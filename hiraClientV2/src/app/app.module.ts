
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './sections/nav/nav.component';
import { MenuComponent } from './sections/menu/menu.component';
import { ListModule } from './sections/list/list.module';
import { HttpClientModule } from '@angular/common/http';
import { PrivmsgComponent } from './pages/privmsg/privmsg.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MenuComponent,
    PrivmsgComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ListModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
