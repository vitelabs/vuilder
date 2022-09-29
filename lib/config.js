"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultViteNetwork = exports.updateNodeConfig = exports.loadViteConfig = exports.cfg = void 0;
const config_default_json_1 = __importDefault(require("./config.default.json"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let config;
function cfg() {
    if (config) {
        return config;
    }
    else {
        return config_default_json_1.default;
    }
}
exports.cfg = cfg;
function loadViteConfig(cfg) {
    config = cfg;
}
exports.loadViteConfig = loadViteConfig;
function updateNodeConfig(cfg) {
    const fsPath = path.join(path.dirname(__dirname), "bin", "node_config.json");
    const ret = fs.readFileSync(fsPath, "utf8");
    const retJson = JSON.parse(ret);
    const newCfg = Object.assign({}, retJson, cfg);
    fs.writeFileSync(fsPath, JSON.stringify(newCfg, null, 2));
}
exports.updateNodeConfig = updateNodeConfig;
exports.defaultViteNetwork = {
    http: "http://127.0.0.1:23456/",
    ws: "http://127.0.0.1:23457/",
    mnemonic: "record deliver increase organ subject whisper private tourist final athlete unit jacket arrow trick sweet chuckle direct print master post senior pluck whale taxi",
};
//# sourceMappingURL=config.js.map