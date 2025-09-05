import SanitizerEventTypes from '../SanitizerEventTypes'

export default interface ISanitizerEventParams {
  date: Date;
  interfaceName: string;
  object: any;
  eventType: SanitizerEventTypes;
  extra?: any;
}