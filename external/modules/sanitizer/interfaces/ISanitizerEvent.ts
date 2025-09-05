export default interface ISanitizerEvent<M = any,E = any> {
  date: Date;
  interfaceName: string;
  object: M;
  eventType: string;
  extra: E | {};
}