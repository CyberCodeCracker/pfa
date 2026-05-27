import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatApiService } from '../../../core/services/chat-api.service';
import { EchoService } from '../../../core/realtime/echo.service';
import { Message } from '../../../core/models/message.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-stage-chat',
  templateUrl: './stage-chat.component.html',
  styleUrls: ['./stage-chat.component.scss'],
})
export class StageChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() stageId!: number;
  @ViewChild('msgContainer') msgContainer!: ElementRef;

  messages: Message[] = [];
  currentUser: User | null = null;
  loading = false;
  sending = false;
  messageCtrl = new FormControl('', [Validators.required, Validators.maxLength(2000)]);
  private shouldScroll = false;
  private destroy$ = new Subject<void>();

  constructor(
    private chatApi: ChatApiService,
    private echo: EchoService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.store.select(selectCurrentUser).pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.currentUser = u;
    });
    this.loadMessages();
    this.subscribeToRealtime();
  }

  ngOnDestroy(): void {
    this.echo.leaveChannel(`presence-stage.${this.stageId}`);
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      const el = this.msgContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  private loadMessages(): void {
    this.loading = true;
    this.chatApi.getPublicMessages(this.stageId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.messages = res.data.reverse();
          this.loading = false;
          this.shouldScroll = true;
        },
        error: () => { this.loading = false; },
      });
  }

  private subscribeToRealtime(): void {
    const channel = this.echo.presenceChannel(`stage.${this.stageId}`);
    if (!channel) return;

    (channel as any).listen('.MessagePosted', (event: { message: Message }) => {
      if (!this.messages.find(m => m.id === event.message.id)) {
        this.messages = [...this.messages, event.message];
        this.shouldScroll = true;
      }
    });
  }

  sendMessage(): void {
    const text = this.messageCtrl.value?.trim();
    if (!text || this.sending) return;

    this.sending = true;
    this.chatApi.sendPublicMessage(this.stageId, text)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.messages = [...this.messages, res.data];
          this.messageCtrl.reset();
          this.sending = false;
          this.shouldScroll = true;
        },
        error: () => { this.sending = false; },
      });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isOwn(msg: Message): boolean {
    return msg.sender?.id === this.currentUser?.id;
  }

  getInitials(user?: User): string {
    if (!user) return '?';
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
  }
}
