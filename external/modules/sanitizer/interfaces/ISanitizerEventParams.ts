export default interface ISanitizerEventParams {
  interfaceName: string;
  object: any;
  eventType: string;
  extra?: any;
}