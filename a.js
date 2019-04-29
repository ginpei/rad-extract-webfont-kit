const extractWebfontKit = require('./src/extract-kit/index');

const zipPath = process.argv[2];
if (!zipPath) {
  process.stdout.write('Usage: node a <zip-file>\n');
  process.exit(1);
}
extractWebfontKit({
  outDir: 'tmp/kit-a',
  zipPath,
}, (error, result) => {
  if (error) {
    console.error(error);
    return;
  }

  process.stdout.write(`Done: ${result}\n`);
});
