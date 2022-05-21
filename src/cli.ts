#!/usr/bin/env ts-node

const yaml = require("js-yaml");
const fs = require("fs");
const glob = require("glob");
const path = require("path");

import defaultCfg from "./config.default.json";
import * as vuilder from "./index";

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

async function testWithCatch(files: any[], cfg: any) {
  try {
    await test(files, cfg);
  } catch (error) {
    console.error(error);
  }
}

async function setup(vite: any) {
  console.log(`Test environment is ready.`);
}
async function tearDown(vite: any) {
  await vite.stop();
  console.log("Test environment cleared.");
}

async function runTest(argv: any) {
  const viteCfg = parseConfig(argv);
  const targetFiles = testTargetFiles(argv);
  if (viteCfg.defaultNode === "none") {
    await testWithCatch(targetFiles, viteCfg);
    return;
  }

  const vite = await vuilder.startLocalNetwork(viteCfg);
  await setup(vite);
  try {
    await testWithCatch(targetFiles, viteCfg);
  } catch (error) {
    console.error(error);
  }
  await tearDown(vite);
}

async function runCompile(argv: any) {
  // todo print to .artifacts
  argv._.slice(1).forEach(async (file: string) => {
    try {
      const compiledContracts = await vuilder.compile(file);
      for (const key in compiledContracts) {
        console.log(compiledContracts[key].name);
        console.log(JSON.stringify(compiledContracts[key].abi));
        console.log(compiledContracts[key].byteCode);
        console.log("----------------------------------");
      }
    } catch (error) {
      console.log(error);
    }
  });
}

require("yargs/yargs")(process.argv.slice(2))
  .command(["test"], "run test", {}, async (argv: any) => {
    await runTest(argv);
  })
  .command(["node"], "run node", {}, async (argv: any) => {
    const viteCfg = parseConfig(argv);
    const vite = await vuilder.startLocalNetwork(viteCfg);
  })
  .command(["compile"], "run compile", {}, async (argv: any) => {
    await runCompile(argv);
  })
  .demandCommand()
  .help().argv;
