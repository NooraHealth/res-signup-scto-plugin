// References to field elements
var dateOfDischarge = document.getElementById('dateOfDischarge');
var toNumber = document.getElementById('toNumber');


var signUpBtn = document.getElementById('signup');
var result = document.getElementById('result');
var info = document.getElementById('info');


// References to values stored in the plug-in parameters
var ptoNumber = getPluginParameter('toNumber');
var pDateOfDischarge = getPluginParameter('dateOfDischarge');
var debug = document.getElementById("debug");
var currentAnswer = fieldProperties.CURRENT_ANSWER;

toNumber.innerText = ptoNumber;
dateOfDischarge.innerText = pDateOfDischarge;
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

var rootURL = "https://staging.noorahealth.org/bd-res-signup";


// Define the dial function
signUpBtn.onclick = function () {
    apiCall();
}

function makeHttpObject () {
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

function setCurrentStatus() {
  if (currentAnswer == "Yes"){
    result.classList.add("success");
    result.innerText = "Success";
  }
  else if (currentAnswer == "No"){
    result.classList.add("danger");
    result.innerText = "Failure";
  }
}


function apiCall () {
    try {
      request = makeHttpObject()

      var requestUrl = rootURL + "/scanu/surveycto_wa_signup.json";
      var payload = {
        "mobile_numbers": [ptoNumber],
        "condition_area": "scanu",
        "program": "mch",
        "country": "bangladesh",
        "language": "ben",
        "call_id": "123456"
      }
  
      request.open('POST', requestUrl, true)
    //   request.setRequestHeader('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent(accountSID + ':' + authToken))))
      request.setRequestHeader('Content-type', ' application/json')
  
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          var response = JSON.parse(request.responseText);
          var users = response['users'];
          for (var i = 0; i < users.length; i++) {
            var item = users[i];
            var status = item['success'] ? 'Success' : 'Failure'
            var statusClass = item['success'] ? 'success' : 'danger';
            result.classList.add(statusClass);
            result.innerText = status;
            setAnswer("Yes");
            if (status == "Failure"){
              info.classList.add('subtitle');
              info.innerHTML = "<p> Reason : " + item['errors'] + "</p>"; 
              setAnswer("No");
            }
          }
        }
      }
  
      request.send(JSON.stringify(payload));
    } catch (error) {
      debug.value = error;
    }
  }
