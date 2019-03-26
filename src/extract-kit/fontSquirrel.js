const css = require('css');
const fs = require('fs');
const path = require('path');
const { saveMeta } = require('./saveMeta');

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
  const ast = css.parse(cssText);
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
 * @param {import('css').Declaration | import('css').Comment} declaration
 * @returns {declaration is import('css').Declaration}
 */
function isDeclaration (declaration) {
  return declaration.type === 'declaration';
}

/**
 * @param {Array<import('css').Declaration | import('css').Comment>} declarations
 * @returns {Map<string, string>}
 */
function makeDeclarationMap (declarations) {
  const map = new Map();
  declarations.forEach((declaration) => {
    if (!isDeclaration(declaration)) {
      return;
    }

    const { property, value } = declaration;
    map.set(property, value);
  });
  return map;
}

/**
 * @param {Map<string, string>} declarations
 * @returns {Font}l
 */
function buildFontData (declarations) {
  const fontFamily = declarations.get('font-family');
  /** @type {Font} */
  const font = {
    displayName: fontFamily,
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
        displayName: fontFamily,
        fontFamily,
        monotypeVariationId: '', // TODO remove
      },
    ],
  };
  return font;
}

/**
 * Parse `src` values of `@font-face`.
 * @param {string} text
 * @returns {string[]}
 * @example
 * const src = `url(\'my-font.eot?#iefix\') format(\'embedded-opentype\'),
 *   url(\'my-font.woff\') format(\'woff\')'`;
 * const urls = parseUrls(src);
 * // [ 'my-font.eot?#iefix',
 * //   'my-font.woff']
 */
function parseUrls (text) {
  const rxUrl = /url\(('(.*?)'|"(.*?)")\)/g;
  const matches = text
    .match(rxUrl)
    .map((s) => s.slice(5, -2)); // 'url("xxx")' -> 'xxx'
  return matches;
}

/**
 * Parse files and create meta data file.
 * @param {string} srcDir
 * @returns {Promise<string>} Meta data file path.
 */
// eslint-disable-next-line arrow-body-style
module.exports.createFontSquirrelMeta = (srcDir) => {
  return new Promise((resolve, reject) => {
    const ast = parseCssFile(srcDir);
    const fontFaces = filterFontFace(ast.stylesheet.rules);
    const declarations = makeDeclarationMap(fontFaces[0].declarations);
    const font = buildFontData(declarations);
    const urls = parseUrls(declarations.get('src'));
    const data = { font };
    const filePath = saveMeta(data, srcDir);
    resolve(filePath);
  });
};
