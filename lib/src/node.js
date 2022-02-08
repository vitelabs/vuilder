"use strict";
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
exports.init = void 0;
const child_process_1 = require("child_process");
const package_json_1 = require("../package.json");
const fs_1 = __importDefault(require("fs"));
const binPath = `node_modules/${package_json_1.name}/bin/`;
// const binPath = `bin/`;
function init({ name = "gvite", version, type = "bin", }) {
    return __awaiter(this, void 0, void 0, function* () {
        let binName = `${name}-${version}`;
        if (fs_1.default.existsSync(binPath + binName)) {
            return;
        }
        const platform = process.platform;
        if (!["linux", "darwin"].includes(platform)) {
            console.log(`${platform} is not supported`);
            return;
        }
        const result = (0, child_process_1.execSync)(`./init.sh  ${version} ${platform}`, {
            cwd: binPath,
            encoding: "utf8",
        });
        console.log(result);
    });
}
exports.init = init;
// init({ version: "v2.11.1" }).then(function() {
//   console.log("done");
// });
//# sourceMappingURL=node.js.map