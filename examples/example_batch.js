#!/usr/bin/env node

require('dotenv').config();
const { Speechmatics } = require('../dist');
const fs = require('fs');
const path = require('path');

const fileName = 'example.wav';

if (parseInt(process.version.match(/(?:v)([0-9]{2})/)[1]) < 18) {
  throw new Error(
    "Requires node 18 or higher. If this isn't possible, see our documentation about polyfilling",
  );
}

const sm = new Speechmatics(process.env.API_KEY);

// Note: when using NodeJS 20+ you may assign this to a `File` object instead
const input = {
  data: new Blob([
    fs.readFileSync(path.join(__dirname, 'example_files', fileName)),
  ]),
  fileName,
};

const config = {
  transcription_config: { language: 'en' },
};

sm.batch
  .transcribe(input, config)
  .then(({ results }) => {
    console.log(results.map((r) => r.alternatives[0].content).join(' '));
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
