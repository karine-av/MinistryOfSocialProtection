import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardPageComponent } from './dashboard-page.component/dashboard-page.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    DashboardPageComponent
  ],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.scss']
})
export class Analytics implements OnInit {
  ngOnInit() {}
}
