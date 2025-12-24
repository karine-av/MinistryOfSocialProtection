import { Component, OnInit, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-roles',
  imports: [
    MatToolbar,
    TranslatePipe
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class Roles implements OnInit {

  ngOnInit() {

  }
}
