import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  template: `
    <div class="glass-panel" [class]="customClass">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .glass-panel {
      padding: 24px;
      margin: 16px;
      background: var(--vibe-glass-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--vibe-glass-border);
      border-radius: 24px;
      box-shadow: var(--vibe-glass-shadow);
    }
  `]
})
export class GlassCardComponent {
  @Input() customClass = '';
}
