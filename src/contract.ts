import { constant, abi as abiUtil } from "@vite/vitejs";
import * as utils from "./utils";
import * as vite from "./vite";
const linker = require("@vite/solppc/linker");
const { Vite_TokenId } = constant;

export class Contract {
  provider: any;
  name: string;
  byteCode: string;
  offchainCode: string;
  abi: any;
  address: string | undefined;
  deployer: any;
  
  constructor(
    name: string,
    byteCode: string,
    abi: any
  ) {
    this.name = name;
    this.byteCode = byteCode;
    this.abi = abi;
    this.offchainCode = "";
  }

  setProvider(provider: any): Contract {
    this.provider = provider;
    return this;
  }

  setDeployer(deployer: any): Contract {
    this.deployer = deployer;
    return this;
  }

  async deploy(
    {
      responseLatency = 0,
      quotaMultiplier = 100,
      randomDegree = 0,
      params,
      tokenId,
      amount,
      libraries
    }: {
      responseLatency?: number;
      quotaMultiplier?: number;
      randomDegree?: number;
      params?: string | Array<string | boolean>;
      tokenId?: string;
      amount?: string;
      libraries?: unknown;
    }
  ) {
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

    if (tokenId) deployTransaction.tokenId = tokenId;
    if (amount) deployTransaction.amount = amount;

    console.log("Sign and send deploy transaction");
    const deployResult = await deployTransaction.autoSend();
    
    await utils.waitFor(() => {
      return vite.isConfirmed(this.provider, deployResult.hash);
    }, "Wait for confirming deploy request", 1000);

    await utils.waitFor(() => {
      return vite.isReceived(this.provider, deployResult.hash);
    }, "Wait for receiving deploy request", 1000);

    const sendBlock = await vite.getAccountBlock(this.provider, deployResult.hash);
    const receiveBlock = await vite.getAccountBlock(this.provider, sendBlock.receiveBlockHash);
    if (receiveBlock?.blockType !== 4) {
      throw new Error("Contract deploy failed:" + this.abi.name);
    }

    console.log("Contract deployed!");
    this.address = deployResult.toAddress;
    return this;
  }

  async attach(address: string){
    this.address = address;
  }

  async call(
    methodName: string,
    params: any[],
    {
      tokenId = Vite_TokenId,
      amount = "0",
      caller = this.deployer
    }: { 
      tokenId?: string; 
      amount?: string;
      caller?: any;
    }
  ) {
    const methodAbi = this.abi.find((x: { name: string; type: string; }) => {
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
    try {
      await block.autoSend();
    } catch (e) {
      console.warn(e)
      throw new Error("send block fail"); 
    }
    

    await utils.waitFor(() => {
      return vite.isReceived(this.provider, block.hash);
    }, "Wait for receiving call request", 1000);
    
    const sendBlock = await vite.getAccountBlock(this.provider, block.hash);
    const receiveBlock = await vite.getAccountBlock(this.provider, sendBlock.receiveBlockHash);
 
    if(!receiveBlock) {
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
        throw new Error(`revert, methodName: ${methodName}`); // @todo: need error descriptions and debug info from RPC
      case 2:
        throw new Error(`maximum call stack size exceeded, methodName: ${methodName}`);
    }

    return receiveBlock;
  }

  link(libraries: unknown) {
    if (libraries) {
      // console.log(linker.findLinkReferences(this.byteCode));
      this.byteCode = linker.linkBytecode(this.byteCode, libraries);
    }
  }

  async query(methodName: string, params:any[]) {
    const methodAbi = this.abi.find((x: { name: string; }) => {
      return x.name === methodName;
    });
    if (!methodAbi) {
      throw new Error("method not found:" + methodName);
    }

    const data = abiUtil.encodeFunctionCall(methodAbi, params);
    const dataBase64 = Buffer.from(data, 'hex').toString('base64');
    let codeBase64;
    if (this.offchainCode && this.offchainCode.length > 0)
      codeBase64 = Buffer.from(this.offchainCode, 'hex').toString('base64');

    let i=0;
    while(i<100) {
      const result = codeBase64 ? 
        await this.provider.request("contract_callOffChainMethod", {
          address: this.address,
          code: codeBase64,
          data: dataBase64
        }) : 
        await this.provider.request("contract_query", {
          address: this.address,
          data: dataBase64
        });
        
      // parse result
      if (result) {
        const resultBytes = Buffer.from(result, 'base64').toString('hex');
        const outputs:any[] = [];
        for (let i = 0; i < methodAbi.outputs.length; i++) {
            outputs.push(methodAbi.outputs[i].type);
        }
        return abiUtil.decodeParameters(
            outputs,
            resultBytes
        );
      }
      console.log('Query failed, try again.');
      await utils.sleep(500);
      i++;
    }    
  }

  async height() {
    return await vite.getAccountHeight(this.provider, this.address!);
  }

  async waitForHeight(height: number) {
    process.stdout.write('Wait for account height [' + height + '] ');
    let i=0;
    while(i<100) {
      const h = await this.height();
      process.stdout.write('.');
      if (h >= height) break;
      await utils.sleep(1000);
      i++;
    }
    console.log(' OK');
  }

  async getPastEvents(eventName = 'allEvents', {fromHeight = 0, toHeight = 0}:{
    filter?: unknown,
    fromHeight?: number,
    toHeight?: number
  }) {
    const result: any[] = [];
    const logs = await this.provider.request("ledger_getVmLogsByFilter",
      {
        "addressHeightRange":{
          [this.address!]:{
            "fromHeight": fromHeight.toString(),
            "toHeight": toHeight.toString()
          }
      }
    });
    // console.log(logs);
    const filteredAbi = eventName === 'allEvents' ? this.abi : this.abi.filter((a: any) => {return a.name === eventName;});

    if (logs) {
      for (const log of logs) {
        const vmLog = log.vmlog;
        const topics = vmLog.topics;
        for (const abiItem of filteredAbi) {
          const signature = abiUtil.encodeLogSignature(abiItem);
          // find the abi by event signature, it is not working for anonymous events.
          // @TODO: parse anonymous events after updating the Vite RPC
          if (abiItem.type === 'event' && signature === topics[0]) { 
            let dataHex;
            if (vmLog.data) {
              dataHex = Buffer.from(vmLog.data, 'base64').toString('hex');
            }
            const returnValues = abiUtil.decodeLog(
              abiItem,
              dataHex,
              topics
            );
            const item = {
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
    }
    return result;
  }

  async balance(tokenId = 'tti_5649544520544f4b454e6e40'): Promise<string> {
    const result = await this.provider.getBalanceInfo(this.address);
    return result?.balance?.balanceInfoMap?.[tokenId]?.balance || '0';
  }
}




