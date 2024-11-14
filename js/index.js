const main = document.getElementById('main');
const form = document.getElementById('appointment-form');

window.onload = () => {
  openDB();
};

window.onclose = () => {
  console.log('db should close connection');
};

renderAppoints();

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

function renderAppoints() {
  main.innerHTML = '';

  fetchDB('appointments', (res) => {
    const resultArray = Array.isArray(res) ? res : Array.from(res);

    if (resultArray.length === 0) {
      console.log('No appointments found.');
      return;
    }

    resultArray.forEach((appoint, index) => {
      //   console.log(`Appointment ${index}:`, appoint);
      main.appendChild(appointmentElement(appoint));
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
