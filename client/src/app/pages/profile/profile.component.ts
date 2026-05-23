import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ThemeService } from '../../core/services/theme.service';
import { User } from '../../shared/interfaces/user.interface';
import { addIcons } from 'ionicons';
import { logOutOutline, moonOutline, createOutline, keyOutline, sunnyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private themeService = inject(ThemeService);
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);

  user: User | null = null;
  isDarkMode = false;

  // Track focus state for each input group
  profileNameFocused = false;
  profileUserFocused = false;
  pwCurrentFocused = false;
  pwNewFocused = false;
  pwConfirmFocused = false;

  profileForm = this.fb.group({
    name:     ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3)]]
  });

  passwordForm = this.fb.group({
    currentPassword:    ['', Validators.required],
    newPassword:        ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  isUpdatingProfile  = false;
  isChangingPassword = false;

  constructor() {
    addIcons({ logOutOutline, moonOutline, createOutline, keyOutline, sunnyOutline });
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.isDarkMode = this.themeService.isDark();
    if (this.user) {
      this.profileForm.patchValue({
        name:     this.user.name,
        username: this.user.username
      });
    }
  }

  get userInitial(): string {
    return (this.user?.name?.charAt(0) || 'U').toUpperCase();
  }

  passwordMatchValidator(g: any) {
    return g.get('newPassword').value === g.get('confirmNewPassword').value
      ? null : { passwordMismatch: true };
  }

  // ── Theme ──────────────────────────────────────────────
  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }

  // ── Profile update ──────────────────────────────────────
  async updateProfile() {
    if (this.profileForm.invalid) return;
    this.isUpdatingProfile = true;
    try {
      const updatedUser = await this.userService.updateProfile(this.profileForm.value as any);
      this.isUpdatingProfile = false;
      this.user = updatedUser;
      const toast = await this.toastCtrl.create({
        message: 'Profile updated successfully',
        duration: 2000, color: 'success', position: 'top'
      });
      toast.present();
    } catch (err: any) {
      this.isUpdatingProfile = false;
      const toast = await this.toastCtrl.create({
        message: err?.message || 'Failed to update profile',
        duration: 3000, color: 'danger', position: 'top'
      });
      toast.present();
    }
  }

  // ── Password change ─────────────────────────────────────
  async changePassword() {
    if (this.passwordForm.invalid) return;
    this.isChangingPassword = true;
    const { newPassword } = this.passwordForm.value;
    try {
      await this.userService.changePassword(newPassword!);
      this.isChangingPassword = false;
      this.passwordForm.reset();
      const toast = await this.toastCtrl.create({
        message: 'Password changed successfully',
        duration: 2000, color: 'success', position: 'top'
      });
      toast.present();
    } catch (err: any) {
      this.isChangingPassword = false;
      const toast = await this.toastCtrl.create({
        message: err?.message || 'Failed to change password',
        duration: 3000, color: 'danger', position: 'top'
      });
      toast.present();
    }
  }

  // ── Logout (unchanged logic) ───────────────────────────
  logout() {
    this.authService.logout();
  }

  // ── Cursor-reactive glass shine ────────────────────────
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const cards = document.querySelectorAll<HTMLElement>('.glass-reactive');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  }
}
