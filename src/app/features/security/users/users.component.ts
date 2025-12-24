import { Component, OnInit, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import {TranslatePipe} from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  imports: [
    MatToolbar,
    TranslatePipe
  ],
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  ngOnInit() {

  }
}
