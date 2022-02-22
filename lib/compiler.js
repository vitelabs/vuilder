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
exports.compile = void 0;
const fs = __importStar(require("fs"));
const contract_1 = require("./contract");
var solppc = require('@vite/solppc');
const contractBase = './contracts';
function compile(sourcePath) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let content = readSourceFile(sourcePath);
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
        let output = JSON.parse(solppc.compile(JSON.stringify(input), { import: findImports }));
        // ignore 3805 warning (pre-release compiler)
        const filteredErrors = (_a = output.errors) === null || _a === void 0 ? void 0 : _a.filter((err) => { return err.errorCode !== '3805'; });
        if (filteredErrors && filteredErrors.length > 0) {
            console.error('Compile errors:', filteredErrors);
        }
        let contracts = output.contracts[sourcePath];
        let compiledContracts = {};
        for (var contractName in contracts) {
            let code = contracts[contractName].evm.bytecode.object;
            let abi = contracts[contractName].abi;
            compiledContracts[contractName] = new contract_1.Contract(contractName, code, abi);
        }
        return compiledContracts;
    });
}
exports.compile = compile;
function readSourceFile(sourceName) {
    let content = fs.readFileSync(`${contractBase}/${sourceName}`).toString();
    // console.log('Compile source file:', sourceName);
    return content;
}
function findImports(path) {
    // console.log('Find imports:', path);
    if (fs.existsSync(`${contractBase}/${path}`))
        return {
            contents: readSourceFile(path)
        };
    else
        return { error: 'File not found' };
}
//# sourceMappingURL=compiler.js.map