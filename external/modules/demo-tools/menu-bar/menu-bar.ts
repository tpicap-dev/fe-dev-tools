import { options } from 'external/modules/demo-tools/demo'
import './style.less'

interface IMenuBarItem {
  title: string;
  eventType: string;
  iconClass?: string;
  glyph: string;
}

export default class MenuBar {
  static initialized = false;
  static area = null;
  static eventTypes = {
    MODE_CLICK: 'DemoTools:MenuBar:modeClick',
    EDIT_CLICK: 'DemoTools:MenuBar:editClick',
    VERBOSE_CLICK: 'DemoTools:MenuBar:verboseClick',
    RESTORING_APP_STATE_STEP_CLICK: 'DemoTools:MenuBar:addRestoringAppStateStepClick',
    EXPORT_DEMO_TO_CONSOLE_CLICK: 'DemoTools:MenuBar:exportDemoToConsoleClick',
    IMPORT_DEMO_CLICK: 'DemoTools:MenuBar:importDemoClick',
    REFERSH_DEMO_CLICK: 'DemoTools:MenuBar:refreshDemoClick',
    CLOSE_DEMO_CLICK: 'DemoTools:MenuBar:closeDemoClick',
  }
  static get items(): IMenuBarItem[] {
    const items:IMenuBarItem[] = [
      { title: 'Demo mode, Ctrl+Alt+M', eventType: MenuBar.eventTypes.MODE_CLICK, iconClass: '', glyph: 'M' },
      { title: 'Edit, Ctrl+Alt+E', eventType: MenuBar.eventTypes.EDIT_CLICK, iconClass: '', glyph: 'E' },
      { title: 'Verbose, Ctrl+Alt+V', eventType: MenuBar.eventTypes.VERBOSE_CLICK, iconClass: '', glyph: 'V' },
      // { title: 'Add restoring app state step', eventType: MenuBar.eventTypes.RESTORING_APP_STATE_STEP_CLICK, iconClass: '', glyph: '+' },
      // { title: 'Export demo to console', eventType: MenuBar.eventTypes.EXPORT_DEMO_TO_CONSOLE_CLICK, iconClass: 'gg-export' },
      // { title: 'Import demo', eventType: MenuBar.eventTypes.IMPORT_DEMO_CLICK, iconClass: 'gg-import' },
    ]

    if(!options.editable){
      // items.push({ title: 'Edit', eventType: MenuBar.eventTypes.EDIT_CLICK, glyph: '🖉' })
    } else {
      // items.push({ title: 'Finish editing', eventType: MenuBar.eventTypes.EDIT_COMPLETE_CLICK, glyph: '✓' })
    }

    return items
  }

  static init() {
    MenuBar.setElement();
    window.addEventListener('Demo:OptionsChanged', MenuBar.handleDemoToolsOptionsChanged)
    MenuBar.initialized = true;
  }

  static setElement() {
    if (MenuBar.initialized) {
      return;
    }

    MenuBar.area = document.createElement('div');
    MenuBar.area.classList.add('menu-bar');

    MenuBar.area.appendChild(MenuBar.getMenuListElement())
    MenuBar.area.appendChild(MenuBar.getRightElement())
  }

  static renderMenuList() {
    if (!MenuBar.area) return;

    const element = MenuBar.area.querySelector('.menu-list');
    element?.replaceWith(MenuBar.getMenuListElement())
  }

  static getMenuListElement() {
    const menuList = document.createElement('div');
    menuList.classList.add('menu-list');
    MenuBar.items.forEach((item) => {
      const el = document.createElement('div');
      el.classList.add('menu-item');
      el.classList.add('menu-item-icon');
      if (item.iconClass) el.classList.add(item.iconClass);
      el.setAttribute('title', item.title);
      el.setAttribute('data-eventtype', item.eventType);
      menuList.appendChild(el);
      el.addEventListener('click', MenuBar.handleItemClick)
      if (item.glyph) {
        el.innerText = item.glyph
      }
    })

    return menuList
  }

  static getRightElement() {
    const el = document.createElement('div');
    el.classList.add('right-section');

    const instructions = document.createElement('div');
    if (options.instructions) {
      instructions.classList.add('instructions');
      instructions.innerHTML = '?';
      instructions.setAttribute('title', options.instructions);
    }

    const refreshELement = document.createElement('div');
    refreshELement.classList.add('refresh-demo');
    refreshELement.innerText = '⟲';
    refreshELement.setAttribute('title', 'Refresh demo');
    refreshELement.setAttribute('data-eventtype', MenuBar.eventTypes.REFERSH_DEMO_CLICK);
    refreshELement.addEventListener('click', MenuBar.handleItemClick)


    const closeELement = document.createElement('div');
    closeELement.classList.add('close-demo');
    closeELement.innerHTML = 'X';
    closeELement.setAttribute('title', 'Close demo');
    closeELement.setAttribute('data-eventtype', MenuBar.eventTypes.CLOSE_DEMO_CLICK);
    closeELement.addEventListener('click', MenuBar.handleItemClick)

    if (options.instructions) {
      el.appendChild(instructions)
    }
    el.appendChild(refreshELement)
    el.appendChild(closeELement)
    return el
  }

  static handleItemClick(e: any) {
    window.dispatchEvent(new CustomEvent(e?.target?.dataset.eventtype))
  }

  static handleDemoToolsOptionsChanged() {
    MenuBar.renderMenuList();
  }

  static destroy() {
    MenuBar.initialized = false;
    window.removeEventListener('Demo:OptionsChanged', MenuBar.handleDemoToolsOptionsChanged)
    MenuBar.area?.querySelectorAll('.menu-item')?.forEach((item) => {
      item.removeEventListener('click', MenuBar.handleItemClick)
    })
    MenuBar.area = null;
  }
}