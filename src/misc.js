// @ts-ignore
const Fontmin = require('fontmin');
const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');

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
 * @param {yauzl.ZipFile} zipFile
 * @param {yauzl.Entry} entry
 * @param {string} destPath
 * @param {(err: Error | null) => void} callback
 */
function extract (zipFile, entry, destPath, callback) {
  zipFile.openReadStream(entry, (err, readStream) => {
    if (err) {
      console.error(err);
      callback(new Error('Failed to extract zipped file'));
      return;
    }

    if (!readStream) {
      callback(new Error(
        'Failed to open read stream while extracting zipped file',
      ));
      return;
    }

    readStream.on('end', () => callback(null));

    const writeStream = fs.createWriteStream(destPath);
    readStream.pipe(writeStream);
  });
}

/**
 * @param {string} filePath
 * @param {string} destPath
 * @param {string} glyph
 * @param {(err: Error | null) => void} callback
 */
function subsetFont (filePath, destPath, glyph, callback) {
  const fontmin = new Fontmin()
    .use(Fontmin.glyph({ text: glyph }))
    .src(filePath)
    .dest(destPath);
  fontmin.run(
    /**
     * @param {Error} [err]
     */
    (err) => {
      if (err) {
        console.error(err);
        callback(new Error('Failed to minimize font'));
        return;
      }

      callback(null);
    },
  );
}

/**
 * TODO delete
 * @param {string} zipPath
 * @param {string} fontsDir
 * @param {(err: Error | null) => void} callback
 */
function extractFontKit (zipPath, fontsDir, callback) {
  prepareDir(fontsDir);

  yauzl.open(zipPath, { lazyEntries: true }, (openZipError, zipFile) => {
    if (openZipError || !zipFile) {
      callback(new Error('Failed to open zip'));
      return;
    }

    zipFile.readEntry();
    zipFile.on('entry', (entry) => {
      const targets = [
        /\.css$/,
        /\.ttf$/,
        /\.woff$/,
      ];

      const { fileName } = entry;

      if (targets.some((v) => v.test(fileName))) {
        const fontFileName = path.basename(fileName);
        const destPath = `${fontsDir}${fontFileName}`;
        extract(zipFile, entry, destPath, (extractError) => {
          if (extractError) {
            callback(new Error('Failed to extract files'));
            return;
          }

          if (/\.ttf$/.test(fileName)) {
            const minPath = `${fontsDir}min`;
            subsetFont(destPath, minPath, 'Web', (subsetError) => {
              if (subsetError) {
                callback(new Error('Failed to extract files'));
                return;
              }

              zipFile.readEntry();
            });

            return;
          }

          zipFile.readEntry();
        });
        return;
      }

      // next
      zipFile.readEntry();
    });
    zipFile.on('end', () => {
      callback(null);
    });
  });
}
module.exports.extractFontKit = extractFontKit;

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
