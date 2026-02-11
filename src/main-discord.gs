const profiles = [
  {
    SK_OAUTH_CRED_KEY: "", // your skport SK_OAUTH_CRED_KEY in cookie
    id: "", // your Endfield game id
    server: "2", // Asia=2 Americas/Europe=3
    language: "en", // english=en 日本語=ja 繁體中文=zh_Hant 简体中文=zh_Hans 한국어=ko Русский=ru_RU
    accountName: "YOUR NICKNAME"
  }
];

const discord_notify = true
const myDiscordID = ""
const discordWebhook = ""

/** The above is the config. Please refer to the instructions on https://github.com/canaria3406/skport-auto-sign for configuration. **/
/** The following is the script code. Please DO NOT modify. **/

const urlDict = {
  Endfield: 'https://zonai.skport.com/web/v1/game/endfield/attendance',
};

const headerDict = {
  default: {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
    'Referer': 'https://game.skport.com/',
    'platform': '3',
    'vName': '1.0.0',
    'Origin': 'https://game.skport.com',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'Priority': 'u=0',
    'Content-Length': '0',
    'TE': 'trailers',
  },
}

async function main() {
  const messages = profiles.map(autoSignFunction);
  const skportResp = `${messages.join('\n\n')}`;
  if (discord_notify && discordWebhook) {
    postWebhook(skportResp);
  }
}

function discordPing() {
  return myDiscordID ? `<@${myDiscordID}> ` : '';
}

function autoSignFunction({
  SK_OAUTH_CRED_KEY,
  id,
  server,
  language = "en",
  accountName
}) {
  const urlsnheaders = [];

  urlsnheaders.push({ 
    url: urlDict.Endfield, 
    headers: { ...headerDict["default"], "cred": SK_OAUTH_CRED_KEY, "sk-game-role": `3_${id}_${server}`, "sk-language": language, "timestamp": String(Math.floor(Date.now() / 1000)) }
  });

  const options = {
    method: 'POST',
    muteHttpExceptions: true,
  };

  let response = `Check-in completed for ${accountName}`;
  var sleepTime = 0
  const httpResponses = []
  for (const urlnheaders of urlsnheaders) {
    Utilities.sleep(sleepTime);
    httpResponses.push(UrlFetchApp.fetch(urlnheaders.url, { ...options, headers: urlnheaders.headers }));
    sleepTime = 1000;
  }

  for (const [i, skportResponse] of httpResponses.entries()) {
    const responseJson = JSON.parse(skportResponse.getContentText());
    const checkInResult = responseJson.message;
    const gameName = Object.keys(urlDict).find(key => urlDict[key] === urlsnheaders[i].url)?.replace(/_/g, ' ');
    const isError = checkInResult != "OK";
    response += `\n${gameName}: ${isError ? discordPing() : ""}${checkInResult}`;
  }

  return response;
}

function postWebhook(data) {
  let payload = JSON.stringify({
    'username': 'auto-sign',
    'avatar_url': 'https://i.imgur.com/TguAOiA.png',
    'content': data
  });

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(discordWebhook, options);
}
