import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Define global object for browser compatibility
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Define process object if needed
if (typeof process === 'undefined') {
  (window as any).process = { env: {} } as NodeJS.Process;
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
