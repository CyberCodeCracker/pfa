import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, interval, startWith, switchMap } from 'rxjs';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { User } from '../../core/models/user.model';
import { NotificationApiService } from '../../core/services/notification-api.service';
import { EchoService } from '../../core/realtime/echo.service';

@Component({
  selector: 'app-authenticated-layout',
  templateUrl: './authenticated-layout.component.html',
  styleUrls: ['./authenticated-layout.component.scss'],
})
export class AuthenticatedLayoutComponent implements OnInit, OnDestroy {
  user$!: Observable<User | null>;
  sidenavOpen = true;
  unreadNotifCount = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private notifApi: NotificationApiService,
    private echo: EchoService,
  ) {}

  ngOnInit(): void {
    this.user$ = this.store.select(selectCurrentUser);
    this.echo.connect();
    this.pollNotifications();
    this.subscribeToRealtimeNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToRealtimeNotifications(): void {
    this.store.select(selectCurrentUser).pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (!user) return;
      const channel = this.echo.privateChannel(`App.Models.User.${user.id}`);
      if (!channel) return;
      (channel as any).notification(() => {
        this.unreadNotifCount += 1;
      });
    });
  }

  private pollNotifications(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.notifApi.list()),
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        this.unreadNotifCount = res.data.filter(n => !n.read_at).length;
      },
    });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
