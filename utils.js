import * as Elementa from 'Elementa/index';
import request from "./request";
import { PitPandaURL } from './constants';

const Color = Java.type('java.awt.Color');

/**
 * @type {import('./browser')['browser']}
 */
let browser;
/**
 * @type {import('./pages/profile')['createProfile']}
 */
let createProfile;
setTimeout(() => {
  browser = require('./browser').browser;
  createProfile = require('./pages/profile').createProfile;
}, 2);

/**
 * No operation
 */
export const noop = () => {};

/**
 * @param {string} str 
 */
export const fixColorEncoding = (str) => str
  .replace(/Â§/g,'§')
  .replace(/â�¤/g,'❤')
  .replace(/â—¼/g,'◼')
  .replace(/â– /g, '■')
  .replace(/â™¦/g,'♦')

/**
 * @param {string} path 
 * @returns {Promise<any>}
 */
export const fetchFromPitPanda = path => request({
  url: `${PitPandaURL}/api${path}`,
  json: true,
  headers: {
      'User-Agent': 'PitPandaMinecraft',
  },
})

/**
 * ex: 123 -> "2h 3m"
 * @param {number} time minutes
 */
export const formatPlaytime = time => {
  let s = `${time%60}m`;
  if(time>=60) s = `${Math.floor(time/60)}h ` + s;
  return s;
}

/**
 * Capitalize the first character of a string
 * @param {string} str 
 */
export const sentenceCase = str => str.charAt(0).toUpperCase() + str.substring(1);

/**
 * only called once.
 * @param {Function} cb
 * @returns {void}
 */
export const onGuiClose = (() => {
  let waiting = [];
  let last = null;
  register('guiOpened', e => {
    waiting = waiting.filter(([cb, gui]) => {
      if(gui === null) {
        if(e.gui === null){
          cb();
          return false;
        }
      }else if(last === gui){
        cb();
        return false;
      }
      return true;
    })
    last = e.gui;
  })
  return (cb, gui = null) => waiting.push([cb, gui]);
})()

/**
 * @param {Gui} gui
 * @returns {(window: Elementa.Window) => void}
 */
export const hostEvents = gui => {
  const windows = [];
  const triggers = [
    gui.registerClicked((x,y,b) => windows.forEach(w => w.mouseClick(x,y,b))),
    gui.registerMouseDragged((x,y,b) => windows.forEach(w => w.mouseDrag(x,y,b))),
    gui.registerScrolled((x,y,s) => windows.forEach(w => w.mouseScroll(s))),
    gui.registerMouseReleased((x,y,b) => windows.forEach(w => w.mouseRelease())),
  ]
  onGuiClose(() => triggers.forEach(t => t.unregister()), gui)
  return window => windows.push(window);
}

/**
 * @param {Elementa.UIComponent} comp 
 * @param {(deltaX: number, deltaY: number, button: number) => void} handler 
 */
export const onDragged = (comp, handler) => {
  const clickRegister = register('guiMouseClick', (prevX,prevY,button) => {
    if(!comp.isHovered()) return;
    const dragTrigger = register('guiMouseDrag',(newX,newY) => {
      const deltaX = newX-prevX;
      const deltaY = newY-prevY;
      handler(deltaX,deltaY,button)
      prevX = newX;
      prevY = newY;
    });
    registerOnce('guiMouseRelease', () => dragTrigger.unregister());
  });
  browser.onBrowserClose(() => clickRegister.unregister())
}

/**
 * @template T 
 * @param {T extends Elementa.UIComponent ? T : never} comp 
 * @param {(button: number) => void} handler 
 * @returns {T}
 */
export const addClickEvent = (comp, handler) => {
  comp.onMouseClick((_0,_1,b) => {
    if(comp.isHovered()) handler(b);
  });
  return comp;
}

/**
 * @type {register}
 */
export const registerOnce = (type, handler) => {
  const trigger = register(type, (...args) => {
    handler(...args);
    trigger.unregister();
  })
  return trigger;
}

/**
 * @param {string} str 
 * @param {number} scale 
 */
export const measureString = (str) => Client.getMinecraft().field_71466_p.func_78256_a(str) // fontRendererObj getStringWidth

/**
 * Produces a nicely formatted string of the time since a given date in unix epoch seconds
 * @param {number} date 
 * @returns {string}
 */
export const timeSince = date => { // https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months";
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours";
  interval = Math.floor(seconds / 60);
  if (interval < 5) return "moments";
  return interval + " minutes";
}

/**
 * @param {string} args 
 * @returns {string[]}
 */
export const nameParam = args => {
  const last = args[args.length - 1] ?? '';
  return World.getAllPlayers().map(p=>p.getName().toLowerCase()).filter(s=>s.startsWith(last));
};

/**
 * @param {string} tag 
 */
export const openProfile = tag => browser.openPage(createProfile(tag));

/**
 * @param {JavaColor} color 
 */
export const colorToLong = color => color.a * 0xFF000000 + color.r * 0xFF0000 + color.g * 0xFF00 + color.b * 0xFF

/**
 * @param {number} long 
 * @returns {JavaColor}
 */
export const longToColor = long => new Color(
  (long & 0xFF0000) / 0xFF0000,
  (long & 0xFF00) / 0xFF00,
  (long & 0xFF) / 0xFF,
  (long & 0xFF000000) / 0xFF000000
);
