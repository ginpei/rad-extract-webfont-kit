/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const path = require('path');
const sinon = require('sinon');
const tmp = require('tmp');
const extractKit = require('../src/extract-kit');

describe('extractKit', () => {
  /**
   * @param {string} fileName
   * @returns {Promise<{ error: Error | null, result: IExtractKitResult, tmpDir: string }>}
   */
  function runOnTmp (fileName) {
    return new Promise((resolve, reject) => {
      tmp.dir((err, tmpDir) => {
        if (err) { reject(err); return; }

        /** @type {IExtractKitOptions} */
        const options = {
          outDir: tmpDir,
          zipPath: path.join(__dirname, `./assets/${fileName}`),
        };
        extractKit(options, (error, result) => {
          resolve({ error, result, tmpDir });
        });
      });
    });
  }

  /** @type {Error} */
  let error;

  /** @type {IExtractKitResult} */
  let result;

  /** @type {string} */
  let tmpDir = '/dev/null';

  describe('with a kit from Fonts.com including multi fonts', () => {
    before(async () => {
      ({ error, result, tmpDir } = await runOnTmp('fontscom-multi.zip'));
    });

    it('runs without error', () => {
      expect(error).to.be.null;
    });

    it('returns result meta file path', () => {
      expect(result).to.be.eq(path.join(tmpDir, 'rad-font.json'));
    });
  });

  describe('with a kit from FontSquirrel.com', () => {
    before(async () => {
      ({ error, result, tmpDir } = await runOnTmp('fontsquirrel.zip'));
    });

    it('runs without error', () => {
      expect(error).to.be.null;
    });

    it('returns result meta file path', () => {
      expect(result).to.be.eq(path.join(tmpDir, 'rad-font.json'));
    });
  });
});
