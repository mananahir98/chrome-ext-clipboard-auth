document.querySelector("#sign-out").addEventListener("click", function () {
  chrome.storage.local.set({ is_user_signed_in: false });
  chrome.runtime.sendMessage({ message: "logout" }, function (response) {
    if (response === "success") window.close();
  });
});

document.querySelector("button").addEventListener("click", function () {
  chrome.runtime.sendMessage(
    { message: "isUserSignedIn" },
    function (response) {
      alert(response);
    }
  );
});

var maxLines = 3;
var gotarray = [];
var time = [];
let favBool = false;
let favValue = [];
let selectAllSubCheckbox = [];
let searchedText = "";
let isSearched = false;
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const mainSwitch = document.getElementById("MiSwitch");
const favAllToggle = document.querySelectorAll("#dataButton");
const favButton = document.querySelector(".fav-button");
const allButton = document.querySelector(".all-button");
const selectAllCheckbox = document.getElementById("allSelect");
const otherCheckboxes = document.getElementsByClassName("other-checkbox");
const removeAllButton = document.querySelector(".eraser-button");
const saveURL = document.querySelector(".button-url");
const searchInput = document.getElementById("searchValue");
const closeSearch = document.querySelector(".close-search");

// escape html needs to be used to format text which is getting copied otherwise html text if get copy will append as html
function escapeHtml(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// for getting the current time at which text get copied
function getTime() {
  var today = new Date();
  var date =
    today.getMonth() + 1 + "-" + today.getDate() + "-" + today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return date + " " + time;
}

// Welcome popup
const welcomePopup = document.querySelector(".welcome-popup-div");
const closeButton = document.querySelector(".close-popup");
closeButton.addEventListener("click", () => {
  welcomePopup.style.display = "none";
  chrome.storage.local.set({ welcomePopup: false }, function () {});
});

// setting value in switch toggle
chrome.storage.local.get("MIswitch", function (result) {
  mainSwitch.checked = result.MIswitch;
});

// event listner for turn on and off code which set even in local storage
mainSwitch.addEventListener("click", function () {
  chrome.storage.local.set({ MIswitch: mainSwitch.checked });
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { isChecked: mainSwitch.checked });
  });
});

// handle select all checkbox selection
window.addEventListener("load", function () {
  selectAllCheckbox.addEventListener("click", function () {
    if (selectAllCheckbox.checked === true) {
      for (let i = 0; i < otherCheckboxes.length; i++) {
        otherCheckboxes.item(i).checked = true;
        selectAllSubCheckbox.push(otherCheckboxes[i]);
      }
      removeAllButton.style.cursor = "pointer";
      removeAllButton.style.pointerEvents = "auto";
      removeAllButton.style.opacity = 1;
    } else {
      for (let i = 0; i < otherCheckboxes.length; i++) {
        otherCheckboxes.item(i).checked = false;
        selectAllSubCheckbox.splice(otherCheckboxes[i]);
      }
      removeAllButton.style.cursor = "default";
      removeAllButton.style.pointerEvents = "none";
      removeAllButton.style.opacity = 0.5;
    }
  });

  if (selectAllSubCheckbox.length === 0) {
    selectAllCheckbox.checked = false;

    removeAllButton.style.cursor = "default";
    removeAllButton.style.pointerEvents = "none";
    removeAllButton.style.opacity = 0.5;
  }
});

// handling single chcekbox selection
const handleCheckBoxEvent = () => {
  let isAllSelected = true;
  for (let i = 0; i < otherCheckboxes.length; i++) {
    if (otherCheckboxes[i].checked) {
      selectAllSubCheckbox.push(otherCheckboxes[i]);
    } else {
      isAllSelected = false;
      selectAllSubCheckbox = selectAllSubCheckbox.filter((e) => e.checked);
    }
  }
  if (!isSearched) {
    selectAllCheckbox.checked = isAllSelected;
  }
  if (selectAllSubCheckbox.length > 0) {
    removeAllButton.style.cursor = "pointer";
    removeAllButton.style.pointerEvents = "auto";
    removeAllButton.style.opacity = 1;
    return;
  }

  removeAllButton.style.cursor = "default";
  removeAllButton.style.pointerEvents = "none";
  removeAllButton.style.opacity = 0.5;
};

