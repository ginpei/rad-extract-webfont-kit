# extract-webfont-kit

## Usage

TODO install

```js
const extractKit = require('extract-webfont-kit');

extractKit({
  outDir: 'path/to/out-dir/',
  zipPath: 'path/to/zip-file',
}, (error, result) => {
  if (error) {
    console.error(error);
    return;
  }

  process.stdout.write(`Done: ${result}\n`);
});
```
