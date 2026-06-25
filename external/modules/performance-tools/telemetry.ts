
interface ISpan {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
}

declare global {
  var telemetry: any;
}

export default abstract class Telemetry {
  static spans: any[] = [];
  static startSpan(filePath: string, functionName: string, line: number, column: number) {
    const spans = Telemetry.spans.filter(s => s.name === `${filePath}:${functionName}:${line}:${column}`)
    Telemetry.spans.push({
      name: `${filePath}:${functionName}:${line}:${column}`,
      startTime: Date.now(),
    })
  }

  static endSpan(filePath: string, functionName: string, line: number, column: number) {
    const spans = Telemetry.spans.filter(s => s.name === `${filePath}:${functionName}:${line}:${column}`)
    if (spans) {
      spans[spans.length - 1].endTime = Date.now()
    }
  }
}