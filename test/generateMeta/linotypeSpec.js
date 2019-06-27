/**
 * Note: these tests write down actual files in tmp directory.
 * They will be cleaned up automatically.
 */

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const path = require('path');
const runOnTmp = require('./runOnTmp');

describe('Linotype', () => {
  const zipFileName = 'linotype.zip';

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
    expect(metaList && metaList.length).to.be.eq(1);
  });

  it('returns output dir', () => {
    if (!tmpDir) {
      throw new Error('Failed to create tmp dir');
    }

    expect(metaList && metaList[0].dir).to.be.eq(path.join(tmpDir));
  });

  it('creates font data', () => {
    /** @type {Font} */
    const expected = {
      displayName: 'Anodyne W01 Shadow',
      fontFamily: 'Anodyne W01 Shdw',
      fontProvider: 'Linotype',
      fontProviderWebSite: 'linotype.com',
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
          trackerScript: `var MTUserId='45598d34-f9ee-4364-821c-4e59d75d6a87';
var MTFontIds = new Array();

MTFontIds.push("1289922"); // Anodyne W01 Shadow${' '}
(function() {
var mtTracking = document.createElement('script');
mtTracking.type='text/javascript';
mtTracking.async='true';
mtTracking.src=('https:'==document.location.protocol?'https:':'http:')+'//fast.fonts.net/lt/trackingCode.js';

(document.getElementsByTagName('head')[0]||document.getElementsByTagName('body')[0]).appendChild(mtTracking);
})();`,
        },
        urlBase: '',
      },
      selectedVariation: undefined,
      variations: [
        {
          displayName: 'Anodyne W01 Shadow',
          fontFamily: 'Anodyne W01 Shdw',
        },
      ],
    };
    expect(metaList && metaList[0].font).to.be.eql(expected);
  });

  it('creates import files data', () => {
    const expected = [
      'demo-async.css',
      'Fonts/1289922/f4258f11-b720-4398-8e6e-9d384824b6f0.eot',
      'Fonts/1289922/8312f781-2ff7-43ff-bcb2-a15f3e8ab027.woff',
      'Fonts/1289922/b8fd6352-55cc-4d34-91d6-400e852f539b.ttf',
      'Fonts/1289922/c8cd2cb2-3158-48fd-aeb1-d28e177a4234.svg',
    ];
    expect(metaList && metaList[0].files).to.be.eql(expected);
  });
});
