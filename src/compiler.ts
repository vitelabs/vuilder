import * as fs from "fs";
import * as _path from "path";
import { Contract } from "./contract"
import * as utils from "./utils";

var solppc = require('@vite/solppc');

const basePath = 'contracts';

export async function compile(sourcePath: string) {
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

  let output = JSON.parse(solppc.compile(JSON.stringify(input), { import: findImports }));
  // ignore 3805 warning (pre-release compiler)
  const filteredErrors = output.errors?.filter((err: any) => { return err.errorCode !== '3805' });
  if (filteredErrors && filteredErrors.length > 0) {
    console.error('Compile errors:', filteredErrors);
  }
  let contracts = output.contracts[sourcePath];
  let compiledContracts: any = {};

  for (var contractName in contracts) {
    let code = contracts[contractName].evm.bytecode.object;
    let abi = contracts[contractName].abi;

    compiledContracts[contractName] = new Contract(contractName, code, abi);
  }

  return compiledContracts;
}

function readSourceFile(path: string) {
  let content = fs.readFileSync(path).toString();
  // console.log('Compile source file:', path);
  return content;
}

function getFullPath(path: string) {
  if (_path.isAbsolute(path)) {
    return path;
  } else if (utils.isNullOrWhitespace(_path.parse(path).dir))
    // if path is just a filename -> return basePath + filename e.g. ./contracts/HelloWorld.solpp
    return _path.join(basePath, path);
  else {
    return _path.join(process.cwd(), path);
  }
}

function findImports(path: string) {
  // console.log('Find imports:', path);
  const fullPath = getFullPath(path);
  if (fs.existsSync(fullPath))
    return {
      contents: readSourceFile(fullPath)
    };
  else return { error: 'File not found' };
}