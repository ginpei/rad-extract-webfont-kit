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
const misc = require('../src/misc');

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
          let meta;
          if (!error) {
            const json = fs.readFileSync(path.join(tmpDir, 'rad-font.json'), 'utf8');
            meta = JSON.parse(json);
          }
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

  /** @type {IFontMeta} */
  let meta;

  /** @type {IExtractKitResult} */
  let result;

  /** @type {string} */
  let tmpDir;

  before(() => {
    error = null;
    meta = null;
    result = null;
    tmpDir = '/dev/null';
  });

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
        variations: [
          {
            displayName: 'Semibold',
            fontFamily: 'Toyota Type Semibold',
            monotypeVariationId: '',
          },
          {
            displayName: 'Italic',
            fontFamily: 'Toyota Type Italic',
            monotypeVariationId: '',
          },
          {
            displayName: 'Book',
            fontFamily: 'Toyota Type Book',
            monotypeVariationId: '',
          },
          {
            displayName: 'Bold Italic',
            fontFamily: 'Toyota Type Bold Italic',
            monotypeVariationId: '',
          },
          {
            displayName: 'Light',
            fontFamily: 'Toyota Type Light',
            monotypeVariationId: '',
          },
          {
            displayName: 'Black',
            fontFamily: 'Toyota Type Black',
            monotypeVariationId: '',
          },
          {
            displayName: 'Semibold Italic',
            fontFamily: 'Toyota Type Semibold Italic',
            monotypeVariationId: '',
          },
          {
            displayName: 'Black Italic',
            fontFamily: 'Toyota Type Black Italic',
            monotypeVariationId: '',
          },
          {
            displayName: 'Regular',
            fontFamily: 'Toyota Type',
            monotypeVariationId: '',
          },
          {
            displayName: 'Book Italic',
            fontFamily: 'Toyota Type Book Italic',
            monotypeVariationId: '',
          },
          {
            displayName: 'Light Italic',
            fontFamily: 'Toyota Type Light Italic',
            monotypeVariationId: '',
          },
          {
            displayName: 'Bold',
            fontFamily: 'Toyota Type Bold',
            monotypeVariationId: '',
          },
        ],
      };
      expect(meta.font).to.be.eql(expected);
    });

    it('creates import files data', () => {
      const { files } = meta;
      expect(files.length).to.be.eql(74);
      expect(files[0]).to.be.eql('demo-async.css');
      expect(files[1]).to.be.eql('mtiFontTrackingCode.js');
      expect(files[2]).to.be.eql('Fonts/0c512a0b-b3e1-4b19-a48e-aa49ef74a189.eot');
      expect(files[73]).to.be.eql('Fonts/96c1475e-c4ad-479a-9e65-228e759893a1.woff2');
    });

    it('embeds license to CSS code', () => {
      const { css } = meta.code;
      const lines = css.split('\n');
      expect(lines[0].trim()).to.be.eq('/*');
      expect(lines[1].trim().slice(0, 16)).to.be.eq('This CSS resourc');
    });

    it('creates embed CSS code from file', () => {
      const { css } = meta.code;
      const lines = css.split('\n');
      expect(lines[6].trim().slice(0, 16)).to.be.eq('@font-face{');
    });

    it('creates embed JS code', () => {
      const { js } = meta.code;
      expect(js.slice(0, 15)).to.be.eq('eval(function(p');
    });
  });

  describe('with a kit from FontSquirrel.com', () => {
    describe('as ideal kit', () => {
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
          displayName: 'Interstate-Light Regular',
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
              displayName: 'Interstate-Light Regular',
              fontFamily: 'interstatelight',
              monotypeVariationId: '',
            },
          ],
        };
        expect(meta.font).to.be.eql(expected);
      });

      it('creates import files data', () => {
        /** @type {IKitFileInformation} */
        const expected = {
          css: ['stylesheet.css'],
          fonts: {
            interstatelight: {
              'embedded-opentype': 'interstate-light-webfont.eot',
              fallback: 'interstate-light-webfont.eot',
              woff: 'interstate-light-webfont.woff',
              woff2: 'interstate-light-webfont.woff2',
            },
          },
          js: [],
        };
        expect(meta.files).to.be.eql(expected);
      });

      it('creates embed CSS code', () => {
        const { css } = meta.code;
        expect(css.slice(0, 16)).to.be.eq('/*! Generated by');
      });

      it('creates embed JS code', () => {
        const { js } = meta.code;
        expect(js).to.be.eq('');
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
          meta,
          result,
          tmpDir,
        } = await runOnTmp('fontsquirrel.zip'));
      });

      after(() => {
        findFilesByExtension.restore();
      });

      it('throws with message', () => {
        expect(error.message).to.be.eq('Kit must contains an HTML file to parse');
      });
    });
  });
});
