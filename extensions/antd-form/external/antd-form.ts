import { keys, pipe } from 'ramda'

import { flattenObj } from '../../../external/modules/ladash/ladash'

export const setFieldValue = (index, value) => {
  if (!(window as any).form) {
    throw new Error('window.form not found')
  }

  const form = (window as any).form

  const values = form.getFieldsValue()
  const flattenedValues = flattenObj(values)
  const path = pipe(
    keys,
    (dotNotationPaths: string[]) => dotNotationPaths[index]?.split('.')
  )(flattenedValues)

  form.setFieldsValue(path?.reduceRight((acc, e) => ({ [e]: acc }), value))
}