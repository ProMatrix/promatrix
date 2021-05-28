import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalService } from './local.service';
import { ApiService } from './api.service';
import { Store } from '@ngxs/store';
import { AppConfigService } from './app-config.service';
import { DotnetRemoteServer } from './environments/dotnet.environments';

class Creds {
  email = 'user@angularstudio.com';
  // password = 'passw00d!';
  password = '';
}
class Keys {
  googleMapKey = '';
  smsFrom = '';
  smsPw = '';
  aspNetCoreVersion = '';
}
@Injectable({ providedIn: 'root' })
export class DnAuthService extends ApiService  {
  creds = new Creds();
  authToken = '';
  loggedIn = false;
  googleMapKey = '';
  smsFrom = '';
  smsPw = '';
  aspNetCoreVersion = '';
  environment: DotnetRemoteServer;

  constructor(ac: AppConfigService, store: Store, http: HttpClient, private ls: LocalService, private router: Router) {
    super(http, store);
    this.environment = ac.getDotnetEnvironment();
    this.creds = this.ls.getLocalStorage('my-creds');
    if (!this.creds) {
      this.creds = new Creds();
    }
  }

  async signIn(success: () => void, error: (e: string) => void) {
    try {
      this.post(this.creds, this.environment.signIn, (response: any) => {
        this.authToken = response.authToken;
        this.loggedIn = true;
        this.ls.setLocalStorage('my-creds', this.creds);
        this.get(this.environment.getKeys,
          (keys: Keys) => {
            this.googleMapKey = keys.googleMapKey;
            this.smsFrom = keys.smsFrom;
            this.smsPw = keys.smsPw;
            this.aspNetCoreVersion = keys.aspNetCoreVersion;
            success();
          }, error, new HttpParams().set('authToken', this.authToken));
      },
      (errorMessage: string) => {
        error(errorMessage);
      });
    } catch (err) {
      error(err.message);
    }
  }

  async signOut() {
    this.creds.password = '';
    this.ls.setLocalStorage('my-creds', this.creds);
    this.loggedIn = false;
  }
}
