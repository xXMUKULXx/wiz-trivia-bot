var port = chrome.runtime.connect({ name: "Highscores" });
port.postMessage({ greeting: "getHighscores" });
port.onMessage.addListener(function (message) {
  displayHighscores(message.users);
});

function displayHighscores(users) {
  // Find a <table> element with id="myTable":
  var table = document.getElementById("DCQAEtable");
  for (let index = users.length - 1; index > -1; index--) {

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow(-1);

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    //add table data class
    cell1.classList.add("DCQAEtabledata");
    cell2.classList.add("DCQAEtabledata");
    cell3.classList.add("DCQAEtabledata");

    // Add some text to the new cells:
    cell1.innerHTML = users.length - index;
    cell2.innerHTML = users[index].userId;
    cell3.innerHTML = users[index].crowns;
  }
}