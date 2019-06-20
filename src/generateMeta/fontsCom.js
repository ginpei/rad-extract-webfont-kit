const cssParser = require('css');
const fs = require('fs');
const path = require('path');
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
 * @param {string} srcDir
 * @returns {Promise<import('css').Stylesheet>}
 */
function parseCssFile (srcDir) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(srcDir, 'demo-async.css');
    fs.readFile(filePath, 'utf8', (error, cssText) => {
      if (error) {
        reject(error);
        return;
      }

      const ast = cssParser.parse(cssText);
      resolve(ast);
    });
  });
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
  // Expect such HTML:
  // <div class="fontdisplay">
  //     <div style="font-family:'Tabula ITC W01 Book';"> ITC Tabula™ W01 Book </div>
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
  const fontFamily = getFontFamilyName(fontFace);
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
  const [, file1, file2, format1, format2] = text.match(rxSrc);
  const file = file1 || file2;
  const format = format1 || format2;
  return [file, format];
}

/**
 * @param {import('css').FontFace} fontFace
 * @returns {string[]}
 */
function getFontFilePaths (fontFace) {
  /** @type {import('css').Declaration[]} */
  const srcDecList = fontFace.declarations.filter(
    (dec) => isDeclaration(dec) && dec.property === 'src',
  );

  // rewrite these with flat() when migrated Node.js v12
  /** @type {Set<string>} */
  const paths = new Set();
  srcDecList.forEach((dec) => {
    dec.value.split(',')
      .map((v) => parseUrl(v)) // [[filePath, format], ...]
      .forEach(([file]) => {
        let p = file;

        // remove query from like "my-font.eot?#iefix"
        const iSearch = p.indexOf('?');
        if (iSearch >= 0) {
          p = p.slice(0, iSearch);
        }

        // remove query from like "xxxxxxxx.svg#xxxxxxxx"
        const iHash = p.indexOf('#');
        if (iHash >= 0) {
          p = p.slice(0, iHash);
        }

        paths.add(p);
      });
  });

  return [...paths];
}

/**
 * @param {import('css').FontFace} fontFace
 * @returns {string[]}
 */
function getFilePaths (fontFace) {
  const pathList = [
    'demo-async.css',
    ...getFontFilePaths(fontFace),
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
  const ast = await parseCssFile(srcDir);
  const [fontFace] = filterFontFace(ast.stylesheet.rules);
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
