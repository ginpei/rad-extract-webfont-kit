declare module NodeJS  {
  interface Global {
    extractWebfontKit: {
      verbose: boolean;
      verboseLog: (...args: any[]) => void;
    }
  }
}

interface IExtractKitOptions {
  /**
   * Output directory where whole files are extracted directly.
   */
  outDir: string;

  /**
   * If show all logs.
   */
  verbose?: boolean;

  /**
   * Input file.
   */
  zipPath: string;
}

interface IExtractKitResult {
}

interface IVariant {
  fontName: string;
}

interface IFont {
  displayName: string;
  familyName: string;
  variants: IVariant[];
}

// TODO find better name
interface IMetaJon {
  font: IFont;
  cssFile: string;
}

/**
 * Each of array items from the file `fontlist.xml`.
 */
interface FontsComXmlRecord {
  /** @example 'Toyota Type Bold' */
  cssFamilyName: string;

  /** @example 'Toyota Type W05 Bold' */
  displayName: string;

  /** @example '7d64989f-173d-443c-bbd5-137c6c873380.eot' */
  eot: string;

  /** @example 'Toyota Type' */
  familyName: string;

  /** @example 'normal' */
  fontStretch: string;

  /** @example 'normal' */
  fontStyle: string;

  /** @example '400' */
  fontWeight: string;

  /** @example 'ToyotaType-Bold' */
  psName: string;

  /** @example '6505c25d-602b-4da2-8058-001e8c6fac4f.svg' */
  svg: string;

  /** @example '1eecf247-9b94-41f3-9950-ae23b9242d18.ttf' */
  ttf: string;

  /** @example '23263224-9661-4569-8aac-935fefbb8bf9.woff' */
  woff: string;

  /** @example '96c1475e-c4ad-479a-9e65-228e759893a1.woff2' */
  woff2: string;
}

type FontFileType =
  | string
  | 'embedded-opentype'
  | 'fallback'
  | 'woff'
  | 'woff2';

interface IFontVariationFileMap {
  [variationName: string]: {
    [fileType in FontFileType]: string;
  }
}

interface IKitCode {
  css: string;
  js: string;
}

interface IFontMeta {
  dir: string;
  files: string[];
  font: Font;
}
