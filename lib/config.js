"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadViteConfig = exports.cfg = void 0;
const config_default_json_1 = __importDefault(require("./config.default.json"));
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
//# sourceMappingURL=config.js.map