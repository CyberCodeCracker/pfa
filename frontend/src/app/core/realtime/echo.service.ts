import { Injectable, NgZone, OnDestroy } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '../../../environments/environment';

(window as any).Pusher = Pusher;

@Injectable({ providedIn: 'root' })
export class EchoService implements OnDestroy {
  private echo: Echo<'reverb'> | null = null;

  constructor(private ngZone: NgZone) {}

  connect(): void {
    if (this.echo) return;

    const authEndpoint = `${environment.baseUrl}/broadcasting/auth`;

    // Run Echo outside Angular zone — Pusher creates many internal timers/event
    // listeners that would otherwise trigger excessive change detection cycles.
    // Callbacks are brought back into the zone explicitly via ngZone.run().
    this.ngZone.runOutsideAngular(() => {
      this.echo = new Echo({
        broadcaster: 'reverb',
        key: environment.reverb.key,
        wsHost: environment.reverb.host,
        wsPort: environment.reverb.port,
        wssPort: environment.reverb.port,
        forceTLS: environment.reverb.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        // Custom authorizer: pusher-js's built-in auth XHR does NOT set
        // withCredentials, so the Sanctum session cookie is never sent on a
        // cross-origin (e.g. localhost:4200 → localhost) /broadcasting/auth
        // request and private/presence channel subscriptions silently fail.
        // Using fetch with credentials:'include' guarantees cookies are sent.
        authorizer: (channel: any) => ({
          authorize: (socketId: string, callback: (error: Error | null, data: any) => void) => {
            const xsrfToken = this.getCookie('XSRF-TOKEN');
            fetch(authEndpoint, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
              },
              body: JSON.stringify({ socket_id: socketId, channel_name: channel.name }),
            })
              .then(res => {
                if (!res.ok) throw new Error(`Auth failed: HTTP ${res.status}`);
                return res.json();
              })
              .then(data => callback(null, data))
              .catch(err => callback(err, null));
          },
        }),
      });
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

  /** Subscribe to a private channel. Callbacks fire inside Angular zone. */
  privateChannel(channelName: string) {
    if (!this.echo) this.connect();
    return this.zonedChannel(this.echo?.private(channelName));
  }

  /** Subscribe to a presence channel. Callbacks fire inside Angular zone. */
  presenceChannel(channelName: string) {
    if (!this.echo) this.connect();
    return this.zonedChannel(this.echo?.join(channelName));
  }

  leaveChannel(channelName: string): void {
    this.echo?.leave(channelName);
  }

  /** Current WebSocket socket id — used to exclude the sender from their own broadcasts (toOthers). */
  socketId(): string | null {
    return this.echo?.socketId() ?? null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  /**
   * Wraps a channel so that .listen() and .notification() callbacks
   * automatically run inside Angular's NgZone.
   */
  private zonedChannel(channel: any) {
    if (!channel) return channel;
    const zone = this.ngZone;

    const originalListen = channel.listen.bind(channel);
    channel.listen = (event: string, callback: (...args: any[]) => void) => {
      return originalListen(event, (...args: any[]) => zone.run(() => callback(...args)));
    };

    if (typeof channel.notification === 'function') {
      const originalNotification = channel.notification.bind(channel);
      channel.notification = (callback: (...args: any[]) => void) => {
        return originalNotification((...args: any[]) => zone.run(() => callback(...args)));
      };
    }

    return channel;
  }
}
