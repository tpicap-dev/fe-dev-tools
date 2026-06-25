import { equals, intersection, is, isNil, values } from 'ramda'
import { IElementBoundStep, options } from 'external/modules/demo-tools/demo'
import { getElementByXPath } from 'external/utils/utils'

import './dom.less'
import MouseCursor from 'external/modules/demo-tools/dom/mouse-cursor'
import { getStringSimilarity } from 'external/modules/ladash/ladash'

enum X_PATH_ERROR {
  CLASS_MISTMATCH = 'Class mistmatch: ',
  ID_MISTMATCH = 'ID mistmatch: ',
  ELEMENT_NOT_FOUND = 'Element not found',
}

interface IBlinkOptions {
  size?: number;
  color?: string;
  border?: string;
  duration?: number;
}

export default abstract class Dom {

  static getElement(arg: string | HTMLElement | IElementBoundStep) {
    if (isNil(arg)) {
      return
    }

    if (is(String, arg)) {
      return document.querySelector(arg)
    } else if (is(HTMLElement, arg)) {
      return arg
    } else if (!isNil((arg as IElementBoundStep).selector) && (arg as IElementBoundStep).hasCorrectSelector) {
      return document.querySelector((arg as IElementBoundStep).selector)
    } else if (!isNil((arg as IElementBoundStep).xPath) && (arg as IElementBoundStep).hasCorrectXPath) {
      return getElementByXPath((arg as IElementBoundStep).xPath)
    } else if (!isNil((arg as IElementBoundStep).elementX )&& !isNil((arg as IElementBoundStep).elementY) && (arg as IElementBoundStep).hasCorrectCoordinates) {
      return document.elementFromPoint(arg.elementX, arg.elementY)
    } else if (!isNil((arg as IElementBoundStep).element) && is(HTMLElement, (arg as IElementBoundStep).element)) {
      return (arg as IElementBoundStep).element
    } else {
      return null
    }
  }

  static getNthParent(element: HTMLElement, nth: number): HTMLElement | null {
    if (nth === 0 || !element) {
      return element
    }
    return Dom.getNthParent(element.parentElement, nth - 1)
  }

  static getElementXPath(element: HTMLElement): string {
    if (!element) {
      return ''
    }

    let xPath = ''
    let els = [element]

    while(els[els.length - 1].parentElement) {
      els.push(els[els.length -1].parentElement)
    }

    els = els.reverse()

    els.forEach((el) => {
      let index = 0
      if (el.parentElement) {
        index = Array.from(el.parentElement.children).indexOf(el)
      }
      xPath += `/*[${index + 1}]`
    })

    return xPath
  }

