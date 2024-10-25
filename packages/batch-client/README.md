# Speechmatics batch client 💬

> [!WARNING]
> This package is still in beta. It should be as functional as the legacy package, but some behaviour may have changed.

Official JS client for the Speechmatics batch jobs API.

API documentation can be found here: https://docs.speechmatics.com/jobsapi#tag/jobs

## Installation

```
npm i @speechmatics/batch-client
```

## Usage

More examples will be available soon. For now, you can checkout the [NodeJS example](/examples/nodejs/batch-example.ts).

This package exports a `BatchClient` class which can be used to call the batch job API endpoints.

### API keys 🔑

Note that the `apiKey` field of the `BatchClient` may be either a long lived API key, or a short-lived JWT.

If it is a short-lived JWT, the developer is responsible for making sure the key is valid.

You can generate a long-lived API key through our self service portal here: https://portal.speechmatics.com/api-keys

See our documentation about generating short-lived JWTs here: https://docs.speechmatics.com/introduction/authentication