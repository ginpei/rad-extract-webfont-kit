# extract-webfont-kit

[![Build Status](https://travis-ci.org/ginpei/rad-extract-webfont-kit.svg?branch=master)](https://travis-ci.org/ginpei/rad-extract-webfont-kit)
[![Maintainability](https://api.codeclimate.com/v1/badges/0987dd8dc383c8643ff7/maintainability)](https://codeclimate.com/github/ginpei/rad-extract-webfont-kit/maintainability)

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
