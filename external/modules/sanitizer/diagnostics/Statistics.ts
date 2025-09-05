import IAmendment from 'external/modules/sanitizer/interfaces/IAmendment'

export interface IBasicStatistics {
  totalValidations: number,
  totalDuration: number,
  minDuration: number,
  maxDuration: number,
  avgDuration: number,
  durationStandardDeviation: number,
}

export default class Statistics {
  static getTotalValidations(values: IAmendment[] = []): number {
    if(!Statistics.validateValues(values)) {
      return 0
    }
    return values?.length
  }

  static getAverageDuration(values: IAmendment[] = []): number {
    if(!Statistics.validateValues(values)) {
      return 0
    }
    return Statistics.getTotalDuration(values) / Statistics.getTotalValidations(values)
  }

  static getMinDuration(values: IAmendment[] = []): number {
    if(!Statistics.validateValues(values)) {
      return 0
    }
    return Math.min(...values.map(e => e.duration))
  }

  static getMaxDuration(values: IAmendment[] = []): number {
    if(!Statistics.validateValues(values)) {
      return 0
    }
    return Math.max(...values.map(e => e.duration))
  }

  static getTotalDuration(values: IAmendment[] = []): number {
    if(!Statistics.validateValues(values)) {
      return 0
    }
    return values.reduce((sum: number, e) => sum + e.duration, 0)
  }

  static getDurationStandardDeviation(values: IAmendment[] = []): number {
    if(!Statistics.validateValues(values)) {
      return 0
    }

    const mean = values.reduce((sum, e) => sum + e.duration, 0) / 2

    const squaredDifferences = values.map(e => (e.duration - mean) ** 2)
    const variance = squaredDifferences.reduce((sum, e) => sum + e, 0) / values.length

    return Math.sqrt(variance)
  }

  static getDurationMediana(values: IAmendment[] = []): number {
    if(!Statistics.validateValues(values)) {
      return 0
    }

    const sortedValues = values.sort((a, b) => a.duration - b.duration)
    const middle = Math.floor(sortedValues.length / 2)

    if (sortedValues.length % 2 ===0) {
      return (sortedValues[middle - 1].duration + sortedValues[middle].duration) / 2
    } else {
      return sortedValues[middle].duration
    }
  }

  static validateValues(values: IAmendment[] = []): boolean {
    if (!values || values.length === 0) {
      return false
    }

    return true
  }

  static getBasicStats(values: IAmendment[] = []) {
    return {
      totalValidations: Statistics.getTotalValidations(values),
      totalDuration: Statistics.getTotalDuration(values),
      minDuration: Statistics.getMinDuration(values),
      maxDuration: Statistics.getMaxDuration(values),
      avgDuration: Statistics.getAverageDuration(values),
      durationMediana: Statistics.getDurationMediana(values),
      durationStandardDeviation: Statistics.getDurationStandardDeviation(values),
    }
  }
}