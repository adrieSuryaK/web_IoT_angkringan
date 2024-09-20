// Handles the sign in button press.
function toggleSignIn() {
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
  } else {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
      swal('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }

    // Sign in with email and pass.
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
      document.getElementById('quickstart-sign-in').disabled = false;
    });
  }
  document.getElementById('quickstart-sign-in').disabled = true;
}

// Handles the sign up button press.
function handleSignUp() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  if (email.length < 4) {
    alert('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    alert('Please enter a password.');
    return;
  }

  // Create user with email and pass.
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode == 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
  });
}

// Sends an email verification to the user.
function sendEmailVerification() {
  firebase.auth().currentUser.sendEmailVerification().then(function () {
    alert('Email Verification Sent!');
  });
}

// Handles reset password.
function sendPasswordReset() {
  var email = document.getElementById('email').value;
  firebase.auth().sendPasswordResetEmail(email).then(function () {
    alert('Password Reset Email Sent!');
  }).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode == 'auth/invalid-email') {
      alert(errorMessage);
    } else if (errorCode == 'auth/user-not-found') {
      alert(errorMessage);
    }
    console.log(error);
  });
}

// initApp handles setting up UI event listeners and registering Firebase auth listeners:
function initApp() {
  // Listening for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function (user) {
    // [START_EXCLUDE silent]
    document.getElementById('spinner').classList.remove('is-active');
    let x = document.querySelectorAll(".authblock");
    for (let i = 0; i < x.length; i++) {
      x[i].style.visibility = "visible";
    }
    // [END_EXCLUDE]
    if (user) {
      // User is signed in.
      y = document.querySelectorAll(".dashboard");
      for (let i = 0; i < y.length; i++) {
        y[i].style.visibility = "visible";
      }
      var displayName = user.displayName;
      var email = user.email;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      firebase.database().ref('users/' + uid).update({
        email: user.email,
      });

      // [START_EXCLUDE]
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
      document.getElementById('dtext').textContent = "You are signed In with " + email;
      document.getElementById('quickstart-sign-in').textContent = 'Sign out';
      document.getElementById('quickstart-sign-up').style.visibility = "hidden";
      document.getElementById('email').style.visibility = "hidden";
      document.getElementById('password').style.visibility = "hidden";
      document.getElementById('quickstart-password-reset').style.visibility = "hidden";
      document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');

      var ref = firebase.database().ref();
      var humidity = firebase.database().ref('users/' + uid + '/humidity');
      var gas = firebase.database().ref('users/' + uid + '/gas_sensor/gas');
      var gas_notice = firebase.database().ref('users/' + uid + '/gas_sensor/gas_notice');
      var lampu = firebase.database().ref('users/' + uid + '/lampu_led');
      var irradiance = firebase.database().ref('users/' + uid + '/irradiance');
      var currentSensor = firebase.database().ref('users/' + uid + '/current');
      var voltage = firebase.database().ref('users/' + uid + '/voltage');
      var power = firebase.database().ref('users/' + uid + '/power');
      var temperature = firebase.database().ref('users/' + uid + '/temperature');
      var prediksi_hujan = firebase.database().ref('users/' + uid + '/prediksi_hujan');
      var rain_analog = firebase.database().ref('users/' + uid + '/rain_sensor/rain_analog');
      var kondisi_hujan = firebase.database().ref('users/' + uid + '/rain_sensor/rain_condition');

      //wind last 5 value DB reference
      var first = firebase.database().ref('users/' + uid + '/wind/first');
      var second = firebase.database().ref('users/' + uid + '/wind/second');
      var third = firebase.database().ref('users/' + uid + '/wind/third');
      var fourth = firebase.database().ref('users/' + uid + '/wind/fourth');
      var fifth = firebase.database().ref('users/' + uid + '/wind/fifth');
      var servo = firebase.database().ref('users/' + uid + '/servo');

      var currentOutput = document.getElementById("current");
      var voltageOutput = document.getElementById("voltage");
      var powerOutput = document.getElementById("power");
      var humidityOutput = document.getElementById("humidity");
      var gas_output = document.getElementById("gas");
      var gas_output_notice = document.getElementById("gas_notice");
      var gas_image = document.getElementById("gas_image");
      var rain_analog_output = document.getElementById("rain_analog");
      var kondisi_hujan_output = document.getElementById("kondisi_hujan_output");
      var kondisi_hujan_image = document.getElementById("kondisi_hujan_image");
      var prediksi_hujan_output = document.getElementById("prediksi_hujan");
      var prediksi_hujan_image = document.getElementById("prediksi_hujan_image");
      var lampu_check = document.getElementById("lampu");
      var slider = document.getElementById("slider");
      var ctx = document.getElementById('myChart').getContext('2d');
      var data = {
        labels: [],
        datasets: [{
          label: 'Value',
          fill: false,
          borderColor: '#3f51b5',
          backgroundColor: '#1a237e',
          borderWidth: 1
        }]
      }
      var chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
      });
      let dp = [];
      let label = [];
      let i = 0;
      first.on("value", function (snap) {
        //console.log(snap.val());
        label.push(new Date().toLocaleString().split(',')[1]);
        dp.push(snap.val());
        i = dp.length;
        if (i > 5) {
          dp.shift();
          label.shift();
          i--;
        }
        data.labels = label;
        data.datasets[0].data = dp;
        console.log(dp);
        chart.update();
      });

      second.on("value", function (snap) {
        //console.log(snap.val());
        label.push(new Date().toLocaleString().split(',')[1]);
        dp.push(snap.val());
        i = dp.length;
        if (i > 5) {
          dp.shift();
          label.shift();
          i--;
        }
        data.labels = label;
        data.datasets[0].data = dp;
        chart.update();
      });
      third.on("value", function (snap) {
        //console.log(snap.val());
        label.push(new Date().toLocaleString().split(',')[1]);
        dp.push(snap.val());
        i = dp.length;
        if (i > 5) {
          dp.shift();
          label.shift();
          i--;
        }

        data.labels = label;
        data.datasets[0].data = dp;
        chart.update();
      });
      fourth.on("value", function (snap) {
        //console.log(snap.val());
        label.push(new Date().toLocaleString().split(',')[1]);
        dp.push(snap.val());
        i = dp.length;
        if (i > 5) {
          dp.shift();
          label.shift();
          i--;
        }

        data.labels = label;
        data.datasets[0].data = dp;
        chart.update();
      });
      fifth.on("value", function (snap) {
        //console.log(snap.val());
        label.push(new Date().toLocaleString().split(',')[1]);
        dp.push(snap.val());
        i = dp.length;
        if (i > 5) {
          dp.shift();
          label.shift();
          i--;
        }

        data.labels = label;
        data.datasets[0].data = dp;
        chart.update();
      });

      humidity.on("value", function (snap) {
        console.log(snap.val());
        humidityOutput.value = snap.val();
        document.getElementById('humidity').innerHTML = snap.val();
      });

      prediksi_hujan.on("value", function (snap) {
        console.log(snap.val());
        prediksi_hujan_output.value = snap.val();
        document.getElementById('prediksi_hujan').innerHTML = snap.val();
        if (snap.val() === 'Kemungkinan sangat kecil terjadi hujan') {
          prediksi_hujan_image.src = 'img/tidak_ada_air_hujan.png';
        } else if (snap.val() === 'Kemungkinan kecil terjadi hujan') {
          prediksi_hujan_image.src = 'img/kecil_terjadi_hujan.png';
        }
        else if (snap.val() === 'Kemungkinan sedang terjadi hujan') {
          prediksi_hujan_image.src = 'img/sedang_terjadi_hujan.png';
        }
        else if (snap.val() === 'Kemungkinan besar terjadi hujan') {
          prediksi_hujan_image.src = 'img/besar_terjadi_hujan.png';
        }
        else if (snap.val() === 'Kemungkinan sangat besar terjadi hujan') {
          prediksi_hujan_image.src = 'img/sangat_besar_terjadi_hujan.png';
        }
      });

      // rain_analog.on("value", function (snap) {
      //   console.log(snap.val());
      //   rain_analog_output.value = snap.val();
      //   document.getElementById('rain_analog').innerHTML = snap.val();
      // });

      kondisi_hujan.on("value", function (snap) {
        console.log(snap.val());
        kondisi_hujan_output.value = snap.val();
        document.getElementById('kondisi_hujan_output').innerHTML = snap.val();
        if (snap.val() === 'Tidak ada air hujan') {
          kondisi_hujan_image.src = 'img/cerah.png';
        } else if (snap.val() === 'Terjadi gerimis') {
          kondisi_hujan_image.src = 'img/gerimis.png';
        }
        else if (snap.val() === 'Terjadi hujan') {
          kondisi_hujan_image.src = 'img/hujan.png';
        }
      });

      // gas.on("value", function (snap) {
      //   console.log(snap.val());
      //   gas_output.value = snap.val();
      //   document.getElementById('gas').innerHTML = snap.val();
      // });

      gas_notice.on("value", function (snap) {
        console.log(snap.val());
        gas_output_notice.value = snap.val();
        document.getElementById('gas_notice').innerHTML = snap.val();
        if (snap.val() === 'Gas detected') {
          gas_image.src = 'img/warning-gas.png';
        } else if (snap.val() === 'No gas') {
          gas_image.src = 'img/safety-gas.png';
        }
      });

      currentSensor.on("value", function (snap) {
        console.log(snap.val());
        currentOutput.value = snap.val();
        document.getElementById('current').innerHTML = snap.val();
      });

      voltage.on("value", function (snap) {
        console.log(snap.val());
        voltageOutput.value = snap.val();
        document.getElementById('voltage').innerHTML = snap.val();
      });

      power.on("value", function (snap) {
        console.log(snap.val());
        powerOutput.value = snap.val();
        document.getElementById('power').innerHTML = snap.val();
      });

      irradiance.on("value", function (snap) {
        document.getElementById('canvas_irradiance').setAttribute("data-value", snap.val());
      });

      temperature.on("value", function (snap) {
        document.getElementById('canvas_temperature').setAttribute("data-value", snap.val());
      });

      servo.on("value", function (snap) {
        slider.value = snap.val();
        document.getElementById('sliderval').innerHTML = snap.val();
      });

      $(function () {
        lampu.on("value", function (snap) {
          if (snap.val() == 1) {
            $('#lampu').click();
          }
        });

      });
      lampu_check.addEventListener('change', function (event) {
        if (event.target.checked) {
          console.log("LAMPU checked");
          lampu.set(1);
        } else {
          lampu.set(0);
        }
      });

      slider.addEventListener('change', function (event) {
        document.getElementById("sliderval").innerHTML = event.target.value;
        var pos = parseInt(event.target.value);
        console.log(pos);
        servo.set(pos);
      });

      function addTableRow(data) {
        var table = document.querySelector('.table tbody');
        var newRow = table.insertRow(-1);

        // Add data to the new row cells
        var cells = Object.values(data);
        for (var i = 0; i < cells.length; i++) {
          var cell = newRow.insertCell(i);
          cell.textContent = cells[i];
        }
      }

      var lastRowNumber = 0;

      // pagination
      var currentPage = 1;
      var rowsPerPage = 15;

      function displayDataOnPage(pageNumber, data) {
        var table = document.querySelector('.table tbody');
        table.innerHTML = '';

        var start = (pageNumber - 1) * rowsPerPage;
        var end = start + rowsPerPage;

        for (var i = start; i < end && i < data.length; i++) {
          addTableRow(data[i]);
        }
      }

      function setupPagination(data) {
        var totalPages = Math.ceil(data.length / rowsPerPage);

        document.getElementById('prevPage').addEventListener('click', function () {
          if (currentPage > 1) {
            currentPage--;
            displayDataOnPage(currentPage, data);
          }
        });

        document.getElementById('nextPage').addEventListener('click', function () {
          if (currentPage < totalPages) {
            currentPage++;
            displayDataOnPage(currentPage, data);
          }
        });
      }

      document.addEventListener('DOMContentLoaded', function () {
        var storedData = JSON.parse(localStorage.getItem('tableData')) || [];
        setupPagination(storedData);
        displayDataOnPage(currentPage, storedData);
      });

      function fetchAndAddData() {
        // Initialize an empty object for newData
        var newData = {};

        var storedData = JSON.parse(localStorage.getItem('tableData')) || [];
        if (storedData.length > 0) {
          lastRowNumber = storedData[storedData.length - 1]['No.'];
        }

        lastRowNumber++;

        newData['No.'] = lastRowNumber;

        // Get the current date and time
        var currentDate = new Date();
        var day = currentDate.getDate();
        var month = currentDate.toLocaleString('default', { month: 'long' });
        var year = currentDate.getFullYear();

        var formattedDate = day + ' ' + month + ' ' + year;
        newData.Tanggal = formattedDate;
        newData.Waktu = new Date().toLocaleTimeString();

        currentSensor.on("value", function (snap) {
          newData.Current = snap.val();
        });

        voltage.on("value", function (snap) {
          newData.Voltage = snap.val();
        });

        power.on("value", function (snap) {
          newData.Power = snap.val();
        });

        humidity.on("value", function (snap) {
          newData.Humidity = snap.val();
        });

        irradiance.on("value", function (snap) {
          newData.Irradiance = snap.val();
        });

        temperature.on("value", function (snap) {
          newData.Temperature = snap.val();
        });

        prediksi_hujan.on("value", function (snap) {
          newData['Prediksi Hujan'] = snap.val();
        });

        kondisi_hujan.on("value", function (snap) {
          newData['Kondisi Hujan'] = snap.val();
        });

        addTableRow(newData);
        addTableRowToLocalStorage(newData, lastRowNumber);
        setupPagination(storedData);
        displayDataOnPage(currentPage, storedData);
      }

      setInterval(fetchAndAddData, 120000);

      // [END_EXCLUDE]
    } else {
      // User is signed out.
      // [START_EXCLUDE]
      y = document.querySelectorAll(".dashboard");
      for (let i = 0; i < y.length; i++) {
        y[i].style.visibility = "hidden";
      }
      document.getElementById('dtext').textContent = "Enter an email and password below and either sign in to an existing account or sign up";
      document.getElementById('quickstart-sign-up').style.visibility = "visible";
      document.getElementById('email').style.visibility = "visible";
      document.getElementById('password').style.visibility = "visible";
      document.getElementById('quickstart-password-reset').style.visibility = "visible";
      document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
      document.getElementById('quickstart-sign-in').textContent = 'Sign in';
      document.getElementById('quickstart-account-details').textContent = 'null';
      // [END_EXCLUDE]
    }
    // [START_EXCLUDE silent]
    document.getElementById('quickstart-sign-in').disabled = false;
    // [END_EXCLUDE]
  });
  // [END authstatelistener]

  document.getElementById('quickstart-sign-in').addEventListener('click', toggleSignIn, false);
  document.getElementById('quickstart-sign-up').addEventListener('click', handleSignUp, false);
  document.getElementById('quickstart-password-reset').addEventListener('click', sendPasswordReset, false);
}

