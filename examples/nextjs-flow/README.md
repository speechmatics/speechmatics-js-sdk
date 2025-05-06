# Speechmatics Flow NextJS example

Example NextJS app using Speechmatics SDK packages.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The app is styled using [Tailwind](https://tailwindcss.com/) classnames, along with [DaisyUI](https://daisyui.com/) component library.

## Packages used
In order to build a React/NextJS app and have Flow working in a browser, this example utilises some of the Speechmatics SDK packages (you can check out their READMEs for more details):

- [@speechmatics/auth](https://github.com/speechmatics/speechmatics-js-sdk/tree/main/packages/auth)
- [@speechmatics/browser-audio-input](https://github.com/speechmatics/speechmatics-js-sdk/tree/main/packages/browser-audio-input)
- [@speechmatics/browser-audio-input-react](https://github.com/speechmatics/speechmatics-js-sdk/tree/main/packages/browser-audio-input-react)
- [@speechmatics/flow-client-react](https://github.com/speechmatics/speechmatics-js-sdk/tree/main/packages/flow-client-react)
- [@speechmatics/web-pcm-player-react](https://github.com/speechmatics/speechmatics-js-sdk/tree/main/packages/web-pcm-player-react)
]

Please check the package.json file for any other dependencies.

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
