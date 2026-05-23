import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { chatbubblesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule],
  template: `
    <ion-content>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>

      <div class="auth-container">
        <div class="brand-header">
          <div class="brand-icon liquid-glass-strong">
            <ion-icon name="chatbubbles-outline"></ion-icon>
          </div>
          <h1>VibeChat</h1>
          <p>Connect with style.</p>
        </div>

        <div class="auth-card liquid-glass">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">

            <!-- Email -->
            <div class="auth-input-shell liquid-glass"
              [class.is-error]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input class="auth-input" formControlName="email" type="email" placeholder="Email Address" autocomplete="email" />
            </div>
            <div class="error-msg" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
              Please enter a valid email address.
            </div>

            <!-- Password -->
            <div class="auth-input-shell liquid-glass"
              [class.is-error]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input class="auth-input" formControlName="password" type="password" placeholder="Password" autocomplete="current-password" />
            </div>
            <div class="error-msg" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
              Password is required.
            </div>

            <button type="submit" class="auth-submit-btn liquid-glass-strong vibe-gradient glass-press" [disabled]="loginForm.invalid || isLoading">
              <ion-spinner *ngIf="isLoading" name="crescent" style="--color:#fff"></ion-spinner>
              <span *ngIf="!isLoading">Log In</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>New to VibeChat? <a routerLink="/signup">Sign up</a></p>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: var(--vibe-bg);
    }
    .bg-orb {
      position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; pointer-events: none;
    }
    .orb-1 { width: 300px; height: 300px; background: rgba(124, 61, 255, 0.22); top: -100px; left: -80px; }
    .orb-2 { width: 250px; height: 250px; background: rgba(33, 212, 253, 0.22); top: 30%; right: -80px; }
    .orb-3 { width: 200px; height: 200px; background: rgba(124, 61, 255, 0.18); bottom: -60px; left: 30%; }

    .auth-container {
      position: relative; z-index: 1; display: flex; flex-direction: column;
      justify-content: center; align-items: center; min-height: 100%; padding: 32px 16px;
    }
    .brand-header { text-align: center; margin-bottom: 36px; }
    .brand-icon {
      width: 72px; height: 72px; border-radius: 24px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      ion-icon { font-size: 36px; color: var(--vibe-accent); }
    }
    .brand-header h1 {
      font-size: 40px; font-weight: 800; letter-spacing: -1.5px; margin: 0 0 8px;
      color: var(--vibe-text-main);
    }
    .brand-header p {
      color: var(--vibe-text-muted); font-size: 17px; font-weight: 500; margin: 0;
    }
    .auth-card {
      width: 92%; max-width: 440px; border-radius: 30px; padding: 32px 28px;
    }
    .auth-form { display: flex; flex-direction: column; }
    
    .auth-input-shell {
      display: flex; align-items: center; gap: 14px; width: 100%; height: 58px;
      padding: 0 20px; border-radius: 999px; margin-bottom: 14px;
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
      &:focus-within { border: 1px solid var(--vibe-accent); box-shadow: 0 0 0 3px rgba(124, 61, 255, 0.15); }
      &.is-error { border: 1px solid #eb445a; box-shadow: 0 0 0 3px rgba(235, 68, 90, 0.15); }
    }
    .auth-input-icon {
      width: 22px; height: 22px; flex: 0 0 22px; stroke: var(--vibe-accent);
    }
    .auth-input {
      flex: 1; width: 100%; height: 100%; min-height: 0;
      color: var(--vibe-text-main) !important; font-size: 17px; font-weight: 500;
      &::placeholder { color: var(--vibe-text-muted) !important; }
    }
    .error-msg {
      color: #eb445a; font-size: 12px; font-weight: 500; margin-top: -10px; margin-bottom: 12px; padding-left: 20px;
    }
    .auth-submit-btn {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 56px; margin-top: 8px;
      color: #fff; font-size: 17px; font-weight: 700; letter-spacing: 0.3px;
      border-radius: 999px; cursor: pointer; font-family: inherit;
      &[disabled] { opacity: 0.55; cursor: not-allowed; }
    }
    .auth-footer {
      text-align: center; margin-top: 24px; font-size: 14px;
      p { margin: 0; color: var(--vibe-text-muted); }
      a { color: var(--vibe-accent); text-decoration: none; font-weight: 700; }
    }
  `]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  isLoading = false;

  constructor() { addIcons({ chatbubblesOutline }); }

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    try {
      await this.authService.login(this.loginForm.value as any);
      this.isLoading = false;
      this.router.navigate(['/tabs/home'], { replaceUrl: true });
    } catch (err: any) {
      this.isLoading = false;
      const toast = await this.toastCtrl.create({
        message:  err?.message || 'Login failed. Check your email and password.',
        duration: 3500, color: 'danger', position: 'top'
      });
      await toast.present();
    }
  }
}
