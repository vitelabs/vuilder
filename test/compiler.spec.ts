import chai, { expect } from "chai";
import * as _path from "path";
import { expectThrowsAsync } from "./utils";
import * as vite from "../src/vite";
import * as defaultCfg from "../src/config.default.json";

chai.use(require('chai-string'));

describe("test Compiler", function () {
  this.timeout(defaultCfg.mocha.timeout);

  it("compile should return the compiled contract", async function () {
    const result = await vite.compile(_path.join(process.cwd(), "test", "contracts", "HelloWorld.solpp"));
    const contract = result.HelloWorld;
    expect(contract.name).to.be.equal("HelloWorld");
    expect(contract.byteCode).to.startsWith("608060");
    expect(contract.abi).to.be.an("array");
    expect(contract.offchainCode).to.be.equal("");
  });

  it("compile should throw an error for invalid path", async function () {
    async function expectCompileThrowsAsync(path: string, expectedPath: string) {
      await expectThrowsAsync(async () => { await vite.compile(path) }, `ENOENT: no such file or directory, open '${expectedPath}'`);
    }
    await expectCompileThrowsAsync("HelloWorld.solpp", _path.join("contracts", "HelloWorld.solpp"));
    await expectCompileThrowsAsync(_path.join("contracts", "HelloWorld.solpp"), _path.join(process.cwd(), "contracts", "HelloWorld.solpp"));
  });
});