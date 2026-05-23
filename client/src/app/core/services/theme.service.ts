import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'vibechat-theme';
  private themeSubject = new BehaviorSubject<AppTheme>(this.getInitialTheme());

  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  isDark(): boolean {
    return this.themeSubject.value === 'dark';
  }

  setTheme(theme: AppTheme): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  private getInitialTheme(): AppTheme {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    const root = document.documentElement;
    const body = document.body;

    // Clear all previous theme classes
    root.classList.remove('theme-light', 'theme-dark', 'dark', 'light');
    body.classList.remove('theme-light', 'theme-dark', 'dark', 'light');

    // Apply new theme classes
    root.classList.add(`theme-${theme}`);
    body.classList.add(`theme-${theme}`);

    // Keep .dark for legacy compatibility with existing CSS
    root.classList.toggle('dark', theme === 'dark');
    body.classList.toggle('dark', theme === 'dark');

    // Data attribute for CSS selectors
    root.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);
  }
}
