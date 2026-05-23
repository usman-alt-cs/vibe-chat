import { Component, inject, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService, AppTheme } from '../../core/services/theme.service';
import { Conversation } from '../../shared/interfaces/message.interface';
import { User } from '../../shared/interfaces/user.interface';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { addIcons } from 'ionicons';
import { chatbubblesOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomePage implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private chatService    = inject(ChatService);
  private userService    = inject(UserService);
  private authService    = inject(AuthService);
  private themeService   = inject(ThemeService);
  router                 = inject(Router);

  conversations: Conversation[] = [];
  searchResults: User[] = [];
  isLoading    = true;
  currentUserId!: string;
  currentUserName = '';

  searchQuery   = '';
  searchFocused = false;

  // ── Appearance ───────────────────────────────────────────
  isAppearanceOpen = false;
  currentTheme: AppTheme = 'dark';

  // ── Notifications ────────────────────────────────────────
  isNotificationsOpen     = false;
  hasUnreadNotifications  = true;

  notifications = [
    { title: 'Welcome to VibeChat', message: 'Start your first conversation by searching for a user.', time: 'Now' },
    { title: 'Theme updated', message: 'Your liquid glass theme is ready.', time: 'Today' },
  ];

  /** Decorative suggested people (frontend-only, no backend impact) */
  suggestedPeople = [
    { initial: 'A', name: 'Ayaan',  gradient: 'linear-gradient(135deg,#EA6113,#FBB931)' },
    { initial: 'Y', name: 'Yogesh', gradient: 'linear-gradient(135deg,#F88F22,#EA6113)' },
    { initial: 'K', name: 'Kiran',  gradient: 'linear-gradient(135deg,#FBB931,#F88F22)' },
    { initial: 'S', name: 'Sana',   gradient: 'linear-gradient(135deg,#EA6113,#F88F22)' },
    { initial: 'R', name: 'Riya',   gradient: 'linear-gradient(135deg,#F88F22,#FBB931)' },
  ];

  private searchSubject = new Subject<string>();

  constructor() {
    addIcons({ chatbubblesOutline });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim() === '') {
        this.searchResults = [];
        this.loadConversations();
      } else {
        this.performSearch(query);
      }
    });
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.currentUserId   = user?.id!;
    this.currentUserName = user?.name || user?.username || 'U';

    // Sync theme from service (handles persistence)
    this.currentTheme = this.themeService.currentTheme;
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ionViewWillEnter() {
    this.searchQuery   = '';
    this.searchResults = [];
    this.loadConversations();
  }

  // ── Data ────────────────────────────────────────────────
  async loadConversations() {
    this.isLoading = true;
    try {
      this.conversations = await this.chatService.getConversations();
    } catch (err) {
      console.error(err);
    }
    this.isLoading = false;
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  async performSearch(query: string) {
    this.isLoading = true;
    try {
      this.searchResults = await this.userService.searchUsers(query);
    } catch (err) {
      console.error(err);
    }
    this.isLoading = false;
  }

  openChat(userId: string) {
    this.router.navigate(['/tabs/chat', userId]);
  }

  focusSearch() {
    this.searchInput?.nativeElement?.focus();
  }

  get userInitial(): string {
    return (this.currentUserName.charAt(0) || 'U').toUpperCase();
  }

  // ── Appearance modal ─────────────────────────────────────
  openAppearance()  { this.isAppearanceOpen = true;  }
  closeAppearance() { this.isAppearanceOpen = false; }

  setTheme(theme: AppTheme) {
    this.themeService.setTheme(theme);
    setTimeout(() => this.closeAppearance(), 260);
  }

  isTheme(theme: AppTheme): boolean {
    return this.currentTheme === theme;
  }

  // ── Notifications ─────────────────────────────────────────
  openNotifications() {
    this.isNotificationsOpen    = true;
    this.hasUnreadNotifications = false;
  }
  closeNotifications() { this.isNotificationsOpen = false; }

  // ── Navigation ────────────────────────────────────────────
  goToSettings() { this.router.navigateByUrl('/tabs/settings'); }

  // ── Cursor-reactive glass shine ───────────────────────────
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
