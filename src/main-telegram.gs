const profiles = [
  {
    account_token: "", // your skport account_token in cookie store
    arknights: true,
    endfield: true,
    language: "en" // english=en 日本語=ja 繁體中文=zh_Hant 简体中文=zh_Hans 한국어=ko Русский=ru_RU
  }
];

const telegram_notify = true
const myTelegramID = ""
const telegramBotToken = ""

/** The above is the config. Please refer to the instructions on https://github.com/canaria3406/skport-auto-sign for configuration. **/
/** The following is the script code. Please DO NOT modify. **/

const urlDict = {
  Endfield: 'https://zonai.skport.com/web/v1/game/endfield/attendance',
  Arknights: 'https://zonai.skport.com/api/v1/game/attendance',
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
    'TE': 'trailers',
  },
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

function generateSign(path, method, headers, query, body, token) {
  let stringToSign = path + (method === "GET" ? (query || "") : (body || ""));
  if (headers.timestamp) stringToSign += headers.timestamp.toString();
  
  const headerObj = {};
  ["platform", "timestamp", "dId", "vName"].forEach(key => {
    if (headers[key]) headerObj[key] = headers[key];
    else if (key === "dId") headerObj[key] = "";
  });
  stringToSign += JSON.stringify(headerObj);
  
  const hmacHex = bytesToHex(Utilities.computeHmacSha256Signature(stringToSign, token));
  return bytesToHex(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, hmacHex, Utilities.Charset.UTF_8));
}

function getAuthData(account_token, arknights_flag, endfield_flag) {
  let authResult = { success: false, cred: null, token: null, tasks: [], error: null };
  try {
    let grantUrl = "https://as.gryphline.com/user/oauth2/v2/grant";
    let grantPayload = { "token": account_token, "appCode": "6eb76d4e13aa36e6", "type": 0 };
    let grantOptions = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(grantPayload),
      "muteHttpExceptions": true
    };
    let grantRes = UrlFetchApp.fetch(grantUrl, grantOptions);
    let grantData = JSON.parse(grantRes.getContentText());
    if (grantData.status !== 0 || !grantData.data || !grantData.data.code) {
      authResult.error = "OAuth failed: " + (grantData.msg || grantRes.getContentText());
      return authResult;
    }
    let oauth_token = grantData.data.code;

    let credUrl = "https://zonai.skport.com/api/v1/user/auth/generate_cred_by_code";
    let credPayload = { "code": oauth_token, "kind": 1 };
    let credOptions = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(credPayload),
      "muteHttpExceptions": true
    };
    let credRes = UrlFetchApp.fetch(credUrl, credOptions);
    let credData = JSON.parse(credRes.getContentText());
    if (credData.code !== 0 || !credData.data || !credData.data.cred) {
      authResult.error = "Cred generation failed: " + (credData.message || credRes.getContentText());
      return authResult;
    }
    authResult.cred = credData.data.cred;
    authResult.token = credData.data.token;

    // Refresh token if not provided in cred response
    if (!authResult.token) {
      let refreshHeaders = Object.assign({}, headerDict.default, {
          "cred": authResult.cred,
          "timestamp": String(Math.floor(Date.now() / 1000)),
          "sk-language": "en"
      });
      let refreshOptions = { method: 'get', headers: refreshHeaders, muteHttpExceptions: true };
      let refreshRes = UrlFetchApp.fetch("https://zonai.skport.com/api/v1/auth/refresh", refreshOptions);
      let refreshData = JSON.parse(refreshRes.getContentText());
      if (refreshData.code === 0 && refreshData.data && refreshData.data.token) {
          authResult.token = refreshData.data.token;
      } else {
          authResult.error = "Token refresh failed: " + refreshRes.getContentText();
          return authResult;
      }
    }

    let bindingUrl = "https://zonai.skport.com/api/v1/game/player/binding";
    let timestamp = String(Math.floor(Date.now() / 1000));
    let bindingHeaders = Object.assign({}, headerDict.default, {
        "cred": authResult.cred,
        "timestamp": timestamp,
        "sk-language": "en"
    });
    bindingHeaders.sign = generateSign("/api/v1/game/player/binding", "GET", bindingHeaders, "", "", authResult.token);
    
    let bindingRes = UrlFetchApp.fetch(bindingUrl, { method: 'get', headers: bindingHeaders, muteHttpExceptions: true });
    let bindingData = JSON.parse(bindingRes.getContentText());
    
    if (bindingData.code === 0 && bindingData.data && bindingData.data.list) {
      let apps = bindingData.data.list;
      for (let i = 0; i < apps.length; i++) {
        let app = apps[i];
        
        if (arknights_flag && app.appCode === "arknights" && app.bindingList) {
          for (let k = 0; k < app.bindingList.length; k++) {
            let b = app.bindingList[k];
            authResult.tasks.push({
              gameName: "Arknights",
              url: urlDict.Arknights,
              path: "/api/v1/game/attendance",
              body: JSON.stringify({ uid: b.uid, gameId: "1" }),
              role: `1_${b.uid}_1`,
              nickName: b.nickName
            });
          }
        }
        
        if (endfield_flag && app.appCode === "endfield" && app.bindingList) {
          for (let k = 0; k < app.bindingList.length; k++) {
            let b = app.bindingList[k];
            let roles = b.roles || [];
            for (let j = 0; j < roles.length; j++) {
              let r = roles[j];
              if (Array.isArray(endfield_flag) && !endfield_flag.includes(parseInt(r.serverId)) && !endfield_flag.includes(r.serverId)) {
                continue;
              }
              authResult.tasks.push({
                gameName: "Endfield",
                url: urlDict.Endfield,
                path: "/web/v1/game/endfield/attendance",
                body: "",
                role: `3_${r.roleId}_${r.serverId}`,
                nickName: r.nickName + " (" + r.serverName + ")"
              });
            }
          }
        }
      }
    } else {
        authResult.error = "Binding list fetch failed: " + bindingRes.getContentText();
        return authResult;
    }
    
    authResult.success = true;
  } catch (e) {
    authResult.error = "Exception: " + e.message;
  }
  return authResult;
}

