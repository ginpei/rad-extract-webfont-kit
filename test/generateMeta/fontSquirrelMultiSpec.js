/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const path = require('path');
const sinon = require('sinon');
const misc = require('../../src/misc');
const runOnTmp = require('./runOnTmp');

describe('with a kit from FontSquirrel.com including multi fonts', () => {
  const zipFileName = 'fontsquirrel-multi.zip';

  /** @type {Error | null} */
  let error;

  /** @type {IFontMeta[] | undefined} */
  let metaList;

  /** @type {string | undefined} */
  let tmpDir;

  describe('as ideal kit', () => {
    before(async () => {
      ({
        error,
        metaList,
        tmpDir,
      } = await runOnTmp(zipFileName));
    });

    it('runs without error', () => {
      expect(error).to.be.null;
    });

    it('returns one font meta data', () => {
      expect(metaList && metaList.length).to.be.eq(12);
    });

    it('returns output dir', () => {
      if (!tmpDir) {
        throw new Error('Failed to create tmp dir');
      }

      expect(metaList && metaList[0].dir).to.be.eq(path.join(tmpDir));
    });

    it('creates first font data', () => {
      /** @type {Font} */
      const expected = {
        displayName: 'JJ Rg Bold Italic',
        fontFamily: 'jjbold_italic',
        fontProvider: 'Font Squirrel',
        fontProviderWebSite: 'fontsquirrel.com',
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
        kitVersion: '2017',
        selectedVariation: undefined,
        variations: [
          {
            displayName: 'JJ Rg Bold Italic',
            fontFamily: 'jjbold_italic',
          },
        ],
      };
      expect(metaList && metaList[0].font).to.be.eql(expected);
    });

    it('creates display name and font family for each', () => {
      if (!metaList) {
        throw new Error('metaList is expected to be generated');
      }

      const pairs = metaList.map(
        ({ font }) => [font.displayName, font.fontFamily],
      );

      expect(pairs).to.deep.eq([
        ['JJ Rg Bold Italic', 'jjbold_italic'],
        ['JJ Rg Bold', 'jjbold'],
        ['JJ Bk Italic', 'jjbook_italic'],
        ['JJ Bk Regular', 'jjbook'],
        ['JJ Bl Italic', 'jjblack_italic'],
        ['JJ Bl Regular', 'jjblack'],
        ['JJ El Italic', 'jjextralight_italic'],
        ['JJ El Regular', 'jjextralight'],
        ['JJ Lt Italic', 'jjlight_italic'],
        ['JJ Lt Regular', 'jjlight'],
        ['JJ Rg Italic', 'jjregular_italic'],
        ['JJ Rg Regular', 'jjregular'],
      ]);
    });

    it('creates first import files data', () => {
      const expected = [
        'stylesheet.css',
        'jj_bd_it-webfont.woff',
      ];
      expect(metaList && metaList[0].files).to.be.eql(expected);
    });

    it('creates last import files data', () => {
      const expected = [
        'stylesheet.css',
        'jj_rg-webfont.woff',
      ];
      expect(metaList && metaList[11].files).to.be.eql(expected);
    });
  });
});
