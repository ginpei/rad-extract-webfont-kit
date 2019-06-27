interface IRunOnTmpResult {
  error: Error | null;
  metaList?: IFontMeta[];
  tmpDir?: string;
}
