/*jshint esversion: 6 */

const ping = require('ping');
const spawn = require('child_process').spawn;
let Observable = require('rxjs').Observable;

/**
 * Frequency to check internet connectecion in miliseconds
 * @type {Number}
 */
const frequency = 10000; //10 seconds

let notifyInternetOk = false;
let notificationsCount = 0;
const NotificationsInternetOkQuantity = 3;

let internetObserver = Observable.interval(frequency)
  .flatMap( i => Observable.fromPromise(ping.promise.probe('8.8.8.8'))
  );

internetObserver.subscribe( res => {
  if (res.alive === true) {
    // If all the notifications have not been sent
    if (!notifyInternetOk){
      spawn('espeak',['Internet OK']);
      notificationsCount++;
      if (notificationsCount >= NotificationsInternetOkQuantity) {
        notifyInternetOk = true;
        notificationsCount = 0;
      }
    }
    console.log(`Intenet connection OK! Response time=${res.time}ms`);
  }
  else{
    notifyInternetOk = false;
    spawn('espeak',['fucking maduro']);
  }
});