const lForm = document.getElementById('l-form');

lForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (lForm['email'].value === '' || lForm['password'] === '') {
    alert('Please provide a username and a password');
    return;
  }

  Login(lForm['email'].value, lForm['password'].value);
});
