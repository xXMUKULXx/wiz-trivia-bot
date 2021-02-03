var startingUserId;
var userId;
var playSound;
var soundFile;
var highlight;
var color;
var timeToWaitQuestion;
var satisfy;
var satisfyRate;
var timeToWait;
var timeToWait429;
var saveInfo;

var config = {
};
firebase.initializeApp(config);

function restoreOptions() {
  chrome.storage.sync.get(['playSound', 'soundFile', 'highlight', 'color', 'timeToWaitQuestion', 'satisfy', 'satisfyRate', 'timeToWait', 'timeToWait429', 'userId', 'totalCrowns'], function (items) {
    var startingUserId = items.userId;
    if (startingUserId) {
      document.getElementById('userId').style.display = "none";
      document.getElementById('userIdActual').innerText = startingUserId;
    }
	console.log(items.totalCrowns);
	chrome.storage.sync.get({ totalCrowns: 'test' }, function (result) {
          console.log('Value currently is ' + result.totalCrowns);
        });
    document.getElementById('totalCrowns').innerText = items.totalCrowns;

    document.getElementById('sound').checked = items.playSound;
    document.getElementById('soundFile').value = items.soundFile;

    document.getElementById('highlight').checked = items.highlight;
    document.getElementById('color').value = items.color;
    document.getElementById('timeToWaitQuestion').value = items.timeToWaitQuestion;

    document.getElementById('satisfy').checked = items.satisfy;
    document.getElementById('satisfyRate').value = items.satisfyRate;
    document.getElementById('timeToWait').value = items.timeToWait;
    document.getElementById('timeToWait429').value = items.timeToWait429;
  });
}

function closeWindow() {
  window.close();
}

function setDefaultOptions() {
  chrome.storage.sync.set({
    playSound: true,
    soundFile: "windows.wav",
    highlight: false,
    color: "#00b300",
    timeToWaitQuestion: 2,
    satisfy: true,
    satisfyRate: 2,
    timeToWait: 60,
    timeToWait429: 30
  }, function () {
    document.getElementById('sound').checked = true;
    document.getElementById('soundFile').value = "windows.wav";

    document.getElementById('highlight').checked = false;
    document.getElementById('color').value = "#00b300";
    document.getElementById('timeToWaitQuestion').value = 2;

    document.getElementById('satisfy').checked = true;
    document.getElementById('satisfyRate').value = 2;
    document.getElementById('timeToWait').value = 60;
    document.getElementById('timeToWait429').value = 30;
    var status = document.getElementById('status');
    status.textContent = 'Options reset to default.';
    setTimeout(function () {
      status.textContent = "";
    }, 750);
  });
}

function saveOptions() {
  saveInfo = true;
  resetErrors();
  checkUserId().then(function () {
    getValues();
    errorCheck();
    if (saveInfo) {
      saveInformation();
    }
  })
}

function resetErrors() {
  document.getElementById('userId').classList.remove("error");
  document.getElementById('timeToWaitQuestion').classList.remove("error");
  document.getElementById('satisfyRate').classList.remove("error");
  document.getElementById('timeToWait').classList.remove("error");
  document.getElementById('timeToWait429').classList.remove("error");
}

function checkUserId() {
  return new Promise(function (resolve, reject) {
    if (!startingUserId) {
      userId = document.getElementById('userId').value;
      if (userId) {
        if (!userId.match(/[.$[\]#/]/)) {
          firebase.database().ref("/users/" + userId).once('value').then(function (snapshot) {
            if (!snapshot.val()) {
              ref = firebase.database().ref("/users/" + userId);
              ref.update({
                userId: userId,
                crowns: 0
              });
              document.getElementById('userId').style.display = "none";
              document.getElementById('userIdActual').innerText = userId;
              resolve();
            } else {
              saveInfo = false;
              document.getElementById('userId').classList.add("error");
              updateStatus("Username exists");
              resolve();
            }
          })
        } else {
          saveInfo = false;
          document.getElementById('userId').classList.add("error");
          updateStatus("Cannot use any of these characters: .$[]#/");
          resolve();
        }
      } else {
        resolve();
      }
    } else {
      userId = startingUserId;
      resolve();
    }
  })
}

function getValues() {
  playSound = document.getElementById('sound').checked;
  soundFile = document.getElementById('soundFile').value;

  highlight = document.getElementById('highlight').checked;
  color = document.getElementById('color').value;
  timeToWaitQuestion = parseInt(document.getElementById('timeToWaitQuestion').value);

  satisfy = document.getElementById('satisfy').checked;
  satisfyRate = parseInt(document.getElementById('satisfyRate').value);
  timeToWait = parseInt(document.getElementById('timeToWait').value);
  timeToWait429 = parseInt(document.getElementById('timeToWait429').value);
}

function errorCheck() {
  if (timeToWaitQuestion < 1 || timeToWaitQuestion > 60) {
    saveInfo = false;
    document.getElementById('timeToWaitQuestion').classList.add("error");
  }

  if (satisfyRate < 1 || satisfyRate > 9) {
    saveInfo = false;
    document.getElementById('satisfyRate').classList.add("error");
  }

  if (timeToWait < 1 || timeToWait > 999) {
    saveInfo = false;
    document.getElementById('timeToWait').classList.add("error");
  }

  if (timeToWait429 < 0 || timeToWait429 > 999) {
    saveInfo = false;
    document.getElementById('timeToWait429').classList.add("error");
  }

  document.getElementById('timeToWaitQuestion').value = timeToWaitQuestion;
  document.getElementById('satisfyRate').value = satisfyRate;
  document.getElementById('timeToWait').value = timeToWait;
  document.getElementById('timeToWait429').value = timeToWait429;
}

function saveInformation() {
  chrome.storage.sync.set({
    playSound: playSound,
    soundFile: soundFile,
    highlight: highlight,
    color: color,
    timeToWaitQuestion: timeToWaitQuestion,
    satisfy: satisfy,
    satisfyRate: satisfyRate,
    timeToWait: timeToWait,
    timeToWait429: timeToWait429,
    userId: userId
  }, function () {
    updateStatus("Options Saved");
  });
}

function updateStatus(message) {
    var status = document.getElementById('status');
    status.textContent = message;
    setTimeout(function () {
      status.textContent = '';
    }, 750);

}

function playAudio() {
  new Audio(chrome.runtime.getURL("sounds/" + document.getElementById('soundFile').value)).play();
}

window.onload = function () {
  restoreOptions();
  document.getElementById('close').addEventListener('click', closeWindow);
  document.getElementById('default').addEventListener('click', setDefaultOptions);
  document.getElementById('cancel').addEventListener('click', closeWindow);
  document.getElementById('save').addEventListener('click', saveOptions);
  document.getElementById('audioTest').addEventListener('click', playAudio);
}