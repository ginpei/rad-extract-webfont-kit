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
            metaList: result,
            tmpDir,
          });
        });
      });
    });
  }

  /** @type {Error} */
  let error;

  /** @type {IFontMeta[]} */
  let metaList;

  /** @type {string} */
  let tmpDir;

  before(() => {
    error = null;
    metaList = null;
    tmpDir = '/dev/null';
  });

  describe('with a kit from Fonts.com including multi fonts', () => {
    const zipFileName = 'fontscom-multi.zip';

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
        selectedVariation: undefined,
        variations: [
          {
            displayName: 'Semibold',
            fontFamily: 'Toyota Type Semibold',
          },
          {
            displayName: 'Italic',
            fontFamily: 'Toyota Type Italic',
          },
          {
            displayName: 'Book',
            fontFamily: 'Toyota Type Book',
          },
          {
            displayName: 'Bold Italic',
            fontFamily: 'Toyota Type Bold Italic',
          },
          {
            displayName: 'Light',
            fontFamily: 'Toyota Type Light',
          },
          {
            displayName: 'Black',
            fontFamily: 'Toyota Type Black',
          },
          {
            displayName: 'Semibold Italic',
            fontFamily: 'Toyota Type Semibold Italic',
          },
          {
            displayName: 'Black Italic',
            fontFamily: 'Toyota Type Black Italic',
          },
          {
            displayName: 'Regular',
            fontFamily: 'Toyota Type',
          },
          {
            displayName: 'Book Italic',
            fontFamily: 'Toyota Type Book Italic',
          },
          {
            displayName: 'Light Italic',
            fontFamily: 'Toyota Type Light Italic',
          },
          {
            displayName: 'Bold',
            fontFamily: 'Toyota Type Bold',
          },
        ],
      };
      expect(metaList[0].font).to.be.eql(expected);
    });

    it('creates import files data', () => {
      const { files } = metaList[0];
      expect(files.length).to.be.eql(74);
      expect(files[0]).to.be.eql('demo-async.css');
      expect(files[1]).to.be.eql('mtiFontTrackingCode.js');
      expect(files[2]).to.be.eql('Fonts/0c512a0b-b3e1-4b19-a48e-aa49ef74a189.eot');
      expect(files[73]).to.be.eql('Fonts/96c1475e-c4ad-479a-9e65-228e759893a1.woff2');
    });
  });

  describe('with a kit from Fonts.com', () => {
    const zipFileName = 'fontscom.zip';

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
      expect(metaList.length).to.be.eq(1);
    });

    it('returns output dir', () => {
      expect(metaList[0].dir).to.be.eq(path.join(tmpDir));
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
        selectedVariation: undefined,
        variations: [
          {
            displayName: 'ITC Tabula™ W01 Book',
            fontFamily: 'Tabula ITC W01 Book',
          },
        ],
      };
      expect(metaList[0].font).to.be.eql(expected);
    });

    it('creates import files data', () => {
      const expected = [
        'demo-async.css',
        'Fonts/fcccbee8-5a10-4150-b22b-84da462defdc.eot',
        'Fonts/043503c4-0c43-4cd2-a54a-7c2cb2bf197d.woff',
        'Fonts/9682b901-d652-45f0-b484-bbd12085ad67.ttf',
        'Fonts/92ab452d-729a-46ce-b8dc-cf2cb5146c7a.svg',
      ];
      expect(metaList[0].files).to.be.eql(expected);
    });
  });

  describe('with a kit from FontSquirrel.com', () => {
    const zipFileName = 'fontsquirrel.zip';

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

  describe('with a kit from Linotype', () => {
    const zipFileName = 'linotype.zip';

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
      expect(metaList.length).to.be.eq(1);
    });

    it('returns output dir', () => {
      expect(metaList[0].dir).to.be.eq(path.join(tmpDir));
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
        selectedVariation: undefined,
        variations: [
          {
            displayName: 'Anodyne W01 Shadow',
            fontFamily: 'Anodyne W01 Shdw',
          },
        ],
      };
      expect(metaList[0].font).to.be.eql(expected);
    });

    it('creates import files data', () => {
      const expected = [
        'demo-async.css',
        'Fonts/1289922/f4258f11-b720-4398-8e6e-9d384824b6f0.eot',
        'Fonts/1289922/8312f781-2ff7-43ff-bcb2-a15f3e8ab027.woff',
        'Fonts/1289922/b8fd6352-55cc-4d34-91d6-400e852f539b.ttf',
        'Fonts/1289922/c8cd2cb2-3158-48fd-aeb1-d28e177a4234.svg',
      ];
      expect(metaList[0].files).to.be.eql(expected);
    });
  });

  describe('with a kit from MyFonts', () => {
    const zipFileName = 'myfonts.zip';

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
      expect(metaList.length).to.be.eq(1);
    });

    it('returns output dir', () => {
      expect(metaList[0].dir).to.be.eq(path.join(tmpDir));
    });

    it('creates font data', () => {
      /** @type {Font} */
      const expected = {
        displayName: 'Quire Sans Extra Light Italic',
        fontFamily: 'QuireSansW04-ExtraLightIt',
        fontProvider: 'myfonts',
        fontProviderWebSite: 'myfonts.com',
        fontType: 'upload',
        image: {
          height: '25px',
          src: '',
          top: 0,
        },
        selectedVariation: undefined,
        variations: [
          {
            displayName: 'Quire Sans Extra Light Italic',
            fontFamily: 'QuireSansW04-ExtraLightIt',
          },
        ],
      };
      expect(metaList[0].font).to.be.eql(expected);
    });

    it('creates import files data', () => {
      const expected = [
        'MyFontsWebfontsKit/MyFontsWebfontsKit.css',
        'webfonts/2B8BF3_0_0.eot',
        'webfonts/2B8BF3_0_0.woff',
        'webfonts/2B8BF3_0_0.ttf',
      ];
      expect(metaList[0].files).to.be.eql(expected);
    });
  });
});
