import { InfoPanelComponent } from './info-panel/info-panel.component';
import { ChatComponent } from './chat.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListModule } from 'src/app/sections/list/list.module';
import { MessageItemComponent } from './message-item/message-item.component';
import { FormsModule } from '@angular/forms';
import { UtilModule } from '../utils/util.module';
import { LinkVcardComponent } from './message-item/link-vcard/link-vcard.component';

const routes: Routes = [
  {
    path: '',
    component: ChatComponent
  }
];

@NgModule({
  declarations: [
    ChatComponent,
    InfoPanelComponent,
    MessageItemComponent,
    LinkVcardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListModule,
    FormsModule,
    UtilModule
  ],
})
export class ChatModule { }
