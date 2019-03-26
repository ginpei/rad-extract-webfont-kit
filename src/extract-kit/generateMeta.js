const fs = require('fs');
const path = require('path');
const createFontsComMultiMeta = require('./createFontsComMultiMeta');

/** @enum {string} */
const KitType = {
  fontsCom: 'fontsCom',
  fontsComMulti: 'fontsComMulti',
  fontSquirrelCom: 'fontSquirrelCom',
  unknown: 'unknown',
};

/**
 * @param {string} dir
 * @returns {Promise<boolean>}
 */
function isFontsComMulti (dir) {
  return new Promise((resolve, reject) => {
    try {
      fs.statSync(path.join(dir, 'fontlist.xml'));
      resolve(true);
    } catch (error) {
      if (error.message.startsWith('ENOENT:')) {
        resolve(false);
        return;
      }

      reject(error);
    }
  });
}

/**
 * @param {string} dir
 * @returns {Promise<boolean>}
 */
function isFontSquirrel (dir) {
  const startText = '# Font Squirrel Font-face Generator Configuration File';

  return new Promise((resolve, reject) => {
    try {
      const text = fs.readFileSync(path.join(dir, 'generator_config.txt'), 'utf8');
      const result = text.startsWith(startText);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Detect which type of webfont kit is the target.
 * @param {string} dir
 * @returns {Promise<KitType>}
 */
async function detectKitType (dir) {
  if (await isFontsComMulti(dir)) {
    return KitType.fontsComMulti;
  }
  if (await isFontSquirrel(dir)) {
    return KitType.fontSquirrelCom;
  }

  return KitType.unknown;
}

/**
 * Generate meta data JSON file to use web fonts.
 * @param {string} srcDir
 * @param {string} destDir
 * @returns {Promise<string>}
 */
module.exports = async (srcDir, destDir) => {
  const type = await detectKitType(srcDir);
  if (type === KitType.fontsComMulti) {
    const metaFilePath = await createFontsComMultiMeta(srcDir, destDir);
    return metaFilePath;
  }

  throw new Error('Unknown type of webfont kit');
};
