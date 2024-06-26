import {
  RealtimeSession,
  AddTranscript,
  RetrieveTranscriptResponse,
} from '../dist';
import { Speechmatics, SpeechmaticsResponseError } from '../dist';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import poll from '../src/utils/poll';

dotenv.config();

const exampleFileName = 'example.wav';
const EXAMPLE_FILE = new Blob([
  fs.readFileSync(
    path.join(__dirname, '..', 'examples', 'example_files', exampleFileName),
  ),
]);

describe('Testing batch capabilities', () => {
  it('attempting to send file and receive transcription through batch', async () => {
    const speechmatics = new Speechmatics(process.env.API_KEY as string);
    const input = { data: EXAMPLE_FILE, fileName: exampleFileName };
    const transcription = await speechmatics.batch.transcribe(input, {
      transcription_config: { language: 'en' },
    });
    expect(transcription).toBeDefined();
    expect(typeof transcription).toBe('object');
    expect((transcription as RetrieveTranscriptResponse).job.data_name).toEqual(
      exampleFileName,
    );
  }, 30000);

  it('lists jobs', async () => {
    const speechmatics = new Speechmatics(process.env.API_KEY as string);
    const response = await speechmatics.batch.listJobs();
    expect(Array.isArray(response.jobs)).toBe(true);
  });

  it('can fetch plain text transcripts', async () => {
    const speechmatics = new Speechmatics(process.env.API_KEY as string);
    const { id } = await speechmatics.batch.createTranscriptionJob(
      { data: EXAMPLE_FILE, fileName: exampleFileName },
      {
        transcription_config: {
          language: 'en',
        },
      },
    );

    let jobResult: string | undefined = undefined;
    await poll(async () => {
      try {
        jobResult = await speechmatics.batch.getJobResult(id, 'text');
        return true;
      } catch (err) {
        if (
          err instanceof SpeechmaticsResponseError &&
          err.response.code === 404
        ) {
          return false;
        } else {
          throw err;
        }
      }
    });

    expect(typeof jobResult).toBe('string');
  }, 60000);

  //add more tests here on multiple transcription in parallel
});

describe('Testing rt capabilities', () => {
  it('attempting to send file and receive transcription through RT', async () => {
    const session = new RealtimeSession({
      async apiKey() {
        return await getRealtimeJWT();
      },
    });

    const startFn = jest.fn();
    const messageFn = jest.fn();
    const endFn = jest.fn();

    session.addListener('RecognitionStarted', () => {
      startFn();
    });

    session.addListener('Error', (error) => {});

    session.addListener('AddTranscript', (message: AddTranscript) => {
      messageFn(message);
    });

    session.addListener('EndOfTranscript', () => {
      endFn();
    });

    await session
      .start({
        transcription_config: { language: 'en' },
        audio_format: { type: 'file' },
      })
      .then(() => {
        //prepare file stream
        const fileStream = fs.createReadStream(
          path.join(
            __dirname,
            '..',
            'examples',
            'example_files',
            'example.wav',
          ),
        );

        //send it
        fileStream.on('data', (sample: Buffer) => {
          session.sendAudio(sample);
        });

        //end the session
        return new Promise<void>((resolve) => {
          fileStream.on('end', () => {
            session.stop().then(() => {
              resolve();
            });
          });
        });
      });

    expect(startFn).toHaveBeenCalled();
    expect(messageFn).toHaveBeenCalled();
    expect(endFn).toHaveBeenCalled();
  }, 25000);
});

// Basic function to get RT JWT for now
// At some point we can export something reusable for this
export default async function getRealtimeJWT(ttl = 60) {
  const jsonResponse = (await fetch(
    'https://mp.speechmatics.com/v1/api_keys?type=rt',
    {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        'Content-type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ ttl }),
    },
  ).then((resp) => resp.json())) as { key_value: string };

  return jsonResponse.key_value;
}
