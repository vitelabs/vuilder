"use strict";
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
exports.compile = void 0;
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const contract_1 = require("./contract");
const node_1 = require("./node");
function _compile(source) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `contracts/${source}`;
        try {
            let result = String(child_process_1.execSync(`${node_1.binPath()}/solppc-0.4.3 --bin --abi ${path}`));
            return parse(result, path);
        }
        catch (err) {
            console.error('Compile failed', err);
            return {};
        }
    });
}
function parse(output, source) {
    let compiledContracts = {};
    let lines = output.split(os_1.default.EOL);
    let contractName;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.startsWith("======= ")) {
            let _source = line.slice("======= ".length, -" =======".length).split(":")[0].trim();
            if (_source !== source)
                continue;
            contractName = line.slice("======= ".length, -" =======".length).split(":")[1].trim();
            compiledContracts[contractName] = new contract_1.Contract(contractName, '', {});
        }
        else if (line.startsWith("Binary:")) {
            i++;
            if (contractName)
                compiledContracts[contractName].byteCode = lines[i].trim();
        }
        else if (line.startsWith("OffChain Binary:")) {
            i++;
            if (contractName)
                compiledContracts[contractName].offchainCode = lines[i].trim();
        }
        else if (line.startsWith("Contract JSON ABI")) {
            i++;
            if (contractName)
                compiledContracts[contractName].abi = JSON.parse(lines[i]);
        }
    }
    return compiledContracts;
}
exports.compile = _compile;
//# sourceMappingURL=legacyCompiler.js.map