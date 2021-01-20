import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit {

  public isWS: boolean
  public host: string = 'irc.hirana.net';
  public nick: string;
  public nickSecundario: string;
  public canales: string[] = [];
  public canalAgregar: string;
  public password: string;
  public tipoLogin: TiposLogin = TiposLogin.NONE;

  public error: string;
  public connected: boolean;

  constructor() { }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    document.getElementById('nickInput').focus();
  }

  removeChannel(idx: number) {
    this.canales.splice(idx, 1);
  }

  kp(event: any) {
    if(event.keyCode === 13) {
      this.agregarCanal();
    }
  }

  agregarCanal() {
    if(this.canales.findIndex(canal => canal === this.canalAgregar) === -1) {
      let canalAgregar = this.canalAgregar;
      if(canalAgregar[0] != '#') {
        canalAgregar = '#' + canalAgregar;
      }
      this.canales.push(canalAgregar);
      this.canalAgregar = '';
      document.getElementById('canalInput').focus();
    }
  }

  connect() {
    if(this.saveData()) {
      // establecer conexión
    }
  }

  saveData(): boolean {
    if(!this.host || this.host.length < 2) {
      this.error = 'Debe ingresar un server';
      return false;
    }
    if(!this.nick || this.nick.length < 2) {
      this.error = 'Debe ingresar un apodo';
      return false;
    }
    if(!this.nickSecundario || this.nickSecundario.length < 2) {
      this.error = 'Debe ingresar un apodo secundario';
      return false;
    }
    // TODO: save data and load data
    return true;
  }

}

export enum TiposLogin {
  NONE = 'NONE',
  NS = 'NS',
  PASS = 'PASS'
}