// template which get append one by one and list are seen in extension
// craete checkbox
function createCheckBox(id) {
  const checkDiv = document.createElement("div");
  checkDiv.className = "checkbox-container";

  const check = document.createElement("input");
  check.className = "other-checkbox";
  check.type = "checkbox";
  check.addEventListener("click", handleCheckBoxEvent);
  check.setAttribute("data-id", id);

  checkDiv.appendChild(check);
  return checkDiv;
}

// create p tag for value and time
function createPTag(p) {
  const para = document.createElement("p");
  para.className = p.className || "";
  para.innerHTML = p.text || "";
  para.id = p.id || "";
  return para;
}

// create button
function createButton(btn) {
  const actionBtn = document.createElement("button");
  actionBtn.id = btn.id;
  actionBtn.className = btn.className;
  actionBtn.setAttribute("data-tooltip", btn.dataTooltip);
  actionBtn.setAttribute("data-id", btn.dataId);
  return actionBtn;
}

// create object footer (buttons)
function createNoteFooter(note, index) {
  const starPath = note.fav
    ? `../../assets/Icons/starFilled.png`
    : `../../assets/Icons/star.png`;

  const noteButtons = document.createElement("div");
  noteButtons.className = "note-buttons";

  const actionButton = document.createElement("div");
  actionButton.className = "action-button";

  const paraAttr = {
    text: time && time[index - 1],
    id: note.id,
  };
  const timePara = createPTag(paraAttr);

  const actionBtnAttr = {
    copy: {
      id: "copyButton",
      className: "icon-copy copyButton leftTooltip-before leftTooltip-after",
      dataTooltip: "Copy",
      dataId: note.id,
    },
    star: {
      id: "starButton",
      className: "starButton leftTooltip-before leftTooltip-after",
      dataTooltip: "Favorite",
      dataId: note.id,
    },
    trash: {
      id: "getButton",
      className: "icon-trash getButton leftTooltip-before leftTooltip-after",
      dataTooltip: "Remove",
      dataId: note.id,
    },
  };

  const copyButton = createButton(actionBtnAttr.copy);
  const starButton = createButton(actionBtnAttr.star);
  const trashButton = createButton(actionBtnAttr.trash);

  copyButton.innerHTML = `<img src="../../assets/Icons/copy-clipboard.png" alt="copy" class="svg-inline--fa fa-copy fa-w-14" width="15" height="15" />`;
  starButton.innerHTML = `<img data-id=${note.id} id="starImg" src=${starPath} alt="star" class="svg-inline--fa fa-star fa-w-14" width="15" height="15" />`;
  trashButton.innerHTML = `<img src="../../assets/Icons/trash.png" alt="Remove" class="svg-inline--fa fa-trash fa-w-14" width="15" height="15" />`;

  actionButton.appendChild(copyButton);
  actionButton.appendChild(starButton);
  actionButton.appendChild(trashButton);

  noteButtons.appendChild(timePara);
  noteButtons.appendChild(actionButton);
  return noteButtons;
}

// merging all elements together
function createBoxContainer(note, indexCount) {
  const noteContainer = document.createElement("div");
  noteContainer.className = "note-container";
  noteContainer.setAttribute("data-index", indexCount);
  noteContainer.setAttribute("data-id", note.id);

  const box = document.createElement("div");
  box.className = "note-text";

  const textValueCopy = document.createElement("div");
  textValueCopy.className = "text-value-copy";

  const countWrapper = document.createElement("div");
  countWrapper.className = "note-count-wrapper";

  countWrapper.appendChild(createCheckBox(note.id));
  countWrapper.appendChild(
    createPTag({ text: note.val, className: "note-text-value" })
  );
  textValueCopy.appendChild(countWrapper);
  box.appendChild(textValueCopy);

  noteContainer.innerHTML = "";
  noteContainer.appendChild(box);
  noteContainer.appendChild(createNoteFooter(note, indexCount));
  return noteContainer;
}

