export default class MouseCursor {
  public x: number;
  public y: number;
  public cursor: HTMLElement

  static amt: number = 0.3;
  static instance: MouseCursor;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.cursor = document.createElement('div');
    this.cursor.classList.add('demo-tools-cursor');
    document.body.appendChild(this.cursor);
  }

  static moveCursor(x: number, y: number, startX?: number, startY?: number) {
    return new Promise(resolve => {
      let mouseCursor

      if (MouseCursor.instance) {
        mouseCursor = MouseCursor.getInstance()
      } else {
        mouseCursor = MouseCursor.getInstance(startX || x, startY || y)
      }

      async function updateFrame() {
        const dx = x - mouseCursor.x;
        const dy = y - mouseCursor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1.1) {
          mouseCursor.x = x;
          mouseCursor.y = y;
          mouseCursor.cursor.style.left = `${x}px`;
          mouseCursor.cursor.style.top = `${y}px`;
          await MouseCursor.clickAnimation()
          resolve(undefined);
          return;
        }

        mouseCursor.x = MouseCursor.lerp(mouseCursor.x, x, MouseCursor.amt);
        mouseCursor.y = MouseCursor.lerp(mouseCursor.y, y, MouseCursor.amt);

        mouseCursor.cursor.style.left = `${mouseCursor.x}px`;
        mouseCursor.cursor.style.top = `${mouseCursor.y}px`;

        requestAnimationFrame(updateFrame);
      }

      requestAnimationFrame(updateFrame);
    })
  }

  static lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  static async clickAnimation() {
    if(!MouseCursor.getInstance()?.cursor) {
      return
    }

    MouseCursor.getInstance()?.cursor.classList.add('demo-tools-cursor-click');
    await new Promise(r => setTimeout(() => {
      MouseCursor.getInstance()?.cursor.classList.remove('demo-tools-cursor-click');
      r(undefined);
    }, 300))
  }

  static destroy() {
    MouseCursor.getInstance()?.cursor?.remove();
    MouseCursor.instance = null;
  }

  static getInstance(x?: number, y?: number) {
    if (!MouseCursor.instance) {
      MouseCursor.instance = new MouseCursor(x || 0, y || 0);
    }

    return MouseCursor.instance;
  }
}