import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EchoService } from '../realtime/echo.service';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  constructor(private echo: EchoService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const xsrfToken = this.getCookie('XSRF-TOKEN');

    if (this.isMutatingMethod(req.method)) {
      // X-Socket-ID lets Laravel's broadcast()->toOthers() exclude the sender
      // from their own broadcasts, preventing the message echoing back to them.
      const socketId = this.echo.socketId();
      req = req.clone({
        setHeaders: {
          ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
          ...(socketId ? { 'X-Socket-ID': socketId } : {}),
        },
        withCredentials: true,
      });
    } else {
      req = req.clone({ withCredentials: true });
    }

    return next.handle(req);
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  private isMutatingMethod(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }
}
