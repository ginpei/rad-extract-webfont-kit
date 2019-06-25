/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const path = require('path');
const runOnTmp = require('./runOnTmp');

describe('Fonts.com including multi fonts', () => {
  const zipFileName = 'fontscom-multi.zip';

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
