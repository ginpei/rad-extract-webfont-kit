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
  const code = await misc.pickUpMonotypeCodeData(dir);

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
    'demo-async.css',
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
module.exports.createFontsComMeta = async (srcDir) => {
  const cssFilePath = path.join(srcDir, 'demo-async.css');
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
