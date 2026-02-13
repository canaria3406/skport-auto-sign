/**
 * This function retrieves the token from the skport check-in page.
 * To use this function, open the skport check-in page, press F12 to enter the console, paste the code, and run it.
 * Visit: https://game.skport.com/endfield/sign-in
 */

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

let cred = 'Error';
if (document.cookie.includes('SK_OAUTH_CRED_KEY=')) {
  cred = `${getCookie('SK_OAUTH_CRED_KEY')}`;
}

let ask = confirm(cred + '\n\nPress enter, then paste the token into your Google Apps Script Project');
let msg = ask ? cred : 'Cancel';
console.log('SK_OAUTH_CRED_KEY:');
console.log(msg);

let token = 'Error';
if (localStorage.getItem('SK_TOKEN_CACHE_KEY')) {
  token = localStorage.getItem('SK_TOKEN_CACHE_KEY');
}

let ask2 = confirm(token + '\n\nPress enter, then paste the token into your Google Apps Script Project');
let msg2 = ask2 ? token : 'Cancel';
console.log('SK_TOKEN_CACHE_KEY:');
console.log(msg2);
