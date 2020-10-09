const express = require('express');
const axios = require('axios');
const app = express();
const jsdom = require("jsdom");
const urlParser = require('url');
const schedule = require('node-schedule');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const configs = require('./configs.json');
const fs = require('fs');

const { JSDOM } = jsdom;

const port = 3030;
let urlCache = {};

let rangosCustom = {};
let globalCustom = {};
let avatarCustom = {};


if(!fs.existsSync('./dataStored/rangos-custom.json')) {
    try {
        fs.mkdirSync('./dataStored');
    } catch(e){}
    fs.writeFileSync('./dataStored/rangos-custom.json', '{}');
} else {
    rangosCustom = JSON.parse(fs.readFileSync('./dataStored/rangos-custom.json'));
}
if(!fs.existsSync('./dataStored/global-custom.json')) {
    try {
        fs.mkdirSync('./dataStored');
    } catch(e){}
    fs.writeFileSync('./dataStored/global-custom.json', '{}');
} else {
    globalCustom = JSON.parse(fs.readFileSync('./dataStored/global-custom.json'));
}
if(!fs.existsSync('./dataStored/avatar-custom.json')) {
    try {
        fs.mkdirSync('./dataStored');
    } catch(e){}
    fs.writeFileSync('./dataStored/avatar-custom.json', '{}');
} else {
    avatarCustom = JSON.parse(fs.readFileSync('./dataStored/avatar-custom.json'));
}

const avatarCache = {};

app.use(bodyParser.json({limit: '10mb', extended: true}));

const sitesAllowed = [
    'http://localhost:4200',
    'https://hira.tandilserver.com',
    'http://irc.tandilserver.com:9000',
    'https://web.hira.li'
];

