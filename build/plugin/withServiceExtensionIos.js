"use strict";
/**
 * Expo config plugin for copying NSE to XCode
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withServiceExtensionIos = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const iosConstants_1 = require("../support/iosConstants");
const NseUpdaterManager_1 = __importDefault(require("../support/NseUpdaterManager"));
const Log_1 = require("../support/Log");
const FileManager_1 = require("../support/FileManager");
const assert_1 = __importDefault(require("assert"));
const getEasManagedCredentialsConfigExtra_1 = __importDefault(require("../support/eas/getEasManagedCredentialsConfigExtra"));
/**
 * Add 'aps-environment' record with current environment to '<project-name>.entitlements' file
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withAppEnvironment = (config, onesignalProps) => {
    return (0, config_plugins_1.withEntitlementsPlist)(config, (newConfig) => {
        if ((onesignalProps === null || onesignalProps === void 0 ? void 0 : onesignalProps.mode) == null) {
            throw new Error(`
        Missing required "mode" key in your app.json or app.config.js file for "expo-notification-service-extension-plugin".
        "mode" can be either "development" or "production".
        Please see expo-notification-service-extension-plugin's README.md for more details.`);
        }
        if ((onesignalProps === null || onesignalProps === void 0 ? void 0 : onesignalProps.iosNSEFilePath) == null) {
            throw new Error(`
        Missing required "iosNSEFilePath" key in your app.json or app.config.js file for "expo-notification-service-extension-plugin".
        "iosNSEFilePath" must point to a local Notification Service file written in objective-c.
        Please see expo-notification-service-extension-plugin's README.md for more details.`);
        }
        newConfig.modResults["aps-environment"] = onesignalProps.mode;
        return newConfig;
    });
};
/**
 * Add "Background Modes -> Remote notifications" and "App Group" permissions
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps
 */
const withRemoteNotificationsPermissions = (config) => {
    const BACKGROUND_MODE_KEYS = ["remote-notification"];
    return (0, config_plugins_1.withInfoPlist)(config, (newConfig) => {
        if (!Array.isArray(newConfig.modResults.UIBackgroundModes)) {
            newConfig.modResults.UIBackgroundModes = [];
        }
        for (const key of BACKGROUND_MODE_KEYS) {
            if (!newConfig.modResults.UIBackgroundModes.includes(key)) {
                newConfig.modResults.UIBackgroundModes.push(key);
            }
        }
        return newConfig;
    });
};
/**
 * Add "App Group" permission
 * @see https://documentation.onesignal.com/docs/react-native-sdk-setup#step-4-install-for-ios-using-cocoapods-for-ios-apps (step 4.4)
 */
