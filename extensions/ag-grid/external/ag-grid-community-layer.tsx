// @ts-ignore
import React, { useCallback } from 'react'

import { GridReadyEvent } from '@ag-grid-community/core'
// eslint-disable-next-line import/no-extraneous-dependencies
import { AgGridReact as AgGridReactOriginal } from '@ag-grid-community/react/main.js'
import { any, filter, find, isNil, keys, pipe, pluck, prop, propEq, whereEq } from 'ramda'

import gridsRegistry from 'd:/users/m_botezatu/projects/dev-tools/extensions/ag-grid/external/grids-registry' // eslint-disable-line import/no-absolute-path


const getGrid = (criteria: string): GridReadyEvent | undefined => {
  const identifier = pipe(
    () => (window as any).devTools.extensions.gridApis,
    keys,
    find((key: string) => String(key).toLowerCase().includes(String(criteria).toLowerCase()))
  )()

  if (!isNil(identifier)) {
    return (window as any).devTools.extensions.gridApis[identifier]
  } else {
    return undefined
  }
}

const setGridData = (criteria: string, data) => {
  const grid = getGrid(criteria)

  if (isNil(grid)) {
    return
  }

  grid.api.setRowData(data)
}

const updateGridRow = (criteria: string, rowId: any, data: any) => {
  const grid = getGrid(criteria)

  if (isNil(grid)) {
    return
  }

  const node = grid.api.getRowNode(rowId)

  if (isNil(node)) {
    return
  }

  grid.api.applyTransaction({ update: [{ ...node.data, ...data }] })
}

const removeGridRow = (criteria: string, rowId: any) => {
  const grid = getGrid(criteria)

  if (isNil(grid)) {
    return
  }

  const node = grid.api.getRowNode(rowId)

  if (isNil(node)) {
    return
  }

  grid.api.applyTransaction({ remove: [node.data] })
}

const addGridRow = (criteria: string, data: any) => {
  const grid = getGrid(criteria)

  if (isNil(grid)) {
    return
  }

  grid.api.applyTransaction({ add: [data] })
}

const getGridData = (criteria: string, filterCriteria: any) => {
  const grid = getGrid(criteria)

  if (isNil(grid)) {
    return []
  }

  const data = pluck<any,any>('data', (grid.api.getModel() as any).rootNode.childrenAfterSort || [])

  if (isNil(filterCriteria)) {
    return data
  }

  return filter<any,any>(whereEq(filterCriteria), data)
}

export const AgGridReact = ({ onGridReady, ...props }) => {
  const _onGridReady = useCallback((event) => {
    const identifier = pipe<any,any,any,string | undefined>(
      prop('columnDefs'),
      (columnDefs: any) => (
        find((gridRegistry: any) => any(propEq<any>('field', gridRegistry?.idColumn), columnDefs), gridsRegistry)
      ),
      prop('identifier')
    )(props);

    (window as any).devTools.extensions.gridApis = (window as any).devTools?.extensions?.gridApis || {}
    if (!isNil(identifier)) {
      (window as any).devTools.extensions.gridApis[identifier] = {
        api: event.api,
        columnApi: event.columnApi
      }
    }
    onGridReady?.(event)
  }, [props, onGridReady])

  return <AgGridReactOriginal onGridReady={_onGridReady} {...props} />
}

(window as any).setGridData = setGridData;
(window as any).getGrid = getGrid;
(window as any).updateGridRow = updateGridRow;
(window as any).addGridRow = addGridRow;
(window as any).removeGridRow = removeGridRow;
(window as any).getGridData = getGridData