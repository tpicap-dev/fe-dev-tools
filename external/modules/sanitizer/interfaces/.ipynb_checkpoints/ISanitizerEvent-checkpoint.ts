import SanitizerEventTypes from '../SanitizerEventTypes'

export default interface ISanitizerEvent<M,E> {
  date: Date;
  interfaceName: string;
  object: M;
  eventType: SanitizerEventTypes;
  extra: E | {};
}