/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const path = require('path');
const runOnTmp = require('./runOnTmp');

describe('with a kit from Transfonter', () => {
  /** @type {Error | null} */
  let error;

  /** @type {IFontMeta[] | undefined} */
  let metaList;

  /** @type {string | undefined} */
  let tmpDir;

  describe('including only one font', () => {
    const zipFileName = 'transfonter.zip';

    before(async () => {
      ({
        error,
        metaList,
        tmpDir,
      } = await runOnTmp(zipFileName));
    });

    it('runs without error', () => {
      if (error) {
        console.error(error);
      }
      expect(error).to.be.null;
    });

    it('returns one font meta data', () => {
      expect(metaList && metaList.length).to.be.eq(1);
    });

    it('returns output dir', () => {
      if (!tmpDir) {
        throw new Error('Failed to create tmp dir');
      }

      expect(metaList && metaList[0].dir).to.be.eq(path.join(tmpDir));
    });

    it('creates font data', () => {
      /** @type {Font} */
      const expected = {
        displayName: 'Interstate-Light Regular',
        fontFamily: 'Interstate',
        fontProvider: 'Transfonter',
        fontProviderWebSite: 'transfonter.org',
        fontType: 'upload',
        image: {
          height: '25px',
          src: '',
          top: 0,
        },
        import: {
          code: {},
          urlBase: '',
        },
        kitVersion: '0',
        selectedVariation: undefined,
        variations: [
          {
            displayName: 'Interstate-Light Regular',
            fontFamily: 'Interstate',
          },
        ],
      };
      expect(metaList && metaList[0].font).to.be.eql(expected);
    });

    it('creates import files data', () => {
      const expected = [
        'stylesheet.css',
        'Interstate-Light.woff2',
        'Interstate-Light.woff',
      ];
      expect(metaList && metaList[0].files).to.be.eql(expected);
    });
  });

  describe('including two fonts', () => {
    const zipFileName = 'transfonter-multi.zip';

    before(async () => {
      ({
        error,
        metaList,
        tmpDir,
      } = await runOnTmp(zipFileName));
    });

    it('throws error', () => {
      expect(error).not.to.be.null;
    });
  });
});
