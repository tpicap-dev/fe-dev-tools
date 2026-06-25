import ExcelJS from 'exceljs/dist/exceljs.min'
import Logger from '../../../external/modules/logger/logger'

class Workbook {
  private ExcelJS: any;
  private logger = new Logger({
    title: 'ExcelJS',
    live: true,
    diff: false,
  })
  public worksheets
  constructor() {
    this.ExcelJS = new ExcelJS.Workbook()
    this.worksheets = this.ExcelJS.worksheets
  }

  xlsx = {
    writeFile: (filePath: string) => {
      this.logger.log(`Writing file to ${filePath}`)
      return this.ExcelJS.xlsx.writeFile(filePath)
    },
    writeBuffer: async () => {
      this.logger.log('Writing buffer')
      const data = []
      this.ExcelJS.eachSheet((worksheet) => {
        worksheet.eachRow((row) => data.push(row.values))
      })
      this.logger.log(JSON.stringify(data))
      return await this.ExcelJS.xlsx.writeBuffer()
    },
    load: async (result) => {
      this.logger.log('Loading workbook')
      const res = await this.ExcelJS.xlsx.load(result)
      this.worksheets = this.ExcelJS.worksheets
      const data = []
      this.ExcelJS.eachSheet((worksheet) => {
        worksheet.eachRow((row) => data.push(row.values))
      })
      this.logger.log(JSON.stringify(data))

      return res
    },
  }

  addWorksheet(sheetName: string) { return this.ExcelJS.addWorksheet(sheetName) }

}

export default abstract class DevToolsExcelJS {
  static Workbook = Workbook
}