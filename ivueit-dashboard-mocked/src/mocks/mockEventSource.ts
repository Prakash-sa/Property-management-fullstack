// Minimal EventSource mock for SSE in the browser
import { genUpdate } from './data';

type MessageHandler = (ev: MessageEvent) => void;

export class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  url: string;
  readyState = MockEventSource.OPEN;
  onmessage: MessageHandler | null = null;
  onerror: ((ev: Event) => any) | null = null;
  private _timer: number | undefined;

  constructor(url: string) {
    this.url = url;
    // push an update every 3s
    // @ts-ignore
    this._timer = window.setInterval(() => {
      const update = genUpdate();
      const ev = new MessageEvent('message', { data: JSON.stringify(update) });
      if (this.onmessage) this.onmessage(ev);
    }, 3000);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    if (type === 'message') {
      const fn = (ev: MessageEvent) => {
        if (typeof listener === 'function') (listener as any)(ev as unknown as Event);
        else (listener as any).handleEvent(ev as unknown as Event);
      };
      this.onmessage = fn as any;
    }
  }

  close() {
    if (this._timer) {
      // @ts-ignore
      window.clearInterval(this._timer);
      this._timer = undefined;
    }
    this.readyState = MockEventSource.CLOSED;
  }
}
