import { ServerMessagesComponent } from './server-messages.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ServerMessagesComponent
  }
];

@NgModule({
  declarations: [
    ServerMessagesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
})
export class ServerModule { }
