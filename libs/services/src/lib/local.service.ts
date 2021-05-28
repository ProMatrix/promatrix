import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalService {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setLocalStorage(name: string, anyObject: any): void {
    if (anyObject instanceof Array) {
      anyObject = { array: anyObject };
    }
    if (typeof (anyObject) === 'object') {
      const stringVal = JSON.stringify(anyObject, null, 2);
      if (stringVal) {
        localStorage.setItem(name, stringVal);
      }
    }
  }
  // eslint-disable-next-line
  getLocalStorage(name: string): any {
    const value = localStorage.getItem(name);
    if (!value) {
      return null;
    }
    if (value.substring(0, 1) === '{') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj: any = JSON.parse(value);
      if ('array' in obj) {
        return obj.array;
      }
      return obj;
    }
    return null;
  }

  filterProjectNameChar(charCode: number): boolean {
    if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode === 8) {
      return true;
    } else {
      return false;
    }
  }
}
