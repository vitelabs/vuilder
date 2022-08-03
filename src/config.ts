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