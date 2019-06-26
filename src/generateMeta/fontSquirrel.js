const fs = require('fs');
const path = require('path');
const css = require('../css');
const misc = require('../misc');

/**
 * @param {string} srcDir
 * @returns {Promise<boolean>}
 */
module.exports.isFontSquirrel = (srcDir) => new Promise((resolve, reject) => {
  try {
    const filePath = path.join(srcDir, 'generator_config.txt');

    try {
      fs.accessSync(filePath, fs.constants.F_OK);
    } catch (error) {
      resolve(false);
      return;
    }

    const text = fs.readFileSync(filePath, 'utf8');
    const startText = '# Font Squirrel Font-face Generator Configuration File';
    const result = text.startsWith(startText);

    resolve(result);
  } catch (error) {
    reject(error);
  }
});

/**
 * @param {string} dir
 * @returns {Promise<string>}
 */
async function getDisplayName (dir) {
  const startTag = '<div id="header">';
  const endTag = '</div>';

  // assume there is only 1 HTML file
  const [htmlPath] = await misc.findFilesByExtension(dir, '.html');
  if (!htmlPath) {
    throw new Error('Kit must contains an HTML file to parse');
  }
  const html = await misc.readText(path.join(dir, htmlPath));

  const startsAt = html.indexOf(startTag) + startTag.length;
  const endsAt = html.indexOf(endTag, startsAt);
  const content = html.slice(startsAt, endsAt);

  const displayName = content.trim();
  return displayName;
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
    fontProvider: 'fontsquirrel.com',
    fontProviderWebSite: 'fontsquirrel.com',
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
    'stylesheet.css',
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
module.exports.createFontSquirrelMeta = async (srcDir) => {
  const cssFilePath = path.join(srcDir, 'stylesheet.css');
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
