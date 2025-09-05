# Dev Tools



## Description

FE dev helper tool for debugging and testing browser app. Provides options to dispatch redux actions, dump state, exposes few 3rd party libraries.

## Installation

- Clone repo from https://github.com/tpicap-dev/fe-dev-tools

## Building

***Pre requirements: Deno(v. 2.4.3) should be installed***

- Modify `shared/constants.js` and `internal/constants.sh` and set `PROJECT_PATH` to absolute project path

## Running application with Dev Tools

- Navigate to dev-tool local repo
- In terminal run `deno task build-external`
- In terminal run `deno task launch-app`
- Refresh browser tab

***

# Features

<table class="wrapped confluenceTable" data-mce-selected="1">
  <colgroup>
    <col
      data-resize-pixel="402.65625"
      data-resize-percent="36.30804779080252"
      data-offset-left="40.5"
      data-offset-right="443.15625"
      style="width: 500px"
    />
    <col
      data-resize-pixel="706.515625"
      data-resize-percent="63.70745040577096"
      data-offset-left="443.15625"
      data-offset-right="1149.671875"
      style="width: 707px"
    />
  </colgroup>
  <tbody>
    <tr>
      <th class="confluenceTh">Objects</th>
      <th class="confluenceTh"><p>Functions</p></th>
    </tr>
    <tr>
      <td colspan="1" class="confluenceTd">
        <p class="auto-cursor-target"><br /></p>
        <table class="wrapped confluenceTable" style="letter-spacing: 0px">
          <tbody>
            <tr>
              <th class="confluenceTh">Object</th>
              <th class="confluenceTh">Properties</th>
            </tr>
            <tr role="row">
                <td colspan="1" class="confluenceTd">store</td>
                <td colspan="1" class="confluenceTd">
                    <p><span style="color: rgb(0,0,255);">state()</span><br>actual state object</p>
                    <p><span style="color: rgb(0,0,255);">panelState(panelType: string)</span><br>returns panel state</p>
                    <p><span style="color: rgb(0,0,255);">dispatch({type: string, payload: any}) <span style="color: rgb(0,0,0);">dispatches passed action</span></span></p>
                    <p><span style="color: rgb(0,0,255);">redispatch(type: string, {payload: any, shift?: number}?) <span style="color: rgb(0,0,0);">redispatches recent action</span></span></p>
                    <p><span style="color: rgb(0,0,255);">getActions() <span style="color: rgb(0,0,0);">returns recent actions</span></span></p>
                    <p><span style="color: rgb(0,0,255);">disableAction({ type: string, exception?: any }) <span style="color: rgb(0,0,0);">disables action with given type except once with payload containing exception</span></span></p>
                    <p><span style="color: rgb(0,0,255);">enableAction(type: string) <span style="color: rgb(0,0,0);">reenables action with given type</span></span></p>
                    <p><span style="color: rgb(0,0,255);">enableActions() <span style="color: rgb(0,0,0);">reenables all disabled actions</span></span></p>
                    <p><span style="color: rgb(0,0,255);">setField(path: string; value: any) <span style="color: rgb(0,0,0);">sets value to state field with path given as dot-notation</span></span></p>
                    <p><span style="color: rgb(0,0,255);">setPanelField(panelType: string, path: string; value: any) <span style="color: rgb(0,0,0);">set value to panel state field with path given as dot-notation, relative to panel path</span></span></p>
                </td>
            </tr>
            <tr>
                <td>
                    logger
                </td>
                <td>
                    <p><span style="color: rgb(0,0,255);">log(value: any)</span><br>store value in localStorage</p>
                    <p><span style="color: rgb(0,0,255);">print()</span><br>prints sored values to console as table</p>
                </td>
            </tr>
            <tr>
              <td class="confluenceTd">r</td>
              <td class="confluenceTd">see ramda documentation</td>
            </tr>
            <tr>
              <td class="confluenceTd">numeral</td>
              <td class="confluenceTd">see numeral documentation</td>
            </tr>
            <tr>
              <td class="confluenceTd">decimal</td>
              <td class="confluenceTd">see Decimal documentation</td>
            </tr>
            <tr>
              <td class="confluenceTd">d</td>
              <td class="confluenceTd"><p>see date-fns documentation</p></td>
            </tr>
          </tbody>
        </table>
        <p class="auto-cursor-target"><br /></p>
      </td>
      <td colspan="1" class="confluenceTd" valign="top">
        <p class="auto-cursor-target"><br /></p>
        <table class="wrapped confluenceTable">
          <tbody>
            <tr>
              <th class="confluenceTh">Function name</th>
              <th colspan="1" class="confluenceTh">Description</th>
              <th class="confluenceTh">Params</th>
              <th class="confluenceTh">Returns</th>
            </tr>
            <tr>
              <td class="confluenceTd">setVar</td>
              <td colspan="1" class="confluenceTd">
                <p>
                  Stores variable in window object and localStorage,<br />making
                  variable available in window object<br />and persistent to
                  page reload
                </p>
              </td>
              <td class="confluenceTd">
                <p>
                  <span style="color: rgb(0, 0, 255)">varName</span>: string
                </p>
                <p><span style="color: rgb(0, 0, 255)">varValue</span>: any</p>
              </td>
              <td class="confluenceTd">-</td>
            </tr>
            <tr>
              <td class="confluenceTd">deleteVar</td>
              <td colspan="1" class="confluenceTd">Deletes variable</td>
              <td class="confluenceTd">
                <span style="color: rgb(0, 0, 255)">varName</span>: string
              </td>
              <td class="confluenceTd">-</td>
            </tr>
            <tr>
              <td class="confluenceTd">clearVars</td>
              <td colspan="1" class="confluenceTd">
                Deletes all variables from dev-tools local storage
              </td>
              <td class="confluenceTd">-</td>
              <td class="confluenceTd">-</td>
            </tr>
            <tr>
                <td class="confluenceTd">stub</td>
                <td colspan="1" class="confluenceTd">
                    Sends request to local dev-tools web-server
                </td>
                <td class="confluenceTd">
                    <span style="color: rgb(0, 0, 255)">path</span>: string
                </td>
                <td class="confluenceTd">
                    <span style="color: rgb(0, 0, 255)">Promise&lt;any&gt;</span>
                </td>
            </tr>
            <tr>
                <td class="confluenceTd">diff</td>
                <td colspan="1" class="confluenceTd">
                    Object diff function
                </td>
                <td class="confluenceTd">
                    <span style="color: rgb(0, 0, 255)">Object1</span>: any, <span style="color: rgb(0, 0, 255)">Object2</span>: any
                </td>
                <td class="confluenceTd">
                    any
                </td>
            </tr>
            <tr>
                <td class="confluenceTd">onLoad</td>
                <td colspan="1" class="confluenceTd">
                    Adds function to window onLoad event listener
                </td>
                <td class="confluenceTd">
                    <span style="color: rgb(0, 0, 255)">function</span>: string
                </td>
                <td class="confluenceTd">
                    -
                </td>
            </tr>
          </tbody>
        </table>
        <p class="auto-cursor-target"><br /></p>
      </td>
    </tr>
  </tbody>
</table>