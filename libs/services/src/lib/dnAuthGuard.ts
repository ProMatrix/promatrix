import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { DnAuthService } from './dnAuth.service';

@Injectable({ providedIn: 'root'})
export class DnAuthGuard implements CanActivate {
  constructor(private auth: DnAuthService) {

  }

  canActivate(): boolean {
    return this.auth.loggedIn;
  }
}
