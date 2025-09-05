
export default interface IAmendment {
  originalObject: any;
  amendedObject: any;
  diff: any;
  startDate: Date;
  endData: Date;
  duration: number;
  result: string;
}