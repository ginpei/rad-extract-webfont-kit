/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const tmp = require('tmp');
const extractKit = require('../src/extract-kit');

describe('extractKit', () => {
  /**
   * @param {string} fileName
   * @returns {Promise<IRunOnTmpResult>}
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
          const json = fs.readFileSync(path.join(tmpDir, 'rad-font.json'), 'utf8');
          const meta = JSON.parse(json);
          resolve({
            error,
            meta,
            result,
            tmpDir,
          });
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

  /** @type {IFontMeta} */
  let meta;

  describe('with a kit from Fonts.com including multi fonts', () => {
    before(async () => {
      ({
        error,
        meta,
        result,
        tmpDir,
      } = await runOnTmp('fontscom-multi.zip'));
    });

    it('runs without error', () => {
      expect(error).to.be.null;
    });

    it('returns result meta file path', () => {
      expect(result).to.be.eq(path.join(tmpDir, 'rad-font.json'));
    });

    it('creates font data', () => {
      /** @type {Font} */
      const expected = {
        displayName: 'Toyota Type',
        fontFamily: 'Toyota Type',
        fontProvider: 'fonts.com',
        fontProviderWebSite: 'fonts.com',
        fontType: 'standard',
        image: {
          height: '25px',
          src: '',
          top: 0,
        },
        monotypeVariationId: '',
        // selectedVariation: undefined,
        variations: [],
      };
      expect(meta.font).to.be.eql(expected);
    });
  });

  describe('with a kit from FontSquirrel.com', () => {
    before(async () => {
      ({
        error,
        meta,
        result,
        tmpDir,
      } = await runOnTmp('fontsquirrel.zip'));
    });

    it('runs without error', () => {
      expect(error).to.be.null;
    });

    it('returns result meta file path', () => {
      expect(result).to.be.eq(path.join(tmpDir, 'rad-font.json'));
    });

    it('creates font data', () => {
      /** @type {Font} */
      const expected = {
        displayName: 'interstatelight',
        fontFamily: 'interstatelight',
        fontProvider: 'fontsquirrel.com',
        fontProviderWebSite: 'fontsquirrel.com',
        fontType: 'standard',
        image: {
          height: '25px',
          src: '',
          top: 0,
        },
        monotypeVariationId: '',
        // selectedVariation: undefined,
        variations: [
          {
            displayName: 'interstatelight',
            fontFamily: 'interstatelight',
            monotypeVariationId: '',
          },
        ],
      };
      expect(meta.font).to.be.eql(expected);
    });
  });
});
