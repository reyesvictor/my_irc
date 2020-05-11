import cookie from 'js-cookie'

//set cookie
//key = name, value = token
export const setCookie = (key, value) => {
  if (window !== 'undefined') {
    cookie.set(key, value, {
      //1 day
      expires: 1,
    });
  }
};

//remove cookie
export const removeCookie = (key) => {
  if (window !== 'undefined') {
    cookie.remove(key, {
      expires: 1,
    });
  }
};

// get from cookie such as stored token
//will be useful when we need to make request to server with token
export const getCookie = (key) => {
  if (window !== 'undefined') {
    return cookie.get(key);
  }
};

//set in localstorage
export const setLocalStorage = (key, value) => {
  if (window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

//remove from localstorage
export const removeLocalStorage = (key) => {
  if (window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// authenticate user by passing data to cookie and localstorage during signin
export const authenticate = (res, next) => {
  console.log('====AUTHENTICATE ON LOGIN RESPONSE=====', res);
  setCookie('token', res.data.token);
  setLocalStorage('user', res.data.user);
  next();
};

//access user info from localstorage
export const isAuth = () => {
  if (window !== 'undefined') {
    const cookieChecked = getCookie('token');
    if (cookieChecked) {
      if (localStorage.getItem('user')) {
        return JSON.parse(localStorage.getItem('user'));
      }
    } else {
      return false;
    }
  }
};


//disconnect user
export const logout = next => {
  removeCookie('token')
  removeLocalStorage('user')
  next()
}