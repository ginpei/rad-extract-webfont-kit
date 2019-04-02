const cssParser = require('css');
const fs = require('fs');
const path = require('path');
const { saveMeta } = require('./saveMeta');
const misc = require('../misc');

/**
 * @param {string} srcDir
 * @returns {Promise<boolean>}
 */
module.exports.isFontSquirrel = (srcDir) => {
  const filePath = path.join(srcDir, 'generator_config.txt');
  const text = fs.readFileSync(filePath, 'utf8');

  const startText = '# Font Squirrel Font-face Generator Configuration File';
  const result = text.startsWith(startText);

  return Promise.resolve(result);
};

/**
 * @param {string} srcDir
 * @returns {import('css').Stylesheet}
 */
function parseCssFile (srcDir) {
  const filePath = path.join(srcDir, 'stylesheet.css');
  const cssText = fs.readFileSync(filePath, 'utf8');
  const ast = cssParser.parse(cssText);
  return ast;
}

/**
 * @param {Array<import('css').Rule | import('css').Comment | import('css').AtRule>} rules
 * @returns {import('css').FontFace[]}
 */
function filterFontFace (rules) {
  return rules.filter((rule) => rule.type === 'font-face');
}

/**
 * @param {string} dir
 * @returns {Promise<IKitCode>}
 */
async function buildCodeData (dir) {
  const css = await misc.readText(path.join(dir, 'stylesheet.css'));
  const js = '';
  return { css, js };
}

/**
 * @param {import('css').Declaration | import('css').Comment} declaration
 * @returns {declaration is import('css').Declaration}
 */
function isDeclaration (declaration) {
  return declaration.type === 'declaration';
}

/**
 * @param {import('css').FontFace} fontFace
 * @returns {string}
 */
function getFontFamilyName (fontFace) {
  /** @type {import('css').Declaration | null} */
  const fontFamilyDec = fontFace.declarations.find((dec) => {
    if (!isDeclaration(dec)) { return false; }
    return dec.property === 'font-family';
  });
  if (!fontFamilyDec) {
    return '';
  }

  const fontFamily = fontFamilyDec.value
    .slice(1, -1); // "'foo'" => 'foo'
  return fontFamily;
}

/**
 * @param {string} dir
 * @returns {Promise<string>}
 */
async function getDisplayName (dir) {
  const startTag = '<div id="header">';
  const endTag = '</div>';

  // assume there is only 1 HTML file
  const [htmlPath] = await misc.findFilesWithExtension(dir, '.html');
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
  const fontFamily = getFontFamilyName(fontFace);
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
    fontType: 'standard',
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
 * Parse `src` values of `@font-face`.
 * Split by "," before passing text.
 * @param {string} text
 * @returns {string[]}
 * @example
 * const src = `url(\'my-font.eot?#iefix\') format(\'embedded-opentype\'),
 *   url(\'my-font.woff\') format(\'woff\')'`;
 * const list = src.split(',');
 * const pairs = list.map((v) => parseUrl(v));
 * // [ ['my-font.eot', 'embedded-opentype'],
 * //   ['my-font.woff', 'woff'] ]
 */
function parseUrl (text) {
  const rxSrc = /url\((?:'(.*?)'|"(.*?)")\)(?: format\((?:'(.*?)'|"(.*?)")\))?/;
  const [all, file1, file2, format1, format2] = text.match(rxSrc);
  const file = file1 || file2;
  const format = format1 || format2;
  return [file, format];
}

/**
 * @param {import('css').FontFace} fontFace
 * @returns {{ [fileType: string]: string }}
 */
function buildFontFileData (fontFace) {
  /** @type {import('css').Declaration[]} */
  const srcDecList = fontFace.declarations.filter(
    (dec) => isDeclaration(dec) && dec.property === 'src',
  );

  /** @type {{ [fileType: string]: string }} */
  const map = {};
  srcDecList.forEach((dec) => {
    const { value } = dec;
    const pairs = value.split(',').map((v) => parseUrl(v));
    pairs.forEach(([file, format = 'fallback']) => {
      const i = file.indexOf('?');
      map[format] = i < 0 ? file : file.slice(0, i);
    });
  });

  return map;
}

/**
 * @param {import('css').FontFace} fontFace
 * @returns {IKitFileInformation}
 */
function buildFileData (fontFace) {
  const fontFamily = getFontFamilyName(fontFace);
  const fontFileData = buildFontFileData(fontFace);

  /** @type {IKitFileInformation} */
  const file = {
    css: ['stylesheet.css'],
    fonts: {
      [fontFamily]: fontFileData,
    },
    js: [],
  };
  return file;
}

/**
 * Parse files and create meta data file.
 * @param {string} srcDir
 * @returns {Promise<string>} Meta data file path.
 */
// eslint-disable-next-line arrow-body-style
module.exports.createFontSquirrelMeta = async (srcDir) => {
  // assume it contains only 1 font-face
  const ast = parseCssFile(srcDir);
  const [fontFace] = filterFontFace(ast.stylesheet.rules);

  const code = await buildCodeData(srcDir);
  const font = await buildFontData(fontFace, srcDir);
  const files = buildFileData(fontFace);

  /** @type {IFontMeta} */
  const data = { code, font, files };
  const filePath = saveMeta(data, srcDir);
  return filePath;
};
