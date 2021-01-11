import { ListComponent } from './sections/menu/list/list.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './sections/nav/nav.component';
import { MenuComponent } from './sections/menu/menu.component';
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MenuComponent,
    ListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
