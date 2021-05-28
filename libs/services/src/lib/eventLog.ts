import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { ApiService } from './api.service';
import { AppConfigService } from './app-config.service';
import { DotnetRemoteServer } from './environments/dotnet.environments';

export class EventProperties {
  public exception: string;
  public message: string;
  public entryType: number;
}

export class EventLogEntry {
  public canRaiseEvents: boolean;
  public category: string;
  public categoryNumber: number;
  public container: any;
  public data: Array<number>;
  public designMode: boolean;
  public entryType: number;
  public eventID: number;
  public events: any;
  public index: number;
  public instanceId: number;
  public machineName: string;
  public message: string;
  public replacementStrings: Array<string>;
  public site: any;
  public source: string;
  public timeGenerated: Date;
  public timeWritten: Date;
  public userName: string;
}

@Injectable({ providedIn: 'root' })
export class EventLog extends ApiService {
  public buildOutput = '';
  public consoleWindow: HTMLTextAreaElement;
  public eventLogEntries = new Array<EventLogEntry>();
  public eventProperties: EventProperties = { exception: '', message: '', entryType: 1 };
  environment: DotnetRemoteServer;
  constructor(ac: AppConfigService, public store: Store, public readonly http: HttpClient) {
    super(http, store);
    this.environment = ac.getDotnetEnvironment();
  }

  throwException(success: () => any, error: (x: string) => any) {
    this.post(this.eventProperties, this.environment.throwException, (response: HttpResponse<any>) => {
      success();
    }, () => {
      error('Error: Successfully generated an Application Exception!');
    });
  }

  logEntry(success: () => any, error: (x: string) => any) {
    this.post(this.eventProperties, this.environment.postLogEntry, (response: HttpResponse<any>) => {
      success();
    }, () => {
      error('Error: Successfully created a log entry!');
    });
  }

  getLogEntries(success: () => void, error: (x: string) => void) {
    this.get(this.environment.getLogEntries,
      (eventLogEntries: Array<EventLogEntry>) => {
        this.eventLogEntries = eventLogEntries;
        this.eventLogEntries.forEach((entry) => {
          entry.timeGenerated = new Date(entry.timeGenerated);
          entry.timeWritten = new Date(entry.timeWritten);
          entry.replacementStrings[1] = entry.replacementStrings[1].replace('\n', '<br />');
        });
        success();
      }, (errorMessage: string) => { error(errorMessage); });
  }
}
