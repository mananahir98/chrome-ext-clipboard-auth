var cp = "";

const closeButton = document.querySelector(".buttonClass");
const copyItems = document.querySelector(".badgeCheckbox");
const radioButtons = document.querySelectorAll(".radio_PositionClass");
const saveTextRadioButtons = document.querySelectorAll(".radio_SaveTextClass");
const checkAuth = chrome.storage.local
  .get(["is_user_signed_in"])
  .then((result) => {
    console.log("Value currently is " + result.key);
    return result.is_user_signed_in;
  });

// getting selected text
function getSelectionText() {
  if (window.getSelection) {
    return window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    return document.selection.createRange().text;
  } else {
    return;
  }
}

// replace special characters into string
function escapeHtml(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// getting copied text time
function getTime() {
  var today = new Date();
  var date =
    today.getMonth() + 1 + "-" + today.getDate() + "-" + today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return date + " " + time;
}

// generating tooltip on selected text
const uniqueButton = document.createElement("div");
uniqueButton.classList.add("mi-tooltip");
uniqueButton.id = "uniqueButton";
uniqueButton.innerText = "Copy to MI Clipboard";

// settings default values on window load
window.onload = function () {
  let elementData;
  chrome.storage.local.get(["numberOfItemsOnIcon"], function (result) {
    elementData = document.getElementById("checkboxClass");
    if (
      result.numberOfItemsOnIcon === undefined ||
      result.numberOfItemsOnIcon === null
    ) {
      chrome.storage.local.set({ numberOfItemsOnIcon: true });
      document.getElementById("checkboxClass").checked = true;
    }
    if (elementData) {
      document.getElementById("checkboxClass").checked =
        result.numberOfItemsOnIcon;
    }
  });

  chrome.storage.local.get(["saveText"], function (result) {
    elementData = document.getElementById(result.saveText);
    if (result.saveText === "" || result.saveText === null) {
      chrome.storage.local.set({ saveText: "tooltipClass" });
      document.getElementById("tooltipClass").checked = true;
    }
    if (elementData) {
      if (result.saveText) {
        document.getElementById(result.saveText).checked = true;
      } else {
        document.getElementById("tooltipClass").checked = true;
      }
    }
  });

  chrome.storage.local.get(["positionClass"], function (result) {
    elementData = document.getElementById(result.positionClass);
    if (result.positionClass === "" || result.positionClass === null) {
      chrome.storage.local.set({ positionClass: "topClass" });
      document.getElementById("topClass").checked = true;
    }
    if (elementData) {
      if (result.positionClass) {
        document.getElementById(result.positionClass).checked = true;
      } else {
        document.getElementById("topClass").checked = true;
      }
    }
  });
};

// added data while click on right click menu option
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const text = getSelectionText();
  sendResponse("Message received");
  if (message.command) {
    if (text.trim() !== "") {
      chrome.storage.local.get(["selected"], function (result) {
        let filteredResults = [];
        if (result.selected.length > 0) {
          filteredResults = result.selected.filter((value) => {
            return value.val
              .toLowerCase()
              .includes(escapeHtml(text).toLowerCase());
          });
        }

        if (filteredResults.length === 0 || result.selected.length === 0) {
          let sendText = result.selected || [];
          sendText.push({
            id: Math.floor(100000000 + Math.random() * 900000000),
            val: escapeHtml(text),
            urlLink: location.href,
            CopiedTime: getTime(),
            fav: false,
          });
          chrome.storage.local.set({ selected: sendText }, function () {
            chrome.storage.local.get(
              ["numberOfItemsOnIcon"],
              function (result) {
                if (result.numberOfItemsOnIcon) {
                  chrome.runtime.sendMessage({
                    badgeText: String(sendText.length),
                  });
                }
              }
            );
          });
        }
      });
    }
  }
});

// coping text with tooltip click
uniqueButton.addEventListener("click", function () {
  const textarea = document.createElement("textarea");
  document.body.appendChild(textarea);
  textarea.value = cp;
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(textarea);
  uniqueButton.style.display = "none";

  chrome.storage.local.get(["selected"], function (result) {
    if (cp.trim() === "") return;
    let filteredResults = [];
    if (result.selected.length > 0) {
      filteredResults = result.selected.filter((value) => {
        return value.val.toLowerCase().includes(escapeHtml(cp).toLowerCase());
      });
    }

    if (filteredResults.length === 0 || result.selected.length === 0) {
      let sendText = result.selected || [];
      sendText.push({
        id: Math.floor(100000000 + Math.random() * 900000000),
        val: escapeHtml(cp),
        urlLink: location.href,
        CopiedTime: getTime(),
        fav: false,
      });
      chrome.storage.local.set({ selected: sendText }, function () {
        chrome.storage.local.get(["numberOfItemsOnIcon"], function (result) {
          if (result.numberOfItemsOnIcon) {
            chrome.runtime.sendMessage({ badgeText: String(sendText.length) });
          }
        });
      });
    }
  });
});

