import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';
import { Store } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CsrfInterceptor } from './core/http/csrf.interceptor';
import { ErrorInterceptor } from './core/http/error.interceptor';
import { AuthEffects } from './store/auth/auth.effects';
import { authReducer } from './store/auth/auth.reducer';
import { AuthActions } from './store/auth/auth.actions';
import { AuthService } from './core/auth/auth.service';
import { filterReducer } from './store/filter/filter.reducer';
import { environment } from '../environments/environment';

export function createTranslateLoader() {
  return new TranslateHttpLoader();
}

function initApp(authService: AuthService, store: Store): () => Promise<void> {
  return async () => {
    await firstValueFrom(authService.csrfCookie()).catch(() => {});
    store.dispatch(AuthActions.loadMe());
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSnackBarModule,
    MatDialogModule,
    AppRoutingModule,
    StoreModule.forRoot({ auth: authReducer, filter: filterReducer }),
    EffectsModule.forRoot([AuthEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [],
      },
      defaultLanguage: 'fr',
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CsrfInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AuthService, Store],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
