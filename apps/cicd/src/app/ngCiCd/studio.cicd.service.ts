import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { StudioAppService } from '../studio.app.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class StudioCiCdService extends StudioAppService {
  ciCdCompleted = true;
  constructor(
    public store: Store,
    public http: HttpClient,
    public snackBar: MatSnackBar
  ) {
    super(store, http, snackBar);
    this.downloadTimeout = 300000;
  }


}
