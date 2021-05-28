/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlreadyReadyComponent, AlreadyReadyHelpDialogComponent } from '@promatrix/features';
import { DevelopmentComponent, DevelopmentHelpDialogComponent } from '@promatrix/features';
import { FeaturesComponent, FeaturesHelpDialogComponent } from '@promatrix/features';
import { HttpDotnetComponent, HttpDotnetHelpDialogComponent } from '@promatrix/features';
import { SettingsComponent, SettingsHelpDialogComponent } from '@promatrix/features';
import { SplashComponent, SplashHelpDialogComponent } from '@promatrix/features';
import { NotificationHelpDialogComponent } from '@promatrix/features';
import { MobileApisHelpDialogComponent } from '@promatrix/features';
import { DnAuthGuard } from '@promatrix/services';

const routes: Routes = [
  { path: '', component: SplashComponent },
  {
    path: 'splash', component: SplashComponent,
    data: {
      debugOnly: false, title: 'Technologies', subtitle: 'Blend of Technologies',
      show: true, helpTemplate: SplashHelpDialogComponent
    },
  },
  {
    path: 'notification',
    canActivate: [DnAuthGuard],
    loadChildren: () => import('@promatrix/features').then(m => m.NotificationModule),
    data: {
      debugOnly: false, title: 'Notification', subtitle: 'Notification System',
      show: true, helpTemplate: NotificationHelpDialogComponent
    },
  },
  {
    path: 'mobileApis',
    canActivate: [DnAuthGuard],
    loadChildren: () => import('@promatrix/features').then(m => m.MobileApisModule),
    data: {
      debugOnly: false, title: 'Mobile Apis', subtitle: 'Mobile API features',
      show: true, helpTemplate: MobileApisHelpDialogComponent
    },
  },
  {
    path: 'settings', component: SettingsComponent,
    canActivate: [DnAuthGuard],
    data: { debugOnly: false, title: 'Settings', subtitle: 'Versions & Settings', show: true, helpTemplate: SettingsHelpDialogComponent },
  },
  {
    path: 'features', component: FeaturesComponent,
    canActivate: [DnAuthGuard],
    data: {
      debugOnly: false, title: 'Features', subtitle: 'The Angular Fire Studio',
      show: true, helpTemplate: FeaturesHelpDialogComponent
    },
  },
  {
    path: 'alreadyReady', component: AlreadyReadyComponent,
    canActivate: [DnAuthGuard],
    data: {
      debugOnly: false, title: 'Already Ready', subtitle: 'Already Ready',
      show: true, helpTemplate: AlreadyReadyHelpDialogComponent
    },
  },
  {
    path: 'httpDemo', component: HttpDotnetComponent,
    canActivate: [DnAuthGuard],
    data: {
      debugOnly: false, title: 'Http Demos', subtitle: 'Features of the Http Service',
      show: true, helpTemplate: HttpDotnetHelpDialogComponent
    },
  },
  {
    path: 'development', component: DevelopmentComponent,
    canActivate: [DnAuthGuard],
    data: {
      debugOnly: true, title: 'Development', subtitle: 'Development Utilities',
      show: true, helpTemplate: DevelopmentHelpDialogComponent
    },
  },
  { path: '**', redirectTo: '/splash', pathMatch: 'full' },
  {
    path: 'restart', redirectTo: '', pathMatch: 'full',
    data: {
      debugOnly: false, title: 'Restart', subtitle: 'Restarting the Application...',
      show: true, helpTemplate: SplashHelpDialogComponent
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
