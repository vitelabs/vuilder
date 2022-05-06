import { ViteAPI, wallet } from "@vite/vitejs";
import { UserAccount } from "./user";
const { HTTP_RPC } = require("@vite/vitejs-http");
import * as viteUtils from "./utils";
import * as compiler from "./compiler";
import * as config from "./config";
import * as legacyCompiler from "./legacyCompiler";
import * as vnode from "./node";

export async function startLocalNetwork(cfg: any) {
  console.log("[Vite] Starting Vite local node...");
  const nodeCfg = (cfg.nodes as any)[cfg.defaultNode];

  await vnode.init({ name: nodeCfg.name, version: nodeCfg.version });
  const binName = vnode.binName(nodeCfg.name, nodeCfg.version);
  const binPath = vnode.binPath();

  const localNode = new vnode.Node(nodeCfg.http, binPath, binName);
  await localNode.start();

  process.on("SIGINT", async function () {
    console.log("Caught interrupt signal");
    await localNode.stop();
    console.log("Node stopped");
  });
  process.on("SIGTERM", async function () {
    console.log("Caught interrupt signal");
    await localNode.stop();
    console.log("Node stopped");
  });
  process.on("SIGQUIT", async function () {
    console.log("Caught interrupt signal");
    await localNode.stop();
    console.log("Node stopped");
  });
  return localNode;
}

export function newProvider(url: string): any {
  const httpProvider = new ViteAPI(new HTTP_RPC(url), () => {
    console.log("New Vite provider from", url);
  });
  return httpProvider;
}

export function newAccount(mnemonics: string, index: number, provider: any) {
  const addressObj = wallet.getWallet(mnemonics).deriveAddress(index);
  let a = new UserAccount(addressObj.address);
  a.setPrivateKey(addressObj.privateKey);
  a._setProvider(provider);
  return a;
}

export async function mint(provider: any) {
  // await sleep(1000);
  // return await provider.request("miner_mine");
}

export async function getSnapshotHeight(provider: any) {
  return provider.request("ledger_getSnapshotChainHeight");
}

export async function getAccountHeight(
  provider: any,
  to: string
): Promise<Number> {
  return provider
    .request("ledger_getLatestAccountBlock", to)
    .then((block: any) => {
      if (block) {
        return parseInt(block.height);
      } else {
        return 0;
      }
    });
}

export async function getQuota(provider: any, to: string) {
  return provider.request("contract_getQuotaByAccount", to);
}

export async function getAccountBlock(provider: any, hash?: string) {
  return provider.request("ledger_getAccountBlockByHash", hash);
}

export async function getBalance(
  provider: any,
  address: string,
  tokenId: string = "tti_5649544520544f4b454e6e40"
) {
  const result = await provider.getBalanceInfo(address);
  const balance = result.balance.balanceInfoMap[tokenId].balance;
  return balance;
}

export async function isReceived(provider: any, hash?: string) {
  return getAccountBlock(provider, hash).then((block) => {
    if (!block) {
      return false;
    } else {
      if (!block.receiveBlockHash) {
        return false;
      } else {
        return true;
      }
    }
  });
}

export async function isConfirmed(provider: any, hash?: string) {
  const block = await getAccountBlock(provider, hash);
  if (!block) {
    return false;
  } else {
    if (!block.confirmedHash) {
      return false;
    } else {
      return true;
    }
  }
}

export const loadViteConfig = config.loadViteConfig;
export const compile = compiler.compile;
export const compileLegacy = legacyCompiler.compile;
export const utils = viteUtils;
