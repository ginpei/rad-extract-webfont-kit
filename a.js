const extractKit = require('./src/extract-kit/index');

extractKit({
  outDir: 'tmp/kit-a',
  zipPath: './src/extract-kit/tests/fontscom-multi.zip',
}, (error, result) => {
  if (error) {
    console.error(error);
    return;
  }

  console.log('# Done.');
});
