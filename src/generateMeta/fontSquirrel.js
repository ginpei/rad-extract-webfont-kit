const fs = require('fs');
const path = require('path');
const css = require('../css');
const misc = require('../misc');

/**
 * @param {string} srcDir
 * @returns {Promise<boolean>}
 */
module.exports.isFontSquirrel = (srcDir) => {
  const filePath = path.join(srcDir, 'generator_config.txt');

  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch (error) {
    return Promise.resolve(false);
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const startText = '# Font Squirrel Font-face Generator Configuration File';
  const result = text.startsWith(startText);

  return Promise.resolve(result);
};

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
 * @param {import('css').FontFace} fontFace
 * @param {string} dir
 * @returns {Promise<Font>}
 */
async function buildFontData (fontFace, dir) {
  const fontFamily = css.getFontFamilyValue(fontFace);
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
    monotypeVariationId: '', // TODO remove
    selectedVariation: undefined,
    variations: [
      {
        displayName,
        fontFamily,
        monotypeVariationId: '', // TODO remove
      },
    ],
  };
  return font;
}

/**
 * @param {import('css').FontFace} fontFace
 * @returns {string[]}
 */
function getFilePaths (fontFace) {
  const pathList = [
    'stylesheet.css',
    ...css.getFontFilePaths(fontFace),
  ];
  return pathList;
}

/**
 * Parse files and create meta data file.
 * @param {string} srcDir
 * @returns {Promise<IFontMeta>}
 */
// eslint-disable-next-line arrow-body-style
module.exports.createFontSquirrelMeta = async (srcDir) => {
  // assume it contains only 1 font-face
  const cssFilePath = path.join(srcDir, 'stylesheet.css');
  const ast = await css.parseCssFile(cssFilePath);
  const [fontFace] = css.filterFontFaceRule(ast.stylesheet.rules);
  if (!fontFace) {
    throw new Error('Failed to find @font-face at-rule');
  }

  const files = getFilePaths(fontFace);
  const font = await buildFontData(fontFace, srcDir);

  /** @type {IFontMeta} */
  const data = {
    dir: srcDir,
    files,
    font,
  };
  return data;
};
