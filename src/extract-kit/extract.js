const Fontmin = require('fontmin');
const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');

const { Entry, ZipFile } = yauzl;

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
 * @returns {Promise<ZipFile>}
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
 * @param {ZipFile} zipFile
 * @param {(entry: Entry) => Promise<void>} onEntry
 * @returns {Promise<void>}
 */
function read (zipFile, onEntry) {
  return new Promise((resolve, reject) => {
    zipFile.readEntry();
    zipFile.on('error', (error) => reject(error)); // TODO check if correct
    zipFile.on(
      'entry',
      /** @type {(entry: Entry) => Promise<void>} */
      async (entry) => {
        await onEntry(entry);
        zipFile.readEntry();
      },
    );

    zipFile.on('end', () => {
      resolve();
    });
  });
}

/**
 * @param {ZipFile} zipFile
 * @param {Entry} entry
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
 * @param {ZipFile} zipFile
 * @param {Entry} entry
 * @param {string} destPath
 * @param {(err: Error | null) => void} callback
 */
function extract0 (zipFile, entry, destPath, callback) {
  zipFile.openReadStream(entry, (err, readStream) => {
    if (err) {
      console.error(err);
      callback(new Error('Failed to extract zipped file'));
      return;
    }

    readStream.on('end', () => callback(null));

    const writeStream = fs.createWriteStream(destPath);
    readStream.pipe(writeStream);
  });
}

/**
 * @param {string} zipPath
 * @param {string} fontsDir
 * @param {(err: Error | null) => void} callback
 */
function extractFontKit (zipPath, fontsDir, callback) {
  prepareDir(fontsDir);

  yauzl.open(zipPath, { lazyEntries: true }, (openZipError, zipFile) => {
    if (openZipError) {
      callback(new Error('Failed to open zip'));
      return;
    }

    zipFile.readEntry();
    zipFile.on('entry', (entry) => {
      const { fileName } = entry;
      const fontFileName = path.basename(fileName);
      const destPath = `${fontsDir}${fontFileName}`;
      extract0(zipFile, entry, destPath, (extractError) => {
        if (extractError) {
          callback(new Error('Failed to extract files'));
          return;
        }

        zipFile.readEntry();
      });
    });

    zipFile.on('end', () => {
      callback(null);
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
    filePaths.push(entry.fileName);
    return extractEntry(zipFile, entry, dest);
  });
  return filePaths;
};
