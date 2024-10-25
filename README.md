
<p align="center">
  <br/>
  <img src="./assets/logo.svg"/>
  <h1 align="center">Speechmatics Javascript SDK</h1>
  <h3 align="center">Best-in-class speech technology for the web and beyond 🚀</h3>
  <p align="center">Packages can be found in the <a href="/packages"><code>packages/</code></a> directory.
  <p align="center">Check out our <a href="/examples"><code>examples/</code></a> to see them in action
</p>


> [!IMPORTANT]  
> **The [`speechmatics` NPM package](https://www.npmjs.com/package/speechmatics) has been deprecated**, and will not be updated further. The packages in this repo offer similar functionality. If you have any issues upgrading, don't hesitate to [get in touch](#feedback--help).

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

## Supported JS runtimes

Our philosophy is to adhere to web standard APIs as much as possible. We aim for our SDKs to work in all browsers, React Native, Deno, Bun and Cloudflare edge environments.

If you encounter any issues running out SDKs in one of these environments, please [open an issue](https://github.com/speechmatics/speechmatics-js-sdk/issues/new).

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