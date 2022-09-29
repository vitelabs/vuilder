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
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const fs = __importStar(require("fs"));
const _path = __importStar(require("path"));
const contract_1 = require("./contract");
const utils = __importStar(require("./utils"));
/* eslint-disable */
const solppc = require('@vite/solppc');
const basePath = 'contracts';
function compile(sourcePath) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const fullPath = getFullPath(sourcePath);
        const content = readSourceFile(fullPath);
        const input = {
            language: 'Solidity',
            sources: {
                [sourcePath]: { content: content }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['evm.bytecode', 'abi']
                    }
                }
            }
        };
        const output = JSON.parse(solppc.compile(JSON.stringify(input), { import: findImports }));
        // ignore 3805 warning (pre-release compiler)
        const filteredErrors = (_a = output.errors) === null || _a === void 0 ? void 0 : _a.filter((err) => { return err.errorCode !== '3805'; });
        if (filteredErrors && filteredErrors.length > 0) {
            console.error('Compile errors:', filteredErrors);
        }
        const contracts = output.contracts[sourcePath];
        const compiledContracts = {};
        for (const contractName in contracts) {
            const code = contracts[contractName].evm.bytecode.object;
            const abi = contracts[contractName].abi;
            compiledContracts[contractName] = new contract_1.Contract(contractName, code, abi);
        }
        return compiledContracts;
    });
}
exports.compile = compile;
function readSourceFile(path) {
    const content = fs.readFileSync(path).toString();
    // console.log('Compile source file:', path);
    return content;
}
function getFullPath(path) {
    if (_path.isAbsolute(path)) {
        return path;
    }
    else if (utils.isNullOrWhitespace(_path.parse(path).dir))
        // if path is just a filename -> return basePath + filename e.g. ./contracts/HelloWorld.solpp
        return _path.join(basePath, path);
    else {
        return _path.join(process.cwd(), path);
    }
}
function findImports(path) {
    // console.log('Find imports:', path);
    const fullPath = getFullPath(path);
    if (fs.existsSync(fullPath))
        return {
            contents: readSourceFile(fullPath)
        };
    else
        return { error: 'File not found' };
}
//# sourceMappingURL=compiler.js.map