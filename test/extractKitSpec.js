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
      /** @type {IKitFileInformation} */
      const expected = {
        css: ['demo-async.css'],
        fonts: {
          'Toyota Type': {
            eot: 'Fonts/a870310a-6fa6-4864-9df8-2c116c6da38b.eot',
            fallback: 'Fonts/a870310a-6fa6-4864-9df8-2c116c6da38b.eot',
            svg: 'Fonts/42442144-a942-40d4-9ab2-64bfba285cb7.svg',
            ttf: 'Fonts/724e0e94-5368-475b-921e-01b7fa77aa78.ttf',
            woff: 'Fonts/08996963-c2e2-421e-81c8-9f02ede31772.woff',
            woff2: 'Fonts/bf7d1dd6-6a4e-4d61-91b0-854826fa67de.woff2',
          },
          'Toyota Type Black': {
            eot: 'Fonts/1de5eca1-b0de-497f-85ef-a1f88d02bcc0.eot',
            fallback: 'Fonts/1de5eca1-b0de-497f-85ef-a1f88d02bcc0.eot',
            svg: 'Fonts/8d6b7a40-61c1-4dcf-a3b1-8283aef3dc13.svg',
            ttf: 'Fonts/d9bba89a-fbd1-41c1-9b9f-8ffe0f3de0d2.ttf',
            woff: 'Fonts/a75ee6e9-330b-4791-be25-36fc176f8119.woff',
            woff2: 'Fonts/5c296c92-6944-4e67-85e0-8952aff3f3bc.woff2',
          },
          'Toyota Type Black Italic': {
            eot: 'Fonts/4ac19afd-339d-41c5-b23a-31b4f2a7491e.eot',
            fallback: 'Fonts/4ac19afd-339d-41c5-b23a-31b4f2a7491e.eot',
            svg: 'Fonts/6567a1f2-e4c1-4235-a440-692442621eed.svg',
            ttf: 'Fonts/4681409d-5e3b-4ed5-a173-822069ad2056.ttf',
            woff: 'Fonts/8759b317-06c5-4619-a3ee-e01355ff6dc9.woff',
            woff2: 'Fonts/b837b624-4c2b-43bd-8159-14647e579530.woff2',
          },
          'Toyota Type Bold': {
            eot: 'Fonts/7d64989f-173d-443c-bbd5-137c6c873380.eot',
            fallback: 'Fonts/7d64989f-173d-443c-bbd5-137c6c873380.eot',
            svg: 'Fonts/6505c25d-602b-4da2-8058-001e8c6fac4f.svg',
            ttf: 'Fonts/1eecf247-9b94-41f3-9950-ae23b9242d18.ttf',
            woff: 'Fonts/23263224-9661-4569-8aac-935fefbb8bf9.woff',
            woff2: 'Fonts/96c1475e-c4ad-479a-9e65-228e759893a1.woff2',
          },
          'Toyota Type Bold Italic': {
            eot: 'Fonts/cc259bf2-30fd-444b-81fb-57b26572c089.eot',
            fallback: 'Fonts/cc259bf2-30fd-444b-81fb-57b26572c089.eot',
            svg: 'Fonts/ebfaea83-8c79-44f7-8e18-e7c39f8210e8.svg',
            ttf: 'Fonts/c032648b-e142-4a95-9790-51c2e805e889.ttf',
            woff: 'Fonts/45b674b8-aa7c-406e-a18f-c9ffd5d4367e.woff',
            woff2: 'Fonts/d708ec37-f77b-4ab6-9c5e-8714630623fa.woff2',
          },
          'Toyota Type Book': {
            eot: 'Fonts/bbb771b0-6d2a-4246-97de-2d7631170b57.eot',
            fallback: 'Fonts/bbb771b0-6d2a-4246-97de-2d7631170b57.eot',
            svg: 'Fonts/9a74b599-6954-4f93-98e9-be677afc6569.svg',
            ttf: 'Fonts/586ea3c0-939f-407e-9c90-8ff2dd0bb946.ttf',
            woff: 'Fonts/3d704b73-7082-4983-98bc-9a60e18701c9.woff',
            woff2: 'Fonts/db8ad3f1-8115-42e7-8f81-88621f0cb3e3.woff2',
          },
          'Toyota Type Book Italic': {
            eot: 'Fonts/d855c47c-7402-48af-972c-f55a2292df57.eot',
            fallback: 'Fonts/d855c47c-7402-48af-972c-f55a2292df57.eot',
            svg: 'Fonts/5effc669-51ff-4353-b37c-ecb3ba08b906.svg',
            ttf: 'Fonts/cfe3025e-97cb-43b8-8c85-9f1dc1820abf.ttf',
            woff: 'Fonts/f7865df9-43b4-4f6c-851a-bb1cc321aec9.woff',
            woff2: 'Fonts/34b0c837-b904-4cc6-b7b8-8bd8813e3400.woff2',
          },
          'Toyota Type Italic': {
            eot: 'Fonts/081ec62d-bfe4-45df-86bc-d43ce89e11bf.eot',
            fallback: 'Fonts/081ec62d-bfe4-45df-86bc-d43ce89e11bf.eot',
            svg: 'Fonts/da3a12fc-b290-4dbf-b866-0613f1804b6e.svg',
            ttf: 'Fonts/229c05fc-d172-472b-9ca5-407d843b9357.ttf',
            woff: 'Fonts/02c3ef06-1499-4525-9348-2aa4ce453538.woff',
            woff2: 'Fonts/dfa3cda2-8b4f-442a-9cb9-a2961ec2d0fd.woff2',
          },
          'Toyota Type Light': {
            eot: 'Fonts/ac9e44c3-2ee4-414b-a151-5a17251f0046.eot',
            fallback: 'Fonts/ac9e44c3-2ee4-414b-a151-5a17251f0046.eot',
            svg: 'Fonts/b4b27a2f-008d-4290-b4d9-0da299d90528.svg',
            ttf: 'Fonts/d917edc4-fe83-4c45-bd72-558b1efbbc39.ttf',
            woff: 'Fonts/03cae3cf-9833-4a19-b643-d66881e03868.woff',
            woff2: 'Fonts/17468e0e-25b0-4c63-a401-3c9937f9c0ab.woff2',
          },
          'Toyota Type Light Italic': {
            eot: 'Fonts/e4079697-c334-4563-a2e0-4f6a3fd825e2.eot',
            fallback: 'Fonts/e4079697-c334-4563-a2e0-4f6a3fd825e2.eot',
            svg: 'Fonts/99abe749-7655-4e6b-885e-179e82a6939b.svg',
            ttf: 'Fonts/c295e1b4-0cde-445d-84c6-5cd5890b5443.ttf',
            woff: 'Fonts/27705b47-2a4d-4291-939a-57a53ff37994.woff',
            woff2: 'Fonts/a8401c35-f3b5-4701-ad7c-79a23a0ab3cc.woff2',
          },
          'Toyota Type Semibold': {
            eot: 'Fonts/0c512a0b-b3e1-4b19-a48e-aa49ef74a189.eot',
            fallback: 'Fonts/0c512a0b-b3e1-4b19-a48e-aa49ef74a189.eot',
            svg: 'Fonts/d1049f4b-8e09-4dcb-8d9a-aadf278d0d24.svg',
            ttf: 'Fonts/60790ec6-b191-440a-982d-750f15972b34.ttf',
            woff: 'Fonts/1ecdb4b3-05df-4629-a61e-cb903079dec9.woff',
            woff2: 'Fonts/68d4d69c-6cb5-4690-8eef-4503e674151e.woff2',
          },
          'Toyota Type Semibold Italic': {
            eot: 'Fonts/59fb5e9a-3494-410b-a7c1-2037ac9e88bc.eot',
            fallback: 'Fonts/59fb5e9a-3494-410b-a7c1-2037ac9e88bc.eot',
            svg: 'Fonts/a5f888c6-8a44-4e46-a6c0-4813c11b22ea.svg',
            ttf: 'Fonts/1de23405-b1d8-49c9-acce-a730a4b87723.ttf',
            woff: 'Fonts/826cfcfe-ccbb-49ab-a569-b3c57089dee3.woff',
            woff2: 'Fonts/6335cac9-7593-49c2-a9f0-43ae7ad041c8.woff2',
          },
        },
        js: ['mtiFontTrackingCode.js'],
      };
      expect(meta.files).to.be.eql(expected);
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
