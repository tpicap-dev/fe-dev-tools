import { isEmpty, values } from 'ramda'
import diff from '../diff/diff'

interface ILoggerOptions {
	diff?: boolean;
}

class Logger {
  static live: boolean = false;
  static values: any[][] = [[]];
  static prefix: string = '';
	static options: ILoggerOptions = {
    diff: false
  };

  static setOptions(options: ILoggerOptions) {
    Logger.options = { ...Logger.options, ...options }
	}

  static log(...args: any[]) {
    if(isEmpty(args)) {
      return
    }
		
		let record

		if (Logger.options.diff) {
			record = [...values(args), ...values(args).map((argument: any, i: number) => diff(args || {}, Logger.values[Logger.values.length - 1][i] || {}))]
		} else {
			record = [...values(args)]
		}


    Logger.values.push(record)

    if (Logger.live) {
      if (Logger.prefix) {
        console.log(Logger.prefix + ':', ...args)
      } else {
        console.log(...args)
      }
    }
  }

  static print() {
    console.table(Logger.values);
  }

  static reset() {
    Logger.values = [[]];
  }

  static getValues() {
		return Logger.values
	}
}

export default Logger;