// text will be copied with Ctrl+c key event
document.addEventListener("keydown", function (event) {
  chrome.storage.local.get(["MIswitch"], function (switchResult) {
    chrome.storage.local.get(["saveText"], function (result) {
      if (
        switchResult.MIswitch === true &&
        result.saveText === "ctrl+cClass" &&
        (event.ctrlKey || event.metaKey) &&
        event.key === "c"
      ) {
        const text = getSelectionText();
        if (text.trim() !== "") {
          chrome.storage.local.get(["selected"], function (result) {
            let filteredResults = [];
            if (result.selected.length > 0) {
              filteredResults = result.selected.filter((value) => {
                return value.val
                  .toLowerCase()
                  .includes(escapeHtml(text).toLowerCase());
              });
            }

            if (filteredResults.length === 0 || result.selected.length === 0) {
              let sendText = result.selected || [];
              sendText.push({
                id: Math.floor(100000000 + Math.random() * 900000000),
                val: escapeHtml(text),
                urlLink: location.href,
                CopiedTime: getTime(),
                fav: false,
              });
              chrome.storage.local.set({ selected: sendText }, function () {
                chrome.storage.local.get(
                  ["numberOfItemsOnIcon"],
                  function (result) {
                    if (result.numberOfItemsOnIcon) {
                      chrome.runtime.sendMessage({
                        badgeText: String(sendText.length),
                      });
                    }
                  }
                );
              });
            }
          });
        }
      }
    });
  });
});

// tooltip possition as per selection from settings
document.addEventListener("mouseup", function () {
  chrome.storage.local.get(["MIswitch"], function (switchResult) {
    chrome.storage.local.get(["saveText"], function (result) {
      const text = getSelectionText();
      if (
        switchResult.MIswitch === true &&
        text &&
        result.saveText === "tooltipClass"
      ) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        var styleElem = document.head.appendChild(
          document.createElement("style")
        );
        document.body.appendChild(uniqueButton);
        uniqueButton.classList.add("show");
        uniqueButton.style.display = "block";

        chrome.storage.local.get(["positionClass"], function (result) {
          if (result.positionClass === "topClass") {
            uniqueButton.style.top =
              rect.top -
              8 +
              window.pageYOffset -
              uniqueButton.offsetHeight +
              "px";
            uniqueButton.style.left =
              rect.left +
              window.pageXOffset -
              uniqueButton.offsetWidth / 2 +
              rect.width / 2 +
              "px";
            styleElem.innerHTML =
              ".mi-tooltip:after {top: 32px; left: 46%; transform: rotate(0deg)}";
          }
          if (result.positionClass === "bottomClass") {
            uniqueButton.style.top =
              rect.bottom -
              22 +
              window.pageYOffset +
              uniqueButton.offsetHeight +
              "px";
            uniqueButton.style.left =
              rect.left +
              window.pageXOffset -
              uniqueButton.offsetWidth / 2 +
              rect.width / 2 +
              "px";
            styleElem.innerHTML =
              ".mi-tooltip:after {top: -14px; left: 52%; transform: rotate(180deg)}";
          }
          if (result.positionClass === "rightClass") {
            uniqueButton.style.top =
              rect.bottom +
              window.pageYOffset -
              uniqueButton.offsetHeight +
              "px";
            uniqueButton.style.left = rect.left + rect.width + 10 + "px";
            styleElem.innerHTML =
              ".mi-tooltip:after {top: 8.5px; left: -8px; transform: rotate(90deg)}";
          }
          if (result.positionClass === "leftClass") {
            uniqueButton.style.top =
              rect.bottom +
              window.pageYOffset -
              uniqueButton.offsetHeight +
              "px";
            uniqueButton.style.left =
              rect.left -
              10 +
              window.pageXOffset -
              uniqueButton.offsetWidth +
              "px";
            styleElem.innerHTML =
              ".mi-tooltip:after {top: 8px; left: 103%; transform: rotate(-90deg)}";
          }
        });
        uniqueButton.style.background = "black";
        cp = text;
      } else {
        uniqueButton.style.display = "none";
      }
    });
  });
});

// disable tooltip position options while tooltip option is not selected
for (let i = 0; i < saveTextRadioButtons.length; i++) {
  saveTextRadioButtons[i].addEventListener("click", function () {
    if (saveTextRadioButtons[i].checked) {
      for (let j = 0; j < radioButtons.length; j++) {
        if (saveTextRadioButtons[i].id === "ctrl+cClass") {
          radioButtons[j].setAttribute("disabled", true);
          radioButtons[j].style.cursor = "default";
        } else {
          radioButtons[j].removeAttribute("disabled");
          radioButtons[j].style.cursor = "pointer";
        }
      }
    }
  });
}

// Save data of settings and close settings
if (closeButton !== null) {
  closeButton.addEventListener("click", function () {
    // number of items to be displayed on extension logo while user allowed to display it from settings
    chrome.storage.local.set({ numberOfItemsOnIcon: copyItems.checked });
    if (copyItems.checked === false) {
      chrome.action.setBadgeText({ text: "" });
    }
    if (copyItems.checked === true) {
      chrome.storage.local.get(["selected"], function (result) {
        if (result.selected) {
          chrome.action.setBadgeText({ text: String(result.selected.length) });
        }
      });
    }

    // setting the option for the copy text in clipboard
    for (let i = 0; i < saveTextRadioButtons.length; i++) {
      if (saveTextRadioButtons[i].checked) {
        chrome.storage.local.set(
          { saveText: saveTextRadioButtons[i].id },
          function () {}
        );
      }
    }

    // setting the position of tooltip
    for (let i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        chrome.storage.local.set(
          { positionClass: radioButtons[i].id },
          function () {}
        );
      }
    }

    // close the settings window
    setTimeout(() => {
      window.close();
    }, 10);
  });
}
