# Speechmatics NextJS example

Example Speech-to-Text NextJS app using Speechmatics SDK packages.

This project was created using [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) with Typescript.

The default styling has been replaced with [PicoCSS](https://picocss.com/).

# Installation and setup

## Check Node version

Make sure you are using Node 22 or higher. You can use [NVM to manage Node versions](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script).

## Generate an API key

To access the APIs and generate JWTs, you'll first need to generate an API key in the Speechmatics  user portal: https://portal.speechmatics.com/api-keys/

Once you've got that, create a `.env` file in this directory:

```
API_KEY=<your api key>
```

## Install dependencies

In this directory run

```
pnpm i
```

This will install all dependencies, including the Speechmatics packages defined in this repo.

## Run the app

Next, run this command to open the app on port 3000:

```
pnpm dev
```
