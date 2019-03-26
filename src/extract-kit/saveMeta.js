const fs = require('fs');
const path = require('path');

/**
 * @param {IFontMeta} data
 * @param {string} destDir
 * @returns {string} Path of the result file.
 */
module.exports.saveMeta = (data, destDir) => {
  const json = JSON.stringify(data);
  const dest = path.join(destDir, 'rad-font.json');
  fs.writeFileSync(dest, json, 'utf8');
  return dest;
};
