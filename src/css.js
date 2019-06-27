const cssParser = require('css');
const fs = require('fs');

/**
 * @param {string} cssFilePath
 * @returns {Promise<import('css').Stylesheet>}
 */
function parseCssFile (cssFilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(cssFilePath, 'utf8', (error, cssText) => {
      if (error) {
        reject(error);
        return;
      }

      const ast = cssParser.parse(cssText);
      resolve(ast);
    });
  });
}
module.exports.parseCssFile = parseCssFile;

/**
 * @param {Array<import('css').Rule | import('css').Comment | import('css').AtRule>} rules
 * @returns {import('css').FontFace[]}
 */
function filterFontFaceRule (rules) {
  return rules.filter((rule) => rule.type === 'font-face');
}
module.exports.filterFontFaceRule = filterFontFaceRule;

/**
 * @param {string} cssFilePath
 */
async function findOneFontFaceRule (cssFilePath) {
  // assume it contains only 1 font-face
  const ast = await parseCssFile(cssFilePath);
  if (!ast.stylesheet) {
    throw new Error('Stylesheet has no rules');
  }

  const rules = filterFontFaceRule(ast.stylesheet.rules);
  if (rules.length < 1) {
    throw new Error('Failed to find @font-face at-rule');
  }
  if (rules.length > 1) {
    throw new Error('It contains more than 1 @font-face at-rules');
  }

  const fontFaceRule = rules[0];
  return fontFaceRule;
}
module.exports.findOneFontFaceRule = findOneFontFaceRule;

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
function parseUrlDataType (text) {
  const rxSrc = /url\((?:'(.*?)'|"(.*?)")\)(?: format\((?:'(.*?)'|"(.*?)")\))?/;
  const [,
    file1 = '',
    file2 = '',
    format1 = '',
    format2 = '',
  ] = text.match(rxSrc) || [];
  const file = file1 || file2;
  const format = format1 || format2;
  return [file, format];
}

/**
 * @param {import('css').Declaration | import('css').Comment} declaration
 * @returns {declaration is import('css').Declaration}
 */
function isDeclaration (declaration) {
  return declaration.type === 'declaration';
}
module.exports.isDeclaration = isDeclaration;

/**
 * @param {import('css').FontFace} fontFaceRule
 * @returns {string}
 */
function getFontFamilyValue (fontFaceRule) {
  if (!fontFaceRule.declarations) {
    throw new Error('No declarations found');
  }

  /** @type {import('css').Declaration | undefined} */
  const fontFamilyDec = fontFaceRule.declarations.find((dec) => {
    if (!isDeclaration(dec)) { return false; }
    return dec.property === 'font-family';
  });
  if (!fontFamilyDec || !fontFamilyDec.value) {
    return '';
  }

  const fontFamily = fontFamilyDec.value
    .slice(1, -1); // "'foo'" => 'foo'
  return fontFamily;
}
module.exports.getFontFamilyValue = getFontFamilyValue;

/**
 * @param {import('css').FontFace} fontFaceRule
 * @returns {string[]}
 */
function getFontFilePaths (fontFaceRule) {
  if (!fontFaceRule.declarations) {
    throw new Error('No declarations found');
  }

  /** @type {import('css').Declaration[]} */
  const srcDecList = fontFaceRule.declarations.filter(
    (dec) => isDeclaration(dec) && dec.property === 'src',
  );

  // rewrite these with flat() when migrated to Node.js v12
  /** @type {Set<string>} */
  const paths = new Set();
  srcDecList.forEach(({ value = '' }) => {
    value.split(',')
      .map((v) => parseUrlDataType(v)) // [[filePath, format], ...]
      .forEach(([file]) => {
        let p = file;

        // remove query from like "my-font.eot?#iefix"
        const iQuery = p.indexOf('?');
        if (iQuery >= 0) {
          p = p.slice(0, iQuery);
        }

        // remove hash from like "xxxxxxxx.svg#xxxxxxxx"
        const iHash = p.indexOf('#');
        if (iHash >= 0) {
          p = p.slice(0, iHash);
        }

        paths.add(p);
      });
  });

  return [...paths];
}
module.exports.getFontFilePaths = getFontFilePaths;
