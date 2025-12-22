declare const gitHead: Function

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
    Info.area.appendChild(Info.getGitLoadingElement())

    Info.getGitElement()
      .then(el => Info.area.appendChild(el))
      .finally(() => Info.area.querySelector('.demo-tools-info-git-loading')?.remove())
  }

  static async getGitElement() {
    let commit: { commit: string, date: string, message: string, branch: string } = {} as any
    try {
      commit = await gitHead()
    } catch (e) {

    }
    const element = document.createElement('div')
    element.setAttribute('id', 'demo-tools-info-git')
    element.classList.add('demo-tools-info-section')

    const innerHTML = `
      <div>Commit Id:</div>
      <div>${commit.commit || 'unknown'}</div>
      <div>Date:</div>
      <div>${commit.date || 'unknown'}</div>
      <div>Message:</div>
      <div>${commit.message || 'unknown'}</div>
      <div>Branch:</div>
      <div>${commit.branch || 'unknown'}</div>`

    element.innerHTML = innerHTML;
    return element;
  }

  static getHeaderElement() {
    const title = document.createElement('h3')
    title.innerHTML = 'Info'
    title.setAttribute('class', 'demo-tools-info-title')
    return title
  }

  static getGitLoadingElement() {
    const element = document.createElement('div')
    element.setAttribute('class', 'demo-tools-info-git-loading')
    element.innerHTML = 'Loading...'
    return element
  }

  static destroy() {
    Info.initialized = false;
    Info.area = null;
  }
}