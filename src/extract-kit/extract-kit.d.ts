interface IExtractKitOptions {
  /**
   * Output directory where whole files are extracted directly.
   */
  outDir?: string;

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
