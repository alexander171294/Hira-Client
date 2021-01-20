import { environment } from './../environments/environment';
import { Component } from '@angular/core';
import { ServerMsgService } from './IRCore/services/server-msg.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hiraClientV2';
  codename = environment.codename;
  version = environment.version;

  constructor(private srvSrv: ServerMsgService) { }

}
