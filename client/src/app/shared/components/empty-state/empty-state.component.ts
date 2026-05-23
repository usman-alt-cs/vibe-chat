import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonicModule],
  template: `
    <div class="empty-state">
      <ion-icon [name]="icon"></ion-icon>
      <h3>{{ title }}</h3>
      <p>{{ subtitle }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      height: 100%;
      color: var(--vibe-text-muted);
    }
    ion-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--vibe-text-main);
    }
    p {
      margin: 0;
      font-size: 14px;
      max-width: 250px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'chatbubbles-outline';
  @Input() title = 'No data';
  @Input() subtitle = '';
}