// Save data to localstorage
function addTableRowToLocalStorage(data, lastRowNumber) {
  var existingData = JSON.parse(localStorage.getItem('tableData')) || [];
  data['No.'] = lastRowNumber;
  existingData.push(data);
  localStorage.setItem('tableData', JSON.stringify(existingData));
}

function loadTableDataFromLocalStorage() {
  var existingData = JSON.parse(localStorage.getItem('tableData')) || [];
  var tableBody = document.querySelector('.table tbody');

  existingData.forEach(function (data) {
    var newRow = tableBody.insertRow(-1);

    var cellNo = newRow.insertCell(0);
    cellNo.textContent = data['No.'];

    var cellTanggal = newRow.insertCell(1);
    cellTanggal.textContent = data['Tanggal'];

    var cellWaktu = newRow.insertCell(2);
    cellWaktu.textContent = data['Waktu'];

    var cellCurrent = newRow.insertCell(3);
    cellCurrent.textContent = data['Current'];

    var cellVoltage = newRow.insertCell(4);
    cellVoltage.textContent = data['Voltage'];

    var cellPower = newRow.insertCell(5);
    cellPower.textContent = data['Power'];

    var cellHumidity = newRow.insertCell(6);
    cellHumidity.textContent = data['Humidity'];

    var cellIrradiance = newRow.insertCell(7);
    cellIrradiance.textContent = data['Irradiance'];

    var cellTemperature = newRow.insertCell(8);
    cellTemperature.textContent = data['Temperature'];

    var cellPrediksiHujan = newRow.insertCell(9);
    cellPrediksiHujan.textContent = data['Prediksi Hujan'];

    var cellKondisiHujan = newRow.insertCell(10);
    cellKondisiHujan.textContent = data['Kondisi Hujan'];
  });
}

window.onload = function () {
  initApp();
  let y = document.querySelectorAll(".dashboard");
  for (let i = 0; i < y.length; i++) {
    y[i].style.visibility = "hidden";
  }
  loadTableDataFromLocalStorage();
};

// same site cookies
// Set a same-site cookie for first-party contexts
document.cookie = 'cookie1=value1; SameSite=Lax;';
// Set a cross-site cookie for third-party contexts
document.cookie = 'cookie2=value2; SameSite=None; Secure';