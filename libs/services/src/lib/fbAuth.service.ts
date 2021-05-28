import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LocalService } from './local.service';
// import { AppSettings } from 'ngx-modelling';

class Google {
  mapKey: string;
}

class Sms {
  from: string;
  pw: string;
}

class User {
  uid = '';
  email = '';
}

class Creds {
  email = 'user@angularstudio.com';
  // password = 'passw00d!';
  password = '';
}

@Injectable({ providedIn: 'root' })
export class FbAuthService {
  user$: Observable<User>;
  creds = new Creds();
  loggedIn = false;
  googleMapKey = '';
  smsFrom = '';
  smsPw = '';

  constructor(private ls: LocalService, private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {
    this.creds = this.ls.getLocalStorage('my-creds');
    if (!this.creds) {
      this.creds = new Creds();
    }
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          // not sure why this is necessary
          const anyUser: any = user;
          return this.afs.doc<User>(`users/${anyUser.uid}`).valueChanges();
        } else {
          this.loggedIn = false;
          return of(null);
        }
      })
    );
  }

  async signIn(success: () => void, error: (e: string) => void) {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(this.creds.email, this.creds.password);
      this.getFireSettings(() => {
        this.loggedIn = true;
        this.ls.setLocalStorage('my-creds', this.creds);
        success();
      }, (err) => {
        error(err);
      });
      return this.updateUserData(credential.user);
    } catch (err) {
      error(err.message);
    }

  }

  async signOut() {
    await this.afAuth.signOut();
    this.creds.password = '';
    this.ls.setLocalStorage('my-creds', this.creds);
    this.loggedIn = false;
  }

  private updateUserData({ uid, email }: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${uid}`);

    const data = {
      uid,
      email
    };
    return userRef.set(data, { merge: true });
  }

  private getFireSettings(success: () => void, error: (x: string) => void) {
    this.afs.collection('google').valueChanges().subscribe((x: Array<Google>) => {
      this.googleMapKey = x[0].mapKey;
      this.afs.collection('sms').valueChanges().subscribe((y: Array<Sms>) => {
        this.smsFrom = y[0].from;
        this.smsPw = y[0].pw;
        success();
      }, (err) => {
        error(err);
      });
    }, (err) => {
      error(err);
    });
  }

}
