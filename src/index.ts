import * as utils from "./utils";
import { compile } from "./compiler";
import { loadViteConfig } from "./config";
import { compile as compileLegacy } from "./legacyCompiler";

import { startLocalNetwork, newProvider, newAccount } from "./vite";
import { UserAccount } from "./user";
import {Contract} from "./contract"

export {
  compile,
  compileLegacy,
  //
  loadViteConfig,
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
