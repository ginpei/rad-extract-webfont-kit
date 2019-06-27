const fs = require('fs');
const path = require('path');

/**
 * @param {string} dirPath
 */
function prepareDir (dirPath) {
  const dirNames = dirPath.split('/').reverse();
  let curPath = '';
  while (dirNames.length > 0) {
    curPath += `${dirNames.pop()}/`;
    if (!fs.existsSync(curPath)) {
      fs.mkdirSync(curPath);
    }
  }
}
module.exports.prepareDir = prepareDir;

/**
 * @param {string} filePath
 * @returns {Promise<string>}
 */
function readText (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, text) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(text);
    });
  });
}
module.exports.readText = readText;

/**
 * @param {string} filePath
 * @param {string} text
 * @returns {Promise<string>}
 */
function writeText (filePath, text) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, text, 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}
module.exports.writeText = writeText;

/**
 * @param {import("fs").PathLike} dir
 * @returns {Promise<string[]>}
 */
function findSubDirs (dir) {
  return new Promise((resolve, reject) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const dirNames = entries
        .filter((v) => v.isDirectory())
        .map((v) => v.name);
      resolve(dirNames);
    } catch (error) {
      reject(error);
    }
  });
}
module.exports.findSubDirs = findSubDirs;

/**
 * @param {import("fs").PathLike} dir
 * @param {string} extension
 * @returns {Promise<string[]>}
 */
function findFilesByExtension (dir, extension) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, 'utf8', (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const targets = files.filter((v) => path.extname(v) === extension);
      resolve(targets);
    });
  });
}
module.exports.findFilesByExtension = findFilesByExtension;

/**
 * @param {string} source
 * @param {string} startTag
 * @param {string} endTag
 */
function pickUpSimpleTagContent (source, startTag, endTag) {
  const startTagIndex = source.indexOf(startTag);
  if (startTagIndex < 0) {
    throw new Error('Start tag is not found');
  }

  const startIndex = startTagIndex + startTag.length;
  const endIndex = source.indexOf(endTag, startIndex);
  if (endIndex < 0) {
    throw new Error('End tag is not found');
  }

  const text = source.slice(startIndex, endIndex)
    .replace(/\r\n/g, '\n')
    .trim();
  return text;
}
module.exports.pickUpSimpleTagContent = pickUpSimpleTagContent;

/**
 * @param {string} dir
 * @returns {Promise<{ licenseText?: string; trackerScript: string; }>}
 */
async function pickUpMonotypeCodeData (dir) {
  const html = await readText(path.join(dir, 'demo-async.htm'));
  const licenseText = pickUpSimpleTagContent(
    html,
    '<pre>',
    '</pre>',
  );
  const trackerScript = pickUpSimpleTagContent(
    html,
    '<script type="text/javascript">',
    '</script>',
  );
  return { licenseText, trackerScript };
}
module.exports.pickUpMonotypeCodeData = pickUpMonotypeCodeData;

/**
 * @param {any[]} args
 */
function verboseLog (...args) {
  // @ts-ignore
  if (!global.extractWebfontKit.verbose) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log('[extractWebfontKit]', ...args);
}
module.exports.verboseLog = verboseLog;
