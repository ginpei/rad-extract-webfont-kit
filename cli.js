const extractWebfontKit = require('./src/index');

const zipPath = process.argv[2];
if (!zipPath) {
  process.stdout.write('Usage: node cli <zip-file>\n');
  process.exit(1);
}
extractWebfontKit({
  outDir: `tmp/${Date.now()}`,
  verbose: true,
  zipPath,
}, (error, result) => {
  if (error) {
    console.error('Failed!', error);
    return;
  }

  // eslint-disable-next-line no-console
  console.log('Done:', result);
});
