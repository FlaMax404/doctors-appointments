const qRegister = document.getElementById('q-register');
const rSection = document.getElementById('register-section');
const rForm = document.getElementById('r-form');

window.addEventListener('load', () => {
  const user = JSON.parse(window.localStorage.getItem('user'));

  if (user && user.accountType !== 'admin') {
    alert('Your account does not have permission to access this page.');
    window.location.replace('/index.html');
  }
});

rForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (rForm['terms'].value === false) {
    alert('please agree to our terms!');
    return;
  }

  if (
    containsNonLetters(rForm['first'].value) ||
    containsNonLetters(rForm['last'].value)
  ) {
    alert('you cannot add numbers or special characters to ur name');
    return;
  }

  const newUser = {
    NHS: rForm['NHS'].value,
    Title: rForm['title'].value,
    First: rForm['first'].value,
    Last: rForm['last'].value,
    Email: rForm['email'].value,
    Gender: rForm['gender'].value,
    Address: rForm['address'].value,
    DOB: rForm['dob'].value,
    Telephone: rForm['telephone'].value,
  };

  console.log(newUser);

  storeData('patients', newUser);
  // postRecord('users', newUser, () => {
  //   window.location.replace('../index.html');
  // });
});
