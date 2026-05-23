import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule],
  template: `
    <ion-content>
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>

      <div class="auth-container">
        <div class="brand-header">
          <h1>Create Account</h1>
          <p>Join the Vibe.</p>
        </div>

        <div class="auth-card liquid-glass">
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="auth-form">

            <!-- Full Name -->
            <div class="auth-input-shell liquid-glass"
              [class.is-error]="signupForm.get('name')?.touched && signupForm.get('name')?.invalid">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input class="auth-input" formControlName="name" type="text" placeholder="Full Name" autocomplete="name" />
            </div>
            <div class="error-msg" *ngIf="signupForm.get('name')?.touched && signupForm.get('name')?.invalid">
              Please enter your full name (min. 2 characters).
            </div>

            <!-- Username -->
            <div class="auth-input-shell liquid-glass"
              [class.is-error]="signupForm.get('username')?.touched && signupForm.get('username')?.invalid">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="4"/>
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
              </svg>
              <input class="auth-input" formControlName="username" type="text" placeholder="Username" autocomplete="username" />
            </div>
            <div class="error-msg" *ngIf="signupForm.get('username')?.touched && signupForm.get('username')?.invalid">
              Username must be 3+ characters.
            </div>

            <!-- Email -->
            <div class="auth-input-shell liquid-glass"
              [class.is-error]="signupForm.get('email')?.touched && signupForm.get('email')?.invalid">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input class="auth-input" formControlName="email" type="email" placeholder="Email Address" autocomplete="email" />
            </div>
            <div class="error-msg" *ngIf="signupForm.get('email')?.touched && signupForm.get('email')?.invalid">
              Please enter a valid email address.
            </div>

            <!-- Password -->
            <div class="auth-input-shell liquid-glass"
              [class.is-error]="signupForm.get('password')?.touched && signupForm.get('password')?.invalid">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input class="auth-input" formControlName="password" type="password" placeholder="Password" autocomplete="new-password" />
            </div>
            <div class="error-msg" *ngIf="signupForm.get('password')?.touched && signupForm.get('password')?.invalid">
              Password must be at least 8 characters.
            </div>

            <!-- Confirm Password -->
            <div class="auth-input-shell liquid-glass"
              [class.is-error]="signupForm.get('confirmPassword')?.touched && 
                (signupForm.get('confirmPassword')?.invalid || signupForm.errors?.['passwordMismatch'])">
              <svg class="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input class="auth-input" formControlName="confirmPassword" type="password" placeholder="Confirm Password" autocomplete="new-password" />
            </div>
            <div class="error-msg" *ngIf="signupForm.errors?.['passwordMismatch'] && signupForm.get('confirmPassword')?.touched">
              Passwords do not match.
            </div>

            <button type="submit" class="auth-submit-btn liquid-glass-strong vibe-gradient glass-press" 
              [disabled]="signupForm.invalid || signupForm.errors?.['passwordMismatch'] || isLoading">
              <ion-spinner *ngIf="isLoading" name="crescent" style="--color:#fff"></ion-spinner>
              <span *ngIf="!isLoading">Sign Up</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/login">Log in</a></p>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content { --background: var(--vibe-bg); }
    .bg-orb { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 0; pointer-events: none; }
    .orb-1 { width: 280px; height: 280px; background: rgba(124, 61, 255, 0.22); top: -80px; right: -60px; }
    .orb-2 { width: 240px; height: 240px; background: rgba(33, 212, 253, 0.22); bottom: 10%; left: -80px; }
    .orb-3 { width: 180px; height: 180px; background: rgba(124, 61, 255, 0.18); top: 40%; right: 10%; }

    .auth-container {
      position: relative; z-index: 1; display: flex; flex-direction: column;
      justify-content: center; align-items: center; min-height: 100%; padding: 32px 16px;
    }
    .brand-header { text-align: center; margin-bottom: 28px; }
    .brand-header h1 {
      font-size: 36px; font-weight: 800; letter-spacing: -1px; margin: 0 0 8px; color: var(--vibe-text-main);
    }
    .brand-header p {
      color: var(--vibe-text-muted); font-size: 17px; font-weight: 500; margin: 0;
    }
    .auth-card {
      width: 92%; max-width: 440px; border-radius: 30px; padding: 28px 28px 24px;
    }
    .auth-form { display: flex; flex-direction: column; }
    
    .auth-input-shell {
      display: flex; align-items: center; gap: 14px; width: 100%; height: 56px;
      padding: 0 20px; border-radius: 999px; margin-bottom: 12px;
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
      color: #eb445a; font-size: 12px; font-weight: 500; margin-top: -8px; margin-bottom: 10px; padding-left: 20px;
    }
    .auth-submit-btn {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 54px; margin-top: 8px;
      color: #fff; font-size: 17px; font-weight: 700; letter-spacing: 0.3px;
      border-radius: 999px; cursor: pointer; font-family: inherit;
      &[disabled] { opacity: 0.55; cursor: not-allowed; }
    }
    .auth-footer {
      text-align: center; margin-top: 20px; font-size: 14px;
      p { margin: 0; color: var(--vibe-text-muted); }
      a { color: var(--vibe-accent); text-decoration: none; font-weight: 700; }
    }
  `]
})
export class SignupPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  signupForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9_]+$')]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;

  passwordMatchValidator(g: any) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.signupForm.invalid || this.signupForm.errors?.['passwordMismatch']) return;
    this.isLoading = true;

    const { confirmPassword, name, username, email, password } = this.signupForm.value as any;

    try {
      await this.authService.signup({ name, username, email, password });
      this.isLoading = false;
      const toast = await this.toastCtrl.create({
        message:  'Account created! Please check your email to confirm, then log in.',
        duration: 4000, color: 'success', position: 'top'
      });
      await toast.present();
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (err: any) {
      this.isLoading = false;
      const toast = await this.toastCtrl.create({
        message:  err?.message || 'Signup failed. Try a different username or email.',
        duration: 3500, color: 'danger', position: 'top'
      });
      await toast.present();
    }
  }
}
