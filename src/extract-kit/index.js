const extract = require('./extract');
const generateMeta = require('./generateMeta');

/**
 * Generate thumbnail image of the font.
 * @param {string} dir
 */
function generateThumbnail (dir) {}

/**
 * @param {IExtractKitOptions} options
 * @param {(error: Error | null, result?: IExtractKitResult) => void} cb
 */
module.exports = async (options, cb) => {
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
