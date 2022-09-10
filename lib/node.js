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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = exports.binPath = exports.binName = exports.init = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vitejs_1 = require("@vite/vitejs");
const { HTTP_RPC } = require("@vite/vitejs-http");
const viteUtils = __importStar(require("./utils"));
const defaultBinPath = path_1.default.join(path_1.default.dirname(__dirname), "bin");
// const binPath = `bin/`;
function init({ name = "gvite", version, type = "bin", }) {
    return __awaiter(this, void 0, void 0, function* () {
        let binFileName = yield binName(name, version);
        if (fs_1.default.existsSync(path_1.default.join(binPath(), binFileName))) {
            return;
        }
        console.log(path_1.default.join(binPath(), binFileName));
        const platform = process.platform;
        const arch = process.arch;
        let environment;
        switch (platform) {
            case "linux":
                if (arch === "arm64") {
                    environment = `${platform}-${arch}`;
                }
                else {
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
        const result = (0, child_process_1.execSync)(`${shell} ${version} ${environment}`, {
            cwd: binPath(),
            encoding: "utf8",
        });
        console.log(result);
    });
}
exports.init = init;
function binName(name, version) {
    const binName = `${name}-${version}`;
    return binName;
}
exports.binName = binName;
function binPath() {
    return defaultBinPath;
}
exports.binPath = binPath;
class Node {
    constructor(url, binPath, binName, nodeCfgPath) {
        this.isUp = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const h = yield this.provider.request("ledger_getSnapshotChainHeight");
                return h && h > 0;
            }
            catch (error) {
                return false;
            }
        });
        this.httpUrl = url;
        this.binPath = binPath;
        this.binName = binName;
        const port = parseInt(new URL(url).port);
        this.logFileName = `gvite-${port}.log`;
        this.nodeCfgPath = nodeCfgPath;
        this.provider = new vitejs_1.ViteAPI(new HTTP_RPC(url), () => {
            console.log("New Vite provider from", url);
        });
        this.stopped = false;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[Vite] Starting Vite local node...");
            console.log("Node binary:", this.binPath);
            this.process = (0, child_process_1.spawn)("./startup.sh", [
                this.binName,
                this.nodeCfgPath,
                this.logFileName
            ], {
                cwd: this.binPath,
                detached: true
            });
            console.log("[Vite] Waiting for the local node to go live...");
            yield viteUtils.waitFor(this.isUp, "Wait for local node", 1000);
            console.log("[Vite] Vite local node is live!");
        });
    }
    stop() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stopped)
                return;
            console.log(`[Vite] Stopping Vite local node... (${(_a = this.process) === null || _a === void 0 ? void 0 : _a.pid})`);
            if ((_b = this.process) === null || _b === void 0 ? void 0 : _b.pid) {
                process.kill(this.process.pid, "SIGKILL");
            }
            this.stopped = true;
            console.log("Node stopped");
        });
    }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map