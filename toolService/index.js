const express = require('express');
const axios = require('axios');
const app = express();
const jsdom = require("jsdom");
const urlParser = require('url');
const schedule = require('node-schedule');

const { JSDOM } = jsdom;

const port = 3030;
let urlCache = {};


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", 'http://localhost:4200');
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
            let favicon = dom.window.document.head.querySelector('link[rel=icon]')?.href;
            if(!favicon) {
                favicon = dom.window.document.head.querySelector('link[rel="shortcut icon"]')?.href;
            }
            const urlParsed = urlParser.parse(url);
            const urlBase = urlParsed.protocol + '//' + urlParsed.host;
            if (favicon.indexOf('http') != 0) {
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