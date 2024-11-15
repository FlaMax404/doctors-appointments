// const main = document.getElementById('main');
const form = document.getElementById('appointment-form');

const content = document.getElementById('content');

window.addEventListener('load', () => {
  const localUser = JSON.parse(window.localStorage.getItem('user'));

  switch (localUser.accountType) {
    case 'admin':
      renderUsers();
      break;
    case 'doctors':
      break;
    case 'patients':
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (form['hour'].value === '' || form['symptoms'].value === '') {
          alert('you have to fill all fields');
          return;
        }

        if (!currentUser) {
          alert('please sign in to schedule an appointment');
          return;
        }

        if (currentUser && currentUser.type === 'doctor') {
          alert('please sign in as a patient to schedule an appointment');
          return;
        }

        const newAppoint = {
          id: generateID(),
          doctor: form['doctor'].value,
          patient: currentUser.username,
          symptoms: form['symptoms'].value,
          date: {
            hour: form['hour'].value,
            minutes: form['minute'].value,
            m: form['daynight'].value,
          },
        };

        form['hour'].value = '';
        form['minute'].value = '';
        form['symptoms'].value = '';
        form['doctor'].value = form['doctor'].options[0];
        form['daynight'].value = 0;

        addAppointment(newAppoint);
      });

      content.innerHTML = `<form id="appointment-form">
            <h1>Schedule an appointment</h1>
            <!-- time -->
            <div id="date">
                <div class="form-input">
                    <label for="hour">Hour</label>
                    <input name="hour" type="number" max="12" min="1">
                </div>
                <div class="form-input">
                    <label for="minute">Minutes</label>
                    <input name="minute" type="number" max="60" min="0">
                </div>
                <div class="form-input">
                    <label for="daynight">Day/Night</label>
                    <select name="daynight" id="daynight">
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>
                <!-- doctors -->
                <div class="form-input">
                    <label for="doctor">Doctor</label>
                    <select name="doctor" id="doctor">
                        <option value="Walter White">Walter White</option>
                        <option value="John Wick">John Wick</option>
                        <option value="Batman">Batman</option>
                        <option value="Kareem">Kareem</option>
                    </select>
                </div>
            </div>

            <!-- symptoms -->
            <div class="form-input">
                <label for="symptoms">Symptoms</label>
                <textarea name="symptoms" id="symptoms"></textarea>
            </div>

            <button>Schedule Appointment</button>
        </form>

        <main id="main">
            <!-- <div class="appointment">
                <div class="appointment-doctor">
                    <h1>Dr. </h1>
                    <h1>Walter White</h1>
                </div>
                <div class="appointment-details">
                    <div class="appointment-details-tag">
                        <p>patient</p>
                        <h1>jaafar</h1>
                    </div>
                    <div class="appointment-details-tag">
                        <p>date</p>
                        <h1>12:30 pm</h1>
                    </div>
                </div>
            </div> -->
        </main>`;
      break;
  }
});

function renderUsers() {
  main.innerHTML = '';

  fetchDB('patients', (res) => {
    const resultArray = Array.isArray(res) ? res : Array.from(res);

    if (resultArray.length === 0) {
      console.log('kos omak');
      return;
    }

    resultArray.forEach((user) => {
      main.appendChild(userElement(user));
    });
  });
}

// renderAppoints();

// function renderAppoints() {
//   main.innerHTML = '';

//   fetchDB('appointments', (res) => {
//     const resultArray = Array.isArray(res) ? res : Array.from(res);

//     if (resultArray.length === 0) {
//       console.log('No appointments found.');
//       return;
//     }

//     resultArray.forEach((appoint, index) => {
//       //   console.log(`Appointment ${index}:`, appoint);
//       main.appendChild(appointmentElement(appoint));
//     });
//   });
// }

function deleteAppointment(id) {
  deleteRecord('appointments', id, () => {
    renderAppoints();
  });
}

// function TestFetching() {
//   fetchQueryDB('appointments', 'patient_name', 'anas', (res) => {
//     const resultArray = Array.isArray(res) ? res : Array.from(res);

