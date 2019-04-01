
const fs = require('fs');
const parser = require('fast-xml-parser');
const path = require('path');
const { saveMeta } = require('./saveMeta');

/**
 * @param {string} dir
 * @returns {Promise<boolean>}
 */
module.exports.isFontsComMulti = (dir) => Promise.resolve(fs.existsSync(path.join(dir, 'fontlist.xml')));

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
 * @param {string} dir
 * @returns {IKitCode}
 */
function buildCodeData (kitFonts, dir) {
  const html = fs.readFileSync(path.join(dir, 'demo-async.htm'));
  const licenseStartIndex = html.indexOf('<pre>/*') + 5;
  const licenseEndIndex = html.indexOf('*/</pre>') + 2;
  const licenseCssComment = html.slice(licenseStartIndex, licenseEndIndex);

  const cssBody = fs.readFileSync(path.join(dir, 'demo-async.css'), 'utf8');
  const css = `${licenseCssComment}\n${cssBody}`;

  const js = fs.readFileSync(path.join(dir, 'mtiFontTrackingCode.js'), 'utf8');
  return { css, js };
}

/**
 * @param {FontsComXmlRecord[]} kitFonts
 */
function buildFontsData (kitFonts) {
  /** @type {IFontVariationFileMap} */
  const fonts = {
    [kitFonts[0].cssFamilyName]: {},
  };
  kitFonts.forEach((font) => {
    fonts[font.cssFamilyName] = {
      eot: font.eot,
      fallback: font.eot,
      svg: font.svg,
      ttf: font.ttf,
      woff: font.woff,
      woff2: font.woff2,
    };
  });
  return fonts;
}

/**
 * @param {FontsComXmlRecord[]} kitFonts
 * @returns {IKitFileInformation}
 */
function buildFileData (kitFonts) {
  /** @type {IKitFileInformation} */
  const files = {
    css: ['demo-async.css'],
    fonts: buildFontsData(kitFonts),
    js: ['mtiFontTrackingCode.js'],
  };
  return files;
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
      monotypeVariationId: '',
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
 * Parse files and create meta data file.
 * @param {string} srcDir
 * @returns {Promise<string>} Meta data file path.
 */
module.exports.createFontsComMultiMeta = (srcDir) => new Promise((resolve, reject) => {
  const kitFonts = readFontsComXml(srcDir);

  const code = buildCodeData(kitFonts, srcDir);
  const files = buildFileData(kitFonts);
  const font = createFont(kitFonts);

  /** @type {IFontMeta} */
  const data = { code, files, font };
  const destFile = saveMeta(data, srcDir);

  resolve(destFile);
});
