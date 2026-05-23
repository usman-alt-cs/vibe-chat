import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingPage),
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then((m) => m.SignupPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.component').then((m) => m.TabsPage),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomePage),
      },
      {
        path: 'groups',
        loadComponent: () => import('./pages/groups/groups.page').then((m) => m.GroupsPage),
      },
      {
        path: 'status',
        loadComponent: () => import('./pages/status/status.page').then((m) => m.StatusPage),
      },
      {
        path: 'calls',
        loadComponent: () => import('./pages/calls/calls.page').then((m) => m.CallsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfilePage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'chat/:userId',
        loadComponent: () => import('./pages/chat/chat.component').then((m) => m.ChatPage),
      }
    ],
  },
  {
    path: '**',
    redirectTo: ''
  }
];
