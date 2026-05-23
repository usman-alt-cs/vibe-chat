import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { 
  search, 
  addCircleOutline, 
  createOutline,
  chatbubbles,
  time,
  contrast,
  moon,
  sunny,
  lockClosed,
  shieldCheckmark,
  key,
  person
} from 'ionicons/icons';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({
      search,
      addCircleOutline,
      createOutline,
      chatbubbles,
      time,
      contrast,
      moon,
      sunny,
      lockClosed,
      shieldCheckmark,
      key,
      person
    });
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onViewApp() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/tabs/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
