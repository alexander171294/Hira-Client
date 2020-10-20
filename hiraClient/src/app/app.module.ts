import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ServerBoxComponent } from './components/server-box/server-box.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SafePipe } from './utils/safe.pipe';
import { LinkVcardComponent } from './components/link-vcard/link-vcard.component';
import { HttpClientModule } from '@angular/common/http';
import { ChannelListComponent } from './components/channel-list/channel-list.component';
import { EmoteListComponent } from './components/chat-box/emote-list/emote-list.component';
import { WhoisComponent } from './components/whois/whois.component';
import { GmodeComponent } from './components/gmode/gmode.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatListComponent,
    UserListComponent,
    ChatBoxComponent,
    ServerBoxComponent,
    SafePipe,
    LinkVcardComponent,
    ChannelListComponent,
    EmoteListComponent,
    WhoisComponent,
    GmodeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
