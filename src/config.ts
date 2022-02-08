import defaultCfg from "./config.default.json";

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
