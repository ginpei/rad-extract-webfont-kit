const fs = require('fs');
const path = require('path');
const css = require('../css');
const misc = require('../misc');

const cssFileName = 'MyFontsWebfontsKit/MyFontsWebfontsKit.css';
const htmlFileName = 'MyFontsWebfontsKit/StartHere.html';

/**
 * @param {string} srcDir
 * @returns {Promise<boolean>}
 */
module.exports.isMyFonts = (srcDir) => new Promise(async (resolve) => {
  const filePath = path.join(srcDir, cssFileName);

  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch (error) {
    resolve(false);
    return;
  }

  const text = await misc.readText(filePath);
  const result = text.includes('MyFonts Webfont Build ID');

  resolve(result);
});

/**
 * @param {string} dir
 * @param {string} fontFamily
 * @returns {Promise<string>}
 */
async function getDisplayName (dir, fontFamily) {
  // Expect such HTML:
  // <span class="QuireSansW04-ExtraLightIt" contenteditable="true">
  //   Quire Sans Extra Light Italic
  // </span>

  const startTag = `<span class="${fontFamily}" contenteditable="true">`;
  const endTag = '</span>';

  const htmlFilePath = path.join(dir, htmlFileName);
  const html = await misc.readText(htmlFilePath);

  const startsAt = html.indexOf(startTag) + startTag.length;
  const endsAt = html.indexOf(endTag, startsAt);
  const content = html.slice(startsAt, endsAt);

  const displayName = content.trim();
  return displayName;
}

/**
 * @param {import('css').FontFace} fontFace
 * @param {string} dir
 * @returns {Promise<Font>}
 */
async function buildFontData (fontFace, dir) {
  const fontFamily = css.getFontFamilyValue(fontFace);
  if (!fontFamily) {
    throw new Error('Font-family must be set');
  }

  const displayName = await getDisplayName(dir, fontFamily);

  /** @type {Font} */
  const font = {
    displayName,
    fontFamily,
    fontProvider: 'linotype',
    fontProviderWebSite: 'linotype.com',
    fontType: 'upload',
    image: {
      height: '25px',
      src: '',
      top: 0,
    },
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
 * @param {import('css').FontFace} fontFaceRule
 * @returns {string[]}
 */
function getFilePaths (fontFaceRule) {
  const pathList = [
    cssFileName,
    ...css.getFontFilePaths(fontFaceRule),
  ];
  return pathList;
}

/**
 * Parse files and create meta data file.
 * @param {string} srcDir
 * @returns {Promise<IFontMeta>}
 */
// eslint-disable-next-line arrow-body-style
module.exports.createMyFontsMeta = async (srcDir) => {
  // assume it contains only 1 font-face
  const cssFilePath = path.join(srcDir, cssFileName);
  const ast = await css.parseCssFile(cssFilePath);
  const [fontFaceRule] = css.filterFontFaceRule(ast.stylesheet.rules);
  if (!fontFaceRule) {
    throw new Error('Failed to find @font-face at-rule');
  }

  const files = getFilePaths(fontFaceRule);
  const font = await buildFontData(fontFaceRule, srcDir);

  /** @type {IFontMeta} */
  const data = {
    dir: srcDir,
    files,
    font,
  };
  return data;
};
