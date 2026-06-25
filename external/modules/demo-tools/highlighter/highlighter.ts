interface IAction {
  label: string;
  action: () => void;
}

interface IItem {
  element: HTMLElement;
  actions: IAction[]
}

export default abstract class Highlighter {
  static items: IItem[] = [];
  static rootElement: HTMLElement | null = null;
  static holeNodes: SVGRectElement[] = [];
  static toolbarNodes: HTMLElement[] = [];
  static highlight(items?: IItem[]) {
    if (items) {
      Highlighter.items = Array.from(items);
    }
    const svgNS = 'http://www.w3.org/2000/svg';

    Highlighter.rootElement = document.createElement('div');
    Highlighter.rootElement.style.position = 'fixed';
    Highlighter.rootElement.style.inset = '0';
    Highlighter.rootElement.style.zIndex = '999999';
    Highlighter.rootElement.style.pointerEvents = 'none';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.inset = '0';

    const defs = document.createElementNS(svgNS, 'defs');
    const mask = document.createElementNS(svgNS, 'mask');
    mask.setAttribute('id', 'spotlight-mask');

    const whiteBg = document.createElementNS(svgNS, 'rect');
    whiteBg.setAttribute('width', '100%');
    whiteBg.setAttribute('height', '100%');
    whiteBg.setAttribute('fill', 'white');

    mask.appendChild(whiteBg);
    defs.appendChild(mask);
    svg.appendChild(defs);

    const dim = document.createElementNS(svgNS, 'rect');
    dim.setAttribute('width', '100%');
    dim.setAttribute('height', '100%');
    dim.setAttribute('fill', 'rgba(0,0,0,0.65)');
    dim.setAttribute('mask', 'url(#spotlight-mask)');
    svg.appendChild(dim);

    const actionLayer = document.createElement('div');
    actionLayer.style.position = 'absolute';
    actionLayer.style.inset = '0';
    actionLayer.style.pointerEvents = 'none';

    Highlighter.rootElement.appendChild(svg);
    Highlighter.rootElement.appendChild(actionLayer);
    document.body.appendChild(Highlighter.rootElement);

    Highlighter.items.forEach((item, itemIndex) => {
      const hole = document.createElementNS(svgNS, 'rect');
      hole.setAttribute('fill', 'black');
      hole.setAttribute('rx', '8');
      mask.appendChild(hole);
      Highlighter.holeNodes.push(hole);

      const toolbar = document.createElement('div');
      toolbar.style.position = 'fixed';
      toolbar.style.pointerEvents = 'auto';
      toolbar.style.background = 'white';
      toolbar.style.borderRadius = '8px';
      toolbar.style.padding = '3px';
      toolbar.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
      toolbar.style.display = 'flex';
      toolbar.style.gap = '4px';
      toolbar.style.transform = 'translateX(-50%)';

      item.actions.forEach((action, actionIndex) => {
        const button = document.createElement('button');
        button.textContent = action.label;
        button.style.border = 'none';
        button.style.color = 'black';
        button.style.cursor = 'pointer';
        button.style.fontWeight = '500';
        button.style.borderRadius = '4px';
        button.style.transition = 'background-color 0.2s';
        button.dataset.itemIndex = String(itemIndex);
        button.dataset.actionIndex = String(actionIndex);
        button.addEventListener('click', Highlighter.onActionClick);
        toolbar.appendChild(button);
      })

      actionLayer.appendChild(toolbar);
      Highlighter.toolbarNodes.push(toolbar);
    });
    // @ts-ignore
    actionLayer.querySelector('button:nth-child(1)')?.focus()

    Highlighter.update();

    window.addEventListener('scroll', Highlighter.onScroll);
    window.addEventListener('resize', Highlighter.onResize);
    window.addEventListener('click', Highlighter.onClick);
  }

  static update() {
    Highlighter.items.forEach((item, index) => {
      const element = item.element;
      const rect = element.getBoundingClientRect();
      const pad = 6;

      const hole = Highlighter.holeNodes[index];
      hole.setAttribute('x', String(rect.left - pad));
      hole.setAttribute('y', String(rect.top - pad));
      hole.setAttribute('width', String(rect.width + pad * 2));
      hole.setAttribute('height', String(rect.height + pad * 2));

      const toolbar = Highlighter.toolbarNodes[index];
      toolbar.style.left = `${rect.left + rect.width / 2}px`;
      toolbar.style.top = `${rect.bottom + 8}px`;
    });
  }

  static unhighlight(element: HTMLElement) {
    const index = Highlighter.items.findIndex(item => item.element === element);
    if (index !== -1) {
      Highlighter.holeNodes[index].remove();
      Highlighter.holeNodes.splice(index, 1);
      Highlighter.toolbarNodes[index].remove();
      Highlighter.toolbarNodes.splice(index, 1);
      Highlighter.items.splice(index, 1);
    }
  }

  static onScroll = () => Highlighter.update();
  static onResize = () => Highlighter.update();
  static onClick = (e) => {
    if (e.target?.localName === 'button') return;
    Highlighter.destroy();
  }
  static onActionClick = (e) => {
    const action = Highlighter.items[Number(e.target.dataset.itemIndex)].actions[Number(e.target.dataset.actionIndex)];
    if (!action) return;
    Highlighter.destroy();
    action.action();
    e.stopPropagation();
  }
  
  static destroy() {
    window.removeEventListener('scroll', Highlighter.onScroll);
    window.removeEventListener('resize', Highlighter.onResize);
    window.removeEventListener('click', Highlighter.onClick, true);
    Highlighter.items.forEach((item, itemIndex) => {
      item.actions.forEach((_, actionIndex) => {
        const button = Highlighter.toolbarNodes[itemIndex]?.children[actionIndex] as HTMLElement;
        button?.removeEventListener('click', Highlighter.onActionClick)
      })
    });
    Highlighter.rootElement?.remove();
    Highlighter.rootElement?.remove();
    Highlighter.holeNodes?.forEach(node => node.remove());
    Highlighter.holeNodes = [];
    Highlighter.toolbarNodes?.forEach(node => node.remove());
    Highlighter.toolbarNodes = [];
    Highlighter.items = [];
  }
}