import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VcardGetterService {

  constructor(private httpC: HttpClient) { }

  public detailOf(url: string): Observable<LinkDetails> {
    return this.httpC.get<LinkDetails>(environment.toolService + 'detail?url=' + encodeURIComponent(url));
  }
}

export class LinkDetails {
  error: boolean;
  title: string;
  favicon: string;
}
