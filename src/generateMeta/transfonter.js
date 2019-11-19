// TODO allow all files
/* eslint-disable no-use-before-define */

const fs = require('fs');
const path = require('path');
const css = require('../css');
const misc = require('../misc');

const cssFileName = 'stylesheet.css';
const htmlFileName = 'demo.html';

/**
 * @param {string} srcDir
 * @returns {Promise<boolean>}
 */
module.exports.isTransfonter = (srcDir) => new Promise(async (resolve) => {
  const filePath = path.join(srcDir, htmlFileName);

  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch (error) {
    resolve(false);
    return;
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const result = text.includes('<title>Transfonter demo</title>');

  resolve(result);
});

/**
 * Parse files and create meta data file.
 * @param {string} srcDir
 * @returns {Promise<IFontMeta[]>}
 */
// eslint-disable-next-line arrow-body-style
module.exports.createTransfonterMeta = async (srcDir) => {
  const cssFilePath = path.join(srcDir, cssFileName);
  const fontFaceRule = await css.findOneFontFaceRule(cssFilePath);

  const files = getFilePaths(fontFaceRule);
  const font = await buildFontData(fontFaceRule, srcDir);

  /** @type {IFontMeta} */
  const data = {
    dir: srcDir,
    files,
    font,
  };
  return [data];
};

/**
 * @param {import('css').FontFace} fontFaceRule
 * @returns {string[]}
 */
function getFilePaths (fontFaceRule) {
  const pathList = [
    'stylesheet.css',
    ...css.getFontFilePaths(fontFaceRule),
  ];
  return pathList;
}

/**
 * @param {import('css').FontFace} fontFaceRule
 * @param {string} dir
 * @returns {Promise<Font>}
 */
async function buildFontData (fontFaceRule, dir) {
  const fontFamily = css.getFontFamilyValue(fontFaceRule);
  if (!fontFamily) {
    throw new Error('Font-family must be set');
  }

  const displayName = await getDisplayName(dir);

  /** @type {Font} */
  const font = {
    displayName,
    fontFamily,
    fontProvider: 'Transfonter',
    fontProviderWebSite: 'transfonter.org',
    fontType: 'upload',
    image: {
      height: '25px',
      src: '',
      top: 0,
    },
    import: {
      code: {},
      urlBase: '',
    },
    kitVersion: '0',
    selectedVariation: undefined,
    variations: [
      {
        displayName,
        fontFamily,
      },
    ],
  };
  return font;
}

/**
 * @param {string} dir
 * @returns {Promise<string>}
 */
async function getDisplayName (dir) {
  const startTag = '<h1>';
  const endTag = '</h1>';

  const html = await misc.readText(path.join(dir, htmlFileName));

  const startsAt = html.indexOf(startTag) + startTag.length;
  const endsAt = html.indexOf(endTag, startsAt);
  const content = html.slice(startsAt, endsAt);

  const displayName = content.trim();
  return displayName;
}
