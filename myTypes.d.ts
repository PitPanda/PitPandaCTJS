/// <reference no-default-lib="true" />
/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import * as Elementa from 'Elementa/index';

declare global {
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
    loadingRenderer?: () => Elementa.UIComponent;
    renderer: (tab: Tab, data?: any) => Elementa.UIComponent;
  }
}

