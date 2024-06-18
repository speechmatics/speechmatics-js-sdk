#!/usr/bin/env node

require('dotenv').config();
const { Speechmatics } = require('../dist');

if (parseInt(process.version.match(/(?:v)([0-9]{2})/)[1]) < 18) {
  throw new Error(
    "Requires node 18 or higher. If this isn't possible, see our documentation about polyfilling",
  );
}

const input = {
  url: 'https://demos.speechmatics.com/audio/es-agile-trimmed.mp3',
};

const config = {
  transcription_config: { language: 'es' },
};

const sm = new Speechmatics(process.env.API_KEY);

sm.batch
  .transcribe(input, config)
  .then(({ results }) => {
    console.log(results.map((r) => r.alternatives[0].content).join(' '));
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
