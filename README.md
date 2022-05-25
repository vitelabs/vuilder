# Vuilder Kit

**vuilder** is a Solidity++ smart contract development toolkit for Vite developers.

It facilitates performing frequent tasks such as contracts compiling, libraries linking, testing and deploying.

## Build

Prerequisites:

- node v16
- npm v8

You can use [nvm](https://github.com/nvm-sh/nvm) to easily switch between node versions.

```
npm run build
```

Make the vuilder command available to be executed with npx:

```
npm link
```

## Create a Vuilder project 
For more, refer to [Doc](https://vitelabs.github.io/vuilder-docs/soliditypp/Vuilder/#create-a-vuilder-project)  


## Installation

- To install vuilder:

```
npm install @vite/vuilder --save-dev
```

- To upgrade to the latest version
```
npm remove @vite/vuilder
npm install @vite/vuilder --save-dev
```

## CLI

```
npx vuilder <command>
```

```
vuilder <command>

Commands:
  vuilder test     run test
  vuilder node     run node
  vuilder compile  run compile

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Usages

### CLI: Run tests

Runs all tests based on this pattern: `./test/**/*.spec.ts`

```
npx vuilder test
```

Run specific tests by providing one or multiple paths (separated by space):

```
npx vuilder test ./test/compiler.spec.ts ./test/vite.spec.ts
```

### CLI: Start a local node

Starts a local node with an optional parameter for configuration purposes.

```
npx vuilder node --config <config.json>
```

```json
{
  "nodes": {
    "latest": {
      "name": "gvite",
      "version": "v2.11.2-rc1",
      "http": "http://127.0.0.1:23456"
    }
  },
  "defaultNode": "latest"
}
```

### CLI: Compile a contract

Compiles a contract located in the `contracts` folder.

```
npx vuilder compile <filename.solpp>
```

### Other

TODO
