// References to field elements
var dateOfDischarge = document.getElementById('dateOfDischarge');
var toNumber = document.getElementById('toNumber');


var signUpBtn = document.getElementById('signup');
var result = document.getElementById('result');
var info = document.getElementById('info');
var answerState = document.getElementById("answerState");

// References to values stored in the plug-in parameters
var ptoNumber = getPluginParameter('toNumber');
var pDateOfDischarge = getPluginParameter('dateOfDischarge');
var apiUrl = getPluginParameter('apiUrl');
var currentAnswer = fieldProperties.CURRENT_ANSWER;

toNumber.innerText = ptoNumber;
dateOfDischarge.innerText = formatDate(pDateOfDischarge);
setCurrentStatus();


function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [day, month, year].join('-');
}


// Define the dial function
signUpBtn.onclick = function () {
  apiCall();
}

function processPayload(data) {
  var users = data['users'];
  for (var i = 0; i < users.length; i++) {
    var item = users[i];
    var status = item['success'] ? 'Success' : 'Failure'
    var statusClass = item['success'] ? 'success' : 'danger';
    if (status == "Success") {
      setResult(statusClass, status)
      setAnswer("Yes");
    }
    else if (status == "Failure") {
      setResult(statusClass, status, item['errors'])
      setAnswer("No");
    }
  }
}

function makeHttpObject() {
  try {
    return new XMLHttpRequest()
  } catch (error) { }
  try {
    return new ActiveXObject('Msxml2.XMLHTTP')
  } catch (error) { }
  try {
    return new ActiveXObject('Microsoft.XMLHTTP')
  } catch (error) { }

  throw new Error('Could not create HTTP request object.')
}

function setResult(resultClass, resultText, reason = null) {
  result.classList.add(resultClass);
  result.innerText = resultText;
  if (reason != null) {
    info.classList.add('subtitle');
    info.innerHTML = "<p> Reason : " + reason + "</p>";
  }
}

function setCurrentStatus() {
  if (currentAnswer == "Yes") {
    setResult("success", "Success");
    answerState.innerText = "<b> Previous Response: </b>";
  }
  else if (currentAnswer == "No") {
    setResult("danger", "Failure");
    answerState.innerText = "<b> Previous Response: </b>";
  }
}


function apiCall() {
  try {
    request = makeHttpObject()
    var payload = {
      "mobile_numbers": [ptoNumber],
      "condition_area": "scanu",
      "program": "mch",
      "country": "bangladesh",
      "language": "ben",
      "call_id": "123456"
    }

    request.open('POST', apiUrl, true)
    //   request.setRequestHeader('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent(accountSID + ':' + authToken))))
    request.setRequestHeader('Content-type', ' application/json')

    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status == 200) {
          try {
            var response = JSON.parse(request.responseText);
            processPayload(response);
          }
          catch {
            setResult("danger", "Failure", "Error occured while parsing response")
          }
        }
        else if (request.status == 404) {
          setResult("danger", "Failure", "Server returned 404")
        }
        else if (request.status == 500) {
          setResult("danger", "Failure", "Server returned 500")
        }
      }
    }

    request.send(JSON.stringify(payload));
  } catch (error) {
    setResult("danger", "Failure", error);
  }
}
