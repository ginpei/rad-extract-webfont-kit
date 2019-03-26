const fs = require('fs');
const parser = require('fast-xml-parser');
const path = require('path');

/**
 * @param {string} dir
 * @returns {Promise<boolean>}
 */
module.exports.isFontsComMulti = (dir) => new Promise((resolve, reject) => {
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

/**
 * @param {string} srcDir
 * @returns {FontsComXmlRecord[]}
 */
function readFontsComXml (srcDir) {
  const xml = fs.readFileSync(path.join(srcDir, 'fontlist.xml'), 'utf8');

  /** @type {Partial<import('fast-xml-parser').X2jOptions>} */
  const options = {
    attributeNamePrefix: '',
    ignoreAttributes: false,
  };
  const data = parser.parse(xml, options);

  /** @type {FontsComXmlRecord[]} */
  const fonts = data.fonts.font.map((font) => ({
    cssFamilyName: font.CssFamilyName,
    displayName: font.displayName,
    eot: path.join('Fonts/', font.eot),
    familyName: font.FamilyName,
    fontStretch: font.FontStretch,
    fontStyle: font.FontStyle,
    fontWeight: font.FontWeight,
    psName: font.psName,
    svg: path.join('Fonts/', font.svg),
    ttf: path.join('Fonts/', font.ttf),
    woff: path.join('Fonts/', font.woff),
    woff2: path.join('Fonts/', font.woff2),
  }));
  return fonts;
}

/**
 * @param {FontsComXmlRecord[]} kitFonts
 * @returns {FontVariation[]}
 */
function createVariations (kitFonts) {
  return [];
}

/**
 * @param {FontsComXmlRecord[]} kitFonts
 * @returns {Font}
 */
function createFont (kitFonts) {
  /** @type {Font} */
  const font = {
    displayName: kitFonts[0].familyName,
    fontFamily: kitFonts[0].familyName,
    fontProvider: 'fonts.com',
    fontProviderWebSite: 'fonts.com',
    fontType: 'standard', // TODO optional?
    image: {
      height: '25px',
      src: '',
      top: 0,
    },
    monotypeVariationId: '',
    selectedVariation: undefined,
    variations: createVariations(kitFonts),
  };
  return font;
}

/**
 * @param {IFontMeta} data
 * @param {string} destDir
 * @returns {string} Path of the result file.
 */
function writeJson (data, destDir) {
  const json = JSON.stringify(data);
  const dest = path.join(destDir, 'rad-font.json');
  fs.writeFileSync(dest, json, 'utf8');
  return dest;
}

/**
 * Parse files and create meta data file.
 * @param {string} srcDir
 * @param {string} destDir
 * @returns {Promise<string>} Meta data file path.
 */
module.exports.createFontsComMultiMeta = (srcDir, destDir) => new Promise((resolve, reject) => {
  const kitFonts = readFontsComXml(srcDir);
  const font = createFont(kitFonts);

  /** @type {IFontMeta} */
  const meta = { font };
  const destFile = writeJson(meta, destDir);

  resolve(destFile);
});
