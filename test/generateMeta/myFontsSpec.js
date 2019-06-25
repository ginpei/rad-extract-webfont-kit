/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const path = require('path');
const runOnTmp = require('./runOnTmp');

describe('with a kit from MyFonts', () => {
  const zipFileName = 'myfonts.zip';

  /** @type {Error} */
  let error;

  /** @type {IFontMeta[]} */
  let metaList;

  /** @type {string} */
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

  it('sets font provider', () => {
    expect(metaList[0].provider).to.be.eq('myfonts');
  });
});
