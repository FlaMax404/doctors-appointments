const dbName = 'DoctorsDatabase';
const encryptionKey = '3040929';

let db;
let currentUser;

const appiontmentsData = [];

function openDB() {
  const request = window.indexedDB.open(dbName, 4);
  request.onerror = (e) => {
    console.log(`DATA BASE: ${request.error}`);
  };

  request.onsuccess = (e) => {
    db = e.target.result;

    if (db.version < 4) {
      db.close();
      return;
    }

    console.log('connected to database');

    fetch('https://jsethi-mdx.github.io/cst2572.github.io/doctors.json').then(
      (response) => {
        console.log(response.json());
      }
    );
    fetch('https://jsethi-mdx.github.io/cst2572.github.io/patients.json').then(
      (response) => {
        console.log(response.json());
      }
    );
    fetch('https://jsethi-mdx.github.io/cst2572.github.io/admin.json').then(
      (response) => {
        console.log(response.json());
      }
    );
    fetch('https://jsethi-mdx.github.io/cst2572.github.io/medicines.json').then(
      (response) => {
        console.log(response.json());
      }
    );

    // do user checking
    // currentUser = { username: 'anas', email: 'anas@anas.com' };
    const localUser = JSON.parse(window.localStorage.getItem('user'));
    const userMenu = document.getElementById('user-menu');

    if (!localUser) {
      if (userMenu) {
        userMenu.innerHTML = `
        <a id='sign-link' href='./pages/sign.html'>
            Sign Up
        </a>
      `;
      }

      return;
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

    //users
    if (!db.objectStoreNames.contains('users')) {
      const uStore = db.createObjectStore('users', {
        keyPath: 'id',
        autoIncrement: true,
      });
      uStore.createIndex('email', ['email'], { unique: true });
      uStore.createIndex('username', ['username'], { unique: true });
      uStore.createIndex('type', ['type'], { unique: false });
      console.log('Created users object store!');
    } else {
      console.log('users object store already exists!');
    }

    //   appointments
    if (!db.objectStoreNames.contains('appointments')) {
      const apStore = db.createObjectStore('appointments', {
        keyPath: 'id',
        autoIncrement: true,
      });
      apStore.createIndex('doctor_name', ['doctor'], { unique: false });
      apStore.createIndex('patient_name', ['patient'], { unique: false });
      apStore.createIndex('date', ['date'], { unique: false });
      console.log('Created appointments object store!');
    } else {
      console.log('users object store already exists!');
    }
  };
}

function Login(objectStore) {
  if (db) {
    const transaction = db.transaction(objectStore, 'readonly');
    const store = transaction.objectStore(objectStore);

    let query;
    let user;

    switch (objectStore) {
      case 'admin':
        query = store.index('email');
        user = query.get([email]);
        break;
      case 'doctors':
        query = store.index('email');
        user = query.get([email]);
        break;
      case 'patients':
        query = store.index('Email');
        user = query.get([Email]);
    }

    user.onerror = (e) => {
      console.log(e);
    };

    user.onsuccess = (e) => {
      const u = user.result;

      console.log('yes yes yse', u);
      // const decryptedPassword = Decrypt(u.salt);
      // console.log('decrypted password', decryptedPassword);

      // if (password === decryptedPassword) {
      //   currentUser = u;

      //   window.localStorage.setItem('user', JSON.stringify(u));

      //   window.location.replace('../index.html');
      // } else {
      //   console.log('password is wrong stupid');
      // }
    };
  } else {
    setTimeout(() => Login(username, password), 100);
  }
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

function fetchQueryDB(objectStore, index, query, callback) {
  if (db) {
    const transaction = db.transaction(objectStore, 'readwrite');
    const store = transaction.objectStore(objectStore);

    const dbQuery = store.index(index);
    const data = dbQuery.getAll([query]);

    data.onerror = (e) => {
      console.log('failed to fetch data from', objectStore, 'with error', e);
    };

    data.onsuccess = (e) => {
      callback(data.result);
    };

    data.oncomplete = (e) => {
      console.log('yes');
      renderAppoints();
    };
  } else {
    console.log('DATABASE connection failure, retrying...');
    setTimeout(() => fetchQueryDB(objectStore, index, query, callback), 100);
  }
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

function postRecord(objectStore, data, callback) {
  if (db) {
    const transaction = db.transaction(objectStore, 'readwrite');
    const store = transaction.objectStore(objectStore);

    console.log('something aint working');

    const req = store.put(data);

    req.onerror = (e) => {
      console.log('POST_ERROR:', e);
    };

    req.onsuccess = (e) => {
      console.log(`${data} was posted successfully!`);
      callback();
    };
  } else {
    console.log('DATABASE connection failure, retrying...');
    setTimeout(() => postRecord(objectStore, data, callback), 100);
  }
}

function generateID() {
  return `${Math.floor(Math.random() * (Math.PI * 10000000))}`;
}

function Encrypt(word) {
  const encrypted = CryptoJS.AES.encrypt(word, encryptionKey).toString();

  return encrypted;
}

function Decrypt(encryptedWord) {
  const decrypted = CryptoJS.AES.decrypt(encryptedWord, encryptionKey).toString(
    CryptoJS.enc.Utf8
  );

  return decrypted;
}
