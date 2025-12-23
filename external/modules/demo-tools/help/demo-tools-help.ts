import { Config, driver } from 'driver.js'
import 'driver.js/dist/driver.css'

import json from './demo-tools-help.json'
import { mapObjIndexed, values } from 'ramda'

export default class Help {
  static driver = driver({
    overlayOpacity: 0.3,
  })

  static show(inConsole: boolean = false) {
    if (inConsole) {
      Help.print();
      return;
    }

    Help.driver.highlight({
      element: document.body,
      popover: {
        showButtons: ['next'],
        nextBtnText: 'Close',
        description: Help.getHtml(),
        popoverClass: 'demo-tools demo-tools-help-popover',
        side: 'left',
        onCloseClick: () => Help.driver.destroy(),
        onNextClick: () => Help.driver.destroy(),
      }
    })
  }

  static print() {
    console.table(json)
  }

  static getHtml(): string {
    return `
      <div class="demo-tools-help">
        <div class="demo-tools-help-column">
          <div class="demo-tools-help-title"><h3>demoTools</h3></div>
          ${Help.getMethodsTable(json.api.demoTools)}
        </div>
        <div class="demo-tools-help-column">
          <div class="demo-tools-help-title"><h3>demoTools.demo</h3></div>
          ${Help.getMethodsTable(json.api.demoTools.demo)}
        </div>
        <div class="demo-tools-help-column">
          <div class="demo-tools-help-title"><h3>Hot keys</h3></div>
          <table class="demo-tools-help-description">
            <thead>
              <tr>
                <th>Hot key</th>
                <th>Action</th>
              </tr>
            </thead>
            ${
              json.hotKeys
                .map(e => `<tr><td>${e.hotKey}</td><td>${e.description}</td></tr>`)
                .join('')
            }
          </table>
        </div>
      </div>
    `
  }

  static getMethodsTable(json: any): string {
    const html = `
      <table class="demo-tools-help-description">
        <thead>
          <tr>
            <th>Method</th>
            <th>Parameters</th>
            <th>Return Type</th>
            <th>Description</th>
          </tr>
        </thead>
    `
    const rows = values(mapObjIndexed((e: any, key) => ({ ...e, method: key }), json))
      .filter(e => e.type?.toLowerCase() === 'function')
      .map(e => `
          <tr>
            <td>${e.method}</td>
            <td>${e.parameters.map(p => `${p.name}: ${p.type}`).join('<br/>')}</td>
            <td>${e.returnType}</td>
            <td>${e.description}</td>
          </tr>
      `)
      .join('')

    return html + rows + '</table>'
  }
}