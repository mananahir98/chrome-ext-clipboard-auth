// adding option in right click menu on installation for copy selected content
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyToExtension",
    title: "Copy to MI-Clipboard",
    contexts: ["selection"],
  });
});

// run only once at installation time
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.storage.local.set({ MIswitch: true });
    chrome.storage.local.set({ selected: [] });
    chrome.storage.local.set({ numberOfItemsOnIcon: true });
    chrome.storage.local.set({ saveText: "tooltipClass" });
    chrome.storage.local.set({ positionClass: "topClass" });
    chrome.storage.local.set({ welcomePopup: true });
    chrome.action.setBadgeText({ text: "0" });
  }
  chrome.runtime.onInstalled.removeListener(arguments.callee);
});

// copy content on click of right click menu option
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyToExtension") {
    chrome.tabs.sendMessage(tab.id, { command: "copyToExtension" });
  }
});

// extension badge text of total items
chrome.storage.local.get(["numberOfItemsOnIcon"], function (response) {
  if (response.numberOfItemsOnIcon) {
    chrome.storage.local.get(["selected"], function (result) {
      if (result.selected) {
        chrome.action.setBadgeText({ text: String(result.selected.length) });
      }
    });
  }
});

// on runtime badge will get the message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.badgeText) {
    chrome.action.setBadgeText({ text: message.badgeText });
  }
});

// The initial state of the extension data
let state = { selected: [] };

// onSuspend event and save the extension state
chrome.runtime.onSuspend.addListener(() => {
  chrome.storage.local.set({ state });
});

// Use CSS to set the background color and text color of the badge
chrome.action.setBadgeBackgroundColor({ color: "#ec008c" });
chrome.action.setBadgeTextColor({ color: "#FFFFFF" });

// Define a function to decode base64url-encoded string
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return atob(str);
}

const CLIENT_ID =
  "1043791985536-lb52peuntgt143t2mvusa7e9n02ork82.apps.googleusercontent.com";
const RESPONSE_TYPE = encodeURIComponent("id_token");
const REDIRECT_URI = encodeURIComponent(
  "https://ahaecnodfnnijlacfojnmaaknjnegeem.chromiumapp.org"
);
const SCOPE = encodeURIComponent("openid");
const STATE = encodeURIComponent(
  "meet" + Math.random().toString(36).substring(2, 15)
);
const PROMPT = encodeURIComponent("consent");

let user_signed_in = false;

function is_user_signed_in() {
  return user_signed_in;
}

function create_auth_endpoint() {
  let nonce = encodeURIComponent(
    Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  );

  let openId_endpoint_url = `https://accounts.google.com/o/oauth2/v2/auth
?client_id=${CLIENT_ID}
&response_type=${RESPONSE_TYPE}
&redirect_uri=${REDIRECT_URI}
&scope=${SCOPE}
&state=${STATE}
&nonce=${nonce}
&prompt=${PROMPT}`;

  return openId_endpoint_url;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "login") {
    if (user_signed_in) {
      user_signed_in = true;
      chrome.action.setPopup({ popup: "./popup/auth/afterlogin.html" }, () => {
        sendResponse("success");
      });
    } else {
      chrome.identity.launchWebAuthFlow(
        {
          url: create_auth_endpoint(),
          interactive: true,
        },
        function (redirect_url) {
          if (chrome.runtime.lastError) {
            // problem signing in
          } else {
            let id_token = redirect_url.substring(
              redirect_url.indexOf("id_token=") + 9
            );
            id_token = id_token.substring(0, id_token.indexOf("&"));

            if (id_token !== null && id_token !== "" && id_token) {
              user_signed_in = true;
              chrome.action.setPopup(
                { popup: "./popup/auth/afterlogin.html" },
                () => {
                  sendResponse("success");
                }
              );
            } else {
              console.log("Invalid credentials.");
            }
          }
        }
      );

      return true;
    }
  } else if (request.message === "logout") {
    user_signed_in = false;
    chrome.action.setPopup({ popup: "./popup/public/login.html" }, () => {
      sendResponse("success");
    });

    return true;
  } else if (request.message === "isUserSignedIn") {
    sendResponse(is_user_signed_in());
  }
});