// copied button for text which is used
const copyButtonEvents = () => {
  document.querySelectorAll(".copyButton").forEach((ele) => {
    ele.addEventListener("click", (event) => {
      const noteContainer = event.target.closest(".note-container");
      const noteText = noteContainer.querySelector(".note-text p").innerText;

      navigator.clipboard
        .writeText(noteText)
        .then(() => {
          ele.setAttribute("data-tooltip", "Copied");
          ele.setAttribute("value", "Copied");
          ele.style.color = "#EDC021";
        })
        .catch((error) => {
          console.error(`Error copying text to clipboard: ${error}`);
        });
    });

    ele.addEventListener("mouseenter", () => {
      if (ele.getAttribute("data-tooltip") !== "Copied") {
        ele.setAttribute("data-tooltip", "Copy");
        ele.setAttribute("value", "Copy");
        ele.style.color = "#9CA6BB";
      }
    });

    ele.addEventListener("mouseleave", () => {
      if (ele.getAttribute("data-tooltip") === "Copied") {
        ele.setAttribute("data-tooltip", "Copy");
        ele.setAttribute("value", "Copy");
        ele.style.color = "#9CA6BB";
      }
    });
  });
};

// star button to fav or unfav
function starButtonEvents(dataList) {
  const starButtons = document.querySelectorAll("#starButton", "#starImg");
  starButtons.forEach((starButton) => {
    starButton.addEventListener("click", (event) => {
      const index = event.target.dataset.id;
      const updatedData = dataList.map((response) => {
        if (parseInt(response.id) === parseInt(index)) {
          response.fav = !response.fav;
        }
        return response;
      });

      chrome.storage.local.set({ selected: updatedData }, function () {
        setArray(updatedData);
      });
    });
  });
}

// delete function to remove from list and even local storage
const del = (i) => {
  chrome.storage.local.get(["selected"], function (result) {
    let updatedItems = result.selected.filter(
      (response) => parseInt(response.id) !== parseInt(i)
    );
    setDataToLocal(updatedItems);
    chrome.action.setBadgeText({ text: String(updatedItems.length) });
    searchInput.value = "";
    closeSearch.style.display = "none";
  });
};

// this below code remove the item from list with animaiton
const deleteButtonEvents = () => {
  const element = document.querySelectorAll(".getButton");
  element.forEach((ele) => {
    ele.addEventListener("click", (event) => {
      const clickedElement = event.target.closest(".note-container");
      const index = clickedElement.dataset.id;
      const clickedElements = document.querySelector(`[data-id="${index}"]`);
      clickedElements.classList.add("deleted");
      setTimeout(() => {
        clickedElements.style.height = "0";
        clickedElements.style.padding = "0";
        clickedElements.style.margin = "0";
        setTimeout(() => {
          del(index);
          clickedElements.style.display = "none";
          clickedElement.remove();
        }, 200);
      }, 300);
    });
  });
};

favAllToggle.forEach((element) => {
  element.addEventListener("click", function (e) {
    if (e.target.value === "All") {
      favBool = false;
      setArray(gotarray);
    } else {
      favBool = true;
      setArray(gotarray);
    }
  });
});

