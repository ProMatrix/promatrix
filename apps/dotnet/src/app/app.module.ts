import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { SideNavState } from './side-nav.component.state';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { HttpDotnetState } from '@promatrix/features';
import { AppAnimationModule, AppHelperModule, MaterialModule, MobileTechModule } from 'ngx-motion';
import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { ContentComponent } from './content.component';
import { SideNavComponent } from './side-nav.component';
import { ApplicationAboutDialogComponent, ApplicationLogonDialogComponent, ToolbarComponent } from './toolbar.component';
import { AppConfigService } from '@promatrix/services';
import { AppServices } from 'ngx-motion';
import { DotnetPump } from '@promatrix/services';
import { DotnetService } from '@promatrix/services';
@NgModule({
  declarations: [
    AppComponent, ContentComponent,
    ToolbarComponent,
    ApplicationAboutDialogComponent, ApplicationLogonDialogComponent, SideNavComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    AppAnimationModule,
    MobileTechModule,
    AppHelperModule.forRoot(),
    NgxsModule.forRoot([
      SideNavState, HttpDotnetState
    ]),
    AppRoutingModule,
    MaterialModule,
    NgxsReduxDevtoolsPluginModule.forRoot(), // Should be last in the list
    NgxsLoggerPluginModule.forRoot(),
  ],
  providers: [AppConfigService, AppServices, DotnetPump, DotnetService],
  bootstrap: [AppComponent]
})
export class AppModule { }
