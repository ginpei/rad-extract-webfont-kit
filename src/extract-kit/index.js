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
  const { outDir } = options;
  await extract(options.zipPath, outDir);
  await generateMeta(outDir, outDir);
  await generateThumbnail(outDir);
  cb(null);
};
