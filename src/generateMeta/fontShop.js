const path = require('path');
const misc = require('../misc');

/**
 * @param {string} dir
 * @returns {Promise<boolean>}
 */
module.exports.isFontShop = (dir) => new Promise(async (resolve, reject) => {
  try {
    // it should only one sub dir
    const [subDirName] = await misc.findSubDirs(dir);
    if (!subDirName) {
      resolve(false);
      return;
    }

    const subDirPath = path.join(dir, subDirName);
    const [htmlFileName] = await misc.findFilesByExtension(
      subDirPath,
      '.html',
    );
    if (!htmlFileName) {
      resolve(false);
      return;
    }

    const html = await misc.readText(path.join(subDirPath, htmlFileName));
    const tag = '<link rel="copyright" href="http://www.fontfont.com/" title="Copyright">';
    const result = html.includes(tag);

    resolve(result);
  } catch (error) {
    reject(error);
  }
});

/**
 * @param {string} srcDir
 * @param {string} subDir
 * @param {string} fileName
 * @returns {Promise<IFontMeta>}
 */
async function createOneMeta (srcDir, subDir, fileName) {
  const dir = path.join(srcDir, subDir);

  const displayName = path.basename(fileName, '.html');
  const fontFileName = `${displayName}Web.woff`;
  const cssFileName = `${displayName}.css`;

  const htmlFilePath = path.join(dir, fileName);
  const html = await misc.readText(htmlFilePath);
  const fontFamily = misc.pickUpSimpleTagContent(html, '<h2>', '</h2>');

  const cssText = `@font-face {
  font-family: ${fontFamily};
  src: url("${fontFileName}") format("woff");
}
`;
  await misc.writeText(path.join(dir, cssFileName), cssText);

  /** @type {Font} */
  const font = {
    displayName,
    fontFamily,
    fontProvider: 'FontShop',
    fontProviderWebSite: 'fontshop.com',
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
    kitVersion: '2013',
    selectedVariation: undefined,
    variations: [
      {
        displayName,
        fontFamily,
      },
    ],
  };

  /** @type {IFontMeta} */
  const data = {
    dir,
    files: [
      cssFileName,
      fontFileName,
    ],
    font,
  };
  return data;
}

/**
 * Parse files and create meta data file.
 * @param {string} srcDir
 * @returns {Promise<IFontMeta[]>}
 */
// eslint-disable-next-line arrow-body-style
module.exports.createFontShopMeta = async (srcDir) => {
  // it should only one sub dir
  const subDirNames = await misc.findSubDirs(srcDir);
  if (subDirNames.length !== 1) {
    throw new Error('Expected only one sub directory');
  }
  const subDirName = subDirNames[0];
  const subDirPath = path.join(srcDir, subDirName);
  const htmlFileNames = await misc.findFilesByExtension(subDirPath, '.html');

  const data = Promise.all(
    htmlFileNames.map((name) => createOneMeta(srcDir, subDirName, name)),
  );
  return data;
};
