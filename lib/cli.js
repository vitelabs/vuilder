#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = require("js-yaml");
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const defaultCfg = __importStar(require("./config.default.json"));
const v = __importStar(require("./vite"));
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
        return Object.assign({}, defaultCfg, configJson);
    }
    else {
        return defaultCfg;
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
function main(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        const viteCfg = parseConfig(argv);
        const vite = yield v.startLocalNetwork(viteCfg);
        yield setup(vite);
        try {
            yield test(testTargetFiles(argv), viteCfg);
        }
        catch (error) {
            console.error(error);
        }
        yield tearDown(vite);
    });
}
require("yargs/yargs")(process.argv.slice(2))
    .command(["test"], "run test", {}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    yield main(argv);
}))
    .command(["node"], "run node", {}, (argv) => __awaiter(void 0, void 0, void 0, function* () {
    const viteCfg = parseConfig(argv);
    const vite = yield v.startLocalNetwork(viteCfg);
}))
    .demandCommand()
    .help().argv;
//# sourceMappingURL=cli.js.map