require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { RealtimeSession } = require('../dist');

if (parseInt(process.version.match(/(?:v)([0-9]{2})/)[1]) < 18) {
  throw new Error(
    "Requires node 18 or higher. If this isn't possible, see our documentation about polyfilling",
  );
}
const session = new RealtimeSession(process.env.API_KEY);

session.addListener('RecognitionStarted', () => {
  console.log('RecognitionStarted');
});

session.addListener('Error', (error) => {
  console.log('session error', error);
});

session.addListener('AddTranscript', (message) => {
  console.log('AddTranscript', message.metadata.transcript);
});

session.addListener('AddPartialTranscript', (message) => {
  // console.log('AddPartialTranscript', message);
});

session.addListener('EndOfTranscript', () => {
  console.log('EndOfTranscript');
});

session
  .start({
    transcription_config: {
      language: 'en',
      operating_point: 'enhanced',
      enable_partials: true,
      max_delay: 2,
    },
    audio_format: { type: 'file' },
  })
  .then(() => {
    //prepare file stream
    const fileStream = fs.createReadStream(
      path.join(__dirname, 'example_files/example.wav'),
    );

    //send it
    fileStream.on('data', (sample) => {
      console.log('sending audio', sample.length);
      session.sendAudio(sample);
    });

    //end the session
    fileStream.on('end', () => {
      session.stop();
    });
  })
  .catch((error) => {
    console.log('error', error.message);
  });
