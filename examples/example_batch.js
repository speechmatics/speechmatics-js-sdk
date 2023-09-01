#!/usr/bin/env node

require('dotenv').config();
const { Speechmatics } = require('../dist');
const fs = require('fs');
const path = require('path');

if (parseInt(process.version.match(/(?:v)([0-9]{2})/)[1]) < 18) {
  throw new Error(
    "Requires node 18 or higher. If this isn't possible, see our documentation about polyfilling",
  );
}

const sm = new Speechmatics(process.env.API_KEY);
const inputFile = new Blob([
  fs.readFileSync(path.join(__dirname, 'example_files', 'example.wav')),
]);

sm.batch
  .transcribe({ input: inputFile, transcription_config: { language: 'en' } })
  .then(({ results }) => {
    console.log(results.map((r) => r.alternatives[0].content).join(' '));
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
