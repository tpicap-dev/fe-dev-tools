# Dev Tools

FE developer helper for debugging and testing browser applications. Provides options to dispatch redux actions, inspect and modify state, and exposes a few 3rd-party libraries for quick access.

## Quick overview

- Inspect and manipulate the redux store
- Dispatch or redispatch actions
- Enable/disable actions for testing flows
- Persist and manage small dev variables in localStorage
- Expose helpers: ramda, numeral, decimal, date-fns, and simple utilities (diff, stub, etc.)

## Installation

Clone the repository:
   ```bash
  git clone https://scm.tpicapcloud.com/fusion/equities/dev-tools
   ```


## Building

Prerequisite: Deno (tested with v1.29.1) must be installed.

1. Edit `shared/constants.js` and set `PROJECT_PATH` to the absolute path of the equities-client project you want to integrate with.
2. From the dev-tools repo root run:
   ```bash
   deno task build-external
   ```

This prepares the JS files for use in the browser.

## Make features available in the browser

To use dev-tools inside the equities-client app during local development:

In dev-tools repo:
   ```bash
   deno task launch-app
   ```

## Exposed API (summary)

Objects and functions are made available on window for quick interactive debugging.

- store
    - state(): returns the current redux state object
    - panelState(panelType: string): returns panel-specific state
    - dispatch(action: { type: string, payload?: any }): dispatches an action
    - redispatch(type: string, { payload?: any, shift?: number }?): redispatches a recent action
    - getActions(): returns recent actions
    - disableAction({ type: string, exception?: any }): disable an action type (allow once with exception)
    - enableAction(type: string): re-enable a disabled action type
    - enableActions(): re-enable all disabled action types
    - setField(path: string, value: any): set state field using dot-notation path
    - setPanelField(panelType: string, path: string, value: any): set panel-relative state field
    - setMatchingField(obj: any, value: any, pathOrPropName? = []): updates object matching obj in store, by merging it with value param 
    - setMatchingFields(obj, value): updates all objects matching obj in store, by merging it with value param

- logger
    - log(value: any): store value in localStorage
    - print(): print stored values to console as a table

- Ladash (__)
    - findProp(obj: any, propName: string): deep searches for all attributes inside obj, which have keys matching propName param
    - findMatch(obj1, obj2, path: (string | number)[]?): deep searches inside obj1 for object matching obj2, starting with given path optionally
    - findMatches(obj1, obj2): deep searches inside obj1 for objects matching obj2, returning all matches
    - diff(obj1: any, obj2: any): object diff helper

- Utilities exposed
    - r — ramda (see ramda docs)
    - numeral — numeral (see numeral docs)
    - decimal — Decimal library
    - d — date-fns (see date-fns docs)
    - setVar(varName: string, varValue: any): persist variable to window + localStorage
    - deleteVar(varName: string)
    - clearVars(): remove all dev-tool stored variables
    - stub(path: string): send request to local dev-tools web-server (returns Promise<any>)
    - onLoad(fn: Function): register function to run on window load

(Refer to code or console for exact signatures and additional helpers.)

## To-do / roadmap

## License & contribution

See repository for contribution guidelines and license information.
