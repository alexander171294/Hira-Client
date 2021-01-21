import { InfoPanelComponent } from './info-panel/info-panel.component';
import { Subscription } from 'rxjs';
import { IRCoreService } from 'src/app/IRCore/IRCore.service';
import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelData, Quote } from 'src/app/IRCore/services/ChannelData';
import { ChannelsService } from 'src/app/IRCore/services/channels.service';
import { UserInfoService } from 'src/app/IRCore/services/user-info.service';
import { MenuSelectorEvent, MenuType } from 'src/app/sections/menu/menu-selector.event';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  image: string = undefined;
  public message: string;

  private channelName: string;
  public channel: ChannelData = new ChannelData();
  private routeSubscription: Subscription;
  public preventOnScroll: boolean;
  public autoDownLocked: boolean;
  public newMessages: boolean;
  public messageSubscription: Subscription;
  public quote: Quote;

  @ViewChild('infoPanel', {static: true}) appInfoPanel: InfoPanelComponent;

  constructor(private router: Router, route: ActivatedRoute, private chanSrv: ChannelsService, private ircSrv: IRCoreService, private uInfoSrv: UserInfoService) {
    this.routeSubscription = this.router.events.subscribe(d => {
      if(this.channelName != route.snapshot.params.channel) {
        this.channelName = route.snapshot.params.channel;
        this.ngOnInit();
      }
    });
  }

  goDown() {
    const elem = document.getElementById('listMessages');
    this.autoDownLocked = false;
    this.newMessages = false;
    setTimeout(() => {
      this.preventOnScroll = true;
      elem.scrollTo({top: elem.scrollHeight});
      setTimeout(() => {
        this.preventOnScroll = false;
      }, 50);
    }, 100);
  }

  autoGoDown() {
    if(this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.messageSubscription = this.chanSrv.messagesReceived.subscribe(d => {
      if(d.target === this.channelName) {
        this.newMessages = false;
        if(this.autoDownLocked) {
          this.newMessages = true;
          return;
        }
        this.goDown();
      }
    })
  }

  onScroll(evt) {
    if(this.preventOnScroll) {
      return;
    }
    this.autoDownLocked = evt.srcElement.scrollTop + evt.srcElement.clientHeight != evt.srcElement.scrollHeight;
    if(!this.autoDownLocked) {
      this.newMessages = false;
    }
  }

  ngOnInit(): void {
    if(this.channelName) {
      this.channel = this.chanSrv.getChannel(this.channelName);
      MenuSelectorEvent.menuChange.emit({
        type: MenuType.CHANNEL,
        name: this.channelName
      });
    } else if(this.chanSrv.getChannels().length > 0) {
      this.router.navigateByUrl('/chat/' + this.chanSrv.getChannels()[0].name);
    } else {
      this.ircSrv.join('main');
    }
    document.getElementById('messageInput').focus();
    this.appInfoPanel.recalcUsers(this.channel.users);
    this.autoGoDown();
  }

  quotear(q: Quote) {
    this.quote = q;
    document.getElementById('messageInput').focus();
  }

  kp(event) {
    if(event.keyCode === 13) {
      if(this.message?.trim().length > 0) {
        this.send();
      }
    }
  }

  kd(event) {
    // tabulador
    if(event.keyCode == 9) {
      event.stopPropagation();
      event.preventDefault();
      const curPos = event.target.selectionStart;
      const partial = this.message.substr(0, curPos).split(' ');
      const search = partial[partial.length-1];
      const user = this.channel.users.find(user => user.nick.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1);
      const startPos = curPos - search.length;
      this.message = this.message.substr(0, startPos) + user.nick + this.message.substr(curPos);
    }
  }

  send() {
    if(this.quote) {
      this.message = '<'+this.quote.author+'> '+this.quote.quote+' |' + this.message;
      this.quote = undefined;
    }
    this.ircSrv.sendMessageOrCommand(this.message, '#'+this.channelName);
    this.message = '';
    document.getElementById('messageInput').focus();
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.messageSubscription.unsubscribe();
  }
}