async function main() {
  let finalMessages = [];
  for (let i = 0; i < profiles.length; i++) {
    finalMessages.push(autoSignFunction(profiles[i], i + 1));
  }
  const skportResp = finalMessages.join('\n\n');
  if (telegram_notify && telegramBotToken && myTelegramID) {
    postWebhook(skportResp);
  }
}

function autoSignFunction(profile, index) {
  const account_token = profile.account_token;
  const arknights = profile.arknights || false;
  const endfield = profile.endfield || false;
  const language = profile.language || "en";
  
  if (!account_token) return `Profile ${index}: No account_token provided.`;
  if (!arknights && !endfield) return `Profile ${index}: No games selected.`;

  const authData = getAuthData(account_token, arknights, endfield);
  if (!authData.success) {
    return `Profile ${index}: ⚠️ Auth Failed! ${authData.error}`;
  }
  if (authData.tasks.length === 0) {
    return `Profile ${index}: No characters found for selected games.`;
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  let responseLines = [`Profile ${index} Check-in completed:`];

  for (const req of authData.tasks) {
    const headers = {
      ...headerDict.default,
      cred: authData.cred,
      "sk-game-role": req.role,
      "sk-language": language,
      timestamp,
    };
    headers.sign = generateSign(req.path, 'POST', headers, '', req.body, authData.token);

    const options = {
      method: 'POST',
      headers: headers,
      muteHttpExceptions: true
    };
    if (req.body) {
      options.payload = req.body;
    }

    const httpResponse = UrlFetchApp.fetch(req.url, options);
    const responseJson = JSON.parse(httpResponse.getContentText());

    if (responseJson.code === 10000) {
      responseLines.push(`[${req.gameName}] ${req.nickName}: ⚠️ Token error/expired!`);
    } else {
      responseLines.push(`[${req.gameName}] ${req.nickName}: ${responseJson.message}`);
    }
  }

  return responseLines.join('\n');
}

function postWebhook(data) {
  let payload = {
    'chat_id': myTelegramID,
    'text': data,
    'disable_web_page_preview': true
  };

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch('https://api.telegram.org/bot' + telegramBotToken + '/sendMessage', options);
}
