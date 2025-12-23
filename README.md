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
  git clone https://github.com/tpicap-dev/fe-dev-tools.git
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
    - logger — lightweight namespaced logger attached to store for quick persistence and inspection
        - logger.on(): turn on logging redux actions to console
        - logger.off(): turn off logging redux actions to console

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
### Demo tools

A small client-side helper (demo-tools) for creating, managing and running UI walkthroughs / demos. It is exposed on the global window as `demo` (see index.ts) and provides a straightforward programmatic API plus a lightweight on-page UI to author and run demo steps.

Key features
- Create and manage steps programmatically (add, update, remove, reorder, copy, move).
- Highlight elements or arbitrary areas and show a popover description (powered by driver.js).
- Run demo sequences with configurable intervals, pause/resume/stop.
- Interactive "picker" that captures hovered element XPath to create highlight/click steps.
- Support for multiple named demo storages (persist multiple demo sets) so you can keep different walkthroughs for different flows.
- Keyboard shortcuts for quick control while developing demos.

Basic usage (browser)
1. Initialize:
   ```javascript
   // in your app bootstrap code
   DemoTools.init({ renderToolbar: true, interval: 2000 })
   // or use the global if index.ts is used:
   window.demo.init({ renderToolbar: true, title: 'Demo name' })
   ```

2. Add steps:
   ```javascript
   DemoTools.addStep({ title: 'Click submit', type: 'click', selector: '#submit-btn' })
   DemoTools.addHighlightStep({ title: 'Profile avatar', selector: '.avatar' })
   ```

3. Run / control:
   ```javascript
   DemoTools.run()        // run all steps
   DemoTools.pause()      // stop running
   DemoTools.resume()     // resume run
   DemoTools.stop()       // stop and reset
   DemoTools.doStep(0)    // run a single step by index or title substring
   DemoTools.printSteps() // log current step list
   ```

4. Pick elements interactively:
    - Call DemoTools.pickStep() to capture the currently hovered element as a step via a small prompt UI.

Keyboard shortcuts (while DemoTools is initialized)
- Ctrl + Alt + P — pick element (press while hovering an element), pause
- Ctrl + Alt + R — run
- Ctrl + Alt + S — stop
- Ctrl + Alt + ArrowRight / ArrowLeft — jump/step (with Shift to only select)
- Ctrl + Alt + ArrowUp / ArrowDown — move step up/down
- Ctrl + Alt + U — update current step (if it is bound to an element)
- Ctrl + Alt + D — delete current step
- Ctrl + Alt + C — check current step (open check prompt)

API summary
- DemoTools.init(options)
    - options.title: string (default 'default')
    - options.demoOptions.title: string (default options.title)
    - options.demoOptions.renderToolbar: boolean (default true)
    - options.demoOptions.interval: number (ms default 2000)
    - options.demoOptions.steps: array (default [])
- DemoTools.getDemos()
- DemoTools.getDemo(demoName)
- DemoTools.setDemo(demoName, steps)
- DemoTools.listDemos()
- DemoTools.removeDemo(demoName)
- DemoTools.destroy()
- DemoTools.demo.addStep(step)
- DemoTools.demo.addHighlightStep(step)
- DemoTools.demo.insertStep(step, index)
- DemoTools.demo.updateStep(titleOrIndex?, newStep?)
- DemoTools.demo.removeStep(titleOrIndex)
- DemoTools.demo.removeAllSteps()
- DemoTools.demo.doStep(titleOrIndex)
- DemoTools.demo.run({ from?, till?, interval? })
- DemoTools.demo.pause(), DemoTools.resume(), DemoTools.stop()
- DemoTools.demo.pickStep()
- DemoTools.demo.printSteps()
- DemoTools.demo.restore() — restore persisted steps from global variable
- DemoTools.demo.destroy() — teardown UI hooks and listeners

## To-do / roadmap

## License & contribution

See repository for contribution guidelines and license information.
