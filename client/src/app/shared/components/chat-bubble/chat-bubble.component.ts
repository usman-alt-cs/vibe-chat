import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="message-wrapper" [class.sent]="isSent" [class.received]="!isSent">
      <div class="bubble" [ngClass]="isSent ? 'vibe-gradient' : 'liquid-glass'">
        <p class="text">{{ message }}</p>
        <span class="time">{{ timestamp | date:'shortTime' }}</span>
      </div>
    </div>
  `,
  styles: [`
    .message-wrapper {
      display: flex;
      width: 100%;
      margin-bottom: 12px;
      padding: 0 16px;
      box-sizing: border-box;
    }
    .sent {
      justify-content: flex-end;
    }
    .received {
      justify-content: flex-start;
    }
    .bubble {
      max-width: 75%;
      padding: 10px 16px;
      border-radius: 20px;
      position: relative;
      word-wrap: break-word;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .sent .bubble {
      color: white;
      border-bottom-right-radius: 4px;
    }
    .received .bubble {
      color: var(--vibe-text-main);
      border-bottom-left-radius: 4px;
    }
    .text {
      margin: 0;
      font-size: 15px;
      line-height: 1.4;
    }
    .time {
      display: block;
      font-size: 10px;
      margin-top: 4px;
      text-align: right;
      opacity: 0.7;
    }
    .sent .time {
      color: rgba(255, 255, 255, 0.8);
    }
  `]
})
export class ChatBubbleComponent {
  @Input() message!: string;
  @Input() timestamp!: string | Date;
  @Input() isSent!: boolean;
}
