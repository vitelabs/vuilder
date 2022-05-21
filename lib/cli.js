#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = require("js-yaml");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const config_default_json_1 = __importDefault(require("./config.default.json"));
const vuilder = __importStar(require("./index"));
// parse config file
function parseCommandLine() {
    const yargs = require("yargs/yargs");
    const { hideBin } = require("yargs/helpers");
    const argv = yargs(hideBin(process.argv)).argv;
    return argv;
}
function parseConfig(argv) {
    if (argv.config) {
        const configJson = yaml.load(fs.readFileSync(argv.config, "utf8"));
        return Object.assign({}, config_default_json_1.default, configJson);
    }
    else {
        return config_default_json_1.default;
    }
}
function testTargetFiles(argv) {
    let result = [];
    if (argv._.length === 1) {
        const files = glob.sync("./test/**/*.spec.ts", { cwd: "" });
        result.push(...files);
        return result;
    }
    argv._.slice(1).forEach((file) => {
        const files = glob.sync(file, { cwd: "" });
        result.push(...files);
    });
    return result;
}
function test(files, cfg) {
    return __awaiter(this, void 0, void 0, function* () {
        const Mocha = require("mocha");
        const mocha = new Mocha(cfg.mocha);
        //   testFiles.forEach((file) => mocha.addFile(file));
        files.forEach((file) => mocha.addFile(path.resolve(file)));
        const testFailures = yield new Promise((resolve) => {
            mocha.run(resolve);
        });
        mocha.dispose();
        return testFailures;
    });
}
function testWithCatch(files, cfg) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield test(files, cfg);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function setup(vite) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Test environment is ready.`);
    });
}
function tearDown(vite) {
    return __awaiter(this, void 0, void 0, function* () {
        yield vite.stop();
        console.log("Test environment cleared.");
    });
}
function runTest(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        const viteCfg = parseConfig(argv);
        const targetFiles = testTargetFiles(argv);
        if (viteCfg.defaultNode === "none") {
            yield testWithCatch(targetFiles, viteCfg);
            return;
        }
        const vite = yield vuilder.startLocalNetwork(viteCfg);
        yield setup(vite);
        try {
            yield testWithCatch(targetFiles, viteCfg);
        }
        catch (error) {
            console.error(error);
        }
        yield tearDown(vite);
    });
}
function runCompile(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        // todo print to .artifacts
        argv._.slice(1).forEach((file) => __awaiter(this, void 0, void 0, function* () {
            try {
                const compiledContracts = yield vuilder.compile(file);
                for (const key in compiledContracts) {
                    console.log(compiledContracts[key].name);
                    console.log(JSON.stringify(compiledContracts[key].abi));
                    console.log(compiledContracts[key].byteCode);
                    console.log("----------------------------------");
                }
            }
            catch (error) {
                console.log(error);
            }
        }));
    });
}
require("yargs/yargs")(process.argv.slice(2))
    .command(["test"], "run test", {}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield runTest(argv);
}))
    .command(["node"], "run node", {}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    const viteCfg = parseConfig(argv);
    const vite = yield vuilder.startLocalNetwork(viteCfg);
}))
    .command(["compile"], "run compile", {}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield runCompile(argv);
}))
    .demandCommand()
    .help().argv;
//# sourceMappingURL=cli.js.map