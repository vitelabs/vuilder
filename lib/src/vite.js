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
exports.utils = exports.compileLegacy = exports.compile = exports.isConfirmed = exports.isReceived = exports.getBalance = exports.getAccountBlock = exports.getQuota = exports.getAccountHeight = exports.getSnapshotHeight = exports.mint = exports.newAccount = exports.newProvider = exports.localProvider = exports.stopLocalNetwork = exports.startLocalNetwork = void 0;
const vitejs_1 = require("@vite/vitejs");
const user_1 = require("./user");
const { HTTP_RPC } = require("@vite/vitejs-http");
const { WS_RPC } = require("@vite/vitejs-ws");
const { IPC_RPC } = require("@vite/vitejs-ipc");
const child_process_1 = require("child_process");
const viteUtils = __importStar(require("./utils"));
const vite_config_json_1 = __importDefault(require("./vite.config.json"));
const compiler = __importStar(require("./compiler"));
const legacyCompiler = __importStar(require("./legacyCompiler"));
const package_json_1 = require("../package.json");
let process;
let provider;
let nodeConfig;
const binPath = `node_modules/${package_json_1.name}/bin/`;
function startLocalNetwork(node = 'nightly') {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[Vite] Starting Vite local network...');
        nodeConfig = vite_config_json_1.default.nodes[node];
        console.log('Node binanry:', nodeConfig.name);
        process = (0, child_process_1.exec)(`./restart.sh ${nodeConfig.name}`, {
            cwd: binPath
        }, (error, stdout, stderr) => {
            // if(error) console.error(error);
            // console.log(stdout);
        });
        console.log('[Vite] Waiting for the local network to go live...');
        yield waitNetworkUp();
        console.log('[Vite] Vite local network is live!');
    });
}
exports.startLocalNetwork = startLocalNetwork;
function stopLocalNetwork() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[Vite] Stopping Vite local network...');
        // process.kill('SIGKILL');
        (0, child_process_1.exec)(`./shutdown.sh`, {
            cwd: binPath
        }, (error, stdout, stderr) => {
            // if(error) console.error(error);
            // console.log(stdout);
        });
    });
}
exports.stopLocalNetwork = stopLocalNetwork;
function waitNetworkUp() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exports.utils.waitFor(isNetworkUp, 'Wait for local network', 1000);
    });
}
function isNetworkUp() {
    return __awaiter(this, void 0, void 0, function* () {
        let h = yield localProvider().request('ledger_getSnapshotChainHeight');
        return h && (h > 0);
    });
}
function localProvider() {
    if (!provider) {
        if (!nodeConfig)
            nodeConfig = vite_config_json_1.default.nodes.nightly;
        provider = newProvider(nodeConfig.http);
    }
    return provider;
}
exports.localProvider = localProvider;
function newProvider(url) {
    // const ipcProvider = new ViteAPI(new IPC_RPC("~/code/contracts/bin/ledger/devdata/gvite.ipc", 10000), () => {
    //     console.log("New Vite provider from", url);
    //   });
    const httpProvider = new vitejs_1.ViteAPI(new HTTP_RPC(url), () => {
        console.log("New Vite provider from", url);
    });
    return httpProvider;
}
exports.newProvider = newProvider;
function newAccount(mnemonics, index) {
    const addressObj = vitejs_1.wallet.getWallet(mnemonics).deriveAddress(index);
    let a = new user_1.UserAccount(addressObj.address);
    a.setPrivateKey(addressObj.privateKey);
    a._setProvider(provider);
    return a;
}
exports.newAccount = newAccount;
function mint(provider) {
    return __awaiter(this, void 0, void 0, function* () {
        // await sleep(1000);
        // return await provider.request("miner_mine");
    });
}
exports.mint = mint;
function getSnapshotHeight(provider) {
    return __awaiter(this, void 0, void 0, function* () {
        return provider.request("ledger_getSnapshotChainHeight");
    });
}
exports.getSnapshotHeight = getSnapshotHeight;
function getAccountHeight(provider, to) {
    return __awaiter(this, void 0, void 0, function* () {
        return provider
            .request("ledger_getLatestAccountBlock", to)
            .then((block) => {
            if (block) {
                return parseInt(block.height);
            }
            else {
                return 0;
            }
        });
    });
}
exports.getAccountHeight = getAccountHeight;
function getQuota(provider, to) {
    return __awaiter(this, void 0, void 0, function* () {
        return provider.request("contract_getQuotaByAccount", to);
    });
}
exports.getQuota = getQuota;
function getAccountBlock(provider, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return provider.request("ledger_getAccountBlockByHash", hash);
    });
}
exports.getAccountBlock = getAccountBlock;
function getBalance(provider, address, tokenId = 'tti_5649544520544f4b454e6e40') {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield provider.getBalanceInfo(address);
        const balance = result.balance.balanceInfoMap[tokenId].balance;
        return balance;
    });
}
exports.getBalance = getBalance;
function isReceived(provider, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return getAccountBlock(provider, hash).then((block) => {
            if (!block) {
                return false;
            }
            else {
                if (!block.receiveBlockHash) {
                    return false;
                }
                else {
                    return true;
                }
            }
        });
    });
}
exports.isReceived = isReceived;
function isConfirmed(provider, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const block = yield getAccountBlock(provider, hash);
        if (!block) {
            return false;
        }
        else {
            if (!block.confirmedHash) {
                return false;
            }
            else {
                return true;
            }
        }
    });
}
exports.isConfirmed = isConfirmed;
exports.compile = compiler.compile;
exports.compileLegacy = legacyCompiler.compile;
exports.utils = viteUtils;
//# sourceMappingURL=vite.js.map