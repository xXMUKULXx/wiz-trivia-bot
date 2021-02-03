if (!document.getElementById('wizardLoginButton')) {
    chrome.runtime.sendMessage({ greeting: 'startQuiz' });
}