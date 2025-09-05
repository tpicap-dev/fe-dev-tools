import { isEmpty, values } from 'ramda'
import diff from '../../../shared/modules/diff/diff'

interface ILoggerOptions {
	diff?: boolean;
}

class Logger {
  private values: any[][] = [[]];
	static defaultOptions: ILoggerOptions = {
		diff: true
	};
	private options: ILoggerOptions;
	
	constructor (options: ILoggerOptions = {}) {
		this.options = { ...Logger.defaultOptions, ...options }
	}

	public setOptions(options: ILoggerOptions) {
		this.options = { ...this.options, ...options }
	}

  public log() {
    if(isEmpty(arguments)) {
      return
    }
		
		let record

		if (this.options.diff) {
			record = [...values(arguments), ...values(arguments).map((argument: any, i: number) => diff(argument || {}, this.values[this.values.length - 1][i] || {}))]
		} else {
			record = [...values(arguments)]
		}


    this.values.push(record)
  }

  public print() {
    console.table(this.values);
  }

  public reset() {
    this.values = [[]];
  }

	public getValues() {
		return this.values
	}
}

export default Logger;