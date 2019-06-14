const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');
const { verboseLog } = require('../misc');

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
 * @param {string} zipPath
 * @returns {Promise<yauzl.ZipFile>}
 */
function open (zipPath) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (error, zipFile) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(zipFile);
    });
  });
}

/**
 * @param {yauzl.ZipFile} zipFile
 * @param {(entry: yauzl.Entry) => Promise<void>} onEntry
 * @returns {Promise<void>}
 */
function read (zipFile, onEntry) {
  return new Promise((resolve, reject) => {
    zipFile.readEntry();
    zipFile.on('error', (error) => reject(error)); // TODO check if correct
    zipFile.on(
      'entry',
      /** @type {(entry: yauzl.Entry) => Promise<void>} */
      async (entry) => {
        try {
          await onEntry(entry);
          zipFile.readEntry();
        } catch (error) {
          reject(error);
        }
      },
    );

    zipFile.on('end', () => {
      resolve();
    });
  });
}

/**
 * @param {yauzl.ZipFile} zipFile
 * @param {yauzl.Entry} entry
 * @param {string} dest
 * @returns {Promise<void>}
 */
function extractEntry (zipFile, entry, dest) {
  return new Promise((resolve, reject) => {
    const { fileName } = entry;

    const dir = path.join(dest, path.dirname(fileName));
    prepareDir(dir);

    zipFile.openReadStream(entry, (err, readStream) => {
      if (err) {
        reject(err);
        return;
      }

      const filePath = path.join(dest, fileName);
      const writeStream = fs.createWriteStream(filePath);
      readStream.on('end', () => resolve());
      readStream.pipe(writeStream);
    });
  });
}

/**
 * Simply extract zip file.
 * @param {string} src
 * @param {string} dest
 * @returns {Promise<string[]>}
 */
module.exports = async (src, dest) => {
  const zipFile = await open(src);
  /** @type {string[]} */
  const filePaths = [];
  await read(zipFile, (entry) => {
    // skip directories
    if (entry.fileName.slice(-1) === '/') {
      return Promise.resolve();
    }

    verboseLog('extract...', entry.fileName);
    filePaths.push(entry.fileName);
    return extractEntry(zipFile, entry, dest);
  });
  return filePaths;
};
