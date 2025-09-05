import { all, equals, filter as filterR, flatten, is, map } from 'ramda'

import Logger from 'external/modules/logger/logger'
import Statistics, { IBasicStatistics } from 'external/modules/sanitizer/diagnostics/Statistics'
import ISanitizerEvent from 'external/modules/sanitizer/interfaces/ISanitizerEvent'
import ISanitizerEventParams from 'external/modules/sanitizer/interfaces/ISanitizerEventParams'
import SanitizerEvent from 'external/modules/sanitizer/SanitizerEvent'
import SanitizerEventTypes from 'external/modules/sanitizer/SanitizerEventTypes'
import IAmendment from 'external/modules/sanitizer/interfaces/IAmendment'

type Format = 'csv'
const logger = new Logger()
// @ts-ignore
logger.setOptions({ diff: false })

declare namespace csvParser {
  function parse(arg: any): any;
}

declare function diff(arg1: any,arg2: any): any

interface IFilterParams {
  interfaceName?: string;
  eventType?: string | string[]
}

interface IGetAmendmentsParams {
  filter?: IFilterParams;
  shorthand?: boolean;
  format?: Format;
}

interface IDiffParams extends IGetAmendmentsParams {
}

interface IValidationParams extends IGetAmendmentsParams {
}

interface IValuesParams {
  format?: Format;
  filter?: IFilterParams;
}

interface IErrorsParams {
  format?: Format;
  filter?: IFilterParams;
  mapFn?: any;
}

interface IOutputParams {
  data: any[] | IBasicStatistics;
  format?: Format;
}

interface IGetStatsParams {
  format?: Format;
}

interface IGetPairsParams {
  filter?: IFilterParams;
}

export default class Diagnostics {
  static enabled: boolean = false

  static enable(): void {
    Diagnostics.reset()
    Diagnostics.enabled = true
  }

  static disable(): void {
    Diagnostics.reset()
    Diagnostics.enabled = false
  }

  static log(params: ISanitizerEventParams): void {
    if (!Diagnostics.enabled) {
      return
    }
    // @ts-ignore
    logger.log(new SanitizerEvent(params))
  }

  static values(params?: IValuesParams): ISanitizerEvent[] {
    if (!Diagnostics.enabled) {
      return []
    }
    const values: any = !params?.filter ? flatten(logger.getValues() as any) : Diagnostics.filter(params?.filter)
    return Diagnostics.output({ format: params?.format, data: values })
  }

  static reset(): void {
    logger.reset()
  }

  static errors(params?: IErrorsParams): ISanitizerEvent[] {
    if (!Diagnostics.enabled) {
      return []
    }
    const errors: ISanitizerEvent[] = Diagnostics.filter(
      { ...params?.filter || {}, eventType: [SanitizerEventTypes.VALIDATION_ERROR, SanitizerEventTypes.SCHEMA_NOT_FOUND] }
    )
    const mappedErrors = params?.mapFn ? errors.map(params?.mapFn) : errors
    return Diagnostics.output({ format: params?.format, data: mappedErrors })
  }

  static getAmendments(params?: IGetAmendmentsParams): IAmendment[] | null {
    if (!Diagnostics.enabled) {
      return null
    }
    const pairs = Diagnostics.getPairs({ filter: { eventType: [SanitizerEventTypes.VALIDATION_START, SanitizerEventTypes.VALIDATION_SUCCESS], ...params?.filter } })
    const diffs = map((pair: [ISanitizerEvent, ISanitizerEvent]): IAmendment | any => {
      return params?.shorthand === true ?
        {
          interfaceName: pair[0].interfaceName,
          // eslint-disable-next-line sonarjs/no-use-of-empty-return-value
          diff: diff(pair[1]?.object, pair[0]?.object),
          startDate: pair[0].date,
          endDate: pair[1].date,
          get duration() { return pair[1].date.getTime() - pair[0].date.getTime() },
          result: pair[1].eventType,
        } :
        {
          originalObject: pair[0]?.object,
          amendedObject: pair[1]?.object,
          // eslint-disable-next-line sonarjs/no-use-of-empty-return-value
          diff: diff(pair[1]?.object, pair[0]?.object),
          startDate: pair[0].date,
          endDate: pair[1].date,
          get duration() { return pair[1].date.getTime() - pair[0].date.getTime() },
          result: pair[1].eventType,
        }
    }, pairs)

    return Diagnostics.output({ format: params?.format, data: diffs })
  }

  static diff(params?: IDiffParams): IAmendment[] | null {
    return Diagnostics.getAmendments({ filter: { eventType: [SanitizerEventTypes.VALIDATION_START, SanitizerEventTypes.VALIDATION_SUCCESS], ...params?.filter } })
  }

  static validations(params?: IValidationParams): IAmendment[] | null {
    return Diagnostics.getAmendments({ filter: { eventType: undefined, ...params?.filter }, ...params })
  }

  static getPairs(params?: IGetPairsParams): Array<[ISanitizerEvent, ISanitizerEvent]> {
    const events: ISanitizerEvent[] = Diagnostics.filter(params?.filter)

    const pairs = events.reduce((acc: Array<[ISanitizerEvent, ISanitizerEvent?]>, event: ISanitizerEvent) => {
      if (event.eventType === SanitizerEventTypes.VALIDATION_START) {
        acc.push([] as any)
        acc[acc.length - 1].push(event)
      } else if (acc[acc.length - 1][0]?.interfaceName === event.interfaceName && acc[acc.length -1].length === 1) {
        acc[acc.length - 1].push(event)
      } else if (acc[acc.length - 1][0]?.interfaceName !== event.interfaceName && acc[acc.length -1].length === 1) {
        acc.pop()
      }
      return acc
    }, [])

    return filterR((pair: [ISanitizerEvent, ISanitizerEvent?]) => pair.length === 2, pairs) as Array<[ISanitizerEvent, ISanitizerEvent]>
  }

  static formatDuration = (duration: number) => (
    `${new Date(duration).getMinutes()}:${new Date(duration).getSeconds()}:${new Date(duration).getMilliseconds()}`
  )

  static filter(filter?: IFilterParams): ISanitizerEvent[] {
    if (filter) {
      return (Diagnostics.values() || []).filter((event: ISanitizerEvent) => {
        const conditions: boolean[] = []
        if (filter.interfaceName) {
          conditions.push(event.interfaceName === filter.interfaceName)
        }

        if (filter.eventType) {
          conditions.push(
            is(String, filter.eventType) && event.eventType === filter.eventType ||
            is(Array, filter.eventType) && filter.eventType.includes(event.eventType)
          )
        }

        return all(equals(true))(conditions)
      })
    } else {
      return Diagnostics.values()
    }
  }

  static output(params: IOutputParams) {
    if (params?.format === 'csv') {
      (csvParser as any).opts.fields = null // workaround for csvParser bug
      return csvParser.parse(params?.data)
    }

    return params?.data || []
  }

  static getStats(params?: IGetStatsParams) {
    return Diagnostics.output({ data: Statistics.getBasicStats(Diagnostics.validations()), format: params?.format })
  }
}