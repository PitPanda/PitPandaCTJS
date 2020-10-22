/// <reference no-default-lib="true" />
/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import * as Elementa from 'Elementa/index';

declare global {
  type Tab = {
    page: Page,
    getName(): string;
    setName(value: string): void;
    component: Elementa.UIComponent;
    select(force?: boolean): void;
    close(): void;
  }

  type Page = {
    async: boolean,
    loadingPromise?: Promise<any>;
    loadingRenderer?: () => Elementa.UIComponent;
    renderer: (tab: Tab, data?: any) => Elementa.UIComponent;
  }
}

