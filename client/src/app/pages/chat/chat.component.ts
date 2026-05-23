import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, IonContent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Message } from '../../shared/interfaces/message.interface';
import { User } from '../../shared/interfaces/user.interface';
import { ChatBubbleComponent } from '../../shared/components/chat-bubble/chat-bubble.component';
import { addIcons } from 'ionicons';
import { send, arrowBack } from 'ionicons/icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ChatBubbleComponent],
  template: `
    <ion-header class="ion-no-border liquid-glass">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/home" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>
          <div class="header-title" *ngIf="otherUser">
            <div class="avatar-sm vibe-gradient">{{ otherUser.name.charAt(0).toUpperCase() }}</div>
            <span>{{ otherUser.name }}</span>
          </div>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content #content [scrollEvents]="true">
      <div class="messages-container">
        <app-chat-bubble 
          *ngFor="let msg of messages"
          [message]="msg.message"
          [timestamp]="msg.created_at"
          [isSent]="msg.sender_id === currentUserId">
        </app-chat-bubble>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border liquid-glass">
      <ion-toolbar>
        <div class="input-wrapper liquid-glass">
          <ion-textarea
            [(ngModel)]="newMessage"
            placeholder="Type a message..."
            autoGrow="true"
            rows="1"
            maxRows="4"
            (keyup.enter)="sendMessage($event)">
          </ion-textarea>
          <ion-button fill="clear" (click)="sendMessage()" [disabled]="!newMessage.trim() || isSending" class="send-btn liquid-glass-strong glass-press">
            <ion-icon slot="icon-only" name="send"></ion-icon>
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-sm {
      width: 32px;
      height: 32px;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
    }
    .messages-container {
      padding: 16px 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: 100%;
    }
    .input-wrapper {
      display: flex;
      align-items: flex-end;
      padding: 8px 16px;
      border-radius: 24px;
      margin: 8px 16px;
    }
    ion-textarea {
      --padding-bottom: 8px;
      --padding-top: 8px;
      --background: transparent;
      margin: 0;
    }
    .send-btn {
      --color: var(--vibe-accent);
      margin: 0 0 4px 8px;
      height: 36px;
      width: 36px;
      border-radius: 50%;
    }
  `]
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('content', { static: false }) content!: IonContent;

  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  otherUserId!: string;
  otherUser?: User;
  currentUserId!: string;
  messages: Message[] = [];
  newMessage = '';
  isSending = false;
  
  private messagesSub?: Subscription;
  private isInitialLoad = true;

  constructor() {
    addIcons({ send, arrowBack });
  }

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUser()?.id!;
    const idParam = this.route.snapshot.paramMap.get('userId');
    if (idParam) {
      this.otherUserId = idParam;
      this.loadOtherUser();
    }
  }

  ionViewWillEnter() {
    if (this.otherUserId) {
      // 1. Fetch initial messages
      this.chatService.getMessages(this.otherUserId).then(msgs => {
        this.messages = msgs;
        setTimeout(() => {
          this.content?.scrollToBottom(0);
          this.isInitialLoad = false;
        }, 100);
      });

      // 2. Subscribe to realtime stream (handles both our optimistic updates and their replies)
      this.messagesSub = this.chatService.messages$.subscribe(msgs => {
        const shouldScroll = this.isInitialLoad || msgs.length > this.messages.length;
        this.messages = msgs;
        if (shouldScroll) {
          setTimeout(() => {
            this.content?.scrollToBottom(300);
            this.isInitialLoad = false;
          }, 100);
        }
      });

      // 3. Connect the Supabase channel
      this.chatService.subscribeToMessages(this.otherUserId, (newMsg) => {
        // Callback invoked on true remote insert. 
        // The service already pushed it to messages$, so UI updates via subscription above.
      });
    }
  }

  ionViewWillLeave() {
    this.chatService.unsubscribeFromMessages();
    this.chatService.clearMessages();
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }
    this.isInitialLoad = true;
  }

  ngOnDestroy() {
    this.chatService.stopPolling();
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }
  }

  async loadOtherUser() {
    try {
      this.otherUser = await this.userService.getUserById(this.otherUserId);
    } catch (err) {
      console.error('Failed to load other user', err);
    }
  }

  async sendMessage(event?: any) {
    if (event) {
      event.preventDefault(); // Prevent enter from creating a new line
    }
    
    if (!this.newMessage.trim() || this.isSending) return;

    const messageText = this.newMessage.trim();
    this.newMessage = '';
    this.isSending = true;

    try {
      await this.chatService.sendMessage(this.otherUserId, messageText);
      this.isSending = false;
      setTimeout(() => this.content.scrollToBottom(300), 50);
    } catch (err) {
      console.error(err);
      this.isSending = false;
      this.newMessage = messageText; // Restore text on failure
    }
  }
}
