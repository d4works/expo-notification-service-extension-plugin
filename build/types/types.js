"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mode = exports.NSE_PLUGIN_PROPS = void 0;
exports.NSE_PLUGIN_PROPS = [
    "mode",
    "iosNSEFilePath",
    "filtering",
    "devTeam",
    "iPhoneDeploymentTarget"
];
var Mode;
(function (Mode) {
    Mode["Dev"] = "development";
    Mode["Prod"] = "production";
})(Mode = exports.Mode || (exports.Mode = {}));
