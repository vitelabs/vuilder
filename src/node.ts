import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { ViteAPI } from "@vite/vitejs";
const { HTTP_RPC } = require("@vite/vitejs-http");
import * as viteUtils from "./utils";

const defaultBinPath = path.join(path.dirname(__dirname), "bin");
// const binPath = `bin/`;

export async function init({
  name = "gvite",
  version,
  type = "bin",
}: {
  name?: String;
  version: String;
  type?: String;
}) {
  let binFileName = await binName(name, version);
  if (fs.existsSync(path.join(binPath(), binFileName))) {
    return;
  }
  console.log(path.join(binPath(), binFileName));
  const platform = process.platform;
  if (!["linux", "darwin"].includes(platform)) {
    console.log(`${platform} is not supported`);
    return;
  }
  let shell = "./init.sh";
  if (version.includes("nightly")) {
    shell = "./init-nightly.sh";
  }
  const result = execSync(`${shell}  ${version} ${platform}`, {
    cwd: binPath(),
    encoding: "utf8",
  });
  console.log(result);
}

export function binName(name: String, version: String) {
  const binName = `${name}-${version}`;
  return binName;
}

export function binPath() {
  return defaultBinPath;
}

export class Node {
  httpUrl: string;
  binPath: string;
  binName: string;
  provider?: any;

  constructor(url: string, binPath: string, binName: string) {
    this.httpUrl = url;
    this.binPath = binPath;
    this.binName = binName;
    this.provider = new ViteAPI(new HTTP_RPC(url), () => {
      console.log("New Vite provider from", url);
    });
  }

  async start() {
    console.log("[Vite] Starting Vite local node...");

    console.log("Node binary:", this.binPath);
    exec(
      `./restart.sh ${this.binName}`,
      {
        cwd: this.binPath,
      },
      (error, stdout, stderr) => {
        // if (error) console.error(error);
        // console.log(stdout);
      }
    );
    console.log("[Vite] Waiting for the local node to go live...");

    await viteUtils.waitFor(this.isUp, "Wait for local node", 1000);
    console.log("[Vite] Vite local node is live!");
  }

  isUp = async (): Promise<boolean> => {
    const h = await this.provider.request("ledger_getSnapshotChainHeight");
    return h && h > 0;
  };

  async stop() {
    console.log("[Vite] Stopping Vite local node...");
    // process.kill('SIGKILL');
    exec(
      `./shutdown.sh`,
      {
        cwd: this.binPath,
      },
      (error, stdout, stderr) => {
        // if (error) console.error(error);
        // console.log(stdout);
      }
    );
  }
}
