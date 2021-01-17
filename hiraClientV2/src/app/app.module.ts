
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './sections/nav/nav.component';
import { MenuComponent } from './sections/menu/menu.component';
import { ListModule } from './sections/list/list.module';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MenuComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
