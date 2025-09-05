export type Exports = {
  [key: string]: FileExports,
}

export type FileExports = {
  regularExports: Array<String>,
  defaultExport: String,
}