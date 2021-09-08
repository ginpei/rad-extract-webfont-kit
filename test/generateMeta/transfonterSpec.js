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
      if (!error) {
        throw new Error('Error must be thrown');
      }
      expect(error.message).to.be.eql('It contains more than 1 @font-face at-rules');
    });
  });

  // RAD-4314 Failed to parse webfont kit from Transfonter
  describe('heading with style attr', () => {
    const zipFileName = 'transfonter-styledHeading.zip';

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

    it('creates font data', () => {
      /** @type {Font} */
      const expected = {
        displayName: 'Don Julio Regular',
        fontFamily: 'Don Julio',
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
            displayName: 'Don Julio Regular',
            fontFamily: 'Don Julio',
          },
        ],
      };
      expect(metaList && metaList[0].font).to.be.eql(expected);
    });
  });
});
