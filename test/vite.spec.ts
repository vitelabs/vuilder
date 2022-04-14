import { expect } from "chai";
import * as vite from "../src/vite";
import * as vnode from "../src/node";
import * as defaultCfg from "../src/config.default.json";

let node: vnode.Node;

describe("test Vite", function () {
  this.timeout(defaultCfg.mocha.timeout);

  before(async function () {
    node = await vite.startLocalNetwork(defaultCfg);
  });

  after(async function () {
    node.stop();
  });

  it("isUp should return true", async function () {
    const isUp = await node.isUp();
    expect(isUp).to.be.true;
  });

  it("getSnapshotHeight should return a value greater than 0", async function () {
    const height = await vite.getSnapshotHeight(node.provider);
    expect(Number(height)).to.be.greaterThan(0);
  });
});
