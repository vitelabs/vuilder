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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAccount = void 0;
const vitejs_accountblock_1 = require("@vite/vitejs-accountblock");
const utils = __importStar(require("./utils"));
const vite = __importStar(require("./vite"));
class UserAccount extends vitejs_accountblock_1.Account {
    // @todo: hack the private member provider in the base class
    _setProvider(provider) {
        this._provider = provider;
        this.setProvider(provider);
    }
    balance(tokenId = 'tti_5649544520544f4b454e6e40') {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._provider.getBalanceInfo(this.address);
            return ((_c = (_b = (_a = result === null || result === void 0 ? void 0 : result.balance) === null || _a === void 0 ? void 0 : _a.balanceInfoMap) === null || _b === void 0 ? void 0 : _b[tokenId]) === null || _c === void 0 ? void 0 : _c.balance) || '0';
        });
    }
    sendToken(toAddress, amount, tokenId = 'tti_5649544520544f4b454e6e40', data = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const block = this.send({ toAddress: toAddress, tokenId: tokenId, amount: amount, data: data });
            yield block.autoSend();
            yield utils.waitFor(() => {
                return vite.isConfirmed(this._provider, block.hash);
            }, "Wait for send transaction to be confirmed", 1000);
            return block;
        });
    }
    receiveAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const blocks = yield this._provider.request("ledger_getUnreceivedBlocksByAddress", this.address, 0, 100);
            if (blocks) {
                for (const block of blocks) {
                    // console.log('receive', block.hash);
                    const receiveBlock = yield this.receive({ sendBlockHash: block.hash }).autoSend();
                    yield utils.waitFor(() => {
                        return vite.isConfirmed(this._provider, receiveBlock.hash);
                    }, "Wait for receive transaction to be confirmed", 1000);
                }
            }
        });
    }
}
exports.UserAccount = UserAccount;
//# sourceMappingURL=user.js.map