// handling tab data and active
const setArray = (dataList) => {
  gotarray = dataList;
  displayTime(gotarray);
  var returnValue = "";
  var appendList = document.getElementById("main-note-wrapper");
  var indexCount = 0;

  appendList.innerHTML = "";

  favAllToggle.forEach((element) => {
    if (isSearched && gotarray.length > 0) {
      gotarray = gotarray.filter((value) => {
        let ignoreCase = value.val.toLowerCase();
        return ignoreCase.includes(searchedText);
      });
    }

    if (favBool === false && element.value === "All") {
      element.classList.add("active");

      removeAllButton.style.cursor = "default";
      removeAllButton.style.pointerEvents = "none";
      removeAllButton.style.opacity = 0.5;
      selectAllCheckbox.checked = false;

      var returnTotalValue = "";
      var appendTotal = document.getElementById("totalDiv");
      returnTotalValue += totalItems(gotarray);
      appendTotal.innerHTML = returnTotalValue;

      saveURL.style.display = "flex";
      appendList.innerHTML = "";

      if (gotarray.length > 0) {
        displayTime(gotarray);
        for (let i = gotarray.length - 1; i >= 0; i--) {
          const note = gotarray[i];
          indexCount += 1;
          appendList.appendChild(createBoxContainer(note, indexCount));
        }
      } else {
        returnValue += `<p class="nodata-found">Saved text snippits will appear here!</p>`;
        appendList.innerHTML = returnValue;
      }

      const copiedValue = document.querySelectorAll(".note-text-value");

      copiedValue.forEach((element) => {
        const lineHeight = parseInt(
          window.getComputedStyle(element).lineHeight,
          10
        );
        const maxHeight = maxLines * lineHeight;
        const hasOverflow = element.scrollHeight > maxHeight;

        if (hasOverflow) {
          element.style.maxHeight = maxHeight + "px";
          element.style.webkitLineClamp = maxLines;

          const readMoreButton = document.createElement("p");
          readMoreButton.classList.add("read-more");
          readMoreButton.textContent = "Read More";

          readMoreButton.addEventListener("click", () => {
            if (readMoreButton.textContent === "Read Less") {
              element.style.maxHeight = maxHeight + "px";
              element.style.webkitLineClamp = maxLines;
              readMoreButton.textContent = "Read More";
            } else {
              element.style.maxHeight = null;
              element.style.webkitLineClamp = null;
              element.style.transition = "all 5s ease";
              readMoreButton.textContent = "Read Less";
            }
          });

          element.parentElement.parentElement.parentElement.appendChild(
            readMoreButton
          );
        }
      });

      deleteButtonEvents();
      copyButtonEvents();
      starButtonEvents(gotarray);
    }

    if (favBool && element.value === "All") {
      element.classList.remove("active");
    }

    if (favBool && element.value === "Fav") {
      element.classList.add("active");

      favValue = gotarray.filter((value) => {
        if (value.fav) {
          return gotarray;
        }
      });

      removeAllButton.style.cursor = "default";
      removeAllButton.style.pointerEvents = "none";
      removeAllButton.style.opacity = 0.5;
      selectAllCheckbox.checked = false;

      var returnTotalValue = "";
      var appendTotal = document.getElementById("totalDiv");
      returnTotalValue += totalItems(favValue);
      appendTotal.innerHTML = returnTotalValue;

      saveURL.style.display = "none";
      appendList.innerHTML = "";

      if (favValue.length > 0) {
        displayTime(favValue);
        for (let i = favValue.length - 1; i >= 0; i--) {
          const note = favValue[i];
          indexCount += 1;
          appendList.appendChild(createBoxContainer(note, indexCount));
        }
      } else {
        returnValue += `<p class="nodata-found">Favorite text snippits will appear here!</p>`;
        appendList.innerHTML = returnValue;
      }

      const copiedValue = document.querySelectorAll(".note-text-value");

      copiedValue.forEach((element) => {
        const lineHeight = parseInt(
          window.getComputedStyle(element).lineHeight,
          10
        );
        const maxHeight = maxLines * lineHeight;
        const hasOverflow = element.scrollHeight > maxHeight;

        if (hasOverflow) {
          element.style.maxHeight = maxHeight + "px";
          element.style.webkitLineClamp = maxLines;

          const readMoreButton = document.createElement("p");
          readMoreButton.classList.add("read-more");
          readMoreButton.textContent = "Read More";

          readMoreButton.addEventListener("click", () => {
            if (readMoreButton.textContent === "Read Less") {
              element.style.maxHeight = maxHeight + "px";
              element.style.webkitLineClamp = maxLines;
              readMoreButton.textContent = "Read More";
            } else {
              element.style.maxHeight = null;
              element.style.webkitLineClamp = null;
              element.style.transition = "all 5s ease";
              readMoreButton.textContent = "Read Less";
            }
          });

          element.parentElement.parentElement.parentElement.appendChild(
            readMoreButton
          );
        }
      });

      deleteButtonEvents();
      copyButtonEvents();
      starButtonEvents(gotarray);
    }

    if (favBool === false && element.value === "Fav") {
      element.classList.remove("active");
    }
  });
};

