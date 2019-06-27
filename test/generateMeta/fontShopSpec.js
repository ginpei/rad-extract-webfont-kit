/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const path = require('path');
const runOnTmp = require('./runOnTmp');

describe('fontShop', () => {
  const zipFileName = 'fontshop-multiFamilies.zip';

  /** @type {Error | null} */
  let error;

  /** @type {IFontMeta[] | undefined} */
  let metaList;

  /** @type {string | undefined} */
  let tmpDir;

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
    expect(metaList && metaList.length).to.be.eq(8);
  });

  it('returns output dir', () => {
    if (!tmpDir) {
      throw new Error('Failed to create tmp dir');
    }

    expect(metaList && metaList[0].dir).to.be.eq(path.join(tmpDir, '320998'));
  });

  describe('creates font data', () => {
    it('[0]', () => {
      /** @type {Font} */
      const expected = {
        displayName: 'Dr Carbfred',
        fontFamily: 'DrCarbfred',
        fontProvider: 'FontShop',
        fontProviderWebSite: 'fontshop.com',
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
        kitVersion: '2013',
        selectedVariation: undefined,
        variations: [
          {
            displayName: 'Dr Carbfred',
            fontFamily: 'DrCarbfred',
          },
        ],
      };
      expect(metaList && metaList[0].font).to.be.eql(expected);
    });

    it('[7]', () => {
      /** @type {Partial<Font>} */
      const expected = {
        displayName: 'Mrs Blackfort',
        fontFamily: 'MrsBlackfort',
        variations: [
          {
            displayName: 'Mrs Blackfort',
            fontFamily: 'MrsBlackfort',
          },
        ],
      };
      const font = metaList && metaList[7].font;
      expect(font && font.displayName).to.be.eql(expected.displayName);
      expect(font && font.fontFamily).to.be.eql(expected.fontFamily);
      expect(font && font.variations).to.be.eql(expected.variations);
    });
  });

  describe('creates import files data', () => {
    it('[0]', () => {
      const expected = [
        'Dr Carbfred.css',
        'Dr CarbfredWeb.woff',
      ];
      expect(metaList && metaList[0].files).to.be.eql(expected);
    });

    it('[7]', () => {
      const expected = [
        'Mrs Blackfort.css',
        'Mrs BlackfortWeb.woff',
      ];
      expect(metaList && metaList[7].files).to.be.eql(expected);
    });
  });
});
