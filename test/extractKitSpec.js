/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const path = require('path');
const sinon = require('sinon');
const tmp = require('tmp');
const extractKit = require('../src');
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
          resolve({
            error,
            meta: result,
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

  /** @type {string} */
  let tmpDir;

  before(() => {
    error = null;
    meta = null;
    tmpDir = '/dev/null';
  });

  describe('with a kit from Fonts.com including multi fonts', () => {
    before(async () => {
      ({
        error,
        meta,
        tmpDir,
      } = await runOnTmp('fontscom-multi.zip'));
    });

    it('runs without error', () => {
      expect(error).to.be.null;
    });

    it('returns output dir', () => {
      expect(meta.dir).to.be.eq(path.join(tmpDir));
    });

    it('creates font data', () => {
      /** @type {Font} */
      const expected = {
        displayName: 'Toyota Type',
        fontFamily: 'Toyota Type',
        fontProvider: 'fonts.com',
        fontProviderWebSite: 'fonts.com',
        fontType: 'upload',
        image: {
          height: '25px',
          src: '',
          top: 0,
        },
        monotypeVariationId: '',
        selectedVariation: undefined,
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
  });

  describe('with a kit from Fonts.com', () => {
    describe('as ideal kit', () => {
      before(async () => {
        ({
          error,
          meta,
          tmpDir,
        } = await runOnTmp('fontscom.zip'));
      });

      it('runs without error', () => {
        if (error) {
          console.error(error);
        }
        expect(error).to.be.null;
      });

      it('returns output dir', () => {
        expect(meta.dir).to.be.eq(path.join(tmpDir));
      });

      it('creates font data', () => {
        /** @type {Font} */
        const expected = {
          displayName: 'ITC Tabula™ W01 Book',
          fontFamily: 'Tabula ITC W01 Book',
          fontProvider: 'fonts.com',
          fontProviderWebSite: 'fonts.com',
          fontType: 'upload',
          image: {
            height: '25px',
            src: '',
            top: 0,
          },
          monotypeVariationId: '',
          selectedVariation: undefined,
          variations: [
            {
              displayName: 'ITC Tabula™ W01 Book',
              fontFamily: 'Tabula ITC W01 Book',
              monotypeVariationId: '',
            },
          ],
        };
        expect(meta.font).to.be.eql(expected);
      });

      it('creates import files data', () => {
        const expected = [
          'demo-async.css',
          'Fonts/fcccbee8-5a10-4150-b22b-84da462defdc.eot',
          'Fonts/043503c4-0c43-4cd2-a54a-7c2cb2bf197d.woff',
          'Fonts/9682b901-d652-45f0-b484-bbd12085ad67.ttf',
          'Fonts/92ab452d-729a-46ce-b8dc-cf2cb5146c7a.svg',
        ];
        expect(meta.files).to.be.eql(expected);
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

  describe('with a kit from FontSquirrel.com', () => {
    describe('as ideal kit', () => {
      before(async () => {
        ({
          error,
          meta,
          tmpDir,
        } = await runOnTmp('fontsquirrel.zip'));
      });

      it('runs without error', () => {
        expect(error).to.be.null;
      });

      it('returns output dir', () => {
        expect(meta.dir).to.be.eq(path.join(tmpDir));
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
          monotypeVariationId: '',
          selectedVariation: undefined,
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
        const expected = [
          'stylesheet.css',
          'interstate-light-webfont.eot',
          'interstate-light-webfont.woff2',
          'interstate-light-webfont.woff',
        ];
        expect(meta.files).to.be.eql(expected);
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

  describe('with a kit from Linotype', () => {
    describe('as ideal kit', () => {
      before(async () => {
        ({
          error,
          meta,
          tmpDir,
        } = await runOnTmp('linotype.zip'));
      });

      it('runs without error', () => {
        if (error) {
          console.error(error);
        }
        expect(error).to.be.null;
      });

      it('returns output dir', () => {
        expect(meta.dir).to.be.eq(path.join(tmpDir));
      });

      it('creates font data', () => {
        /** @type {Font} */
        const expected = {
          displayName: 'Anodyne W01 Shadow',
          fontFamily: 'Anodyne W01 Shdw',
          fontProvider: 'linotype',
          fontProviderWebSite: 'linotype.com',
          fontType: 'upload',
          image: {
            height: '25px',
            src: '',
            top: 0,
          },
          monotypeVariationId: '',
          selectedVariation: undefined,
          variations: [
            {
              displayName: 'Anodyne W01 Shadow',
              fontFamily: 'Anodyne W01 Shdw',
              monotypeVariationId: '',
            },
          ],
        };
        expect(meta.font).to.be.eql(expected);
      });

      it('creates import files data', () => {
        const expected = [
          'demo-async.css',
          'Fonts/1289922/f4258f11-b720-4398-8e6e-9d384824b6f0.eot',
          'Fonts/1289922/8312f781-2ff7-43ff-bcb2-a15f3e8ab027.woff',
          'Fonts/1289922/b8fd6352-55cc-4d34-91d6-400e852f539b.ttf',
          'Fonts/1289922/c8cd2cb2-3158-48fd-aeb1-d28e177a4234.svg',
        ];
        expect(meta.files).to.be.eql(expected);
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
