const qRegister = document.getElementById('q-register');
const qLogin = document.getElementById('q-login');

const rSection = document.getElementById('register-section');
const lSection = document.getElementById('login-section');

const rForm = document.getElementById('r-form');
const lForm = document.getElementById('l-form');

window.onload = () => {
  openDB();
};

qRegister.addEventListener('click', () => {
  lSection.classList.remove('sign-section');
  lSection.classList.add('hidden');
  rSection.classList.add('sign-section');
  rSection.classList.remove('hidden');
});

qLogin.addEventListener('click', () => {
  rSection.classList.remove('sign-section');
  rSection.classList.add('hidden');
  lSection.classList.add('sign-section');
  lSection.classList.remove('hidden');
});

rForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (
    rForm['username'].value === '' ||
    rForm['email'].value === '' ||
    rForm['password'].value === '' ||
    rForm['acc-type'].value === ''
  ) {
    alert('Please fill out all fields');
    return;
  }

  if (rForm['terms'].value === false) {
    alert('please agree to our terms!');
    return;
  }

  const newUser = {
    id: generateID(),
    username: rForm['username'].value,
    email: rForm['email'].value,
    type: rForm['acc-type'].value,
    salt: Encrypt(rForm['password'].value),
  };

  postRecord('users', newUser, () => {
    window.location.replace('../index.html');
  });
});

lForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (lForm['username'].value === '' || lForm['password'] === '') {
    alert('Please provide a username and a password');
    return;
  }

  Login(lForm['username'].value, lForm['password'].value);
});
