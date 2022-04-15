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
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitFor = exports.sleep = exports.isNullOrWhitespace = exports.isString = void 0;
function isString(value) {
    return typeof value === 'string' || value instanceof String;
}
exports.isString = isString;
function isNullOrWhitespace(value) {
    if (!isString(value)) {
        return true;
    }
    else {
        return value === null || value === undefined || value.trim() === '';
    }
}
exports.isNullOrWhitespace = isNullOrWhitespace;
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.sleep = sleep;
function waitFor(conditionFn, description = '', pollInterval = 1000) {
    return __awaiter(this, void 0, void 0, function* () {
        process.stdout.write(description);
        const poll = (resolve) => {
            conditionFn().then((result) => {
                if (result) {
                    console.log(' OK');
                    resolve();
                }
                else {
                    process.stdout.write('.');
                    setTimeout(_ => poll(resolve), pollInterval);
                }
            }).catch(() => {
                process.stdout.write('.');
                setTimeout(_ => poll(resolve), pollInterval);
            });
        };
        return new Promise(poll);
    });
}
exports.waitFor = waitFor;
//# sourceMappingURL=utils.js.map