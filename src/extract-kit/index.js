const { verboseLog } = require('../misc');
const extract = require('./extract');
const generateMeta = require('./generateMeta');

if (!global.extractWebfontKit) {
  global.extractWebfontKit = {
    verbose: false,
    verboseLog,
  };
}

/**
 * Generate thumbnail image of the font.
 * @param {string} dir
 */
// eslint-disable-next-line no-unused-vars
function generateThumbnail (dir) {
  // TODO
}

/**
 * @param {IExtractKitOptions} options
 * @param {(error: Error | null, result?: IExtractKitResult) => void} cb
 */
module.exports = async (options, cb) => {
  if (options.verbose) {
    global.extractWebfontKit.verbose = true;
  }

  try {
    const { outDir } = options;
    await extract(options.zipPath, outDir);
    const filePath = await generateMeta(outDir);
    await generateThumbnail(outDir);
    cb(null, filePath);
  } catch (error) {
    cb(error);
  }
};
