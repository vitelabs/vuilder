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
exports.Contract = void 0;
const vitejs_1 = require("@vite/vitejs");
const utils = __importStar(require("./utils"));
const vite = __importStar(require("./vite"));
var linker = require("@vite/solppc/linker");
const { Vite_TokenId } = vitejs_1.constant;
class Contract {
    constructor(name, byteCode, abi) {
        this.name = name;
        this.byteCode = byteCode;
        this.abi = abi;
        this.offchainCode = "";
    }
    setProvider(provider) {
        this.provider = provider;
        return this;
    }
    setDeployer(deployer) {
        this.deployer = deployer;
        return this;
    }
    deploy({ responseLatency = 0, quotaMultiplier = 100, randomDegree = 0, params, tokenId, amount, libraries }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.deployer) {
                console.error("Can not deploy contract, set a deployer first.");
                return;
            }
            if (!this.provider) {
                console.error("Can not deploy contract, set a Vite provider first.");
                return;
            }
            // link libraries
            if (libraries)
                this.link(libraries);
            const deployTransaction = this.deployer.createContract({
                abi: this.abi,
                code: this.byteCode,
                quotaMultiplier: quotaMultiplier.toString(),
                randomDegree: randomDegree.toString(),
                responseLatency: responseLatency.toString(),
                params: params
            });
            if (tokenId)
                deployTransaction.tokenId = tokenId;
            if (amount)
                deployTransaction.amount = amount;
            console.log("Sign and send deploy transaction");
            const deployResult = yield deployTransaction.autoSend();
            yield utils.waitFor(() => {
                return vite.isConfirmed(this.provider, deployResult.hash);
            }, "Wait for confirming deploy request", 1000);
            yield utils.waitFor(() => {
                return vite.isReceived(this.provider, deployResult.hash);
            }, "Wait for receiving deploy request", 1000);
            const sendBlock = yield vite.getAccountBlock(this.provider, deployResult.hash);
            const receiveBlock = yield vite.getAccountBlock(this.provider, sendBlock.receiveBlockHash);
            if ((receiveBlock === null || receiveBlock === void 0 ? void 0 : receiveBlock.blockType) !== 4) {
                throw new Error("Contract deploy failed:" + this.abi.name);
            }
            console.log("Contract deployed!");
            this.address = deployResult.toAddress;
            return this;
        });
    }
    call(methodName, params, { tokenId = Vite_TokenId, amount = "0", caller = this.deployer }) {
        return __awaiter(this, void 0, void 0, function* () {
            const methodAbi = this.abi.find((x) => {
                return x.name === methodName && x.type === "function";
            });
            if (!methodAbi) {
                throw new Error("method not found: " + methodName);
            }
            const block = caller.callContract({
                abi: methodAbi,
                toAddress: this.address,
                params: params,
                tokenId: tokenId,
                amount: amount,
            });
            block.autoSend();
            yield utils.waitFor(() => {
                return vite.isReceived(this.provider, block.hash);
            }, "Wait for receiving call request", 1000);
            const sendBlock = yield vite.getAccountBlock(this.provider, block.hash);
            const receiveBlock = yield vite.getAccountBlock(this.provider, sendBlock.receiveBlockHash);
            if (!receiveBlock) {
                throw new Error("receive block not found");
            }
            if (receiveBlock.blockType !== 4 && receiveBlock.blockType !== 5 || !receiveBlock.data) {
                throw new Error("bad recieve block");
            }
            const data = receiveBlock.data;
            const bytes = Buffer.from(data, 'base64');
            if (bytes.length != 33) {
                throw new Error("bad data in recieve block");
            }
            // parse error code from data in receive block
            const errorCode = bytes[32];
            switch (errorCode) {
                case 1:
                    throw new Error("revert"); // @todo: need error descriptions and debug info from RPC
                case 2:
                    throw new Error("maximum call stack size exceeded");
            }
            return receiveBlock;
        });
    }
    link(libraries) {
        if (libraries) {
            // console.log(linker.findLinkReferences(this.byteCode));
            this.byteCode = linker.linkBytecode(this.byteCode, libraries);
        }
    }
    query(methodName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const methodAbi = this.abi.find((x) => {
                return x.name === methodName;
            });
            if (!methodAbi) {
                throw new Error("method not found:" + methodName);
            }
            let data = vitejs_1.abi.encodeFunctionCall(methodAbi, params);
            let dataBase64 = Buffer.from(data, 'hex').toString('base64');
            let codeBase64;
            if (this.offchainCode && this.offchainCode.length > 0)
                codeBase64 = Buffer.from(this.offchainCode, 'hex').toString('base64');
            while (true) {
                let result = codeBase64 ?
                    yield this.provider.request("contract_callOffChainMethod", {
                        address: this.address,
                        code: codeBase64,
                        data: dataBase64
                    }) :
                    yield this.provider.request("contract_query", {
                        address: this.address,
                        data: dataBase64
                    });
                // parse result
                if (result) {
                    let resultBytes = Buffer.from(result, 'base64').toString('hex');
                    let outputs = [];
                    for (let i = 0; i < methodAbi.outputs.length; i++) {
                        outputs.push(methodAbi.outputs[i].type);
                    }
                    return vitejs_1.abi.decodeParameters(outputs, resultBytes);
                }
                console.log('Query failed, try again.');
                yield utils.sleep(500);
            }
        });
    }
    height() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vite.getAccountHeight(this.provider, this.address);
        });
    }
    waitForHeight(height) {
        return __awaiter(this, void 0, void 0, function* () {
            process.stdout.write('Wait for account height [' + height + '] ');
            while (true) {
                let h = yield this.height();
                process.stdout.write('.');
                if (h >= height)
                    break;
                yield utils.sleep(1000);
            }
            console.log(' OK');
        });
    }
    getPastEvents(eventName = 'allEvents', { fromHeight = 0, toHeight = 0 }) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            let logs = yield this.provider.request("ledger_getVmLogsByFilter", {
                "addressHeightRange": {
                    [this.address]: {
                        "fromHeight": fromHeight.toString(),
                        "toHeight": toHeight.toString()
                    }
                }
            });
            // console.log(logs);
            const filteredAbi = eventName === 'allEvents' ? this.abi : this.abi.filter((a) => { return a.name === eventName; });
            if (logs) {
                for (let log of logs) {
                    let vmLog = log.vmlog;
                    let topics = vmLog.topics;
                    for (let abiItem of filteredAbi) {
                        let signature = vitejs_1.abi.encodeLogSignature(abiItem);
                        // find the abi by event signature, it is not working for anonymous events.
                        // @TODO: parse anonymous events after updating the Vite RPC
                        if (abiItem.type === 'event' && signature === topics[0]) {
                            let dataHex;
                            if (vmLog.data) {
                                dataHex = Buffer.from(vmLog.data, 'base64').toString('hex');
                            }
                            let returnValues = vitejs_1.abi.decodeLog(abiItem, dataHex, topics);
                            let item = {
                                returnValues: returnValues,
                                event: abiItem.name,
                                raw: {
                                    data: dataHex,
                                    topics: topics
                                },
                                signature: signature,
                                accountBlockHeight: log.accountBlockHeight,
                                accountBlockHash: log.accountBlockHash,
                                address: log.address
                            };
                            result.push(item);
                            break;
                        }
                    }
                }
                ;
            }
            return result;
        });
    }
    balance(tokenId = 'tti_5649544520544f4b454e6e40') {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.provider.getBalanceInfo(this.address);
            return ((_c = (_b = (_a = result === null || result === void 0 ? void 0 : result.balance) === null || _a === void 0 ? void 0 : _a.balanceInfoMap) === null || _b === void 0 ? void 0 : _b[tokenId]) === null || _c === void 0 ? void 0 : _c.balance) || '0';
        });
    }
}
exports.Contract = Contract;
//# sourceMappingURL=contract.js.map