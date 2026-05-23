import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-calls',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.scss']
})
export class CallsPage {
  activeSegment: 'audio' | 'video' = 'audio';
}
