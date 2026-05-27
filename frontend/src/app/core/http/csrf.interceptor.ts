import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const xsrfToken = this.getCookie('XSRF-TOKEN');

    if (xsrfToken && this.isMutatingMethod(req.method)) {
      req = req.clone({
        setHeaders: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) },
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
