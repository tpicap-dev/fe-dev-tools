import { is, isNil } from 'ramda'
import { IElementBoundStep } from './demo-tools'
import { getElementByXPath } from '../../utils/utils'

interface IBlinkOptions {
  size?: number;
  color?: string;
  border?: string;
  duration?: number;
}

export default abstract class Dom {

  static getElement(arg: string | HTMLElement | IElementBoundStep) {

    if (is(String, arg)) {
      return document.querySelector(arg)
    } else if (is(HTMLElement, arg)) {
      return arg
    } else if (!isNil((arg as IElementBoundStep).element) && is(HTMLElement, (arg as IElementBoundStep).element)) {
      return (arg as IElementBoundStep).element
    } else if (!isNil((arg as IElementBoundStep).xPath)) {
      return getElementByXPath((arg as IElementBoundStep).xPath)
    } else {
      return document.querySelector((arg as IElementBoundStep).selector)
    }
  }

  static click(arg: string | HTMLElement | IElementBoundStep) {
    try {
      const element = Dom.getElement(arg)

      if (!element) {
        return
      }

      element.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))

      // @ts-ignore
      Dom.blink(element.getBoundingClientRect().x + element.getBoundingClientRect().width / 2, element.getBoundingClientRect().y + element.getBoundingClientRect().height / 2)
    } catch (e) {
    }
  }

  static rightClick(arg: string | HTMLElement | IElementBoundStep) {
    try {
      const element = Dom.getElement(arg)

      if (!element) {
        return
      }

      element.dispatchEvent(new MouseEvent('rightclick', {bubbles: true, cancelable: true}))
      element.dispatchEvent(new MouseEvent('contextmenu', {bubbles: true, cancelable: true}))

      Dom.blink(
        // @ts-ignore
        element.getBoundingClientRect().x + element.getBoundingClientRect().width / 2, element.getBoundingClientRect().y + element.getBoundingClientRect().height / 2,
        {color: 'green'}
      )
    } catch (e) {
    }
  }

  static hover(arg: string | HTMLElement | IElementBoundStep) {
    try {
      const element = Dom.getElement(arg)

      if (!element) {
        return
      }

      element.dispatchEvent(new MouseEvent('mouseover', {bubbles: true, cancelable: true}))
    } catch (e) {
    }
  }

  static focus(selector: string) {
    try {
      const element = document.querySelector(selector)
      if (!element) {
        return
      }

      element.dispatchEvent(new FocusEvent('focus', {bubbles: true, cancelable: true}))
    } catch (e) {
    }
  }

  static setValue(selector: string, value: string) {
    try {
      const element = document.querySelector(selector) as HTMLInputElement
      if (!element) {
        return
      }

      element.setAttribute(
        'value',
        value
      )

      element.value = value
      element.dispatchEvent(new Event('change', {bubbles: true, cancelable: true}))
      element.dispatchEvent(new Event('input', {bubbles: true, cancelable: true}))
    } catch (e) {
    }
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


}