import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideRouter } from '@angular/router';
import localeEsPe from '@angular/common/locales/es-PE';

import { routes } from './app.routes';

registerLocaleData(localeEsPe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
