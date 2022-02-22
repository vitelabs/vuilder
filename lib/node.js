"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
        const platform = process.platform;
        if (!["linux", "darwin"].includes(platform)) {
            console.log(`${platform} is not supported`);
            return;
        }
        let shell = "./init.sh";
        if (version.includes("nightly")) {
            shell = "./init-nightly.sh";
        }
        const result = child_process_1.execSync(`${shell}  ${version} ${platform}`, {
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
    constructor(url, binPath, binName) {
        this.isUp = () => __awaiter(this, void 0, void 0, function* () {
            const h = yield this.provider.request("ledger_getSnapshotChainHeight");
            return h && h > 0;
        });
        this.httpUrl = url;
        this.binPath = binPath;
        this.binName = binName;
        this.provider = new vitejs_1.ViteAPI(new HTTP_RPC(url), () => {
            console.log("New Vite provider from", url);
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[Vite] Starting Vite local node...");
            console.log("Node binary:", this.binPath);
            child_process_1.exec(`./restart.sh ${this.binName}`, {
                cwd: this.binPath,
            }, (error, stdout, stderr) => {
                // if (error) console.error(error);
                // console.log(stdout);
            });
            console.log("[Vite] Waiting for the local node to go live...");
            yield viteUtils.waitFor(this.isUp, "Wait for local node", 1000);
            console.log("[Vite] Vite local node is live!");
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("[Vite] Stopping Vite local node...");
            // process.kill('SIGKILL');
            child_process_1.exec(`./shutdown.sh`, {
                cwd: this.binPath,
            }, (error, stdout, stderr) => {
                // if (error) console.error(error);
                // console.log(stdout);
            });
        });
    }
}
exports.Node = Node;
//# sourceMappingURL=node.js.map