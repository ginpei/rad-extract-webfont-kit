const {
  createFontsComMultiMeta,
  isFontsComMulti,
} = require('./fontsComMulti');

const {
  createFontsComMeta,
  isFontsCom,
} = require('./fontsCom');

const {
  createFontShopMeta,
  isFontShop,
} = require('./fontShop');

const {
  createFontSquirrelMeta,
  isFontSquirrel,
} = require('./fontSquirrel');

const {
  createLinotypeMeta,
  isLinotype,
} = require('./linotype');

const {
  createMyFontsMeta,
  isMyFonts,
} = require('./myFonts');

const {
  createTransfonterMeta,
  isTransfonter,
} = require('./transfonter');

/**
 * Generate meta data JSON file to use web fonts.
 * @param {string} dir
 * @returns {Promise<IFontMeta[]>}
 */
module.exports = async (dir) => {
  if (await isFontsComMulti(dir)) {
    return createFontsComMultiMeta(dir);
  }

  if (await isFontsCom(dir)) {
    return createFontsComMeta(dir);
  }

  if (await isFontShop(dir)) {
    return createFontShopMeta(dir);
  }

  if (await isFontSquirrel(dir)) {
    return createFontSquirrelMeta(dir);
  }

  if (await isLinotype(dir)) {
    return createLinotypeMeta(dir);
  }

  if (await isMyFonts(dir)) {
    return createMyFontsMeta(dir);
  }

  if (await isTransfonter(dir)) {
    return createTransfonterMeta(dir);
  }

  throw new Error('Unsupported type of webfont kit');
};
