import path from "path";
import { expect } from "chai";
import { writeFile } from "./utils";
import * as vite from "../src/vite";
import * as vnode from "../src/node";
import * as defaultCfg from "../src/config.default.json";
import * as nodeCfg from "../bin/node_config.json"

let node1: vnode.Node;
let node2: vnode.Node;

describe("test Vite", function () {
  this.timeout(defaultCfg.mocha.timeout);

  before(async function () {
    vite.stopLocalNetworks();
    const tempCfg = createTempCfg();
    node1 = await vite.startLocalNetwork(defaultCfg);
    node2 = await vite.startLocalNetwork(tempCfg);
  });

  after(async function () {
    node1.stop();
    const isUp1 = await node1.isUp();
    expect(isUp1).to.be.false;
    let isUp2 = await node2.isUp();
    expect(isUp2).to.be.true;
    node2.stop();
    isUp2 = await node2.isUp();
    expect(isUp2).to.be.false;
  });

  it("isUp should return true", async function () {
    const isUp1 = await node1.isUp();
    expect(isUp1).to.be.true;
    const isUp2 = await node2.isUp();
    expect(isUp2).to.be.true;
  });

  it("getSnapshotHeight should return a value greater than 0", async function () {
    const height1 = await vite.getSnapshotHeight(node1.provider);
    expect(Number(height1)).to.be.greaterThan(0);
    const height2 = await vite.getSnapshotHeight(node2.provider);
    expect(Number(height2)).to.be.greaterThan(0);
  });
});

// creates temporary config files used to start an additional node on different ports
function createTempCfg() {
  const tempNodeCfg = JSON.parse(JSON.stringify(nodeCfg))
  delete tempNodeCfg.default
  tempNodeCfg.Port = 8497
  tempNodeCfg.HttpPort = 23466
  tempNodeCfg.WSPort = 23467
  tempNodeCfg.DataDir = "ledger/23466"
  const tempPath = path.join(path.dirname(__dirname), "test", "configs", "temp");
  writeFile(tempPath, "node_config.json", JSON.stringify(tempNodeCfg, null, 2), "utf8")
  const tempCfg = JSON.parse(JSON.stringify(defaultCfg))
  delete tempCfg.default
  tempCfg.nodes.latest.http = `http://127.0.0.1:${tempNodeCfg.HttpPort}`
  tempCfg.nodes.latest.config = path.join(tempPath, "node_config.json")
  writeFile(tempPath, "config.json", JSON.stringify(tempCfg, null, 2), "utf8")
  return tempCfg
}
