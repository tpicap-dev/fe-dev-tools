// @ts-ignore
import React, { useCallback } from 'react'

// @ts-ignore
import { GridReadyEvent } from '@ag-grid-community/core'
// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-ignore
import { AgGridReact as AgGridReactOriginal, AgGridReactProps as AgGridReactPropsOriginal } from '@icap/fusion-ag-grid/node_modules/@ag-grid-community/react'
import { any, clone, filter, find, isEmpty, isNil, keys, pipe, pluck, prop, whereEq } from 'ramda'

import staticGridsRegistry from './grids-registry' // eslint-disable-line import/no-absolute-path

const gridsRegistry = clone([ ...staticGridsRegistry, ...((window as any)?.gridsRegistry || []) ])

const registerGrid = (gridRegistry: {
  identifier: string, idColumn: string }) => {
  if (isNil(gridRegistry?.idColumn) || isNil(gridRegistry?.identifier)) {
    return
  }

  gridsRegistry.push(gridRegistry);
  (window as any).setVar?.('gridsRegistry', gridsRegistry)
}


const getGrid = (criteria?: string): GridReadyEvent | undefined => {
  if (isNil(criteria)) {
    return (window as any)?.devTools?.extensions?.gridApis?.current
  }
  const identifier = pipe(
    () => (window as any)?.devTools?.extensions?.gridApis,
    // @ts-ignore
    keys,
    find((key: string) => String(key).toLowerCase().includes(String(criteria).toLowerCase()))
  )() as string | undefined

  if (!isNil(identifier)) {
    return (window as any)?.devTools?.extensions?.gridApis[identifier]
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

  const node = typeof rowId === 'string' ? grid.api.getRowNode(rowId) : (grid.api.getDisplayedRowAtIndex(rowId) || grid.api.getRowNode(rowId))

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

  // @ts-ignore
  const data = pluck<any,any>('data', (grid.api.getModel() as any).rootNode.childrenAfterSort || [])

  if (isNil(filterCriteria)) {
    return data
  }

  return filter<any,any>(whereEq(filterCriteria), data)
}

export const AgGridReact = ({ onGridReady, ...props }) => {
  const _onGridReady = useCallback((event) => {
    const identifier = pipe<any,any,any,string | undefined>(
      prop('columnState'),
      (columnState: any) => {
        if (!isEmpty(columnState)) {
          // @ts-ignore
          return find((gridRegistry: any) => any(col => col?.colId === gridRegistry?.idColumn, columnState || []), gridsRegistry)
        }

        if (!isEmpty(props?.rowData)) {
          return find((gridRegistry: any) => !isNil(props.rowData[0][gridRegistry.idColumn]), gridsRegistry)
        }

        return undefined
      },
      prop('identifier')
    )(props);

    if ((window as any).devTools) {
      (window as any).devTools.extensions.gridApis = (window as any).devTools?.extensions?.gridApis || {}
    }
    if (!isNil(identifier) && (window as any)?.devTools?.extensions?.gridApis) {
      (window as any).devTools.extensions.gridApis[identifier] = {
        api: event.api,
        columnApi: event.columnApi
      }
    }

    (window as any).devTools.extensions.gridApis.current = {
      api: event.api,
      columnApi: event.columnApi
    }
    onGridReady?.(event)
  }, [props, onGridReady])

  return <AgGridReactOriginal onGridReady={_onGridReady} {...props} />
}

export interface AgGridReactProps extends AgGridReactPropsOriginal {};

(window as any).registerGrid = registerGrid;
(window as any).getGridData = getGridData;
(window as any).removeGridRow = removeGridRow;
(window as any).setGridData = setGridData;
(window as any).getGrid = getGrid;
(window as any).updateGridRow = updateGridRow;
(window as any).addGridRow = addGridRow;
