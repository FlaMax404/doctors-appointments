const dbName = 'DoctorsDatabase';
const encryptionKey = '3040929';

let db;
let currentUser;

window.onload = () => {
  openDB();
};

function openDB() {
  const request = window.indexedDB.open(dbName, 5); // Increased version number

  request.onerror = (e) => {
    console.log(`DATABASE ERROR: ${request.error}`);
  };

  request.onsuccess = (e) => {
    db = e.target.result;

    if (db.version < 5) {
      db.close();
      return;
    }

    console.log('Connected to database');

    // Fetch and store JSON data
    Promise.all([
      fetch('../doctors.json')
        .then((response) => response.json())
        .then((data) => storeData('doctors', data)),
      fetch('../patients.json')
        .then((response) => response.json())
        .then((data) => storeData('patients', data)),
      fetch('../admin.json')
        .then((response) => response.json())
        .then((data) => storeData('admin', data)),
      fetch('../medicines.json')
        .then((response) => response.json())
        .then((data) => storeData('medicines', data)),
    ]).catch((error) => console.error('Error fetching JSON data:', error));

    // User checking logic remains the same
    const localUser = JSON.parse(window.localStorage.getItem('user'));
    const userMenu = document.getElementById('user-menu');

    if (!localUser) {
      if (window.location.pathname !== '/pages/login.html') {
        window.location.replace('../pages/login.html');
      }
    } else {
      currentUser = localUser;
    }

    if (currentUser) {
      if (userMenu) {
        if (currentUser.accountType === 'patients') {
          // prettier-ignore
          userMenu.innerHTML = `<h1>${currentUser.user.First + ' ' + currentUser.user.Last}</h1>
          <button id="sign-out"><i class="fa-solid fa-sign-out-alt"></i></button>
          `;
        } else {
          userMenu.innerHTML = `
          <h1>${
            currentUser.user.first_name + ' ' + currentUser.user.last_name
          }</h1>
          <button id="sign-out"><i class="fa-solid fa-sign-out-alt"></i></button>
        `;
        }

        document.getElementById('sign-out').addEventListener('click', () => {
          currentUser = {};
          window.localStorage.clear();
          window.location.reload();
        });
      }
    }
  };

  request.onupgradeneeded = (e) => {
    db = e.target.result;
    console.log('Upgrading database schema to version:', db.version);

    // Create object stores if they don't exist
    const stores = {
      users: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'email', keyPath: ['email'], options: { unique: true } },
          {
            name: 'username',
            keyPath: ['username'],
            options: { unique: true },
          },
          { name: 'type', keyPath: ['type'], options: { unique: false } },
        ],
      },
      appointments: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          {
            name: 'doctor_name',
            keyPath: ['doctor'],
            options: { unique: false },
          },
          {
            name: 'patient_name',
            keyPath: ['patient'],
            options: { unique: false },
          },
          { name: 'date', keyPath: ['date'], options: { unique: false } },
        ],
      },
      doctors: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'email', keyPath: ['email'], options: { unique: true } },
          {
            name: 'last_name',
            keyPath: ['last_name'],
            options: { unique: true },
          },
        ],
      },
      patients: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'Last', keyPath: ['Last'], options: { unique: false } },
          { name: 'Email', keyPath: ['Email'], options: { unique: true } },
          { name: 'id', keyPath: ['id'], options: { unique: true } },
        ],
      },
      admin: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          {
            name: 'email',
            keyPath: ['email'],
            options: { unique: true },
          },
          {
            name: 'last_name',
            keyPath: ['last_name'],
            options: { unique: true },
          },
        ],
      },
      medicines: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'name', keyPath: ['name'], options: { unique: true } },
          {
            name: 'category',
            keyPath: ['category'],
            options: { unique: false },
          },
        ],
      },
    };

    // Create all object stores
    for (const [storeName, storeConfig] of Object.entries(stores)) {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {
          keyPath: storeConfig.keyPath,
          autoIncrement: storeConfig.autoIncrement,
        });

        // Create indexes
        if (storeConfig.indexes) {
          storeConfig.indexes.forEach((index) => {
            store.createIndex(index.name, index.keyPath, index.options);
          });
        }

        console.log(`Created ${storeName} object store!`);
      } else {
        console.log(`${storeName} object store already exists!`);
      }
    }
  };
}

