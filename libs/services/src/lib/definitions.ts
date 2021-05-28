export class Channel {
    id = '0';
    lastAck = 0;
    name = '';
    message = '';
    messageTime = 0;
    subscriptions = Array<string>();
}

export class ServerTime {
    milliseconds: number;
    zoneOffset: number;
}

export class BookInfo {
    id: number;
    name: string;
    summary: string;
  }
  
  export class Simpson {
    firstName: string;
    lastName: string;
  }
  