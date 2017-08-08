'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');
const requestHTTP = require('request');
const moment = require('moment');


const SCHEDULE_ACTION = 'schedule';
const TRAFFIC_ACTION = 'traffic';


exports.sillyNameMaker = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
 
  function getSchedule (app) {    
      requestHTTP('https://api-ratp.pierre-grimaud.fr/v3/schedules/bus/120/mairie+de+bry+sur+marne/A', function (error, response, body) {
          let schedules_120 = JSON.parse(body).result.schedules;
        let schedules = [];
            schedules.push(parseInt(schedules_120[0].message.substring(0, 2)));
            schedules.push(parseInt(schedules_120[1].message.substring(0, 2)));
            requestHTTP('https://api-ratp.pierre-grimaud.fr/v3/schedules/bus/210/mairie+de+bry+sur+marne/A', function (error, response, body) {
              let schedules_210 = JSON.parse(body).result.schedules;
          schedules.push(parseInt(schedules_210[0].message.substring(0, 2)));
              schedules.push(parseInt(schedules_210[1].message.substring(0, 2)));
                var result = bubble(schedules);
                app.tell('The bus arrive in ' + result[0] + ' minutes, next bus in ' + result[1]);
          })
      })
  }
  
  function getTraffic (app) {    
          requestHTTP('https://api-ratp.pierre-grimaud.fr/v3/traffic/rers/a', function (error, response, body) {
              let traffic = JSON.parse(body).result
          app.tell(traffic.title + ': ' + traffic.message);
          })
  }
  
  function bubble(arr) {//You need Two Loops for Bubble sort
    for (var i = 0; i < arr.length; i++) {//Outer Loop
     for(var j=0; j < arr.length - 1; j++){//Inner Loop
      if (arr[j] > arr[j + 1]) {
        var a = arr[j]
        var b = arr[j + 1]
        arr[j] = b
        arr[j + 1] = a
       }
     }
    }
    return arr;
  }
  
  let actionMap = new Map();
  actionMap.set(SCHEDULE_ACTION, getSchedule);
  actionMap.set(TRAFFIC_ACTION, getTraffic);

  app.handleRequest(actionMap);
});