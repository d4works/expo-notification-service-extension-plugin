"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NSE_EXT_FILES = exports.NSE_SOURCE_FILE = exports.NSE_TARGET_NAME = exports.DEFAULT_BUNDLE_SHORT_VERSION = exports.DEFAULT_BUNDLE_VERSION = exports.BUNDLE_VERSION_TEMPLATE_REGEX = exports.BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = exports.GROUP_IDENTIFIER_TEMPLATE_REGEX = exports.NSE_PODFILE_REGEX = exports.NSE_PODFILE_SNIPPET = exports.TARGETED_DEVICE_FAMILY = exports.IPHONEOS_DEPLOYMENT_TARGET = void 0;
exports.IPHONEOS_DEPLOYMENT_TARGET = "11.0";
exports.TARGETED_DEVICE_FAMILY = `"1,2"`;
exports.NSE_PODFILE_SNIPPET = `
target 'NotificationServiceExtension' do
  pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;
exports.NSE_PODFILE_REGEX = /target 'NotificationServiceExtension'/;
exports.GROUP_IDENTIFIER_TEMPLATE_REGEX = /{{GROUP_IDENTIFIER}}/gm;
exports.BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = /{{BUNDLE_SHORT_VERSION}}/gm;
exports.BUNDLE_VERSION_TEMPLATE_REGEX = /{{BUNDLE_VERSION}}/gm;
exports.DEFAULT_BUNDLE_VERSION = '1';
exports.DEFAULT_BUNDLE_SHORT_VERSION = '1.0';
exports.NSE_TARGET_NAME = "NotificationServiceExtension";
exports.NSE_SOURCE_FILE = "NotificationService.m";
exports.NSE_EXT_FILES = [
    "NotificationService.h",
    `${exports.NSE_TARGET_NAME}.entitlements`,
    `${exports.NSE_TARGET_NAME}-Info.plist`
];
