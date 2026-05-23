import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService, AppTheme } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/interfaces/user.interface';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  private themeService = inject(ThemeService);
  private authService  = inject(AuthService);
  router               = inject(Router);   // public – used in template
  private location     = inject(Location);


  currentUser: User | null = null;
  currentTheme: AppTheme   = 'dark';

  // Notification toggles (UI only)
  notifMessages   = true;
  notifSound      = true;
  doNotDisturb    = false;

  // Privacy toggles (UI only)
  onlineStatus    = true;
  readReceipts    = true;

  // Glass intensity (UI only)
  glassIntensity  = 80;

  get userInitial(): string {
    return (this.currentUser?.name?.charAt(0) || this.currentUser?.username?.charAt(0) || 'S').toUpperCase();
  }

  get displayName(): string {
    return this.currentUser?.name || this.currentUser?.username || 'VibeChat User';
  }

  get displayUsername(): string {
    return `@${this.currentUser?.username || 'vibechat'}`;
  }

  get isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  ngOnInit() {
    this.currentUser  = this.authService.getCurrentUser();
    this.currentTheme = this.themeService.currentTheme;
    this.themeService.theme$.subscribe(t => { this.currentTheme = t; });
  }

  goBack() {
    this.location.back();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  setTheme(theme: AppTheme) {
    this.themeService.setTheme(theme);
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (err) {
      console.error(err);
    }
  }
}
