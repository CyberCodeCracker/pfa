import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationApiService, AppNotification } from '../../core/services/notification-api.service';

interface NotifMeta {
  label: string;
  icon: string;
  chipClass: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  private readonly metaMap: Record<string, NotifMeta> = {
    reunion_planifiee: {
      label: 'Réunion planifiée',
      icon: 'event',
      chipClass: 'bg-tertiary-container text-on-tertiary-container',
    },
    meeting_reminder: {
      label: 'Rappel réunion',
      icon: 'alarm',
      chipClass: 'bg-tertiary-container text-on-tertiary-container',
    },
    document_soumis: {
      label: 'Document soumis',
      icon: 'upload_file',
      chipClass: 'bg-secondary-container text-on-secondary-container',
    },
    document_depose: {
      label: 'Document déposé',
      icon: 'download_for_offline',
      chipClass: 'bg-secondary-container text-on-secondary-container',
    },
    document_valide: {
      label: 'Document validé',
      icon: 'check_circle',
      chipClass: 'bg-primary-container text-on-primary-container',
    },
    document_refuse: {
      label: 'Document refusé',
      icon: 'cancel',
      chipClass: 'bg-error-container text-on-error-container',
    },
    feedback_recu: {
      label: 'Feedback reçu',
      icon: 'rate_review',
      chipClass: 'bg-secondary-container text-on-secondary-container',
    },
  };

  constructor(
    private notifApi: NotificationApiService,
    private router: Router,
  ) {}

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

  navigate(notif: AppNotification): void {
    if (!notif.read_at) {
      this.notifApi.markRead(notif.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => { notif.read_at = new Date().toISOString(); },
      });
    }

    const data = notif.data as Record<string, any>;
    const type: string = data['type'] ?? notif.type ?? '';
    const stageId: number | undefined = data['stage_id'];
    const reunionId: number | undefined = data['reunion_id'];

    switch (type) {
      case 'reunion_planifiee':
        if (stageId) this.router.navigate(['/stages', stageId], { queryParams: { tab: 4 } });
        else this.router.navigate(['/reunions']);
        break;

      case 'meeting_reminder':
        this.router.navigate(['/reunions']);
        break;

      case 'document_soumis':
      case 'document_valide':
      case 'document_refuse':
      case 'document_depose':
        if (stageId) this.router.navigate(['/stages', stageId], { queryParams: { tab: 3 } });
        break;

      case 'feedback_recu':
        if (stageId) this.router.navigate(['/stages', stageId], { queryParams: { tab: 0 } });
        break;

      default:
        break;
    }
  }

  markAllRead(): void {
    this.notifApi.markAllRead().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const now = new Date().toISOString();
        this.notifications.forEach(n => { if (!n.read_at) n.read_at = now; });
      },
    });
  }

  getMeta(notif: AppNotification): NotifMeta {
    const data = notif.data as Record<string, any>;
    const type: string = data['type'] ?? notif.type ?? '';
    return this.metaMap[type] ?? { label: 'Notification', icon: 'notifications', chipClass: 'bg-surface-container text-on-surface-variant' };
  }

  getMessage(notif: AppNotification): string {
    const data = notif.data as Record<string, any>;
    if (data['message']) return data['message'];
    // reunion_planifiee has no message field — build one from sujet/date
    if (data['sujet']) {
      const date = data['date'] ? new Date(data['date']).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
      return `Réunion planifiée : "${data['sujet']}"${date ? ' le ' + date : ''}`;
    }
    return 'Nouvelle notification';
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read_at).length;
  }
}