//     if (resultArray.length === 0) {
//       console.log('No appointments found.');
//       return;
//     }

//     resultArray.forEach((appoint, index) => {
//       //   console.log(`Appointment ${index}:`, appoint);
//       main.appendChild(
//         appointmentElement(appoint.doctor, appoint.patient, appoint.date)
//       );
//     });
//   });
// }

// TestFetching();

function addAppointment(appointment) {
  const transaction = db.transaction('appointments', 'readwrite');

  transaction.onerror = (e) => {
    console.log(`ADD APPOINTMENT`, e);
  };

  const store = transaction.objectStore('appointments');

  const _request = store.put(appointment);

  _request.onerror = (e) => {
    console.log('request', e);
  };

  _request.onsuccess = () => {
    console.log('something happened');
    renderAppoints();
    // db.close();
  };
}

function appointmentElement(a) {
  const father = document.createElement('div');
  father.classList.add('appointment');

  const info = document.createElement('div');
  info.classList.add('appointment-info');

  const firstChild = document.createElement('div');
  firstChild.classList.add('appointment-doctor');

  const nameHandler = document.createElement('h1');
  nameHandler.innerText = 'Dr. ';

  const docName = document.createElement('h1');
  docName.innerText = a.doctor;

  firstChild.appendChild(nameHandler);
  firstChild.appendChild(docName);

  info.appendChild(firstChild);

  const secondChild = document.createElement('div');
  secondChild.classList.add('appointment-details');

  const patient = document.createElement('div');
  patient.classList.add('appointment-details-tag');

  const p_patient = document.createElement('p');
  p_patient.innerText = 'patient';

  const h1_patient = document.createElement('h1');
  h1_patient.innerText = a.patient;

  patient.appendChild(p_patient);
  patient.appendChild(h1_patient);
  secondChild.appendChild(patient);

  const date = document.createElement('div');
  date.classList.add('appointment-details-tag');

  const p_date = document.createElement('p');
  p_date.innerText = 'date';

  const h1_date = document.createElement('h1');
  h1_date.innerText = `${a.date.hour}:${
    a.date.minutes < 10
      ? a.date.minutes > 0
        ? `0${a.date.minutes}`
        : '00'
      : a.date.minutes
  } ${a.date.m}`;

  date.appendChild(p_date);
  date.appendChild(h1_date);
  secondChild.appendChild(date);

  const symp = document.createElement('div');
  symp.classList.add('appointment-details-tag');

  const p_symp = document.createElement('p');
  p_symp.innerText = 'symptoms';

  const h1_symp = document.createElement('h1');
  h1_symp.innerText = a.symptoms;

  symp.appendChild(p_symp);
  symp.appendChild(h1_symp);
  secondChild.appendChild(symp);

  info.appendChild(secondChild);

  father.appendChild(info);
  if (currentUser && currentUser.type === 'admin') {
    const actions = document.createElement('div');
    actions.classList.add('appointment-actions');

    //   const accept = document.createElement('button');
    //   accept.id = 'accept';
    //   accept.innerText = 'accept';

    //   accept.addEventListener('click', () => {
    //     deleteAppointment(a.id);
    //   });
    //   actions.appendChild(accept);

    const cancel = document.createElement('button');
    cancel.id = 'cancel';
    cancel.innerText = 'delete';

    cancel.addEventListener('click', () => {
      deleteAppointment(a.id);
    });

    actions.appendChild(cancel);

    father.appendChild(actions);
  }

  return father;
}

