const extract = require('./extract');

/** @enum {string} */
const KitType = {
  'Fonts.com': 'Fonts.com',
  unknown: 'unknown',
};

/**
 * Detect which type of webfont kit is the target.
 * @param {string} dir
 * @returns {KitType}
 */
function detectKitType (dir) {
  return KitType.unknown;
}

/**
 * Generate meta data JSON file to use web fonts.
 * @param {string} dir
 */
function generateMeta (dir) {
  const type = detectKitType(dir);
}

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
  const dir = options.outDir;
  await extract(options.zipPath, dir);
  generateMeta(dir);
  generateThumbnail(dir);
  cb(null);
};
