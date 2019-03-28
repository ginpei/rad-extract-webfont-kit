interface IRunOnTmpResult {
  error: Error | null;
  meta: IFontMeta;
  result: IExtractKitResult;
  tmpDir: string;
}
