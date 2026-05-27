import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatApiService } from '../../core/services/chat-api.service';
import { EchoService } from '../../core/realtime/echo.service';
import { Message, PrivateChat } from '../../core/models/message.model';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
})
export class MessagingComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  chats: PrivateChat[] = [];
  activeChat: PrivateChat | null = null;
  messages: Message[] = [];
  currentUser: User | null = null;
  loadingChats = true;
  loadingMessages = false;
  messageCtrl = new FormControl('', [Validators.required, Validators.maxLength(2000)]);
  sendingMessage = false;
  private shouldScrollToBottom = false;
  private destroy$ = new Subject<void>();

  private activeChatChannelName: string | null = null;

  constructor(
    private chatApi: ChatApiService,
    private echo: EchoService,
    private store: Store,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.store.select(selectCurrentUser).pipe(takeUntil(this.destroy$)).subscribe(u => {
      this.currentUser = u;
    });

    this.loadChats();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['userId']) {
        this.openOrCreateChat(+params['userId']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.activeChatChannelName) {
      this.echo.leaveChannel(this.activeChatChannelName);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private loadChats(): void {
    this.loadingChats = true;
    this.chatApi.listPrivateChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.chats = res.data;
          this.loadingChats = false;
        },
        error: () => { this.loadingChats = false; },
      });
  }

  private openOrCreateChat(userId: number): void {
    this.chatApi.getOrCreatePrivateChat(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.selectChat(res.data);
          if (!this.chats.find(c => c.id === res.data.id)) {
            this.chats = [res.data, ...this.chats];
          }
        },
      });
  }

  selectChat(chat: PrivateChat): void {
    if (this.activeChatChannelName) {
      this.echo.leaveChannel(this.activeChatChannelName);
    }
    this.activeChat = chat;
    this.activeChatChannelName = `chat.${chat.id}`;
    this.loadMessages(chat.id);
    this.subscribeToPrivateChannel(chat.id);
  }

  private subscribeToPrivateChannel(chatId: number): void {
    const channel = this.echo.privateChannel(`chat.${chatId}`);
    if (!channel) return;
    (channel as any).listen('.MessagePosted', (event: { message: Message }) => {
      if (event.message.sender?.id !== this.currentUser?.id &&
          !this.messages.find(m => m.id === event.message.id)) {
        this.messages = [...this.messages, event.message];
        this.shouldScrollToBottom = true;
      }
    });
  }

  private loadMessages(chatId: number): void {
    this.loadingMessages = true;
    this.chatApi.getPrivateMessages(chatId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.messages = res.data.reverse();
          this.loadingMessages = false;
          this.shouldScrollToBottom = true;
        },
        error: () => { this.loadingMessages = false; },
      });
  }

  sendMessage(): void {
    if (!this.activeChat || this.messageCtrl.invalid || this.sendingMessage) return;
    const contenu = this.messageCtrl.value!.trim();
    if (!contenu) return;

    this.sendingMessage = true;
    this.chatApi.sendPrivateMessage(this.activeChat.id, contenu)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.messages = [...this.messages, res.data];
          this.messageCtrl.reset();
          this.sendingMessage = false;
          this.shouldScrollToBottom = true;
        },
        error: () => { this.sendingMessage = false; },
      });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  getChatPartner(chat: PrivateChat): User | undefined {
    if (!this.currentUser) return undefined;
    return this.currentUser.role === 'enseignant' ? chat.etudiant : chat.enseignant;
  }

  isOwnMessage(msg: Message): boolean {
    return msg.sender?.id === this.currentUser?.id;
  }

  getInitials(user?: User): string {
    if (!user) return '?';
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
  }
}
