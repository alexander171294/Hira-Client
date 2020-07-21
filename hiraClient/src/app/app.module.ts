import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ServerBoxComponent } from './components/server-box/server-box.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    ChatListComponent,
    UserListComponent,
    ChatBoxComponent,
    ServerBoxComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
