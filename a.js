const extractKit = require('./src/extract-kit/index');

extractKit({
  outDir: 'tmp/kit-a',
  zipPath: './src/extract-kit/tests/fontsquirrel.zip',
}, (error, result) => {
  console.log('# error, result', error, result);
});
