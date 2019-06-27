/*
 * # Data flow and types of Monotype fonts
 *
 * - `MonotypeFontRecord`: Database contains
 * - ↓ embed in HTML as JSON
 * - `Font`: `normalizeMonotypeFonts()` in `FontService` converts to
 * - ↓ `fontSettingsPanel` gets them via `FontService.getFonts()`
 * - ↓ embed in template in order to pass to `fontFamilySelectionDropdown`
 * - ↓ in the dropdown, when you change selection, `updateFont()` invoked
 * - `FontSettings`: `createCurrentFontStyle()` in `fontSettingsPanel` returns
 * - ↓ stored as `styles.fontSettings` as ad config via `CreativeSvc.updateElementStylesForSize()`
 *
 * # Load fonts in published ads
 *
 * - `IFontSettings`: config embedded to HTML contains
 * - `FontAsset`: `resolveFonts()` in `assetResolver` converts to
 * - ↓ passed to `load()` in `assetLoader` as `asset.fonts`
 * - ↓ embed font face declaration in `assets.monotypeImportCSSString`
 * - ↓ `fontChecker` waits for their load
 * - Then on one use the `fontAsset` values (?)
 *
 * # Load fonts in editor page
 *
 * - `IFontSettings`: config embedded to HTML contains
 * - `FontAsset`: `resolveFonts()` in `assetResolver` converts to
 * - ↓ passed to `load()` in `editorAssetLoader` as `asset.fonts`
 * - ↓ embedded font face declaration by `loadMonotypeFonts()`
 * - ↓ `fontChecker` waits for their load
 * - ↓ when modify font settings in editor, the loader is invoked again
 *
 * # To lambda
 *
 * In order to create subset fonts for publish, some data is sent to lambda.
 *
 * - `IFontSettings`: creative config returned by `RadicalSvc.getConfig()` contains
 * - `FontLambda`, `buildMonotypeFontSettings()` in `SaveSvc` converts to
 * - the function saves file in path like `ads/${projectId}/fonts/${cssFontFamily}/${content}`
 */

// ------------------------------------

/**
 * Schema on the database.
 * Handled by `models/monotypeFont` first.
 */
interface MonotypeFontRecord {
  _id: string; // MongoDB ID
  cssFamilyName: string; // used as font-family in CSS, also as family ID
  displayName: string; // familyName + variant name? looks useless
  familyName: string; // most human-readable name
  fileSize: number;
  fontContentTypeId: 1; // font file type. 1=TTF
  fontStretch: FontStretch;
  fontStyle: FontStyle;
  fontVariantDisplayName: string; // can be variant's name and ID
  fontWeight: FontWeight;
  webFontFileName: string; // font file name
}

/**
 * Original record from Monotype (data/fonts.csv).
 */
interface IMonotypeFontSource {
  CssFamilyName:          string; // 'Neue Frutiger W01'
  DisplayName:            string; // 'Neue Frutiger® W01 Black'
  FamilyName:             string; // 'Neue Frutiger®'
  FontId:                 number; // 673189,
  FontStretch:            string; // 'normal'
  FontStyle:              string; // 'normal'
  FontVarientDisplayName: string; // 'Black' (this typo is handled)
  FontWeight:             number; // 900
}

/**
 * Original record from Monotype (data/font-files.csv).
 */
interface IMonotypeFontFileSource {
  DownloadURL:       string; // 'http://fast.fonts.com/dv2/1/<GUID>.ttf?<key>' } ]
  FileSize:          number; // 57476,
  FontContentTypeId: number; // 1,
  FontId:            number; // 673189,
  WebFontFileName:   string; // 'b1062a8f-11aa-4489-85ec-60f8a3762a52',
}

/**
 * Converted from `MonotypeFontRecord`.
 * See `normalizeMonotypeFonts()` in `FontService`.
 */
