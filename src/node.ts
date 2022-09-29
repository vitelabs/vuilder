import { ChildProcess, execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { ViteAPI } from "@vite/vitejs";
/* eslint-disable */
const { HTTP_RPC } = require("@vite/vitejs-http");
import * as viteUtils from "./utils";

const defaultBinPath = path.join(path.dirname(__dirname), "bin");
// const binPath = `bin/`;

export async function init({
  name = "gvite",
  version,
  type = "bin",
}: {
  name?: string;
  version: string;
  type?: string;
}) {
  const binFileName = await binName(name, version);
  if (fs.existsSync(path.join(binPath(), binFileName))) {
    return;
  }
  console.log(path.join(binPath(), binFileName));
  const platform = process.platform;
  const arch = process.arch;
  let environment;
  switch (platform) {
    case "linux":
      if (arch === "arm64") {
        environment = `${platform}-${arch}`;
      } else {
        environment = platform;
      }
      break;
    case "darwin":
      environment = platform;
      break;
    default:
      break;
  }
  if (viteUtils.isNullOrWhitespace(environment)) {
    console.log(`${platform}-${arch} is not supported`);
    return;
  }
  let shell = "./init.sh";
  if (version.includes("nightly")) {
    shell = "./init-nightly.sh";
  }
  const result = execSync(`${shell} ${version} ${environment}`, {
    cwd: binPath(),
    encoding: "utf8",
  });
  console.log(result);
}

export function binName(name: string, version: string) {
  const binName = `${name}-${version}`;
  return binName;
}

export function binPath() {
  return defaultBinPath;
}

export class Node {
  process?: ChildProcess
  httpUrl: string;
  binPath: string;
  binName: string;
  logFileName: string
  nodeCfgPath: string;
  provider?: any;
  stopped: boolean

  constructor(url: string, binPath: string, binName: string, nodeCfgPath: string) {
    this.httpUrl = url;
    this.binPath = binPath;
    this.binName = binName;
    const port = parseInt(new URL(url).port)
    this.logFileName = `gvite-${port}.log`
    this.nodeCfgPath = nodeCfgPath;
    this.provider = new ViteAPI(new HTTP_RPC(url), () => {
      console.log("New Vite provider from", url);
    });
    this.stopped = false;
  }

  async start() {
    console.log("[Vite] Starting Vite local node...");

    console.log("Node binary:", this.binPath, this.binName, this.nodeCfgPath, this.logFileName);
    this.process = spawn(
      "./startup.sh",
      [
        this.binName,
        this.nodeCfgPath,
        this.logFileName
      ],
      {
        cwd: this.binPath,
        detached: true
      },
    )
    console.log("[Vite] Waiting for the local node to go live...");

    await viteUtils.waitFor(this.isUp, "Wait for local node", 1000);
    console.log("[Vite] Vite local node is live!");
  }

  isUp = async (): Promise<boolean> => {
    try {
      const h = await this.provider.request("ledger_getSnapshotChainHeight");
      return h && h > 0;
    } catch (error) {
      return false
    }
  };

  async stop() {
    if (this.stopped) return;
    console.log(`[Vite] Stopping Vite local node... (${this.process?.pid})`);
    if (this.process?.pid) {
      process.kill(this.process.pid, "SIGKILL")
    }
    this.stopped = true;
    console.log("Node stopped");
  }
}
