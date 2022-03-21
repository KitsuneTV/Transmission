# @kitsunetv/transmission

A simple Transmission RPC client for Node.js, written in TypeScript!

## Installation

```shell
$ yarn add @kitsunetv/transmission
```

## Example Usage

```ts
import { Transmission } from "@kitsunetv/transmission";

const transmission = new Transmission({
  host: "http://example.com:9091",
  // path default is "/transmission/rpc"
  path: "/transmission/rpc",
  // if your transmission server is authed...
  username: "username",
  password: "password",
});

// Get session token from transmission RPC
await transmission.authenticate();

// get all torrents
const torrents = transmission.getTorrents();

// start all torrents
for (const torrent of torrents) {
  torrent.start();
}
```
