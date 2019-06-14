const {
  createFontsComMultiMeta,
  isFontsComMulti,
} = require('./fontsComMulti');

const {
  createFontSquirrelMeta,
  isFontSquirrel,
} = require('./fontSquirrel');

/** @enum {string} */
const KitType = {
  fontsCom: 'fontsCom',
  fontsComMulti: 'fontsComMulti',
  fontSquirrelCom: 'fontSquirrelCom',
  unknown: 'unknown',
};

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
 * @returns {Promise<string>}
 */
module.exports = async (srcDir) => {
  const type = await detectKitType(srcDir);
  if (type === KitType.fontsComMulti) {
    const metaFilePath = await createFontsComMultiMeta(srcDir);
    return metaFilePath;
  }
  if (type === KitType.fontSquirrelCom) {
    const metaFilePath = await createFontSquirrelMeta(srcDir);
    return metaFilePath;
  }

  throw new Error('Unknown type of webfont kit');
};
