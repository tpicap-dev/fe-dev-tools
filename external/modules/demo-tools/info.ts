import { format } from 'date-fns'
import DevServer from 'external/modules/dev-server/dev-server'
import { fetchGitSummary, IGitSummary } from 'external/modules/git/git'
import { findIndex, keys, pipe, prop, propEq } from 'ramda'
import { stringToSlug } from 'external/utils/utils'
import { options } from 'external/modules/demo-tools/demo'

const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'

type Entry = { [ key: string]: string }
type Section = { key: string, data: Entry[] }
type Data = Section[]

export default class Info {
  static initialized = false;
  static eventTypes = {
    ELEMENT_SET: 'DemoTools:Info:ElementSet',
  }
  static area = null;
  static data: Data = [];
  static reduxStateUnsubscribe = null;
  static init() {
    if (options?.toolbarOptions?.showInfo === false) {
      window.dispatchEvent(new CustomEvent(Info.eventTypes.ELEMENT_SET))
      return;
    }
    window.addEventListener('Demo:OptionsChanged', Info.handleOptionsChangedEvent)
    Info.initialized = true;
    Info.setElement();
    Info.reduxStateUnsubscribe = (window as any)?.store.subscribe(() => {
      Info.updateData('app');
    });
  }

  static setElement() {
    Info.area = document.createElement('div')
    Info.area.setAttribute('id', 'demo-tools-info')
    Info.area.appendChild(Info.getHeaderElement())
    Info.area.appendChild(Info.getLoadingElement())

    Info.setData()
      .then(() => Info.render())
      .finally(() => {
        Info.area.querySelectorAll('.demo-tools-info-loading').forEach(el => el. remove())
        window.dispatchEvent(new CustomEvent(Info.eventTypes.ELEMENT_SET))
      })
  }

  static render() {
    if (!Info.area) {
      return
    }
    const wrapper = document.createElement('div')
    wrapper.classList.add('demo-tools-info-section')
    Info.data.forEach(section => {
      const html = section.data.map(Info.renderEntry).join('')
      wrapper.innerHTML += html
    })

    if (Info.area.querySelector('.demo-tools-info-section')) {
      Info.area.querySelector('.demo-tools-info-section').replaceWith(wrapper)
    } else {
      Info.area.appendChild(wrapper)
    }
  }

  static async setData() {
    Info.data = []
    return Info.getGitData()
      .then(section => Info.data.push(section))
      .then(() => Info.getProjectInfoData())
      .then(section => Info.data.push(section))
      .then(() => Info.getPageInfoData())
      .then(data => Info.data.push(data))
      .then(() => Info.getAppInfoData())
      .then(data => Info.data.push(data))
  }

  static updateData(key: string) {
    const index = findIndex(propEq(key, 'key'), Info.data);
    if (index === -1) {
      return;
    }
    let promise: Promise<Section>;
    switch(key) {
      case 'git':
        promise = Info.getGitData();
        break;
      case 'project':
        promise = Info.getProjectInfoData();
        break;
      case 'page':
        promise = Info.getPageInfoData();
        break;
      case 'app':
        promise = Info.getAppInfoData();
        break;
      default: break;
    }

    promise.then(section => {
      Info.data[index] = section
      Info.render();
    })
  }

  static renderEntry(entry: Entry) {
    const pair = Object.entries(entry)
    return `<div class="${stringToSlug(pair[0][0])}-label">${pair[0][0]}:</div><div title="${pair[0][1]}" class="${stringToSlug(pair[0][0])}-value">${pair[0][1]}</div>`
  }

  static getHeaderElement() {
    const title = document.createElement('h3')
    title.innerHTML = 'Info'
    title.setAttribute('class', 'demo-tools-info-title')
    return title
  }

  static async getGitData(): Promise<Section> {
    let gitSummary: IGitSummary = {} as any
    try {
      gitSummary = await fetchGitSummary()
    } catch (e) {}

    return {
      key: 'git',
      data: [
        {['Commit Id']: gitSummary.commit || 'unknown'},
        {['Date']: gitSummary.date ? format(new Date(gitSummary.date), DATE_TIME_FORMAT) : 'unknown'},
        {['Message']: gitSummary.message || 'unknown'},
        {['Tag']: gitSummary.tag || 'unknown'},
        {['Branch']: gitSummary.branch || 'unknown'},
        {['Branch switched']: gitSummary.branchSwitchTime || 'unknown'},
      ]
    }
  }

  static async getProjectInfoData(): Promise<Section> {
    let projectInfo: { bundleMTime: string } = {} as any
    try {
      projectInfo = await DevServer.get('project-info')
    } catch (e) {}

    return {
      key: 'project',
      data: [
        {['Compiled at']: projectInfo.bundleMTime ? format(new Date(projectInfo.bundleMTime), DATE_TIME_FORMAT) : 'unknown'},
      ]
    }
  }

  static async getPageInfoData(): Promise<Section> {
    return {
      key: 'page',
      data: [
        {['Page loaded at']: performance?.timeOrigin ? format(new Date(performance?.timeOrigin), DATE_TIME_FORMAT) : 'unknown'},
      ]
    }
  }

  static async getAppInfoData(): Promise<Section> {
    const state = (window as any).store.getState();
    const roles = pipe(
      prop('permissions'),
      keys,
    )(state)
      ?.sort()
      .map((role: string) => role.replace('fifx-', '').replace('-role', ''))
      .join(', ')

    return {
      key: 'app',
      data: [
        {['User roles']: roles}
      ]
    }
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
      <div>${gitSummary.date ? format(new Date(gitSummary.date), DATE_TIME_FORMAT) : 'unknown'}</div>
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
    <div>${projectInfo.bundleMTime ? format(new Date(projectInfo.bundleMTime), DATE_TIME_FORMAT) : 'unknown'}</div>
    `

    element.innerHTML = innerHTML;

    return element;
  }

  static async getPageInfoElement() {
    const element = document.createElement('div')
    element.classList.add('demo-tools-info-section')
    const innerHTML = `
    <div>Page loaded at:</div>
    <div>${performance?.timeOrigin ? format(new Date(performance?.timeOrigin), DATE_TIME_FORMAT) : 'unknown'}</div>
    `

    element.innerHTML = innerHTML;

    return element;
  }

  static handleOptionsChangedEvent(e: CustomEvent) {
    Info.destroy()
    if (options?.toolbarOptions?.showInfo) {
      Info.init()
    }
  }

  static destroy() {
    Info.initialized = false;
    Info.area = null;
    Info.reduxStateUnsubscribe?.()
    window.removeEventListener('Demo:OptionsChanged', Info.handleOptionsChangedEvent)
  }
}