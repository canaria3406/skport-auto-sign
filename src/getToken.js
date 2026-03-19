/**
 * This script extracts your SK_OAUTH_CRED_KEY.
 * Usage: Open https://game.skport.com/endfield/sign-in, press F12, paste this code into the Console, and press Enter.
 */

(() => {
  const match = document.cookie.match(/(?:^|;)\s*SK_OAUTH_CRED_KEY=([^;]*)/);

  if (!match) {
    alert("❌ Error: SK_OAUTH_CRED_KEY not found. Please ensure you are logged in.");
    return console.error("SK_OAUTH_CRED_KEY missing.");
  }

  const cred = match[1];
  console.log("SK_OAUTH_CRED_KEY:", cred);

  try {
    navigator.clipboard.writeText(cred).then(() => {
      alert("✅ SK_OAUTH_CRED_KEY successfully copied to your clipboard!\n\nYou can now paste it into your Google Apps Script config.");
    }).catch(() => {
      prompt("✅ SK_OAUTH_CRED_KEY found!\nPress Ctrl+C / Cmd+C to copy:", cred);
    });
  } catch (e) {
    prompt("✅ SK_OAUTH_CRED_KEY found!\nPress Ctrl+C / Cmd+C to copy:", cred);
  }
})();
