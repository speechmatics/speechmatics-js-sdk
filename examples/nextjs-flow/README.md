# Speechmatics Flow NextJS example

Example NextJS app using Speechmatics SDK packages.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The app is styled using [Tailwind](https://tailwindcss.com/) classnames, along with [DaisyUI](https://daisyui.com/) component library.

# Installation and setup

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
