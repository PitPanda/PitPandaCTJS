/// <reference no-default-lib="true" />
/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import * as Elementa from 'Elementa/index';

declare global {
  type Timeout = {
    cancel(): void;
    fn: () => void;
    cancelled: boolean;
  }

  /**
   * First is method to call when component is initialized. 
   * Second is to be called on cleanup.
   */
  type DelicateComponent = [() => Elementa.UIContainer, () => void];

  type TabComponentHandlerOptions = {
    onClick: () => void;
    onExit: () => void;
  }

  type TabComponentHandler = {
    component: Elementa.UIComponent;
    update(): void;
    focused(): void;
    unfocused(): void;
  }

  type Tab = {
    page: Page,
    getName(): string;
    setName(value: string): this;
    getPinned(): boolean;
    setPinned(value: boolean): this;
    componentHandler: TabComponentHandler;
    select(force?: boolean): this;
    close(): void;
    timeout?: Timeout;
  }

  type Page = ({
    async: true;
    loadingPromise: Promise<any>;
    loadingRenderer: () => DelicateComponent;
  } | {
    async: false;
  }) & {
    renderer: (tab: Tab, data?: any) => Elementa.UIComponent;
    tabComponentHandler: (tab: Tab, options: TabComponentHandlerOptions) => TabComponentHandler;
    ids: string[];
  }
}

