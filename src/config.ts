import defaultCfg from "./config.default.json";
import * as path from "path";
import * as fs from "fs";

let config: any;

export function cfg() {
  if (config) {
    return config;
  } else {
    return defaultCfg;
  }
}

export function loadViteConfig(cfg: any) {
  config = cfg;
}

export function updateNodeConfig(cfg: any) {
  const fsPath = path.join(path.dirname(__dirname), "bin", "node_config.json");
  const ret = fs.readFileSync(fsPath, "utf8");
  const retJson = JSON.parse(ret);
  const newCfg = Object.assign({}, retJson, cfg);
  fs.writeFileSync(fsPath, JSON.stringify(newCfg, null, 2));
}

export const defaultViteNetwork = {
  http: "http://127.0.0.1:23456/",
  ws: "http://127.0.0.1:23457/",
  mnemonic:
    "record deliver increase organ subject whisper private tourist final athlete unit jacket arrow trick sweet chuckle direct print master post senior pluck whale taxi",
};
