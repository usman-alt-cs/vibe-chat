import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface NavTab {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, RouterOutlet],
  template: `
    <!-- Plain router outlet — no ion-tabs constraints -->
    <div class="tabs-shell">
      <router-outlet></router-outlet>
    </div>

    <!-- Custom floating bottom nav -->
    <nav class="vibe-nav liquid-glass" role="navigation" aria-label="Main navigation">
      <button
        *ngFor="let tab of tabs"
        type="button"
        class="vibe-nav-item"
        [class.active]="isActive(tab.route)"
        (click)="navigate(tab.route)"
        [attr.aria-label]="tab.label"
        [attr.aria-current]="isActive(tab.route) ? 'page' : null"
      >
        <div class="nav-icon-wrap">
          <span class="material-symbols-rounded nav-icon">{{ tab.icon }}</span>
          <span class="active-dot" *ngIf="isActive(tab.route)"></span>
        </div>
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </nav>
  `,
  styles: [`
    /* ─── Shell that fills available height ───────────────── */
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .tabs-shell {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    .tabs-shell router-outlet + * {
      position: absolute;
      inset: 0;
    }

    /* ─── Floating nav container ──────────────────────────── */
    .vibe-nav {
      position: fixed;
      left: 50%;
      bottom: calc(18px + env(safe-area-inset-bottom, 0px));
      transform: translateX(-50%);
      width: calc(100% - 32px);
      max-width: 430px;
      height: 82px;
      padding: 8px 6px;
      border-radius: 999px;
      z-index: 1000;

      display: grid;
      grid-template-columns: repeat(5, 1fr);
      align-items: center;
      gap: 2px;

      /* Cyan-dominant polished edge — no purple wash */
      box-shadow:
        0 0 28px rgba(33, 212, 253, 0.18),
        0 0 12px rgba(124, 61, 255, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.18),
        inset 0 -1px 0 rgba(33, 212, 253, 0.10);
    }

    /* ─── Individual tab button ───────────────────────────── */
    .vibe-nav-item {
      position: relative;
      height: 64px;
      min-width: 0;
      border: none;
      background: transparent;
      border-radius: 999px;
      color: rgba(200, 220, 255, 0.52);  /* softer inactive — more readable */
      cursor: pointer;
      padding: 0;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;

      transition:
        transform 280ms ease,
        color 280ms ease,
        background 280ms ease,
        box-shadow 280ms ease;
    }

    .vibe-nav-item:hover {
      transform: translateY(-2px);
      color: rgba(220, 235, 255, 0.88);
    }

    .vibe-nav-item:active {
      transform: scale(0.94);
    }

    .vibe-nav-item.active {
      color: #ffffff;
      background: linear-gradient(145deg, #7C3DFF, #21D4FD);
      box-shadow:
        0 8px 28px rgba(124, 61, 255, 0.38),
        0 6px 18px rgba(33, 212, 253, 0.22),
        inset 0 1px 0 rgba(255, 255, 255, 0.18);
    }

    /* ─── Icon ────────────────────────────────────────────── */
    .nav-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-icon {
      font-size: 23px;
      line-height: 1;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      transition: transform 280ms ease, font-variation-settings 280ms ease;
    }

    .vibe-nav-item.active .nav-icon {
      font-size: 24px;
      font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
    }

    .vibe-nav-item:hover .nav-icon {
      transform: scale(1.12);
    }

    .active-dot {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
    }

    /* ─── Label ───────────────────────────────────────────── */
    .nav-label {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    /* ─── Small phone ─────────────────────────────────────── */
    @media (max-width: 370px) {
      .vibe-nav {
        height: 76px;
        padding: 6px 4px;
        bottom: calc(12px + env(safe-area-inset-bottom, 0px));
      }
      .vibe-nav-item { height: 58px; }
      .nav-icon { font-size: 21px; }
      .vibe-nav-item.active .nav-icon { font-size: 22px; }
      .nav-label { font-size: 9.5px; }
    }

    /* ─── Light mode — white/cyan backlight, no purple wash ── */
    :host-context(.theme-light) .vibe-nav,
    .theme-light .vibe-nav {
      background: rgba(255, 255, 255, 0.82) !important;
      border: 1px solid rgba(7, 17, 31, 0.10);
      box-shadow:
        0 20px 60px rgba(255, 255, 255, 0.80),
        0 14px 38px rgba(33,  212, 253, 0.12),
        0 8px  30px rgba(7,   17,  31,  0.06),
        inset 0 1px 1px rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(32px);
      -webkit-backdrop-filter: blur(32px);
    }

    :host-context(.theme-light) .vibe-nav-item,
    .theme-light .vibe-nav-item {
      color: rgba(7, 17, 31, 0.55);
    }

    :host-context(.theme-light) .vibe-nav-item:hover,
    .theme-light .vibe-nav-item:hover {
      color: rgba(7, 17, 31, 0.88);
    }

    /* Active pill keeps iris→cyan gradient in both modes */
    :host-context(.theme-light) .vibe-nav-item.active,
    .theme-light .vibe-nav-item.active {
      color: #ffffff;
      box-shadow:
        0 0 22px rgba(255, 255, 255, 0.70),
        0 0 14px rgba(33, 212, 253, 0.24),
        0 10px 28px rgba(124, 61, 255, 0.18);
    }
  `]
})
export class TabsPage implements OnInit {
  tabs: NavTab[] = [
    { label: 'Chats',   icon: 'chat_bubble',         route: '/tabs/home'    },
    { label: 'Groups',  icon: 'group',                route: '/tabs/groups'  },
    { label: 'Status',  icon: 'radio_button_checked', route: '/tabs/status'  },
    { label: 'Calls',   icon: 'call',                 route: '/tabs/calls'   },
    { label: 'Profile', icon: 'person',               route: '/tabs/profile' },
  ];

  activeRoute = '/tabs/home';

  constructor(private router: Router) {}

  ngOnInit() {
    // Set active from current URL immediately
    this.activeRoute = this.router.url || '/tabs/home';

    // Update active tab on every navigation
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.activeRoute = e.urlAfterRedirects;
      });
  }

  isActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }

  navigate(route: string) {
    this.router.navigateByUrl(route);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const cards = document.querySelectorAll<HTMLElement>('.glass-reactive');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  }
}
