const fs = require('fs');
const path = require('path');
const yauzl = require("yauzl");

/**
 * @param {string} dirPath
 */
module.exports.prepareDir = prepareDir
function prepareDir(dirPath) {
  const dirNames = dirPath.split('/').reverse();
  var curPath = '';
  while (dirNames.length > 0) {
    curPath += dirNames.pop() + '/';
    if (!fs.existsSync(curPath)) {
      fs.mkdirSync(curPath);
    }
  }
}

/**
 * @param {string} zipPath
 * @param {(err: Error | null) => void} callback
 */
module.exports.extractFontFiles = extractFontFiles;
function extractFontFiles(zipPath, callback) {
  prepareDir('tmp/fonts');

  yauzl.open(zipPath, { lazyEntries: true }, (err, zipFile) => {
    if (err) {
      callback(new Error('Failed to open zip'));
      return;
    }

    zipFile.readEntry();
    zipFile.on('entry', (entry) => {
      const fileName = entry.fileName;
      console.log('# file', fileName);

      if (/\.ttf$/.test(fileName)) {
        const fontFileName = path.basename(fileName);
        const buffer = entry.extraFields.data;
        try {
          fs.writeFileSync(`tmp/fonts/${fontFileName}`, buffer);
        } catch (error) {
          callback(new Error('Failed to extract files'));
          return;
        }
      }

      // next
      zipFile.readEntry();
    });
    zipFile.on('end', () => {
      callback(null);
    });
  });
}
