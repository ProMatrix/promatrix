import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppConfigService } from '@promatrix/services';
import { MaterialModule } from 'ngx-motion';
import { NgxsModule } from '@ngxs/store';
import { SideNavState } from './side-nav.component.state';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('AppComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MaterialModule,
        NgxsModule.forRoot([SideNavState,]),
        HttpClientTestingModule
    ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [AppComponent],
      providers: [AppConfigService]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Angular Fire Studio (Desktop)'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.appTitle).toEqual('Angular.Net Studio (Desktop)');
  });

});
