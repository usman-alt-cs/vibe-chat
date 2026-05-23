import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './status.page.html',
  styleUrls: ['./status.page.scss'],
})
export class StatusPage {}