app.all('*', function(req, res, next) {
    if (sitesAllowed.find(sa => sa === req.get('origin'))) {
        res.header("Access-Control-Allow-Origin", req.get('origin'));
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/detail', function(req, res) {
    const url = decodeURIComponent(req.query.url);
    if(urlCache[url]) {
        checkFetching(url).then(response => {
            res.send(response);
        })
    } else {
        const result = {
            error: false,
            title: '',
            favicon: ''
        };
        urlCache[url] = 'fetching';
        console.log('Fetching: ', url);
        axios.get(url).then(r => {
            const dom = new JSDOM(r.data);
            result.title = dom.window.document.title;
            const tq = dom.window.document.head.querySelector('link[rel=icon]');
            let favicon =  tq ? tq.href : undefined;
            if(!favicon) {
                const tq2 = dom.window.document.head.querySelector('link[rel="shortcut icon"]');
                favicon = tq2 ? tq2.href : undefined;
            }
            const urlParsed = urlParser.parse(url);
            const urlBase = urlParsed.protocol + '//' + urlParsed.host;
            if (favicon && favicon.indexOf('http') != 0) {
                favicon = favicon[0] == '/' ? urlBase + favicon : urlBase + '/' + favicon;
            }
            result.favicon = favicon;
            urlCache[url] = result;
            res.send(JSON.stringify(result));
        }).catch(err => {
            console.error(err);
            result.error = true;
            res.send(JSON.stringify(result));
        });
    }
});

app.post('/upload', function(req, res) {
    const image = req.body.image;
    const formData = new FormData();
    formData.append('image', image);
    formData.append('type', 'base64');
    axios({
        method: 'post',
        url: 'https://api.imgur.com/3/upload',
        data: formData,
        headers: {
            'Authorization': 'Client-ID ' + configs.clientID,
            ...formData.getHeaders()
        }
        }).then(function (response) {
            //handle success
            res.send({image: response.data.data.link});
        }).catch(function (response) {
            //handle error
            console.log(response.response.data.data);
            res.send('ERR');
        });
});

app.get('/customr', function(req, res) {
    const user = decodeURIComponent(req.query.usr);
    const channel = decodeURIComponent(req.query.chn);
    if((!rangosCustom[channel] || !rangosCustom[channel][user]) && !globalCustom[user]) {
        res.send({
            exists: false
        });
    } else if (rangosCustom[channel] && rangosCustom[channel][user]) {
        res.send({
            exists: true,
            color: rangosCustom[channel][user].color,
            rango: rangosCustom[channel][user].rango
        });
    } else {
        res.send({
            exists: true,
            color: globalCustom[user].color,
            rango: globalCustom[user].rango
        });
    }
});

app.get('/avatar', function(req, res) {
    const user = decodeURIComponent(req.query.usr);
    if(avatarCache[user]) {
        res.type(avatarCache[user].tdata);
        res.send(avatarCache[user].bdata);
    } else {
        if(avatarCustom[user]) {
            axios.get(avatarCustom[user],{
                responseType: 'arraybuffer'
              }).then(r => {
                avatarCache[user] = {};
                avatarCache[user].bdata = r.data;
                avatarCache[user].tdata = 'image/png';
                res.type(avatarCache[user].tdata);
                res.send(avatarCache[user].bdata);
            });
        } else {
            const avatarURL = 'https://avatars.dicebear.com/api/jdenticon/' + user + '.svg?options[colorful]=1';
            console.log('reading avatar', avatarURL);
            axios.get(avatarURL,{
                // responseType: 'text'
                responseType: 'text'
              }).then(r => {
                avatarCache[user] = {};
                avatarCache[user].bdata = r.data;
                avatarCache[user].tdata = 'image/svg+xml';
                res.type(avatarCache[user].tdata);
                res.send(avatarCache[user].bdata);
            });
        }
    }
});

function checkFetching(url) {
    return new Promise((resolve, reject) => {
        if(urlCache[url] === 'fetching') {
            setTimeout(() => {
                checkFetching(url).then(r => {resolve(r);});
            }, 100);
        } else {
            resolve(urlCache[url]);
        }
    });
}

schedule.scheduleJob('* * * * *', function(){
    console.log('Cleaning memory with ' + Object.entries(urlCache).length + ' objects');
    urlCache = {};
});

app.listen(port, function() {
    console.log('Listen in port ' + port + '!');
});

const irc = require('irc');

const channelUsersPrivileges = {

};

const client = new irc.Client(configs.network, configs.nickServ, {
    channels: configs.initialChannels,
});

client.on('registered', function(){
    client.say('NickServ', 'identify ' + configs.password);
});

client.on('message', function(nick, to, text, message){
    if (to === configs.nickServ) {
        // private message.
        const dataPart = text.trim().split(' ');
        // #channel polsaker r probando #aaa
        if (dataPart[0] == 'ayuda' || dataPart[0] == 'help') {
            client.say(nick, '/hc join #canal | para unir el bot al canal');
            client.say(nick, '/hc #canal userNick r RangoNombre #aaa | dar rango en un canal a un usuario');
            client.say(nick, '/hc userNick g RangoNombre #aaa | dar rango global a un usuario');
            client.say(nick, '/hc owners')
            client.say(nick, '/hc avatar http:/imgur.com/a15q3.png | only png accepted')
        } else if (dataPart[2] == 'r') {
            if(channelUsersPrivileges[dataPart[0]] &&
               (channelUsersPrivileges[dataPart[0]][nick] === '&' || 
                channelUsersPrivileges[dataPart[0]][nick] === '~')) {
                let channel = dataPart[0]; 
                if(dataPart[0][0] == '#') {
                    channel = channel.slice(1);
                }
                if(!rangosCustom[channel]) {
                    rangosCustom[channel] = {};
                }
                rangosCustom[channel][dataPart[1]] = {
                    exists: true,
                    color: dataPart[4] ? dataPart[4] : '#b9b9b9',
                    rango: dataPart[3]
                };
                fs.writeFileSync('./dataStored/rangos-custom.json', JSON.stringify(rangosCustom));
                client.say(nick, 'ok');
            } else {
                if(!channelUsersPrivileges[dataPart[0]]) {
                    client.say(nick, 'No estaba en el canal, prueba de nuevo.');
                    client.join(dataPart[0]);
                } else {
                    client.say(nick, 'No eres admin o founder del canal.');
                }
            }
        } else if (dataPart[1] == 'g') {
            if(configs.bigBoss.find(boss => boss === nick)) {
                const user = dataPart[0];
                globalCustom[user] = {
                    exists: true,
                    color: dataPart[3] ? dataPart[3] : '#b9b9b9',
                    rango: dataPart[2]
                };
                fs.writeFileSync('./dataStored/global-custom.json', JSON.stringify(globalCustom));
                client.say(nick, 'ok');
            } else {
                client.say(nick, 'No te encuentras en la lista de nicks habilitados. ');
            }
        } else if (dataPart[0] == 'owners') {
            client.say(nick, 'Lista de owners: ' + configs.bigBoss)
        } else if (dataPart[0] == 'avatar') {
            const url = dataPart[1];
            const imageLink = /(http(s?):)([\/|.|\w|\s|-])*\.(?:jpg|png)/.exec(url);
            if(imageLink) {
                avatarCustom[nick] = url;
                avatarCache[nick] = undefined;
                fs.writeFileSync('./dataStored/avatar-custom.json', JSON.stringify(avatarCustom));
                client.say(nick, 'Avatar updated.');
            } else {
                client.say(nick, 'Invalid link.');
            }
        } else if (dataPart[0] == 'join' && dataPart[1]) {
            client.join(dataPart[1]);
        }
    }
});

client.on('names', function(channel, nicks) {
    channelUsersPrivileges[channel] = nicks;
})
