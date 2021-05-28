export class RequestHttpDownload {
  static readonly type = '[httpDemo] Request Http Download';
  constructor(public name: string, public title: string, public payload: boolean, public playback: boolean, public delay: number) { }
}

export class ResponseHttpDownload {
  static readonly type = '[httpDemo] Response Http Download';
  constructor(public payload: Blob, public samplePayload: boolean) { }
}

export class HttpDotnetInit {
  static readonly type = '[http-dotnet-init] HttpDotnetInit';
  // remove circular reference by using ngAction: any
  constructor(public ngAction: any) { }
}

export class HttpFirebaseInit {
  static readonly type = '[http-firebase-init] HttpFirebaseInit';
  // remove circular reference by using ngAction: any
  constructor(public ngAction: any) { }
}
