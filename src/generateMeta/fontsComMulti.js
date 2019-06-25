
const fs = require('fs');
const parser = require('fast-xml-parser');
const path = require('path');

/**
 * @param {string} dir
 * @returns {Promise<boolean>}
 */
module.exports.isFontsComMulti = (dir) => new Promise((resolve, reject) => {
  try {
    // TODO replace with new API
    const result = fs.existsSync(path.join(dir, 'fontlist.xml'));
    resolve(result);
  } catch (error) {
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
 * @returns {string[]}
 */
function buildFontsData (kitFonts) {
  const pathList = kitFonts
    .map((font) => [
      font.eot,
      font.eot,
      font.svg,
      font.ttf,
      font.woff,
      font.woff2,
    ])
    .reduce((all, partial) => [
      ...all,
      ...partial,
    ], []);
  return pathList;
}

/**
 * @param {FontsComXmlRecord[]} kitFonts
 * @returns {string[]}
 */
function buildFileData (kitFonts) {
  const pathList = [
    'demo-async.css',
    'mtiFontTrackingCode.js',
    ...buildFontsData(kitFonts),
  ];
  return pathList;
}

/**
 * @param {FontsComXmlRecord[]} kitFonts
 * @returns {FontVariation[]}
 */
function createVariations (kitFonts) {
  /** @type {FontVariation[]} */
  const variations = kitFonts.map((font) => {
    const { cssFamilyName } = font;
    const displayName = cssFamilyName.startsWith(font.familyName)
      ? (cssFamilyName.slice(font.familyName.length).trim() || 'Regular')
      : cssFamilyName;

    /** @type {FontVariation} */
    const variation = {
      displayName,
      fontFamily: font.cssFamilyName,
    };
    return variation;
  });
  return variations;
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
    fontType: 'upload',
    image: {
      height: '25px',
      src: '',
      top: 0,
    },
    selectedVariation: undefined,
    variations: createVariations(kitFonts),
  };
  return font;
}

/**
 * Parse files and create meta data file.
 * @param {string} srcDir
 * @returns {Promise<IFontMeta[]>}
 */
module.exports.createFontsComMultiMeta = (srcDir) => new Promise(async (resolve) => {
  const kitFonts = readFontsComXml(srcDir);

  /** @type {IFontMeta} */
  const data = {
    dir: srcDir,
    files: buildFileData(kitFonts),
    font: createFont(kitFonts),
  };
  resolve([data]);
});
