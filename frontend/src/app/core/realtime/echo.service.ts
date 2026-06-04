import { Injectable, OnDestroy } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../../environments/environment';

(window as any).Pusher = Pusher;

@Injectable({ providedIn: 'root' })
export class EchoService implements OnDestroy {
  private echo: Echo<'reverb'> | null = null;

  connect(): void {
    if (this.echo) return;

    const xsrfToken = this.getCookie('XSRF-TOKEN');

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: environment.reverb.key,
      wsHost: environment.reverb.host,
      wsPort: environment.reverb.port,
      wssPort: environment.reverb.port,
      forceTLS: environment.reverb.scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      withCredentials: true,
      authEndpoint: `${environment.baseUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Accept: 'application/json',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
        },
      },
    });
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
    return match ? match[2] : null;
  }

  disconnect(): void {
    this.echo?.disconnect();
    this.echo = null;
  }

  privateChannel(channelName: string) {
    if (!this.echo) this.connect();
    return this.echo?.private(channelName);
  }

  presenceChannel(channelName: string) {
    if (!this.echo) this.connect();
    return this.echo?.join(channelName);
  }

  leaveChannel(channelName: string): void {
    this.echo?.leave(channelName);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
