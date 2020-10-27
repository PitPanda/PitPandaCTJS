import * as Elementa from 'Elementa/index';
import { request } from "../requestV2";
import { Promise } from '../PromiseV2';
import { PitPandaURL } from './constants';
import { addCustomCompletion } from '../CustomTabCompletions';

const Color = Java.type('java.awt.Color');

/**
 * @type {import('./browser')['browser']}
 */
let browser;
/**
 * @type {import('./components/pages/profile')['createProfilePage']}
 */
let createProfile;
setTimeout(() => {
  browser = require('./browser').browser;
  createProfile = require('./components/pages/profile').createProfilePage;
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
 */
export const fetchFromPitPanda = path => request({
  url: `${PitPandaURL}/api${path}`,
  json: true,
  headers: {
      'User-Agent': 'PitPandaMinecraft',
  },
}).then(data => new Promise((resolve, reject) => {
  if(!data.success) return reject(data.error);
  resolve(data);
}))

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
  /**
   * only called once.
   * @param {() => void} cb
   * @returns {void}
   */
  const fn = (cb, gui = null) => waiting.push([cb, gui]);
  return fn;
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
 * @param {string} match 
 * @param {string[]} samples 
 */
export const filterMatchingStart = (match, samples) => samples.filter(s=>s.startsWith(match));

export const getPlayerNames = () => World.getAllPlayers().map(p=>p.getName().toLowerCase());

/**
 * @param {string[]} args 
 * @returns {string[]}
 */
export const nameParam = (args) => {
  const last = args[args.length - 1] ?? '';
  return filterMatchingStart(last, getPlayerNames());
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

const nameCache = new Map();
/**
 * @param {string} tag
 * @returns {Promise<string>}
 */
export const nameResolve = tag => new Promise((resolve, reject) => {
  if(nameCache.has(tag)) return resolve(nameCache.get(tag));
  fetchFromPitPanda(`/username/${tag}`).then(data => {
    if(!data.success) reject(data.error);
    const name = fixColorEncoding(data.name);
    nameCache.set(tag, name);
    setTimeout(() => nameCache.delete(tag), 300e3)
    resolve(name);
  }).catch(reject);
});

/**
 * this is prone to reject. (rejects undefined)
 * max wait is 5s
 * this will reject outside of pit but it may resolve weird values too
 * @returns {Promise<string>}
 */
export const getMap = () => new Promise((resolve, reject) => {
  let timedout = false;
  setTimeout(() => {
    timedout = true;
    reject();
  }, 5e3);
  let limit = 5;
  const trigger = register('chat', (message, event) => {
    if(timedout) return trigger.unregister();
    const matches = message.match(/You are currently playing on (.*)/);
    if(!matches) {
      limit--;
      if(!limit) trigger.unregister();
      return reject();
    };
    resolve(matches[1])
    event.setCanceled(true);
    trigger.unregister();
  }).setCriteria("${message}");
  ChatLib.command('map');
});

/**
 * @param {string[]} aliases 
 * @param {(...args: string[]) => void} implementation 
 * @param {(...args: string[]) => string[]} completer 
 */
export const registerCommandWithAliases = (aliases, implementation, completer) => {
  for(let alias of aliases){
    const cmd = register('command', implementation).setName(alias);
    if(completer) addCustomCompletion(cmd, completer);
  }
}

/**
 * @returns {boolean}
 */
export const isInPit = () => Scoreboard.getTitle().removeFormatting().equals('THE HYPIXEL PIT');

export const onEnterPit = (()=>{
  let inPit = false;
  /**
   * @type {() => (undefined | () => void)}
   */
  const onEnter = [];
  /**
   * @type {() => void)}
   */
  const onExit = [];
  register('worldLoad', () => {
    setTimeout(() => {
      if(isInPit()){
        onEnter.forEach(f => {
          const exit = f();
          if(exit) onExit.push(exit);
        });
        inPit = true;
      }
    }, 100);
  });
  register('worldUnload', () => {
    if(inPit) while(onExit.length) onExit.pop()();
    inPit = false;
  });
  /**
   * note runs 100ms late to give the scoreboard a chance to update
   * if someone has seriously bad ping this could fail lol
   * @param {() => (undefined | () => void)} enter
   */
  const fn = (enter) => onEnter.push(enter);
  return fn;
})();

/**
 * @param {() => void} fn 
 * @param {number} ms 
 * @returns {Timeout}
 */
export const timeout = (fn, ms) => {
  let canceled = false;
  const cancel = () => self.cancelled = true;
  const self = {
    cancel,
    fn,
    cancelled: false,
  }
  setTimeout(() => {
    if(self.canceled) return;
    fn();
  }, ms);
  return self;
}

/**
 * @param {(cancel: Timeout) => void} fn 
 * @param {number} ms 
 * @returns {Timeout}
 */
export const interval = (fn, ms) => {
  let canceled = false;
  const cancel = () => self.cancelled = true;
  const self = {
    cancel,
    fn,
    cancelled: false,
  }
  setTimeout(function tick(){
    if(canceled) return;
    fn(self);
    setTimeout(tick, ms)
  }, ms);
  return self;
}
