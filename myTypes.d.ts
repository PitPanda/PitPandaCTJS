/// <reference no-default-lib="true" />
/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import * as Elementa from 'Elementa/index';

declare global {
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
    setName(value: string): void;
    componentHandler: TabComponentHandler;
    select(force?: boolean): void;
    close(): void;
  }

  type Page = {
    async: boolean;
    tabComponentHandler: (tab: Tab, options: TabComponentHandlerOptions) => TabComponentHandler;
    loadingPromise?: Promise<any>;
    loadingRenderer?: () => DelicateComponent;
    renderer: (tab: Tab, data?: any) => Elementa.UIComponent;
    ids: string[];
  }
}

