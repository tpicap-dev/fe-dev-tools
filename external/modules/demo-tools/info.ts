import { format } from 'date-fns'
import DevServer from 'external/modules/dev-server/dev-server'
import { fetchGitSummary, IGitSummary } from 'external/modules/git/git'

export default class Info {
  static initialized = false;
  static area = null;
  static init() {
    Info.initialized = true;
    Info.setElement()
  }

  static setElement() {
    Info.area = document.createElement('div')
    Info.area.setAttribute('id', 'demo-tools-info')
    Info.area.appendChild(Info.getHeaderElement())
    Info.area.appendChild(Info.getLoadingElement())

    Info.getGitElement()
      .then(el => Info.area.appendChild(el))
      .then(() => Info.getProjectInfoElement())
      .then(el => Info.area.appendChild(el))
      .finally(() => Info.area.querySelectorAll('.demo-tools-info-loading').forEach(el => el. remove()))
  }

  static getHeaderElement() {
    const title = document.createElement('h3')
    title.innerHTML = 'Info'
    title.setAttribute('class', 'demo-tools-info-title')
    return title
  }

  static async getGitElement() {
    let gitSummary: IGitSummary = {} as any
    try {
      gitSummary = await fetchGitSummary()
    } catch (e) {

    }
    const element = document.createElement('div')
    element.setAttribute('id', 'demo-tools-info-git')
    element.classList.add('demo-tools-info-section')

    const innerHTML = `
      <div>Commit Id:</div>
      <div>${gitSummary.commit || 'unknown'}</div>
      <div>Date:</div>
      <div>${gitSummary.date ? format(new Date(gitSummary.date), 'yyyy-MM-dd HH:mm:ss') : 'unknown'}</div>
      <div>Message:</div>
      <div title="${gitSummary.message}">${gitSummary.message || 'unknown'}</div>
      <div>Branch:</div>
      <div>${gitSummary.branch || 'unknown'}</div>
      <div>Branch switched:</div>
      <div>${gitSummary.branchSwitchTime || 'unknown'}</div>`

    element.innerHTML = innerHTML;
    return element;
  }

  static getLoadingElement() {
    const element = document.createElement('div')
    element.setAttribute('class', 'demo-tools-info-loading')
    element.innerHTML = 'Loading...'
    return element
  }

  static async getProjectInfoElement() {
    let projectInfo: { bundleMTime: string } = {} as any
    try {
      projectInfo = await DevServer.get('project-info')
    } catch (e) {

    }
    const element = document.createElement('div')
    element.classList.add('demo-tools-info-section')
    const innerHTML = `
    <div>Compiled at:</div>
    <div>${projectInfo.bundleMTime ? format(new Date(projectInfo.bundleMTime), 'yyyy-MM-dd HH:mm:ss') : 'unknown'}</div>
    `

    element.innerHTML = innerHTML;

    return element;
  }

  static destroy() {
    Info.initialized = false;
    Info.area = null;
  }
}