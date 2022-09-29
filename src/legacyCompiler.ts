import os from "os";
import { ChildProcess, spawnSync, exec, execSync } from 'child_process';
import {Contract} from "./contract"
import {binPath} from "./node";


async function _compile(source: string) {
    const path = `contracts/${source}`;
    try {
      const result = String(
          execSync(
              `${binPath()}/solppc-0.4.3 --bin --abi ${path}`
          )
      );
      return parse(result, path);
  } catch (err) {
      console.error('Compile failed', err);
      return {};
  }
}

function parse(output: string, source: string) {
  const compiledContracts: any = {};
  const lines = output.split(os.EOL);
  let contractName;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("======= ")) {
      const _source = line.slice("======= ".length, -" =======".length).split(":")[0].trim();
      if (_source !== source)
        continue;
      contractName = line.slice("======= ".length, -" =======".length).split(":")[1].trim();
      compiledContracts[contractName] = new Contract(contractName, '', {});
    } else if (line.startsWith("Binary:")) {
      i++;
      if (contractName)
        compiledContracts[contractName].byteCode = lines[i].trim();
    } else if (line.startsWith("OffChain Binary:")) {
      i++;
      if (contractName)
        compiledContracts[contractName].offchainCode = lines[i].trim();
    } else if (line.startsWith("Contract JSON ABI")) {
      i++;
      if (contractName)
        compiledContracts[contractName].abi = JSON.parse(lines[i]);
    }
  }

  return compiledContracts;
}

export const compile = _compile;