function fetchDB(objectStore, callback) {
  if (db) {
    const transaction = db.transaction(objectStore, 'readwrite');
    const store = transaction.objectStore(objectStore);

    const data = store.getAll();

    data.onerror = (e) => {
      console.log('failed to fetch data from', objectStore, 'with error', e);
    };

    data.onsuccess = (e) => {
      callback(data.result);
    };
  } else {
    console.log('DATABASE connection failure, retrying...');
    setTimeout(() => fetchDB(objectStore, callback), 100);
  }
}

// Helper function to store data in an object store
function storeData(storeName, data) {
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  // Clear existing data
  store.clear();

  // Add new data
  if (Array.isArray(data)) {
    data.forEach((item) => {
      store.add(item);
    });
  } else {
    store.add(data);
  }

  transaction.oncomplete = () => {
    console.log(`Successfully stored data in ${storeName}`);
  };

  transaction.onerror = (e) => {
    console.error(`Error storing data in ${storeName}:`, e.target.error);
  };
}

function deleteRecord(objectStore, id, callback) {
  if (db) {
    const transaction = db.transaction(objectStore, 'readwrite');
    const store = transaction.objectStore(objectStore);

    const deleteReq = store.delete(id);

    deleteReq.onsuccess = () => {
      console.log(`deleted record with id:${id}`);
      callback();
    };
  } else {
    console.log('DATABASE connection failure, retrying...');
    setTimeout(() => deleteRecord(objectStore, index, callback), 100);
  }
}

function updatePatient(
  id,
  { NHS, title, first, last, dob, gender, address, email, telephone }
) {
  if (!db) {
    console.error('Database not initialized');
    return;
  }

  console.log('trying to change id', id);

  const transaction = db.transaction('patients', 'readwrite');
  const store = transaction.objectStore('patients');

  const request = store.get(id);

  request.onsuccess = () => {
    const patient = request.result;

    patient.NHS = NHS || patient.NHS;
    patient.Title = title || patient.Title;
    patient.First = first || patient.First;
    patient.Last = last || patient.Last;
    patient.DOB = dob || patient.DOB;
    patient.Gender = gender || patient.Gender;
    patient.Address = address || patient.Address;
    patient.Email = email || patient.Email;
    patient.Telephone = telephone || patient.Telephone;

    const updateReq = store.put(patient);

    updateReq.onsuccess = () => {
      console.log('patient updated successfully!', updateReq.result);
    };
  };
}

async function findUserByEmail(email) {
  const stores = ['admin', 'doctors', 'patients'];

  for (let storeName of stores) {
    console.log(`Checking store: ${storeName}`);
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);

    // Use the correct index name
    const indexName = storeName === 'patients' ? 'Email' : 'email';
    console.log(`Using index: ${indexName}`);
    const query = store.index(indexName);
    const userRequest = query.get([email]);

    // Await the request and capture any errors
    const user = await new Promise((resolve, reject) => {
      userRequest.onsuccess = () => {
        console.log(`User search result in ${storeName}:`, userRequest.result);
        resolve(
          userRequest.result ? { ...userRequest.result, storeName } : null
        );
      };
      userRequest.onerror = (e) => {
        console.error(`Error accessing store ${storeName}:`, e);
        reject(e);
      };
    });

    if (user) {
      console.log(`User found in ${storeName}:`, user);
      return { user, storeName }; // Exit if a user is found
    }
  }

  console.log('User not found in any store.');
  return null; // Return null if no user is found in any store
}

async function Login(email, password) {
  if (db) {
    const { user, storeName } = await findUserByEmail(email);

    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);

    const indexName = storeName === 'patients' ? 'Last' : 'last_name';
    const query = store.index(indexName);
    const userReq = query.get([password]);

    userReq.onsuccess = () => {
      const u = userReq.result;

      if (u) {
        window.localStorage.setItem(
          'user',
          JSON.stringify({ user: u, accountType: storeName })
        );
        window.location.replace('../index.html');
      } else {
        alert('incorrect email or password inserted.');
      }
    };

    userReq.onerror = () => {
      alert('incorrect email or password inserted.');
    };

    if (!user) {
      alert('incorrect email or password inserted.');
      return;
    }
  } else {
    setTimeout(() => Login(username, password), 100);
  }
}
const containsNonLetters = (value) => {
  return /[^a-zA-Z]/.test(value);
};
