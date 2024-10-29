# Speechmatics NodeJS examples

Examples using Speechmatics with Node JS

## To run this examples

Check out this repo, navigate to `/examples` and run

```
pnpm i
```

Then head to our portal and generate an API key: https://portal.speechmatics.com/api-keys/

Once you've got that, create a `.env` file in this folder with `API_KEY=<your key>`.

### Transcribe a file (batch API)

```
pnpm run:batch
```

### Transcribe a file (real-time)

```
pnpm run:real-time-file
```