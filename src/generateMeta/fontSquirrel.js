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
 * @param {import('css').FontFace} fontFaceRule
 * @returns {string}
 */
function getFilePrefix (fontFaceRule) {
  if (!fontFaceRule.declarations) {
    throw new Error('Inconsistent font face rule: no declarations');
  }

  /** @type {import('css').Declaration | undefined} */
  const srcDec = fontFaceRule.declarations.find(
    (v) => css.isDeclaration(v) && v.property === 'src',
  );
  if (!srcDec) {
    throw new Error('Inconsistent font face rule: no src declaration');
  }
  if (!srcDec.value) {
    throw new Error('Inconsistent font face rule: no src value');
  }

  // assume it's like "nice_font-webfont.woff"
  const [fontFileName] = css.parseUrlDataType(srcDec.value);
  const iDash = fontFileName.lastIndexOf('-');
  if (iDash < 0) {
    throw new Error('Unknown font file name structure');
  }
  const prefix = fontFileName.slice(0, iDash);

  return prefix;
}

/**
 * @param {string} dir
 * @param {string} filePrefix
 * @returns {Promise<string>}
 */
async function getDisplayName (dir, filePrefix) {
  const startTag = '<div id="header">';
  const endTag = '</div>';

  const htmlPath = `${filePrefix}-demo.html`;
  let html = '';
  try {
    html = await misc.readText(path.join(dir, htmlPath));
  } catch (error) {
    console.error(error);
    throw new Error('Kit must contains an HTML file to parse');
  }

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

  const filePrefix = getFilePrefix(fontFaceRule);
  const displayName = await getDisplayName(dir, filePrefix);

  /** @type {Font} */
  const font = {
    displayName,
    fontFamily,
    fontProvider: 'Font Squirrel',
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
    kitVersion: '2017',
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
  const fontFaceRules = await css.findFontFaceRules(cssFilePath);

  const pDataList = fontFaceRules.map(async (rule) => {
    const files = getFilePaths(rule);
    const font = await buildFontData(rule, srcDir);

    /** @type {IFontMeta} */
    const data = {
      dir: srcDir,
      files,
      font,
    };
    return data;
  });

  const meta = await Promise.all(pDataList);
  return meta;
};
