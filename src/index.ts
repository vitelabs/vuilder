import * as utils from "./utils";
import { compile } from "./compiler";
import { loadViteConfig, updateNodeConfig } from "./config";
import { compile as compileLegacy } from "./legacyCompiler";

import { startLocalNetwork, newProvider, newAccount } from "./vite";
import { UserAccount } from "./user";
import {Contract} from "./contract"

export {
  compile,
  compileLegacy,
  //
  loadViteConfig,
  updateNodeConfig,
  //
  utils,
  //
  startLocalNetwork,
  //
  newProvider,
  newAccount,
  //
  UserAccount,
  Contract,
};