const withAppGroupPermissions = (config) => {
    const APP_GROUP_KEY = "com.apple.security.application-groups";
    return (0, config_plugins_1.withEntitlementsPlist)(config, newConfig => {
        var _a;
        if (!Array.isArray(newConfig.modResults[APP_GROUP_KEY])) {
            newConfig.modResults[APP_GROUP_KEY] = [];
        }
        const modResultsArray = newConfig.modResults[APP_GROUP_KEY];
        const entitlement = `group.${((_a = newConfig === null || newConfig === void 0 ? void 0 : newConfig.ios) === null || _a === void 0 ? void 0 : _a.bundleIdentifier) || ""}.nse`;
        if (modResultsArray.indexOf(entitlement) !== -1) {
            return newConfig;
        }
        modResultsArray.push(entitlement);
        return newConfig;
    });
};
const withEasManagedCredentials = (config) => {
    var _a;
    (0, assert_1.default)((_a = config.ios) === null || _a === void 0 ? void 0 : _a.bundleIdentifier, "Missing 'ios.bundleIdentifier' in app config.");
    config.extra = (0, getEasManagedCredentialsConfigExtra_1.default)(config);
    return config;
};
const withOneSignalNSE = (config, props) => {
    // support for monorepos where node_modules can be above the project directory.
    const pluginDir = require.resolve("expo-notification-service-extension-plugin/package.json");
    const sourceDir = path.join(pluginDir, "../build/support/serviceExtensionFiles/");
    return (0, config_plugins_1.withDangerousMod)(config, [
        'ios',
        async (config) => {
            var _a, _b, _c, _d, _e;
            const iosPath = path.join(config.modRequest.projectRoot, "ios");
            /* COPY OVER EXTENSION FILES */
            fs.mkdirSync(`${iosPath}/${iosConstants_1.NSE_TARGET_NAME}`, { recursive: true });
            for (let i = 0; i < iosConstants_1.NSE_EXT_FILES.length; i++) {
                const extFile = iosConstants_1.NSE_EXT_FILES[i];
                const targetFile = `${iosPath}/${iosConstants_1.NSE_TARGET_NAME}/${extFile}`;
                await FileManager_1.FileManager.copyFile(`${sourceDir}${extFile}`, targetFile);
            }
            // Copy NSE source file either from configuration-provided location, falling back to the default one.
            const sourcePath = (_a = props.iosNSEFilePath) !== null && _a !== void 0 ? _a : `${sourceDir}${iosConstants_1.NSE_SOURCE_FILE}`;
            const targetFile = `${iosPath}/${iosConstants_1.NSE_TARGET_NAME}/${iosConstants_1.NSE_SOURCE_FILE}`;
            await FileManager_1.FileManager.copyFile(`${sourcePath}`, targetFile);
            /* MODIFY COPIED EXTENSION FILES */
            const nseUpdater = new NseUpdaterManager_1.default(iosPath);
            await nseUpdater.updateNSEEntitlements(`group.${(_b = config.ios) === null || _b === void 0 ? void 0 : _b.bundleIdentifier}.nse`, props === null || props === void 0 ? void 0 : props.filtering);
            await nseUpdater.updateNSEBundleVersion((_d = (_c = config.ios) === null || _c === void 0 ? void 0 : _c.buildNumber) !== null && _d !== void 0 ? _d : iosConstants_1.DEFAULT_BUNDLE_VERSION);
            await nseUpdater.updateNSEBundleShortVersion((_e = config === null || config === void 0 ? void 0 : config.version) !== null && _e !== void 0 ? _e : iosConstants_1.DEFAULT_BUNDLE_SHORT_VERSION);
            return config;
        },
    ]);
};
const withOneSignalXcodeProject = (config, props) => {
    return (0, config_plugins_1.withXcodeProject)(config, newConfig => {
        var _a, _b;
        const xcodeProject = newConfig.modResults;
        if (!!xcodeProject.pbxTargetByName(iosConstants_1.NSE_TARGET_NAME)) {
            Log_1.Log.log(`${iosConstants_1.NSE_TARGET_NAME} already exists in project. Skipping...`);
            return newConfig;
        }
        // Create new PBXGroup for the extension
        const extGroup = xcodeProject.addPbxGroup([...iosConstants_1.NSE_EXT_FILES, iosConstants_1.NSE_SOURCE_FILE], iosConstants_1.NSE_TARGET_NAME, iosConstants_1.NSE_TARGET_NAME);
        // Add the new PBXGroup to the top level group. This makes the
        // files / folder appear in the file explorer in Xcode.
        const groups = xcodeProject.hash.project.objects["PBXGroup"];
        Object.keys(groups).forEach(function (key) {
            if (typeof groups[key] === "object" && groups[key].name === undefined && groups[key].path === undefined) {
                xcodeProject.addToPbxGroup(extGroup.uuid, key);
            }
        });
        // WORK AROUND for codeProject.addTarget BUG
        // Xcode projects don't contain these if there is only one target
        // An upstream fix should be made to the code referenced in this link:
        //   - https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxProject.js#L860
        const projObjects = xcodeProject.hash.project.objects;
        projObjects['PBXTargetDependency'] = projObjects['PBXTargetDependency'] || {};
        projObjects['PBXContainerItemProxy'] = projObjects['PBXTargetDependency'] || {};
        // Add the NSE target
        // This adds PBXTargetDependency and PBXContainerItemProxy for you
        const nseTarget = xcodeProject.addTarget(iosConstants_1.NSE_TARGET_NAME, "app_extension", iosConstants_1.NSE_TARGET_NAME, `${(_a = config.ios) === null || _a === void 0 ? void 0 : _a.bundleIdentifier}.${iosConstants_1.NSE_TARGET_NAME}`);
        // Add build phases to the new target
        xcodeProject.addBuildPhase(["NotificationService.m"], "PBXSourcesBuildPhase", "Sources", nseTarget.uuid);
        xcodeProject.addBuildPhase([], "PBXResourcesBuildPhase", "Resources", nseTarget.uuid);
        xcodeProject.addBuildPhase([], "PBXFrameworksBuildPhase", "Frameworks", nseTarget.uuid);
        // Edit the Deployment info of the new Target, only IphoneOS and Targeted Device Family
        // However, can be more
        const configurations = xcodeProject.pbxXCBuildConfigurationSection();
        for (const key in configurations) {
            if (typeof configurations[key].buildSettings !== "undefined" &&
                configurations[key].buildSettings.PRODUCT_NAME == `"${iosConstants_1.NSE_TARGET_NAME}"`) {
                const buildSettingsObj = configurations[key].buildSettings;
                buildSettingsObj.DEVELOPMENT_TEAM = props === null || props === void 0 ? void 0 : props.devTeam;
                buildSettingsObj.IPHONEOS_DEPLOYMENT_TARGET = (_b = props === null || props === void 0 ? void 0 : props.iPhoneDeploymentTarget) !== null && _b !== void 0 ? _b : iosConstants_1.IPHONEOS_DEPLOYMENT_TARGET;
                buildSettingsObj.TARGETED_DEVICE_FAMILY = iosConstants_1.TARGETED_DEVICE_FAMILY;
                buildSettingsObj.CODE_SIGN_ENTITLEMENTS = `${iosConstants_1.NSE_TARGET_NAME}/${iosConstants_1.NSE_TARGET_NAME}.entitlements`;
                buildSettingsObj.CODE_SIGN_STYLE = "Automatic";
            }
        }
        // Add development teams to both your target and the original project
        xcodeProject.addTargetAttribute("DevelopmentTeam", props === null || props === void 0 ? void 0 : props.devTeam, nseTarget);
        xcodeProject.addTargetAttribute("DevelopmentTeam", props === null || props === void 0 ? void 0 : props.devTeam);
        return newConfig;
    });
};
const withNotificationServicePodfile = (config, props) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        'ios',
        async (config) => {
            const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
            const podfileContent = await fs.promises.readFile(podfilePath, 'utf-8');
            if (podfileContent.includes("target 'NotificationServiceExtension' do")) {
                console.log("NotificationServiceExtension target already exists in Podfile. Skipping...");
                return config;
            }
            const insertion = `
  
target 'NotificationServiceExtension' do
  use_frameworks! :linkage => :static
  pod 'Firebase/Messaging'
end
`;
            const newPodfileContent = podfileContent + insertion;
            await fs.promises.writeFile(podfilePath, newPodfileContent);
            return config;
        }
    ]);
};
const withServiceExtensionIos = (config, props) => {
    config = withAppEnvironment(config, props);
    config = withRemoteNotificationsPermissions(config, props);
    config = withAppGroupPermissions(config, props);
    config = withOneSignalNSE(config, props);
    config = withOneSignalXcodeProject(config, props);
    config = withEasManagedCredentials(config, props);
    config = withNotificationServicePodfile(config, props);
    return config;
};
exports.withServiceExtensionIos = withServiceExtensionIos;
