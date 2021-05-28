import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { NgBuildComponent } from './ngBuild/ngBuild.component';
import { NgLintComponent } from './ngLint/ngLint.component';
import { NgUtestComponent } from './ngUtest/ngUtest.component';
import { NgEtestComponent } from './ngEtest/ngEtest.component';
import { NgAtestComponent } from './ngAtest/ngAtest.component';
import { NgPublishComponent } from './ngPublish/ngPublish.component';
import { NgCiCdComponent } from './ngCiCd/ngCiCd.component';
import { NgxsModule } from '@ngxs/store';
import { AppAnimationModule, AppHelperModule, MobileTechModule, MaterialModule } from 'ngx-motion';

@NgModule({
  declarations: [
    AppComponent,
    NgLintComponent, NgBuildComponent, NgUtestComponent, NgEtestComponent, NgAtestComponent, NgPublishComponent, NgCiCdComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppAnimationModule,
    MobileTechModule,
    AppHelperModule.forRoot(),
    RouterModule.forRoot([], { relativeLinkResolution: 'legacy' }),
    NgxsModule.forRoot([
    ]),
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
