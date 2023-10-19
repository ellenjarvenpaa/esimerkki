//import { pwaInfo } from 'virtual:pwa-info';
import {fetchData} from './functions.js';
import {LoginUser, User} from './interfaces/User.js';
import {apiUrl} from './variables.js';
import './dialogi.css';

// PWA code
//console.log(pwaInfo);

// select forms from the DOM
const loginForm = document.querySelector('#login-form');

// select inputs from the DOM
const usernameInput = document.querySelector('#username') as HTMLInputElement | null;
const passwordInput = document.querySelector('#password') as HTMLInputElement | null;

const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement;

// select profile elements from the DOM
const usernameTarget = document.querySelector('#username-target');
const emailTarget = document.querySelector('#email-target');

// TODO: function to login
const login = async (user: {
  username: string;
  password: string;
}): Promise<LoginUser> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  }
  return await fetchData<LoginUser>(apiUrl + '/auth/login', options);
};

// TODO: function to add userdata (email, username and avatar image) to the
// Profile DOM and Edit Profile Form
const addUserDataToDom = (user: User): void => {
  if (!usernameTarget || !emailTarget || !profileEmailInput || !profileUsernameInput) {
    return;
  }
  usernameTarget.innerHTML = user.username;
  emailTarget.innerHTML = user.email;

  profileEmailInput.value = user.email;
  profileUsernameInput.value = user.username;
};

// function to get userdata from API using token
const getUserData = async (token: string): Promise<User> => {
  const options: RequestInit = {
    headers: {
      Authorization: 'Bearer' + token,
    },
  };
  return await fetchData<User>(apiUrl + '/users/token', options);
};

// TODO: function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom
const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }
  const userData = await getUserData(token);
  await addUserDataToDom(userData);
};

// call checkToken on page load to check if token exists and update the DOM
checkToken();

// TODO: login form event listener
// event listener should call login function and save token to local storage
// then call addUserDataToDom to update the DOM with the user data
loginForm?.addEventListener('submit', async (evt)=>{
  evt.preventDefault();
  if(!usernameInput || !passwordInput) {
    return;
  }
  const user = {
    username: usernameInput.value,
    password: passwordInput.value,
  }
  const loginData = await login(user);
  console.log(loginData);
  localStorage.setItem('token', loginData.token);
  addUserDataToDom(loginData.data);
});

