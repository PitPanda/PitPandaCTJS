import * as Elementa from 'Elementa/index';
import { addClickEvent, noop, registerOnce } from '../../utils';

const Color = Java.type('java.awt.Color');

/**
 * @type {import('../../browser')['browser']}
 */
let browser;
setTimeout(() => {
  browser = require('../../browser').browser;
}, 2);

/**
 * @typedef {Object} Options
 * @property {string} initial
 * @property {RegExp} allowedChars
 * @property {Elementa.XConstraint} textXConst
 * @property {JavaColor} color
 * @property {boolean} alwaysFocused
 * @property {(value: string) => void} onEnter
 * @property {(value: string) => void} onChange
 */

 /**
  * @type {Options}
  */
const defaults = {
  initial: '',
  allowedChars: /[_a-zA-Z0-9]/,
  textXConst: (2).pixels(),
  color: new Color(0,0,0,0),
  alwaysFocused: false,
  onEnter: noop,
  onChange: noop,
}

/**
 * @param {Partial<Options>} opts 
 */
export const createInput = (opts = {}) => {
  const options = {...defaults, ...opts};
  const component = new Elementa.UIBlock(options.color);
  let [getState, setState] = (()=>{
    let state = '';
    return [
      () => state,
      /**
     * @param {string} value
     */
      value => {
        state = value;
        component.clearChildren().addChild(
          new Elementa.UIText(state || ' ')
            .setY(new Elementa.CenterConstraint())
            .setX(options.textXConst)
        )
      },
    ]
  })();
  setState(options.initial);
  let focused = options.alwaysFocused;
  /**
   * @param {Gui} gui 
   */
  const prepListener = gui => {
    const listener = gui.registerKeyTyped((char, keyCode) => {
      if(!focused) return;
      if(keyCode === 28) return options.onEnter(getState());
      if(keyCode === 14) {
        if(gui.isControlDown()){
          setState('')
        }else{
          setState(getState().slice(0,-1))
        }
        options.onChange(getState())
        return;
      }
      if(options.allowedChars.test(char)) {
        setState(getState()+(char+''));
        options.onChange(getState())
      }
    });
    browser.onWindowChange(() => listener.unregister());
  }
  if(!browser.gui) browser.onWindowChange(() => prepListener(browser.gui))
  else prepListener(browser.gui);
  if(!options.alwaysFocused){
    addClickEvent(component, () => {
      focused = true;
      const registerExitFocus = () => registerOnce('guiMouseClick', () => {
        if(component.isHovered()) return registerExitFocus();
        focused = false;
      })
    });
  }
  return {
    component,
    getState,
    setState,
  }
}
