import { createPageRoot } from './components/pageRoot';
import { createLoadingTextAnimation } from './components/loadingText';
import { hostEvents, onGuiClose, timeout } from "./utils";
import * as Elementa from 'Elementa/index';
import { Promise } from '../PromiseV2';
import { createHomePage } from './components/pages/home'
import { createErrorPage } from './components/pages/error';
import { getSetting } from './settings';
import { createScrollable } from './components/scrollable';

export const browser = {
  /**
   * @type {boolean}
   */
  isOpen: false,

  /**
   * @type {Gui}
   */
  gui: null,

  /**
   * @type {ReturnType<import('./utils')['hostEvents']>}
   */
  guiEventLinker: null,

  /**
   * @type {Elementa.Window}
   */
  window: null,

  /**
   * @type {Elementa.UIContainer}
   */
  root: null,

  /**
   * @type {Elementa.UIContainer}
   */
  header: null,

  /**
   * @type {Elementa.UIContainer}
   */
  contentRoot: null,

  /**
   * @type {Promise<void>}
   */
  openingPromise: null,

  /**
   * @type {Tab[]}
   */
  tabs: [],

  /**
   * @type {[number, Tab]}
   */
  activeTab: null,

  /**
   * @param {Page} page 
   */
  openPage(page){
    if(!this.isOpen) this.openWindow(false);
    this.openingPromise.then(()=>{
      if(!this.isOpen) return;
      const existingTab = this.findTabByIds(page.ids);
      if(existingTab){
        existingTab.select(true);
      }else{
        const tab = this._createTab(page);
        this.tabs.push(tab);
        tab.select(true);
      }
      this.reloadHeader();
    });
    return this;
  },

  /**
   * @param {boolean} reOpen 
   */
  openWindow(reOpen = true){
    if(this.isOpen) return this;
    this.gui = new Gui();
    this.gui.open();
    this.guiEventLinker = hostEvents(this.gui);
    this.window = new Elementa.Window();
    this.isOpen = true;
    this.openingPromise = createPageRoot(this.window).then(root => {
      this.guiEventLinker(this.onBrowserClose.bind(this))(this.window);
      this.root = root;
      this.header = new Elementa.UIContainer()
        .setWidth(new Elementa.RelativeConstraint(1))
        .setHeight((28).pixels())
      this.contentRoot = new Elementa.UIContainer()
        .setWidth(new Elementa.RelativeConstraint(1))
        .setHeight(new Elementa.SubtractiveConstraint(
          new Elementa.RelativeConstraint(1),
          (28).pixels(),
        ))
        .setY(new Elementa.SiblingConstraint())
        .enableEffect(new Elementa.ScissorEffect());
      this.root.addChildren([
        this.header,
        this.contentRoot,
      ]);
    });

    if(!this.tabs.length) {
      const newTab = this._createTab(createHomePage())
      newTab.setPinned(true);
      this.activeTab = [0, newTab]
      this.tabs.push(newTab);
    }
    if(reOpen) {
      this.openingPromise.then(() => {
        if(!this.isOpen) return;
        this.activeTab[1].select(true);
        this.activeTab[1].focused();
        this.reloadHeader();
      });
    }

    const renderTrigger = this.gui.registerDraw(() => this.window.draw());

    onGuiClose(() => {
      this._triggerBrowserClose();
      this._triggerWindowChange();
      this.activeTab[1].unfocused();
      renderTrigger.unregister();
      this.isOpen = false;
      this.gui = null;
      this.guiEventLinker = null;
      this.window = null;
      this.rootPromise = null;
      this.root = null;
      this.header = null;
      this.contentRoot = null;
    }, this.gui);
    
    return this;
  },

  /**
   * @type {(() => void)[]}
   */
  windowChangeListeners: [],

  /**
   * Unregisters it self after triggering once
   * (Also triggers on close)
   * @param {() => void} callback 
   */
  onWindowChange(callback){
    this.windowChangeListeners.push(callback);
  },

  _triggerWindowChange(){
    while(this.windowChangeListeners.length) this.windowChangeListeners.pop()();
  },

  /**
   * @type {(() => void)[]}
   */
  browserCloseListeners: [],

  /**
   * Unregisters it self after triggering once
   * @param {() => void} callback 
   */
  onBrowserClose(callback){
    this.browserCloseListeners.push(callback);
  },

  _triggerBrowserClose(){
    while(this.browserCloseListeners.length) this.browserCloseListeners.pop()();
  },

  reloadHeader(){
    if(!this.isOpen) return;
    this.header.clearChildren().addChildren(this.tabs.map(t=>t.componentHandler.component));
  },

  /**
   * @param {string[]} ids
   * @returns {Tab | undefined}
   */
  findTabByIds(ids){
    return this.tabs.find(tab => ids.some(id => tab.page.ids.includes(id)))
  },

  /**
   * @param {Elementa.UIComponent} content 
   * @param {'left' | 'right'=} direction 
   */
  _mountContent(content, direction = 'left'){
    const prevContent = this.contentRoot.children[0];
    if(prevContent && prevContent !== content){
      const animationTime = getSetting('PageTransitionTime')/1000;
      let animation;
      if(direction === 'left') {
        animation = prevContent.makeAnimation();
        this.contentRoot.addChild(content);
        content.setX(new Elementa.SiblingConstraint());
        animation.setXAnimation(Elementa.Animations.OUT_EXP, animationTime, (0).pixels(false,true));
      } else {
        animation = content.makeAnimation();
        prevContent.setX(new Elementa.SiblingConstraint());
        this.contentRoot.clearChildren().addChildren([content, prevContent]);
        content.setX((0).pixels(false,true));
        animation.setXAnimation(Elementa.Animations.OUT_EXP, animationTime, (0).pixels());
      }
      animation.onComplete(() => this.contentRoot.clearChildren().addChild(content))
      animation.begin();
    }else{
      this.contentRoot
        .clearChildren()
        .addChild(content);
    }
  },

  /**
   * @param {Page} page
   * @returns {Tab}
   */
  _createTab(page){
    const that = this;
    let name = 'New Tab';
    let pinned = false;
    let focused = false;
    /**
     * @type {Tab}
     */
    const tab = {
      page: page,
      getPinned(){
        return pinned;
      },
      setPinned(value){
        pinned = value;
        if(this.timeout) this.timeout.cancel();
        return this;
      },
      getName(){
        return name;
      },
      setName(newName){
        name = newName;
        this.componentHandler.update();
        return this;
      },
      getIndex(){
        return that.tabs.indexOf(this);
      },
      focused(){
        focused = true;
        this.componentHandler.focused();
        if(this.timeout) this.timeout.cancel();
      },
      unfocused(){
        if(!focused) return;
        focused = false;
        this.componentHandler.unfocused();
        if(!this.getPinned()) this.timeout = timeout(() => this.close(), getSetting('PageTimeout')*1e3)
      },
      select(force = false) {
        const prevTab = that.activeTab[1];
        const direction = this.getIndex() < that.activeTab[0] ? 'right' : 'left';
        if(this === prevTab && !force) return;
        if(this !== prevTab) {
          prevTab.unfocused();
          this.focused();
        }
        that.activeTab = [this.getIndex(), this];
        that._triggerWindowChange();
        const page = this.page;
        if(page.async == true){
          this.setName('Loading');
          const [initLoader, cleanupLoader] = (page.loadingRenderer || createLoadingTextAnimation)();
          const asyncRoot = new Elementa.UIContainer()
            .setWidth(new Elementa.RelativeConstraint(1))
            .setHeight(new Elementa.RelativeConstraint(1))
            .addChild(initLoader());
          that._mountContent(asyncRoot, direction);
          page.loadingPromise.then(data => {
            cleanupLoader();
            if(!that.isOpen || that.activeTab[1] !== this) return;
            asyncRoot
              .clearChildren()
              .addChild(
                createScrollable(
                  page.renderer(this, data),
                  that.guiEventLinker(that.onWindowChange.bind(that))
                )
              )
          }).catch(error => {
            cleanupLoader();
            if(!that.isOpen || that.activeTab[1] !== this) return;
            const reason = 'error' in error ? error.error : error.toString();
            console.log(error);
            asyncRoot
              .clearChildren()
              .addChild(createErrorPage(reason).renderer(this));
          });
        }else{
          that._mountContent(
            createScrollable(
              page.renderer(this),
              that.guiEventLinker(that.onWindowChange.bind(that))
            ),
            direction
          )
        }
        return this;
      },
      close(){
        if(!that.tabs.includes(this)) return console.log('call closed on already closed tab. ids:', this.page.ids.toString());
        const [oldIndex, oldTab] = that.activeTab;
        that.tabs = that.tabs.filter(t => t !== this);
        if(oldTab === this){
          if(that.tabs[oldIndex]) that.tabs[oldIndex].select();
          else that.tabs[oldIndex-1].select();
        } else that.activeTab[0] = that.tabs.indexOf(oldTab);
        if(this.timeout) this.timeout.cancel();
        that.reloadHeader();
        
      }
    }
    tab.componentHandler = page.tabComponentHandler(tab, {
      onClick: () => tab.select(),
      onExit: () => tab.close(),
    })
    return tab;
  }
};
