import ISanitizerEvent from './interfaces/ISanitizerEvent'
import ISanitizerEventParams from './interfaces/ISanitizerEventParams'

export default class SanitizerEvent<M,E> implements ISanitizerEvent<M,E> {
  public readonly date: Date;

  public readonly interfaceName: string;

  public readonly object: M;

  public readonly eventType: string;

  public readonly extra: E;

  constructor(params: ISanitizerEventParams) {
    this.date = new Date()
    this.interfaceName = String(params.interfaceName)
    this.object = params.object
    this.eventType = params.eventType
    this.extra = params.extra || {}
  }
}