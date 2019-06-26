/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const path = require('path');
const runOnTmp = require('./runOnTmp');

describe('fontsCom', () => {
  const zipFileName = 'fontscom.zip';

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
      import: {
        code: {
          licenseText: `/*
This CSS resource incorporates links to font software which is the valuable copyrighted
property of Monotype Imaging and/or its suppliers. You may not attempt to copy, install,
redistribute, convert, modify or reverse engineer this font software. Please contact Monotype
Imaging with any questions regarding Web Fonts:  http://webfonts.fonts.com
*/`,
          trackerScript: `var MTIProjectId='6fc2ae63-066d-4f3c-84da-3076aa2d1b6c';
 (function() {
        var mtiTracking = document.createElement('script');
        mtiTracking.type='text/javascript';
        mtiTracking.async='true';
        mtiTracking.src=('https:'==document.location.protocol?'https:':'http:')+'//fast.fonts.net/t/trackingCode.js';
        (document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild( mtiTracking );
   })();`,
        },
        urlBase: '',
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
