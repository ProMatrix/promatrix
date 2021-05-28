import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { AppAnimationModule, AppHelperModule, MaterialModule, MobileTechModule } from 'ngx-motion';
import { BaseMobileHelpDialogComponent } from './base.mobile.help.dialog';
import { MobileApisComponent, MobileApisHelpDialogComponent } from './mobile-api.component';
import { MobileApisState } from './mobile-api.component.state';

@NgModule({
  declarations: [
    BaseMobileHelpDialogComponent, MobileApisComponent, MobileApisHelpDialogComponent
  ],
  imports: [
    FormsModule,
    AppAnimationModule,
    MobileTechModule,
    MaterialModule,
    AppHelperModule.forRoot(),
    RouterModule.forChild([
      {
        path: '',
        component: MobileApisComponent
      },
    ]),
    NgxsModule.forFeature([
      MobileApisState,
    ]),
  ]
})
export class MobileApisModule { }
