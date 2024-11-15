const main = document.getElementById('main');

const content = document.getElementById('content');
let localUser;

window.addEventListener('load', () => {
  localUser = JSON.parse(window.localStorage.getItem('user'));

  switch (localUser.accountType) {
    case 'admin':
      renderUsers();
      break;
    case 'doctors':
      renderAppoints(true);
      break;
    case 'patients':
      content.removeChild(main);
      content.appendChild(appointmentsFormElement());
      content.appendChild(main);

      const form = document.getElementById('appointment-form');
      let count = 0;

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (count >= 3) {
          alert('NIGGER STOP PRESSING THE SECHDULE BUTTON!!!11122');
          count = 0;
          return;
        }
        count++;

        if (form['hour'].value === '' || form['symptoms'].value === '') {
          alert('you have to fill all fields');
          return;
        }

        // if (!currentUser) {
        //   alert('please sign in to schedule an appointment');
        //   return;
        // }

        // if (currentUser && currentUser.type === 'doctor') {
        //   alert('please sign in as a patient to schedule an appointment');
        //   return;
        // }

        const username = `${localUser.user.First} ${localUser.user.Last}`;
        const newAppoint = {
          id: generateID(),
          doctor: form['doctor'].value,
          patient: username,
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

      renderAppoints(false);
      break;
  }
});

function renderUsers() {
  main.innerHTML = '';

  fetchDB('patients', (res) => {
    const resultArray = Array.isArray(res) ? res : Array.from(res);

    if (resultArray.length === 0) {
      console.log('empty');
      return;
    }

    resultArray.forEach((user) => {
      main.appendChild(userElement(user));
    });
  });
}

// renderAppoints();

function renderAppoints(showbtn) {
  main.innerHTML = '';

  let query = '';
  let index = '';
  if (localUser.accountType === 'patients') {
    query = `${localUser.user.First} ${localUser.user.Last}`;
    index = 'patient_name';
  } else {
    query = `${localUser.user.first_name} ${localUser.user.last_name}`;
    index = 'doctor_name';
  }

  fetchQueryDB('appointments', index, query, (res) => {
    const resultArray = Array.isArray(res) ? res : Array.from(res);

    if (resultArray.length === 0) {
      console.log('No appointments found.');
      main.innerHTML = `<h1>No appointments found.</h1>`;
      return;
    }

    resultArray.forEach((appoint, index) => {
      //   console.log(`Appointment ${index}:`, appoint);
      if (showbtn === true) {
        main.appendChild(appointmentElement(appoint, true));
      } else {
        main.appendChild(appointmentElement(appoint, false));
      }
    });
  });
}

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

function appointmentElement(a, showUpdateButton) {
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
    a.date.minutes < 10 ? `0${a.date.minutes}` : a.date.minutes
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

  // Medicine section
  const medicine = document.createElement('div');
  medicine.classList.add('appointment-details-tag');

  const p_medicine = document.createElement('p');
  p_medicine.innerText = 'medicine';

  const h1_medicine = document.createElement('h1');
  h1_medicine.innerText = a.medicine || 'Pending prescription';

  medicine.appendChild(p_medicine);
  medicine.appendChild(h1_medicine);
  secondChild.appendChild(medicine);

  info.appendChild(secondChild);
  father.appendChild(info);

  // State to track edit mode
  let isEditing = false;

  // Show Update button if `showUpdateButton` is true
  if (showUpdateButton) {
    const actions = document.createElement('div');
    actions.classList.add('appointment-actions');

    const updateButton = document.createElement('button');
    updateButton.innerText = 'Update';
    updateButton.classList.add('update-button');

    // Save and Cancel buttons, initially hidden
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('save-button');
    saveButton.style.display = 'none';

    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.classList.add('cancel-button');
    cancelButton.style.display = 'none';

    actions.appendChild(updateButton);
    actions.appendChild(saveButton);
    actions.appendChild(cancelButton);
    father.appendChild(actions);

    // Medicine dropdown
    let medicineDropdown;

    // Toggle Edit Mode
    const toggleEditMode = () => {
      isEditing = !isEditing;
      updateButton.style.display = isEditing ? 'none' : 'inline';
      saveButton.style.display = isEditing ? 'inline' : 'none';
      cancelButton.style.display = isEditing ? 'inline' : 'none';
      h1_medicine.style.display = isEditing ? 'none' : 'block';

      if (isEditing) {
        // Create and show the dropdown in edit mode
        medicineDropdown = document.createElement('select');
        medicineDropdown.id = 'med-select';

        // medicines.forEach((med) => {
        //   const option = document.createElement('option');
        //   option.value = med;
        //   option.innerText = med;
        //   medicineDropdown.appendChild(option);
        // });

        fetchDB('medicines', (res) => {
          const resultArray = Array.isArray(res) ? res : Array.from(res);

          if (resultArray.length === 0) {
            console.log('empty');
            return;
          }

          resultArray.forEach((doc) => {
            const option = document.createElement('option');
            option.value = doc.Drug;
            option.textContent = doc.Drug;
            medicineDropdown.appendChild(option);
          });
        });

        // Add dropdown to the medicine section
        medicine.appendChild(medicineDropdown);
      } else {
        // Remove dropdown if exists
        if (medicineDropdown) {
          medicine.removeChild(medicineDropdown);
          medicineDropdown = null;
        }
      }
    };

    // Event listeners for buttons
    updateButton.addEventListener('click', toggleEditMode);

    saveButton.addEventListener('click', () => {
      // Update the medicine text with the selected value from the dropdown
      a.medicine = medicineDropdown.value; // Optional: Save in object
      updateRecord('appointments', a.id, a);
      toggleEditMode();
      window.location.reload();
    });

    cancelButton.addEventListener('click', toggleEditMode);
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

function appointmentsFormElement() {
  // Create the form element
  const form = document.createElement('form');
  form.id = 'appointment-form';

  // Create the heading
  const heading = document.createElement('h1');
  heading.textContent = 'Schedule an appointment';
  form.appendChild(heading);

  // Time input section
  const dateDiv = document.createElement('div');
  dateDiv.id = 'date';

  // Hour input
  const hourDiv = document.createElement('div');
  hourDiv.className = 'form-input';
  const hourLabel = document.createElement('label');
  hourLabel.htmlFor = 'hour';
  hourLabel.textContent = 'Hour';
  const hourInput = document.createElement('input');
  hourInput.name = 'hour';
  hourInput.type = 'number';
  hourInput.max = '12';
  hourInput.min = '1';
  hourDiv.appendChild(hourLabel);
  hourDiv.appendChild(hourInput);
  dateDiv.appendChild(hourDiv);

  // Minute input
  const minuteDiv = document.createElement('div');
  minuteDiv.className = 'form-input';
  const minuteLabel = document.createElement('label');
  minuteLabel.htmlFor = 'minute';
  minuteLabel.textContent = 'Minutes';
  const minuteInput = document.createElement('input');
  minuteInput.name = 'minute';
  minuteInput.type = 'number';
  minuteInput.max = '60';
  minuteInput.min = '0';
  minuteDiv.appendChild(minuteLabel);
  minuteDiv.appendChild(minuteInput);
  dateDiv.appendChild(minuteDiv);

  // Day/Night select
  const daynightDiv = document.createElement('div');
  daynightDiv.className = 'form-input';
  const daynightLabel = document.createElement('label');
  daynightLabel.htmlFor = 'daynight';
  daynightLabel.textContent = 'Day/Night';
  const daynightSelect = document.createElement('select');
  daynightSelect.name = 'daynight';
  daynightSelect.id = 'daynight';

  const amOption = document.createElement('option');
  amOption.value = 'AM';
  amOption.textContent = 'AM';
  const pmOption = document.createElement('option');
  pmOption.value = 'PM';
  pmOption.textContent = 'PM';

  daynightSelect.appendChild(amOption);
  daynightSelect.appendChild(pmOption);
  daynightDiv.appendChild(daynightLabel);
  daynightDiv.appendChild(daynightSelect);
  dateDiv.appendChild(daynightDiv);

  // Doctor select
  const doctorDiv = document.createElement('div');
  doctorDiv.className = 'form-input';
  const doctorLabel = document.createElement('label');
  doctorLabel.htmlFor = 'doctor';
  doctorLabel.textContent = 'Doctor';
  const doctorSelect = document.createElement('select');
  doctorSelect.name = 'doctor';
  doctorSelect.id = 'doctor';

  fetchDB('doctors', (res) => {
    const resultArray = Array.isArray(res) ? res : Array.from(res);

    if (resultArray.length === 0) {
      console.log('empty');
      return;
    }

    resultArray.forEach((doc) => {
      const name = `${doc.first_name} ${doc.last_name}`;
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      doctorSelect.appendChild(option);
    });
  });

  doctorDiv.appendChild(doctorLabel);
  doctorDiv.appendChild(doctorSelect);
  dateDiv.appendChild(doctorDiv);

  // Append the date section to the form
  form.appendChild(dateDiv);

  // Symptoms textarea
  const symptomsDiv = document.createElement('div');
  symptomsDiv.className = 'form-input';
  const symptomsLabel = document.createElement('label');
  symptomsLabel.htmlFor = 'symptoms';
  symptomsLabel.textContent = 'Symptoms';
  const symptomsTextarea = document.createElement('textarea');
  symptomsTextarea.name = 'symptoms';
  symptomsTextarea.id = 'symptoms';

  symptomsDiv.appendChild(symptomsLabel);
  symptomsDiv.appendChild(symptomsTextarea);
  form.appendChild(symptomsDiv);

  // Submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Schedule Appointment';
  form.appendChild(submitButton);

  // Append the form to the body or a specific element on your page
  return form;
}
