import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

declare var electronApi;

@Component({
  selector: 'app-electron-cfg',
  templateUrl: './electron-cfg.component.html',
  styleUrls: ['./electron-cfg.component.scss']
})
export class ElectronCFGComponent implements OnInit {

  @Output() oClose: EventEmitter<void> = new EventEmitter<void>();

  gateway: string = environment.gateway;
  logRoute: string;
  originalLogRoute: string;
  saveLogs: boolean;

  public isElectron = environment.electron;

  constructor() { }

  ngOnInit(): void {
    if (this.isElectron) {
      electronApi.getLogRoute();
    }
    if (localStorage.getItem('ignoreLogs')) {
      this.saveLogs = false;
    } else {
      this.saveLogs = true;
    }
  }

  @HostListener('document:logRoute', ['$event'])
  onLogRoute(evt: CustomEvent) {
    this.logRoute = evt.detail;
    this.originalLogRoute = this.logRoute;
  }

  save() {
    if (this.gateway !== environment.gateway) {
      localStorage.setItem('custom-gateway', this.gateway);
      window.location.reload();
    }
    if (this.logRoute !== this.originalLogRoute) {
      electronApi.setLogRoute(this.logRoute);
    }
    if (this.saveLogs) {
      localStorage.removeItem('ignoreLogs');
    } else {
      localStorage.setItem('ignoreLogs', 'true');
    }
    this.oClose.emit();
  }
}
