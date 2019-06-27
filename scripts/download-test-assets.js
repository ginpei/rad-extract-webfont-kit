const { exec } = require('child_process');
const path = require('path');
const misc = require('../src/misc');

const outDir = path.join(__dirname, '../test/assets');
const urlPrefix = 'https://s3-us-west-2.amazonaws.com/ginpei.hey.yo/rad-extract-webfont-kit/test-assets/';
const files = [
  'fontscom-multi.zip',
  'fontscom.zip',
  'fontshop-multiFamilies.zip',
  'fontsquirrel.zip',
  'linotype.zip',
  'myfonts.zip',
];

/**
 * @param {string} fileName
 * @param {string} dir
 * @param {string} secret
 */
function download (fileName, dir, secret) {
  return new Promise((resolve, reject) => {
    const referer = `https://responsiveads.com/rad-extract-webfont-kit/${secret}`;
    const url = `${urlPrefix}${fileName}`;

    const command = [
      'curl',
      `--referer ${referer}`,
      `--out ${path.join(dir, fileName)}`,
      url,
    ].join(' ');

    process.stdout.write(`> ${command}\n`);
    exec(command, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function main () {
  const secret = process.env.DOWNLOAD_KEY;
  if (!secret) {
    throw new Error('DOWNLOAD_KEY must be set');
  }

  misc.prepareDir(outDir);

  for (let i = 0; i < files.length; i += 1) {
    const fileName = files[i];
    // eslint-disable-next-line no-await-in-loop
    await download(fileName, outDir, secret);
  }
}

main()
  .catch((error) => console.error(error));
