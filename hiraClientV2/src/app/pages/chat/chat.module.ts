import { InfoPanelComponent } from './info-panel/info-panel.component';
import { ChatComponent } from './chat.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListModule } from 'src/app/sections/list/list.module';

const routes: Routes = [
  {
    path: '',
    component: ChatComponent
  }
];

@NgModule({
  declarations: [
    ChatComponent,
    InfoPanelComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListModule
  ],
})
export class ChatModule { }
