import { isEmpty, values } from 'ramda'
import diff from '../../../shared/modules/diff/diff'

interface ILoggerOptions {
  title?: string;
	diff?: boolean;
  live?: boolean;
}

class Logger {
  private values: any[][] = [[]];
	static defaultOptions: ILoggerOptions = {
    title: 'default',
		diff: true,
    live: false,
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

    if (this.options.title) {
      record.unshift(`${this.options.title}:`)
    }


    this.values.push(record)

    if (this.options.live) {
      console.log(...record);
    }
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