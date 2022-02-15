"use strict";

var pad = function pad(stringToPad, width, paddingCharacter) {
  var padChar = paddingCharacter || '0';
  var toPad = stringToPad.toString();
  return toPad.length >= width ? toPad : new Array(width - toPad.length + 1).join(padChar) + toPad;
};

var trimText = function trimText(s) {
  var indexOfString = s.search(/[^\d]/);
  var result = s;

  if (indexOfString > 0) {
    result = s.substring(0, indexOfString);
  }

  return result;
};

var versionEquals = function versionEquals(versionA, versionB) {
  return versionA.major === versionB.major && versionA.minor === versionB.minor && versionA.patch === versionB.patch;
};

var versionStringToVersion = function versionStringToVersion(versionString, currentVersion, currentVersionCode) {
  var versionParts = versionString.split('.');
  var build = 1;

  if (currentVersion && versionEquals(currentVersion, versionStringToVersion(versionString))) {
    var newVersionCode = (currentVersionCode + 1).toString();
    build = +newVersionCode.substr(newVersionCode.length - 1);

    if (build === 0) {
      throw new Error('Sorry you have more than 10 builds using that version consider bumping version or change your version manually');
    }
  }

  return {
    major: +trimText(versionParts[0] || '0'),
    minor: +trimText(versionParts[1] || '1'),
    patch: +trimText(versionParts[2] || '0'),
    build: build
  };
};

var versionToVersionCode = function versionToVersionCode(version) {
  var major = pad(version.major, 2);
  var minor = pad(version.minor, 2);
  var patch = pad(version.patch, 2);
  var build = version.build;
  return +"".concat(major).concat(minor).concat(patch).concat(build);
};

module.exports = {
  versionStringToVersion: versionStringToVersion,
  versionToVersionCode: versionToVersionCode
};