const fs = require('fs');
const path = require('path');
const css = require('../css');
const misc = require('../misc');

/**
 * @param {string} srcDir
 * @returns {Promise<boolean>}
 */
module.exports.isFontsCom = (srcDir) => new Promise((resolve) => {
  const filePath = path.join(srcDir, 'demo-async.htm');

  try {
    fs.accessSync(filePath, fs.constants.F_OK);
  } catch (error) {
    resolve(false);
    return;
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const result = text.includes('<h1 class="demo">Fonts.com Web fonts</h1>');

  resolve(result);
});

/**
 * @param {string} dir
 * @returns {Promise<string>}
 */
async function getDisplayName (dir) {
  // Expect such HTML:
  // <div class="fontdisplay">
  //   <div style="font-family:'Tabula ITC W01 Book';"> ITC Tabula™ W01 Book </div>
  // </div>

  const startTag = '<div class="fontdisplay">';

  const html = await misc.readText(path.join(dir, 'demo-async.htm'));

  const wrapperStartsAt = html.indexOf(startTag);
  const startsAt = html.indexOf('>', wrapperStartsAt + startTag.length + 1) + 1;
  const endsAt = html.indexOf('</div>', startsAt);
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
    fontProvider: 'fonts.com',
    fontProviderWebSite: 'fonts.com',
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
    'demo-async.css',
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
module.exports.createFontsComMeta = async (srcDir) => {
  // assume it contains only 1 font-face
  const cssFilePath = path.join(srcDir, 'demo-async.css');
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