interface Font {
  displayName: string; // <- record.familyName
  fontFamily: string; // <- record.cssFamilyName
  fontProvider: FontProvider;
  fontProviderWebSite: string;
  fontType: FontType;
  image: {
    height: string; // CSS length like `'25px'`, `'inherit'`
    src: string;
    top: number;
  };
  import?: {
    code: {
      licenseText?: string;
      trackerScript?: string;
    };
    urlBase: string;
  };
  kitVersion?: string;
  monotypeVariationId?: string; // TODO maybe the default?
  selectedVariation?: FontVariation; // added in `selectFontVariation()`
  variations: FontVariation[];
}
interface FontVariation {
  displayName: string; // <- record.fontVariantDisplayName
  fontFamily: string; // <- `${record.cssFamilyName} ${record.fontVariantDisplayName}`
  monotypeVariationId?: string;
}

/**
 * Converted from `Font`.
 * Set `createCurrentFontStyle()` in `fontSettingsPanel`.
 */
interface IFontSettings {
  color?: string;
  displayName: string; // <- font.displayName <- record.cssFamilyName
  fontFamily: string; // <- font.selectedVariation.fontFamily or font.fontFamily
  fontName: string; // <- font.displayName <- record.cssFamilyName
  fontProvider: FontProvider;
  fontSize: {
    unit: string;
    value: number;
  };
  fontStyle?: string;
  fontVariation: string; // <- font.selectedVariation.displayName <- record.fontVariantDisplayName
  fontWeight?: string;
  letterSpacing: {
    unit: string;
    value: number;
  };
  lineHeight: string;
  monotypeVariationId?: string; // for old Monotype fonts
  textAlign: string;
  textVerticalAlign: string;
  variationKey?: FontVariationKey; // for Google Fonts
}

/**
 * Converted from `FontSettings`.
 * See `resolveFonts()` in `assetResolver`.
 *
 * Google Fonts are handled in `loadGoogleFonts()` in `assetLoader`.
 *
 * Monotype fonts are handled in `loadMonotypeFonts()` in `editorAssetLoader`
 * if in editor page, otherwise just `monotypeImportCSSString` is handled instead.
 */
type FontAsset = GoogleFontAsset | MonotypeFontAsset;
interface GoogleFontAsset {
  fontFamily: string; // <- fontSettings.fontFamily
  displayName: string; // <- fontSettings.displayName
  fontProvider: 'google'; // <- fontSettings.fontProvider
  variationKey: string; // <- fontSettings.variationKey
}
interface MonotypeFontAsset {
  fontFamily: string; // <- fontSettings.fontFamily
  displayName: string; // <- fontSettings.displayName
  fontProvider: 'rad-monotype'; // <- fontSettings.fontProvider
  variationKey: string; // <- fontSettings.fontVariation
  // monotypeVariationId: string; // <- fontSettings.monotypeVariationId
}

/**
 * Converted from `FontSettings`.
 * See `buildMonotypeFontSettings()` in `SaveSvc`.
 */
interface FontLambda {
  content: string; // all characters contained in elements using this font
  cssFontFamily: string; // <- `${displayName} ${fontVariation}`
  fileKey: string; // added by `monotypeFontModel.findFileKey()` <- record.webFontFileName
}

type FontType = 'standard' | 'upload' | 'premium';
type FontProvider =
  | 'google' // TODO replace with 'Google Fonts'
  | 'Fonts.com'
  | 'FontShop'
  | 'Font Squirrel'
  | 'Linotype'
  | 'MyFonts';
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type FontStyle = 'normal' | 'italic' | 'oblique';
type FontStretch = 'normal' | 'condensed' | 'semi-condensed' |
  'extra-condensed' | 'semi-expanded';

/**
 * Used for Google Fonts.
 */
type FontVariationKey =  '100' | '200' | '300' | '400' |
  '500' | '600' | '700' | '800' | '900' |
  '100i' | '200i' | '300i' | '400i' |
  '500i' | '600i' | '700i' | '800i' | '900i';
