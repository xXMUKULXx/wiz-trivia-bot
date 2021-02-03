var satisfy;
var satisfyRate;
var timeToWait;
var timeToWait429;
var totalCrowns;
var userId;
var currentQuiz;
var openThisQuiz;
var time;
var interval;
var quizList = ["Adventuring", "Conjuring", "Magical", "Marleybone", "Mystical", "Spellbinding", "Spells", "Valencia", "Wizard", "Zafaria"];

var config = {
};
firebase.initializeApp(config);

chrome.runtime.onInstalled.addListener(function (details) {
    chrome.storage.sync.get({ totalCrowns: 'test' }, function (items) {
        if (items.totalCrowns == 'test') {
            createUser().then(function () {
                window.open("chrome-extension://fodeboikmeckeiamdjheegoapebkcomk/options/options.html");
            });
        }
    });
});

chrome.storage.onChanged.addListener(function (changes) {
    for (var key in changes) {
        var storageChange = changes[key];
        switch (key) {
            case "satisfy":
                satisfy = storageChange.newValue;
                break;
            case "satisfyRate":
                satisfyRate = storageChange.newValue;
                break;
            case "timeToWait":
                timeToWait = storageChange.newValue;
                break;
            case "timeToWait429":
                timeToWait429 = storageChange.newValue;
                break;
            case "totalCrowns":
                totalCrowns = storageChange.newValue;
            default:
                break;
        }
    }
});

function getOptions() {
    chrome.storage.sync.get(['satisfy', 'satisfyRate', 'timeToWait', 'timeToWait429', 'userId', 'totalCrowns'], function (items) {
        satisfy = items.satisfy;
        satisfyRate = items.satisfyRate;
        timeToWait = items.timeToWait;
        timeToWait429 = items.timeToWait429;
        userId = items.userId;
        totalCrowns = items.totalCrowns;
    });
}

//Browser icon onClicked
chrome.browserAction.onClicked.addListener(function () {
    window.open("https://www.wizard101.com/game/trivia", "Quiz");
});

chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name == "Highscores");
    port.onMessage.addListener(function (message) {
        if (message.greeting == "getHighscores") {
            getScores().then(function (userMap) {
                port.postMessage({ users: userMap });
            })
        }
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.greeting) {
        case 'startQuiz':
		console.log("opening");
            openThisQuiz = "Adventuring";
            openQuiz();
            break;
        case 'setCurrentQuiz':
            currentQuiz = message.currentQuiz;
            break;
        case 'getCurrentQuiz':
            sendResponse({ quizName: currentQuiz });
            break;
        case 'nextQuiz':
            getOptions();
            quizIndex = quizList.indexOf(currentQuiz) + 1;
            openThisQuiz = quizList[quizIndex];
            if (!satisfy || message.when || quizIndex % satisfyRate != 0) {
                openQuiz();
            }
            else {
                window.open('waitScreen.html', "Please Wait", "width=350,height=350");
                countDown(timeToWait);
            }
            break;
        case "error429":
            window.open('waitScreen.html', "Please Wait", "width=350,height=350");
            openThisQuiz = currentQuiz;
            countDown(timeToWait429);
            break;
        case "cancelTimer":
            stopCounter();
            break;
        case "earnedCrowns":
		
            break;
    }
});

function countDown(timeWaiting) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "refresh" });
    });
    time = timeWaiting;
    interval = setInterval(() => {
        time -= 1;
        if (time == 0) {
            clearInterval(interval);
            openQuiz();
        }

    }, 1000);
}

function stopCounter() {
    clearInterval(interval);
    time = 0;
    openQuiz();
}

function openQuiz() {
    switch (openThisQuiz) {
        case 'Adventuring':
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-adventuring-trivia", "Quiz");
            break;
        case 'Conjuring':
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-conjuring-trivia", "Quiz");
            break;
        case 'Magical':
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-magical-trivia", "Quiz");
            break;
        case 'Marleybone':
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-marleybone-trivia", "Quiz");
            break;
        case 'Mystical':
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-mystical-trivia", "Quiz");
            break;
        case 'Spellbinding':
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-spellbinding-trivia", "Quiz");
            break;
        case 'Spells':
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-spells-trivia", "Quiz");
            break;
        case 'Valencia':
            window.open("https://www.wizard101.com/quiz/trivia/game/pirate101-valencia-trivia", "Quiz");
            break;
        case 'Wizard':
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-wizard-city-trivia", "Quiz");
            break;
        case 'Zafaria':
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-zafaria-trivia", "Quiz");
            break;
        default:
            window.open("https://www.wizard101.com/quiz/trivia/game/wizard101-adventuring-trivia", "Quiz");
            break;
    }
}

function createUser() {
    return new Promise(function (resolve, reject) {
        chrome.storage.sync.set({
            playSound: true,
            soundFile: "windows.wav",
            highlight: false,
            color: "#00b300",
            timeToWaitQuestion: 2,
            satisfy: true,
            satisfyRate: 2,
            timeToWait: 60,
            timeToWait429: 30,
            userId: "",
            totalCrowns: 0
        })
        resolve();
    })
}



function getScores() {
    return new Promise(function (resolve, reject) {
        var users = [];
        var index = 0;
        var display = 25;
        var ref = firebase.database().ref("users");
        ref.orderByChild("crowns").limitToLast(display).on("child_added", function (snapshot) {
            users.push(snapshot.val());
            index++;
            if (index == display) {
                resolve(users);
            }
        });
    })
}

window.onload = (function () {
    getOptions();
})