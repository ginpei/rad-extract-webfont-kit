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
module.exports.isMyFonts = (srcDir) => new Promise(async (resolve, reject) => {
  try {
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
  } catch (error) {
    reject(error);
  }
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
 * @param {string} dir
 */
async function buildCodeData (dir) {
  const html = await misc.readText(path.join(dir, 'MyFontsWebfontsKit/StartHere.html'));
  const licenseText = misc.pickUpSimpleTagContent(
    html,
    '<!--',
    '-->',
  );

  return { licenseText };
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

  const displayName = await getDisplayName(dir, fontFamily);
  const code = await buildCodeData(dir);

  /** @type {Font} */
  const font = {
    displayName,
    fontFamily,
    fontProvider: 'myfonts',
    fontProviderWebSite: 'myfonts.com',
    fontType: 'upload',
    image: {
      height: '25px',
      src: '',
      top: 0,
    },
    import: {
      code,
      urlBase: '',
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
 * @returns {Promise<IFontMeta[]>}
 */
// eslint-disable-next-line arrow-body-style
module.exports.createMyFontsMeta = async (srcDir) => {
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
