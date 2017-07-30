/*jshint esversion: 6 */

const ping = require('ping');
const spawn = require('child_process').spawn;
let Observable = require('rxjs').Observable;

/**
 * Frequency to check internet connectecion in miliseconds
 * @type {Number}
 */
const frequency = 10000; //10 seconds

/**
 * A flag to know if the internet ok notification was made
 */
let notifyInternetOk = false;

let notificationsCount = 0;

/**
 * How many times we notify when the internet is ok
 */
const NotificationsInternetOkQuantity = 3;

// Subscribe to listen the ping responses
Observable.interval(frequency)
  // Every 10 seconds (for ex) we will make a ping to google
  .flatMap( () => Observable.fromPromise(ping.promise.probe('8.8.8.8')) )
  .subscribe( res => {

    // There is internet
    if (res.alive === true)
      thereIsInternet(res.time);
    // No internet
    else
      thereIsNOInternet();
});

/**
 * Execute this function when we have internet
 *
 * @param time the time of the package took to arrive
 */
function thereIsInternet(time) {

  // Emit a sound "internet OK" only 3 times, once spoken, just print
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

/**
 * Execute this function when we have NOT internet
 *
 * Here we send 10 ping packages very fast and if that package
 */
function thereIsNOInternet() {

  // Take only 10 ping responses
  let takeOnly = 10;

  // Expresed on percentage, the rate of package lost to consider than there is no internet
  let noInternetRate = 60;

  notifyInternetOk = false;

  // That +3 is to get sure that all this packages are sent before the next internet checker interval is made
  Observable.interval(frequency/(takeOnly+3) )
    // make ping
    .flatMap( () => Observable.fromPromise(ping.promise.probe('8.8.8.8')) )
    // take only 10
    .take( takeOnly )
    // Just count how many times the ping could not complete the journey
    .reduce( (lostPackages, res) => {
      // Count one if the response is false
      if(res.alive === false)
        return ++lostPackages;
    }, 0 )
    // Filter only when the lost packages are greater than the noInternetRate
    .filter( lostPackages => (lostPackages*100/takeOnly) >= noInternetRate )
    .subscribe( () => {
      console.log('NO INTERNET!');
      spawn('espeak',['fucking maduro'])
    });
}