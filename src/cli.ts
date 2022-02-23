#!/usr/bin/env node

const yaml = require("js-yaml");
const fs = require("fs");
const glob = require("glob");
const path = require("path");

import * as defaultCfg from "./config.default.json";
import * as v from "./vite";

// parse config file
function parseCommandLine() {
  const yargs = require("yargs/yargs");
  const { hideBin } = require("yargs/helpers");
  const argv = yargs(hideBin(process.argv)).argv;

  return argv;
}

function parseConfig(argv: any) {
  if (argv.config) {
    const configJson = yaml.load(fs.readFileSync(argv.config, "utf8"));
    return Object.assign({}, defaultCfg, configJson);
  } else {
    return defaultCfg;
  }
}

function testTargetFiles(argv: any) {
  let result: any[] = [];
  if (argv._.length === 1) {
    const files = glob.sync("./test/**/*.spec.ts", { cwd: "" });
    result.push(...files);
    return result;
  }
  argv._.slice(1).forEach((file: string) => {
    const files = glob.sync(file, { cwd: "" });
    result.push(...files);
  });

  return result;
}

async function test(files: any[], cfg: any) {
  const Mocha = require("mocha");
  const mocha = new Mocha(cfg.mocha);
  //   testFiles.forEach((file) => mocha.addFile(file));
  files.forEach((file) => mocha.addFile(path.resolve(file)));
  const testFailures = await new Promise<number>((resolve) => {
    mocha.run(resolve);
  });

  mocha.dispose();

  return testFailures;
}

async function setup(vite: any) {
  console.log(`Test environment is ready.`);
}
async function tearDown(vite: any) {
  await vite.stop();
  console.log("Test environment cleared.");
}

async function main(argv: any) {
  const viteCfg = parseConfig(argv);
  const vite = await v.startLocalNetwork(viteCfg);
  await setup(vite);
  try {
    await test(testTargetFiles(argv), viteCfg);
  } catch (error) {
    console.error(error);
  }
  await tearDown(vite);
}

require("yargs/yargs")(process.argv.slice(2))
  .command(["test"], "run test", {}, async (argv: any) => {
    await main(argv);
  })
  .command(["node"], "run node", {}, async (argv: any) => {
    const viteCfg = parseConfig(argv);
    const vite = await v.startLocalNetwork(viteCfg);
  })
  .demandCommand()
  .help().argv;
