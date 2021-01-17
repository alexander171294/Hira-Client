import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '',   redirectTo: '/user', pathMatch: 'full' },
  { path: 'chat', loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatModule)},
  { path: 'user', loadChildren: () => import('./pages/user/user.module').then(m => m.UserModule)},
  { path: 'server', loadChildren: () => import('./pages/server-messages/server.module').then(m => m.ServerModule)},
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
