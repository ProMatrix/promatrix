import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppAnimationModule, AppHelperModule, MaterialModule, MobileTechModule } from 'ngx-motion';
import { BaseHelpDialogComponent } from './base.help.dialog';
import { AlreadyReadyComponent, AlreadyReadyHelpDialogComponent } from './alreadyReady.component';
import { DevelopmentComponent, DevelopmentHelpDialogComponent } from './development.component';
import { FeaturesComponent, FeaturesHelpDialogComponent } from './features.component';
import { FileTransferDialogComponent } from './file.transfer.dialog.component';
import { HttpDotnetComponent, HttpDotnetHelpDialogComponent } from './httpDotnet.component';
import { HttpFirebaseComponent, HttpFirebaseHelpDialogComponent } from './httpFirebase.component';
import { SettingsComponent, SettingsHelpDialogComponent } from './settings.component';
import { SplashComponent, SplashHelpDialogComponent } from './splash.component';

@NgModule({
  imports: [BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppAnimationModule,
    MobileTechModule,
    AppHelperModule.forRoot(),
    MaterialModule
  ],
  declarations: [
    BaseHelpDialogComponent, 
    AlreadyReadyComponent, AlreadyReadyHelpDialogComponent,
    DevelopmentComponent, DevelopmentHelpDialogComponent,
    FeaturesComponent, FeaturesHelpDialogComponent,
    FileTransferDialogComponent,
    HttpDotnetComponent, HttpDotnetHelpDialogComponent,
    HttpFirebaseComponent, HttpFirebaseHelpDialogComponent,
    SettingsComponent, SettingsHelpDialogComponent,
    SplashComponent, SplashHelpDialogComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    BaseHelpDialogComponent,
    AlreadyReadyComponent, AlreadyReadyHelpDialogComponent,
    DevelopmentComponent, DevelopmentHelpDialogComponent,
    FeaturesComponent, FeaturesHelpDialogComponent,
    FileTransferDialogComponent,
    HttpDotnetComponent, HttpDotnetHelpDialogComponent,
    HttpFirebaseComponent, HttpFirebaseHelpDialogComponent,
    SettingsComponent, SettingsHelpDialogComponent,
    SplashComponent, SplashHelpDialogComponent
  ],
})
export class FeaturesModule {}