// on serch funciotn which gets list
const onSearch = () => {
  const totalCheckboxClass = document.querySelector(".totalCheckbox");

  searchInput.addEventListener("keyup", function () {
    let searchValue = escapeHtml(searchInput.value.toLowerCase());
    searchedText = escapeHtml(searchInput.value.toLowerCase());
    isSearched = searchValue.length > 0;

    if (searchValue.trim() !== "") {
      chrome.storage.local.get(["selected"], function (result) {
        if (result.selected) {
          const filteredResults = result.selected.filter((value) => {
            let ignoreCase = value.val.toLowerCase();
            return ignoreCase.includes(searchValue);
          });

          setArray(filteredResults);
        }
      });

      totalCheckboxClass.style.display = "none";
    } else {
      chrome.storage.local.get(["selected"], function (result) {
        setArray(result.selected);
      });

      totalCheckboxClass.style.display = "block";
    }

    if (searchInput.value !== "") {
      closeSearch.style.display = "block";
    } else {
      closeSearch.style.display = "none";
    }
  });

  closeSearch.addEventListener("click", () => {
    let searchValue = searchInput.value.toLowerCase();
    if (searchValue.trim() !== "") {
      searchInput.value = "";
      isSearched = false;
      chrome.storage.local.get(["selected"], function (result) {
        setArray(result.selected);
      });
      closeSearch.style.display = "none";
      totalCheckboxClass.style.display = "block";
    }
  });
};

// truncate the selecetd data list
const emptyList = () => {
  const isFavTab = favAllToggle[1].className.includes("active");
  if (
    selectAllSubCheckbox.length === otherCheckboxes.length &&
    !isSearched &&
    !isFavTab
  ) {
    gotarray = [];

    handleAfterDeletion(gotarray);
    return;
  }
  if (isSearched) {
    let list = [];
    chrome.storage.local.get(["selected"], function (result) {
      list = [...result.selected];
      for (let i = 0; i < selectAllSubCheckbox.length; i++) {
        list = list.filter(
          (item) => item.id !== parseInt(selectAllSubCheckbox[i].dataset.id)
        );
      }
      handleAfterDeletion(list);
      return;
    });
  }
  for (let i = 0; i < otherCheckboxes.length; i++) {
    if (otherCheckboxes[i].checked) {
      gotarray = gotarray.filter(
        (item) => item.id !== parseInt(otherCheckboxes[i].dataset.id)
      );
    }
  }
  if (selectAllSubCheckbox.length === otherCheckboxes.length && isFavTab) {
    favAllToggle.forEach((element) => {
      if (element.value === "All") {
        element.classList.add("active");
        saveURL.style.display = "flex";
        selectAllCheckbox.checked = false;
      } else {
        element.classList.remove("active");
      }
    });
  }
  handleAfterDeletion(gotarray);
};

function handleAfterDeletion(list) {
  setDataToLocal(list);
  chrome.action.setBadgeText({ text: String(list.length) });
  confirmationPopup.style.display = "none";
  removeAllButton.style.cursor = "default";
  removeAllButton.style.pointerEvents = "none";
  removeAllButton.style.opacity = 0.5;
}

