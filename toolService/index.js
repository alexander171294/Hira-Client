const express = require('express');
const axios = require('axios');
const app = express();
const jsdom = require("jsdom");
const urlParser = require('url');
const schedule = require('node-schedule');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const imgur = require('./imgur.json');

const { JSDOM } = jsdom;

const port = 3030;
let urlCache = {};

app.use(bodyParser.json({limit: '10mb', extended: true}));

const sitesAllowed = [
    'http://localhost:4200',
    'https://hira.tandilserver.com',
    'http://irc.tandilserver.com:9000'
]

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
            'Authorization': 'Client-ID ' + imgur.clientID,
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
    console.log('getCMR', user);
    const channel = decodeURIComponent(req.query.chn);
    console.log('Getting custom rango of ', user, 'for channel: ', channel);
    res.send({
        exists: user === 'TztWS',
        color: 'red',
        rango: 'rango'
    });
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