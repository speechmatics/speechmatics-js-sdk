
<p align="center">
  <br/>
  <img src="./assets/logo.svg"/>
  <h1 align="center">Speechmatics Javascript SDK</h1>
  <p align="center">Monorepo of official Javascript libraries for interacting with Speechmatics APIs, and other related utilities.</p>
  <p align="center">Packages can be found in the <a href="/packages"><code>packages/</code></a> directory.
  <p align="center">Check out our <a href="/examples"><code>examples/</code></a> to see them in action
</p>

## Legacy version

**The [`speechmatics` NPM package](https://www.npmjs.com/package/speechmatics) has been deprecated**, and will not be updated further. The packages in this repo offer similar functionality. If you have any issues upgrading, don't hesitate to [get in touch](#feedback--help).

## Packages

See the `README.md` files in each package for installation and usage details:


### API clients

Official JS clients for Speechmatics APIs

- **Batch client**: Upload files for transcription:
  
  [`@speechmatics/batch-client`](./packages/batch-client)
- **Real-time client**: Stream audio data for real-time transcription:
  
  [`@speechmatics/real-time-client`](./packages/real-time-client)
- **Flow client**: Interact with Flow API, our voice assistant engine:
  
  [`@speechmatics/flow-client`](./packages/flow-client)

### React hooks

Wrappers of the clients above to integrate into React projects:

- [`@speechmatics/flow-client-react`](./packages/flow-client-react)

## Documentation

The documentation for the API can be found [here](https://docs.speechmatics.com/).

More examples on how to use the SDK can be found in the [examples](./examples) folder.

Our Portal is also a good source of information on how to use the API. You can find it [here](https://portal.speechmatics.com/). Check out `Upload` and `Realtime Demo` sections.

## Contributing

We'd love to see your contributions! Please read our [contributing guidelines](./CONTRIBUTING.md) for more information.

## Feedback & Help

- For feature requests or bugs [open an issue](https://github.com/speechmatics/speechmatics-js-sdk/issues/new) 
- To provide direct feedback, email us at [devrel@speechmatics.com](mailto:devrel@speechmatics.com)
- We're [@speechmatics](https://twitter.com/Speechmatics) on Twitter too!