// Confirm Delete popup
const confirmationPopup = document.querySelector(".confirmation-Popup-div");
const mainContainer = document.querySelector(".main-container");
const confirmYesButton = document.querySelector("#confirmYes");
const confirmNoButton = document.querySelector("#confirmNo");
const eraserButton = document.querySelector(".eraser-button");
eraserButton.addEventListener("click", () => {
  confirmationPopup.style.display = "block";
  mainContainer.style.background = "black";
});

confirmYesButton.addEventListener("click", emptyList);

confirmNoButton.addEventListener("click", () => {
  confirmationPopup.style.display = "none";
});

// totalItems which get total number of items of clipboard
const totalItems = (dataList) => {
  if (dataList.length === 0) {
    if (selectAllCheckbox.checked === true) {
      selectAllCheckbox.checked = false;
    }
    selectAllCheckbox.setAttribute("disabled", true);
    document.querySelector(".totalCheckbox").style.cursor = "default";
  } else {
    selectAllCheckbox.removeAttribute("disabled");
    document.querySelector(".totalCheckbox").style.cursor = "pointer";
  }

  let totalItem = "";
  totalItem = `<p>Total Items: (${dataList?.length})</p>`;
  return totalItem;
};

// user can add text even by searching the text and add even
const addNote = (note) => {
  if (note.trim() !== "") {
    chrome.storage.local.get(["selected"], function (result) {
      if (result.selected) {
        if (result.selected.some((item) => item.val === note)) {
        } else {
          result.selected.push({
            id: Math.floor(100000000 + Math.random() * 900000000),
            val: note,
            fav: false,
            urlLink: location.href,
            CopiedTime: getTime(),
          });
          setDataToLocal(result.selected);
          chrome.action.setBadgeText({ text: String(result.selected.length) });
        }
      }
    });
  }
  document.getElementById("searchValue").value = "";
};

// save url button funciton
const handleSaveURL = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    if (url) {
      addNote(url);
    }
  });
};

// SaveURL button for save current window url to clipboard
saveURL.addEventListener("click", handleSaveURL);

// getting time of copied text
const displayTime = (gotarray) => {
  time = gotarray.map((copyTime) => {
    var today = Math.abs((new Date().getTime() / 1000).toFixed(0));
    var dateValue = Math.abs(
      (new Date(copyTime.CopiedTime).getTime() / 1000).toFixed(0)
    );
    var diff = today - dateValue;
    var days = `${Math.floor(diff / 86400)} days`;
    var hours = `${Math.floor(diff / 3600) % 24} hours`;
    var minutes = `${Math.floor(diff / 60) % 60} minutes`;

    var currentDate = new Date(copyTime.CopiedTime);
    var date =
      currentDate.getDate() +
      " " +
      monthNames[currentDate.getMonth()].slice(0, 3) +
      " " +
      currentDate.getFullYear();
    var copiedHour = (currentDate.getHours() + 24) % 24;
    var mid = "am";

    if (copiedHour == 0) {
      //At 00 copiedHour we need to show 12 am
      copiedHour = 12;
    } else if (copiedHour > 12) {
      copiedHour = copiedHour % 12;
      mid = "pm";
    }

    var time = copiedHour + ":" + currentDate.getMinutes();

    return Number(days.split(" ")[0]) >= 1
      ? date + ", " + time + " " + mid
      : hours + " " + minutes;
  });
  return time?.reverse();
};

// simple usable function for setting data
const setDataToLocal = (data) => {
  chrome.storage.local.set({ selected: data }, function () {
    setArray(data);
  });
};

// When dom gets load this action needs to be used
window.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["welcomePopup"], function (data) {
    if (data.welcomePopup) {
      var welcomePopup = document.querySelector(".welcome-popup-div");
      welcomePopup.style.display = "block";
    }
  });

  chrome.storage.local.get("MIswitch", function (result) {
    mainSwitch.checked = result.MIswitch;
  });

  chrome.storage.local.get(["selected"], function (result) {
    if (result.selected) {
      setArray(result.selected);
      onSearch();
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {});
});