function userElement(user) {
  const father = document.createElement('div');
  father.classList.add('user');

  const info = document.createElement('div');
  info.classList.add('user-info');

  const userInfoFields = [
    { label: 'NHS', value: user.NHS },
    { label: 'Title', value: user.Title },
    { label: 'First Name', value: user.First },
    { label: 'Last Name', value: user.Last },
    { label: 'DOB', value: user.DOB },
    { label: 'Gender', value: user.Gender },
    { label: 'Address', value: user.Address },
    { label: 'Email', value: user.Email },
    { label: 'Telephone', value: user.Telephone },
  ];

  userInfoFields.forEach((field) => {
    const detailContainer = document.createElement('div');
    detailContainer.classList.add('user-details-tag');
    detailContainer.id = field.label.trim();

    const label = document.createElement('p');
    label.innerText = field.label;

    const value = document.createElement('h1');
    value.innerText = field.value;
    value.classList.add('user-value');

    detailContainer.appendChild(label);
    detailContainer.appendChild(value);
    info.appendChild(detailContainer);
  });

  father.appendChild(info);

  const actions = document.createElement('div');
  actions.classList.add('user-actions');

  // Update Button
  const updateButton = document.createElement('button');
  updateButton.innerText = 'Update';
  updateButton.addEventListener('click', () => {
    enterUpdateMode(father, user, updateButton, deleteButton);
  });
  actions.appendChild(updateButton);

  // Delete Button
  const deleteButton = document.createElement('button');
  deleteButton.innerText = 'Delete';
  deleteButton.addEventListener('click', () => {
    deleteUser(user.id);
  });
  actions.appendChild(deleteButton);

  father.appendChild(actions);

  return father;
}

// Helper function to switch to editable inputs for update
function enterUpdateMode(father, user, updateButton, deleteButton) {
  const inputs = father.querySelectorAll('.user-value');
  const originalValues = {};

  // Store original values and replace each detail with an input
  inputs.forEach((element, index) => {
    const fieldKey = Object.keys(user)[index + 1]; // Skip 'id' field
    originalValues[fieldKey] = element.innerText; // Save original value

    const input = document.createElement('input');
    input.value = user[fieldKey];
    input.addEventListener('input', (e) => {
      user[fieldKey] = e.target.value;
    });
    element.replaceWith(input);
  });

  // Hide update and delete buttons, show save and cancel buttons
  updateButton.style.display = 'none';
  deleteButton.style.display = 'none';

  const actions = father.querySelector('.user-actions');

  // Save Button
  const saveButton = document.createElement('button');
  saveButton.innerText = 'Save';
  saveButton.addEventListener('click', () => {
    const newUser = {
      NHS: user['NHS'],
      Title: user['Title'], // i mean kos omak
      First: user['First'],
      Last: user['Last'],
      Email: user['Email'],
      Gender: user['Gender'],
      Address: user['Address'],
      DOB: user['DOB'],
      Telephone: user['Telephone'],
    };
    updatePatient(user['id'], newUser);
    console.log(newUser);

    exitUpdateMode(father, user, originalValues, updateButton, deleteButton);
  });
  actions.appendChild(saveButton);

  // Cancel Button
  const cancelButton = document.createElement('button');
  cancelButton.innerText = 'Cancel';
  cancelButton.addEventListener('click', () => {
    exitUpdateMode(
      father,
      user,
      originalValues,
      updateButton,
      deleteButton,
      true
    );
  });
  actions.appendChild(cancelButton);
}

function exitUpdateMode(
  father,
  user,
  originalValues,
  updateButton,
  deleteButton,
  isCancel = false
) {
  const inputs = father.querySelectorAll('input');

  // Replace inputs with original or updated values
  inputs.forEach((input, index) => {
    const fieldKey = Object.keys(user)[index + 1];
    const value = document.createElement('h1');
    value.classList.add('user-value');
    value.innerText = isCancel ? originalValues[fieldKey] : user[fieldKey];
    input.replaceWith(value);

    // Revert user object to original values if canceled
    if (isCancel) {
      user[fieldKey] = originalValues[fieldKey];
    }
  });

  // Restore update and delete buttons
  updateButton.style.display = 'inline-block';
  deleteButton.style.display = 'inline-block';

  // Remove save and cancel buttons
  const actions = father.querySelector('.user-actions');
  const saveButton = actions.querySelector('button:contains("Save")');
  const cancelButton = actions.querySelector('button:contains("Cancel")');

  if (saveButton) saveButton.remove();
  if (cancelButton) cancelButton.remove();
}
// Function to delete a user
function deleteUser(userId) {
  console.log(`Deleting user with ID: ${userId}`);

  deleteRecord('patients', userId, () => {
    renderUsers();
  });
  // Additional code to delete the user
}
