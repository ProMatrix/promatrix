import { Component } from '@angular/core';
import { AppConfigService } from '@promatrix/services';
import * as e from  '../environments/environment.dev';
@Component({
  selector: 'promatrix-app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  public readonly appTitle = 'Angular.Net Studio (Desktop)';
  constructor(ac: AppConfigService) {
    ac.getAppSettings('dotnet', e.environment.production);
  }
}
