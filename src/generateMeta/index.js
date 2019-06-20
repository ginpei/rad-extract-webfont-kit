const {
  createFontsComMultiMeta,
  isFontsComMulti,
} = require('./fontsComMulti');

const {
  createFontsComMeta,
  isFontsCom,
} = require('./fontsCom');

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

  if (await isFontsCom(dir)) {
    return KitType.fontsCom;
  }

  if (await isFontSquirrel(dir)) {
    return KitType.fontSquirrelCom;
  }

  return KitType.unknown;
}

/**
 * Generate meta data JSON file to use web fonts.
 * @param {string} srcDir
 * @returns {Promise<IFontMeta>}
 */
module.exports = async (srcDir) => {
  const type = await detectKitType(srcDir);
  if (type === KitType.fontsComMulti) {
    return createFontsComMultiMeta(srcDir);
  }

  if (type === KitType.fontsCom) {
    return createFontsComMeta(srcDir);
  }

  if (type === KitType.fontSquirrelCom) {
    return createFontSquirrelMeta(srcDir);
  }

  throw new Error('Unsupported type of webfont kit');
};
