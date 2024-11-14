const dbName = 'DoctorsDatabase';
const encryptionKey = '3040929';

let db;
let currentUser;

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
      fetch('https://jsethi-mdx.github.io/cst2572.github.io/doctors.json')
        .then(response => response.json())
        .then(data => storeData('doctors', data)),
      fetch('https://jsethi-mdx.github.io/cst2572.github.io/patients.json')
        .then(response => response.json())
        .then(data => storeData('patients', data)),
      fetch('https://jsethi-mdx.github.io/cst2572.github.io/admin.json')
        .then(response => response.json())
        .then(data => storeData('admin', data)),
      fetch('https://jsethi-mdx.github.io/cst2572.github.io/medicines.json')
        .then(response => response.json())
        .then(data => storeData('medicines', data))
    ]).catch(error => console.error('Error fetching JSON data:', error));

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
        userMenu.innerHTML = `
          <h1>${currentUser.username}</h1>
          <button id="sign-out"><i class="fa-solid fa-sign-out-alt"></i></button>
        `;

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
          { name: 'username', keyPath: ['username'], options: { unique: true } },
          { name: 'type', keyPath: ['type'], options: { unique: false } }
        ]
      },
      appointments: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'doctor_name', keyPath: ['doctor'], options: { unique: false } },
          { name: 'patient_name', keyPath: ['patient'], options: { unique: false } },
          { name: 'date', keyPath: ['date'], options: { unique: false } }
        ]
      },
      doctors: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'name', keyPath: ['name'], options: { unique: false } },
          { name: 'specialty', keyPath: ['specialty'], options: { unique: false } }
        ]
      },
      patients: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'name', keyPath: ['name'], options: { unique: false } },
          { name: 'email', keyPath: ['email'], options: { unique: true } }
        ]
      },
      admin: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'username', keyPath: ['username'], options: { unique: true } }
        ]
      },
      medicines: {
        keyPath: 'id',
        autoIncrement: true,
        indexes: [
          { name: 'name', keyPath: ['name'], options: { unique: true } },
          { name: 'category', keyPath: ['category'], options: { unique: false } }
        ]
      }
    };

    // Create all object stores
    for (const [storeName, storeConfig] of Object.entries(stores)) {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {
          keyPath: storeConfig.keyPath,
          autoIncrement: storeConfig.autoIncrement
        });

        // Create indexes
        if (storeConfig.indexes) {
          storeConfig.indexes.forEach(index => {
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
    data.forEach(item => {
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
