const path = require('path');
const tmp = require('tmp');
const extractKit = require('../../src');

/**
 * @param {string} fileName
 * @returns {Promise<IRunOnTmpResult>}
 */
module.exports = (fileName) => new Promise((resolve, reject) => {
  tmp.dir((err, tmpDir) => {
    if (err) { reject(err); return; }

    /** @type {IExtractKitOptions} */
    const options = {
      outDir: tmpDir,
      zipPath: path.join(__dirname, `../assets/${fileName}`),
    };
    extractKit(options, (error, result) => {
      resolve({
        error,
        metaList: result,
        tmpDir,
      });
    });
  });
});
