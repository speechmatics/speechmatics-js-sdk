# Speechmatics NodeJS examples

Examples using Speechmatics with Node JS

## To run this examples

## Check Node version

Make sure you are using Node 22 or higher. You can use [NVM to manage Node versions](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script).

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