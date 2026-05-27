import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NotificationApiService, AppNotification } from '../../core/services/notification-api.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(private notifApi: NotificationApiService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.notifApi.list().pipe(takeUntil(this.destroy$)).subscribe({
      next: res => { this.notifications = res.data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  markRead(notif: AppNotification): void {
    if (notif.read_at) return;
    this.notifApi.markRead(notif.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { notif.read_at = new Date().toISOString(); },
    });
  }

  markAllRead(): void {
    this.notifApi.markAllRead().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const now = new Date().toISOString();
        this.notifications.forEach(n => { if (!n.read_at) n.read_at = now; });
      },
    });
  }

  getNotifIcon(type: string): string {
    if (type.includes('Meeting')) return 'event';
    if (type.includes('Message')) return 'chat_bubble';
    if (type.includes('Document')) return 'description';
    if (type.includes('Feedback')) return 'rate_review';
    if (type.includes('Invitation')) return 'mail';
    return 'notifications';
  }

  getNotifMessage(notif: AppNotification): string {
    const data = notif.data as Record<string, string>;
    return (data['message'] as string) ?? 'Nouvelle notification';
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read_at).length;
  }
}
