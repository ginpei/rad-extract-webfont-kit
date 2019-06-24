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

const {
  createLinotypeMeta,
  isLinotype,
} = require('./linotype');

/**
 * Generate meta data JSON file to use web fonts.
 * @param {string} dir
 * @returns {Promise<IFontMeta>}
 */
module.exports = async (dir) => {
  if (await isFontsComMulti(dir)) {
    return createFontsComMultiMeta(dir);
  }

  if (await isFontsCom(dir)) {
    return createFontsComMeta(dir);
  }

  if (await isFontSquirrel(dir)) {
    return createFontSquirrelMeta(dir);
  }

  if (await isLinotype(dir)) {
    return createLinotypeMeta(dir);
  }

  throw new Error('Unsupported type of webfont kit');
};
