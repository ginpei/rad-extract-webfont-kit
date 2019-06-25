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

describe('with a kit from FontSquirrel.com', () => {
  const zipFileName = 'fontsquirrel.zip';

  /** @type {Error} */
  let error;

  /** @type {IFontMeta[]} */
  let metaList;

  /** @type {string} */
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
      expect(metaList.length).to.be.eq(1);
    });

    it('returns output dir', () => {
      expect(metaList[0].dir).to.be.eq(path.join(tmpDir));
    });

    it('creates font data', () => {
      /** @type {Font} */
      const expected = {
        displayName: 'Interstate-Light Regular',
        fontFamily: 'interstatelight',
        fontProvider: 'fontsquirrel.com',
        fontProviderWebSite: 'fontsquirrel.com',
        fontType: 'upload',
        image: {
          height: '25px',
          src: '',
          top: 0,
        },
        selectedVariation: undefined,
        variations: [
          {
            displayName: 'Interstate-Light Regular',
            fontFamily: 'interstatelight',
          },
        ],
      };
      expect(metaList[0].font).to.be.eql(expected);
    });

    it('creates import files data', () => {
      const expected = [
        'stylesheet.css',
        'interstate-light-webfont.eot',
        'interstate-light-webfont.woff2',
        'interstate-light-webfont.woff',
      ];
      expect(metaList[0].files).to.be.eql(expected);
    });

    it('sets font provider', () => {
      expect(metaList[0].provider).to.be.eq('fontsquirrel.com');
    });
  });

  describe('without HTML file', () => {
    /** @type {sinon.SinonStub} */
    let findFilesByExtension;

    before(async () => {
      findFilesByExtension = sinon.stub(misc, 'findFilesByExtension')
        .returns(Promise.resolve([]));

      ({
        error,
        metaList,
        tmpDir,
      } = await runOnTmp(zipFileName));
    });

    after(() => {
      findFilesByExtension.restore();
    });

    it('throws with message', () => {
      expect(error.message).to.be.eq('Kit must contains an HTML file to parse');
    });
  });
});