  static click(arg: string | HTMLElement | IElementBoundStep) {
    try {
      const element = Dom.getElement(arg)

      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()

      return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2) .then(() => {
        element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
        element.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}))
        element.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true}))

        // @ts-ignore
        Dom.blink(rect.x + rect.width / 2, rect.y + rect.height / 2)
      })
    } catch (e) {
    }
  }

  static rightClick(arg: string | HTMLElement | IElementBoundStep) {
    try {
      const element = Dom.getElement(arg)

      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()

      return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2).then(() => {
        element.dispatchEvent(new MouseEvent('rightclick', {bubbles: true, cancelable: true}))
        element.dispatchEvent(new MouseEvent('contextmenu', {bubbles: true, cancelable: true}))

        Dom.blink(
          // @ts-ignore
          rect.x + rect.width / 2, rect.y + rect.height / 2,
          {color: 'green'}
        )
      })
    } catch (e) {
    }
  }

  static hover(arg: string | HTMLElement | IElementBoundStep) {
    try {
      const element = Dom.getElement(arg)

      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()

      return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2).then(() => {
        element.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true, cancelable: true}))
        element.dispatchEvent(new MouseEvent('mouseover', {bubbles: true, cancelable: true}))
      })
    } catch (e) {
    }
  }

  static focus(arg: string | HTMLElement | IElementBoundStep) {
    try {
      const element = Dom.getElement(arg)

      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()

      return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2).then(() => {
        element.dispatchEvent(new FocusEvent('focus', {bubbles: true, cancelable: true}))
      })
    } catch (e) {
    }
  }

  static keydown(arg: string | HTMLElement | IElementBoundStep, key: string) {
    try {
      const element = Dom.getElement(arg)

      if (!element) {
        return
      }

      element.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true }))
      element.dispatchEvent(new KeyboardEvent('keypress', { key, code: key, bubbles: true }))
    } catch (e) {
    }
  }

  static setValue(arg: string | HTMLElement | IElementBoundStep, value: string | number) {
    try {
      const element = Dom.getElement(arg)

      if (!element) {
        return
      }

      const rect = element.getBoundingClientRect()

      return MouseCursor.moveCursor(rect.x + rect.width / 2, rect.y + rect.height / 2)
        .then(() => { return Dom.typeIntoInput(String(value), element) })
        .then(() => {
          const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

          element.setAttribute(
            'value',
            value
          )

          nativeSetter.call(element, value)
          element.dispatchEvent(new Event('change', { bubbles: true }))
          element.dispatchEvent(new Event('input', { bubbles: true }))
        })
    } catch (e) {
    }
  }

  static typeIntoInput(text: string, element: HTMLInputElement, speed = 10) {
    return new Promise((resolve) => {
      // Clear initial content and ensure focus
      element.value = '';
      element.focus();

      let index = 0;

      function typeNextChar() {
        if (index < text.length) {
          element.value += text.charAt(index);
          index++;

          // Dispatch an 'input' event so frameworks (React, Vue) or listeners stay in sync
          element.dispatchEvent(new Event('input', { bubbles: true }));

          // Add slight random variance (+/- 20ms) to simulate realistic human typing
          const randomDelay = speed + (Math.random() * 40 - 20);
          setTimeout(typeNextChar, Math.max(10, randomDelay));
        } else {
          // Dispatch 'change' event when typing finishes
          element.dispatchEvent(new Event('change', { bubbles: true }));
          resolve(undefined);
        }
      }

      typeNextChar();
    });
  }

  static mouseCursorClickAnimation(cursorElement: HTMLElement) {

  }

  static blink(x, y, options: IBlinkOptions = {}) {
    const {
      size = 40,
      color = 'yellow',
      border = '2px solid yellow',
      duration = 400,
    } = options

    const circle = document.createElement('div')
    circle.style.position = 'absolute'
    circle.style.left = `${x - size / 2}px`
    circle.style.top = `${y - size / 2}px`
    circle.style.width = `${size}px`
    circle.style.height = `${size}px`
    circle.style.borderRadius = '50%'
    circle.style.backgroundColor = color
    circle.style.border = border
    circle.style.pointerEvents = 'none'
    circle.style.zIndex = '999999999'
    circle.style.boxShadow = `0 0 10px ${color}`
    circle.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`
    circle.style.transform = 'scale(0.2)'
    circle.style.opacity = '1'

    document.body.appendChild(circle)

    circle.getBoundingClientRect()

    circle.style.transform = 'scale(1)'
    circle.style.opacity = '0'

    setTimeout(() => {
      circle.remove()
    }, duration)
  }

  static scrollBy(arg: string | HTMLElement | IElementBoundStep, scrollAxe: string, scrollBy: number) {
    try {
      const element = Dom.getElement(arg)
      if (!element) {
        return
      }

      if (scrollAxe === 'x') {
        element.scrollBy({
          top: 0,
          left: scrollBy,
          behavior: 'smooth'
        })
      } else {
        element.scrollBy({
          top: scrollBy,
          left: 0,
          behavior: 'smooth'
        })
      }
    } catch (e) {
    }
  }

  static attrsMatch(el1: HTMLElement, el2: HTMLElement): true | string {

    if (!el1) {
      return `${X_PATH_ERROR.ELEMENT_NOT_FOUND}: el2.toString()}`
    }

    if (el1 instanceof HTMLElement) {
      if (!equals(el1.id, el2.id) && el2.id !== '' && !isNil(el2.id)) {
        return `${X_PATH_ERROR.ID_MISTMATCH}: ${el1.id || '-empty-'} !== ${el2.id || '-empty-'}`
      }

      const intersectionClasses = intersection(values(el1.classList), values(el2.classList))
      const excessiveClasses = values(el1.classList).filter(c => !values(el1.classList).includes(c))
      const missingClasses = values(el2.classList).filter(c => !values(el1.classList).includes(c))
      if (Math.abs(1 - intersectionClasses.length / values(el2.classList).length) > 0.25) {
        return `${X_PATH_ERROR.CLASS_MISTMATCH}\n\tMissing classes: ${missingClasses.join(', ')}\n\tExcessive classes: ${excessiveClasses.join(', ')}`
      }
    }

    return true
  }

  static getClosestToXPathIndex(elements: HTMLElement[], xPath: string) {
    const xPaths = elements.map(e => Dom.getElementXPath(e))
    const similarities = xPaths.map( curXPAth => getStringSimilarity(xPath, curXPAth) )
    let index = 0
    let maxSimilarity = 0

    similarities.forEach((similarity, i) => {
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity
        index = i
      }
    })

    return index
  }

  static isElementInViewport(arg: HTMLElement | IElementBoundStep) {
    const element = Dom.getElement(arg)
    if (!element) {
      return false
    }

    return Boolean(element.checkVisibility())
  }

}