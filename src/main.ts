import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import './rxjs.imports';
if (environment.production) {
  enableProdMode();
}
import './app/core/preloader/preloader';

const bootstrap = platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

bootstrap.then(() => {
  if ((window as any).appBootstrap) {
    (window as any).appBootstrap();
  }
});
