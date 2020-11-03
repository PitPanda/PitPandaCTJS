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
  /**
   * @type {[() => void, Gui][]}
   */
  let waiting = [];
  let last = null;
  register('guiOpened', _ => {
    const current = Client.currentGui.get();
    waiting = waiting.filter(([cb, gui]) => {
      if(gui !== last) return true
      cb();
      return false;
    })
    last = current;
  })
  /**
   * only called once.
   * @param {() => void} cb
   * @param {Gui} gui
   * @returns {void}
   */
  const fn = (cb, gui) => waiting.push([cb, gui]);
  return fn;
})()

/**
 * @param {Gui} gui
 * @returns {(cleanUp: (() => void)) => (window: Elementa.Window) => void}
 */
export const hostEvents = gui => {
  /**
   * @type {Set<Elementa.Window>}
   */
  const windows = new Set();
  const triggers = [
    gui.registerClicked((x,y,b) => [...windows].forEach(w => w.mouseClick(x,y,b))),
    gui.registerMouseDragged((x,y,b) => [...windows].forEach(w => w.mouseDrag(x,y,b))),
    gui.registerScrolled((x,y,s) => [...windows].forEach(w => w.mouseScroll(s))),
    gui.registerMouseReleased((x,y,b) => [...windows].forEach(w => w.mouseRelease())),
  ]
  onGuiClose(() => triggers.forEach(t => t.unregister()), gui);
  return cleanUp => { //note: if a window is associated with multiple cleanups it will get removed by the first one.
    let subWindows = [];
    cleanUp(() => subWindows.forEach(w => windows.delete(w)));
    return window => {
      subWindows.push(window);
      windows.add(window);
    }
  }
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
  browser.onWindowChange(() => clickRegister.unregister())
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
export const colorToLong = color => color.getAlpha() * 0x01000000 + color.getRed() * 0x010000 + color.getGreen() * 0x0100 + color.getBlue() * 0x01

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
    let cmd = register('command', implementation).setName(alias);
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
    }, 1e3);
  });
  register('worldUnload', () => {
    if(inPit) while(onExit.length) onExit.pop()();
    inPit = false;
  });
  /**
   * note runs 1s late to give the scoreboard a chance to update
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
  const self = {
    cancel: () => {
      if(!self.cancelled) self.thread.interrupt();
      self.cancelled = true;
    },
    fn,
    cancelled: false,
    thread: new Thread(() => {
      try{
        Thread.sleep(ms);
        fn();
      }catch(e){ }
    })
  }
  self.thread.start();
  return self;
}

/**
 * @param {(cancel: Timeout) => void} fn 
 * @param {number} ms 
 * @returns {Timeout}
 */
export const interval = (fn, ms) => {
  const self = {
    cancel: () => self.thread.interrupt(),
    fn,
    cancelled: false,
    thread: new Thread(() => {
      try {
        while(true){
          Thread.sleep(ms);
          fn(self);
        }
      }catch(e){
        self.cancelled = true;
      }
    })
  }
  self.thread.start();
  return self;
}

/**
 * @param {Elementa.UIComponent} comp 
 */
export const isComponentOnScreen = comp => {
  return (
    comp.getBottom() >= 0 &&
    comp.getTop() <= Renderer.screen.getHeight() &&
    comp.getLeft() >= 0 &&
    comp.getRight() <= Renderer.screen.getWidth()
  )
};

const ItemStack = Java.type('net.minecraft.item.ItemStack');
const MCItem = Java.type('net.minecraft.item.Item');
const NBTTagCompound = Java.type('net.minecraft.nbt.NBTTagCompound');
const NBTTagList = Java.type('net.minecraft.nbt.NBTTagList');
const NBTTagString = Java.type('net.minecraft.nbt.NBTTagString');

/**
 * @param {PitPandaItem} item 
 * @returns {ItemStack}
 */
export const createItemStack = item => {
  if(typeof item.meta === 'string') item.meta = parseInt(item.meta,16) || 0;
  const mcitemtype = MCItem.func_150899_d(item.id); //getItemById
  const itemstack = new ItemStack(mcitemtype, item.count, item.meta);
  const NBTtag = new NBTTagCompound();
  const NBTtaglore = new NBTTagCompound();
  NBTtag.func_74782_a('display', NBTtaglore) //setTag
  const NBTlore = new NBTTagList();
  item.desc.forEach(line => {
    NBTlore.func_74742_a(new NBTTagString(line)); //appendTag
  });
  NBTtaglore.func_74782_a('Lore', NBTlore) //setTag
  itemstack.func_77982_d(NBTtag) //setTagCompoung
  itemstack.func_151001_c(item.name) //setStackDisplayName
  if(item.id >= 298 && item.id <= 301) mcitemtype.func_82813_b(itemstack, item.meta) //setColor
  return itemstack;
}

/**
 * @param {ItemStack} itemstack 
 */
export const givePlayerItemStack = itemstack => Player.getPlayer().field_71071_by.func_70441_a(itemstack)// inventory addItemStackToInventory
