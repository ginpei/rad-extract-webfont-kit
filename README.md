# extract-webfont-kit

[![NPM Package](https://img.shields.io/npm/v/@ginpei/rad-extract-webfont-kit.svg)](https://www.npmjs.com/package/@ginpei/rad-extract-webfont-kit)
[![Build Status](https://travis-ci.org/ginpei/rad-extract-webfont-kit.svg?branch=master)](https://travis-ci.org/ginpei/rad-extract-webfont-kit)
[![Maintainability](https://api.codeclimate.com/v1/badges/0987dd8dc383c8643ff7/maintainability)](https://codeclimate.com/github/ginpei/rad-extract-webfont-kit/maintainability)

## Usage

### Install

```console
$ npm install @ginpei/rad-extract-webfont-kit
```

### Invoke

```js
const extractKit = require('@ginpei/rad-extract-webfont-kit');

extractKit({
  outDir: 'path/to/out-dir/',
  zipPath: 'path/to/zip-file',
}, (error, result) => {
  if (error) {
    console.error(error);
    return;
  }

  process.stdout.write('Done:', result);
});
```

## For developer

Tests require test asset zip files, which require a key to download.

### Get key

You have to get the key to download files. The key is defined in the AWS S3 bucket policy as referrer URL.

Find it in S3 bucket → Permissions → Bucket Policy.

```
"aws:Referer": "https://responsiveads.com/rad-extract-webfont-kit/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Download test assets

```console
DOWNLOAD_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx npm run download-test-assets
```

### Test

```console
npm run test
```

### Try in production development

Use `npm link` to use this directory from your project.

- [npm-link | npm Documentation](https://docs.npmjs.com/cli/link.html)

Step 1/2: In this directory, create a link:

```console
$ npm link
```

Step 2/2: In the directory of your project where you use this lib:

```console
$ npm link @ginpei/rad-extract-webfont-kit
```

Now `require('@ginpei/rad-extract-webfont-kit')` imports this working directory instead of the things downloaded from npm.
