

let checkCookies = cookieStore?.get('token').then(token => {
    if (token && token.value) {
        // console.log("Token found:", token.value); 
        return [true, token.value];
    } else {
        console.log('No token found in cookie store, or token value is empty.');
        return [false, null];
    }
}).catch(error => {
    console.error('Error checking token from cookieStore:', error);
    return [false, null];
});



let logInCheck = checkCookies.then(result => {
    const isLoggedIn = result[0];
    const tokenValue = result[1];

    if (!isLoggedIn) {
        console.log('User is not logged in based on cookie check (no valid token).');
        return [false, null];
    }
    console.log('User is logged in.');
    return [true, tokenValue];
}).catch(error => {
    console.error('Unexpected error in logInCheck processing:', error);
    return [false, null];
});


const Toaster = (text) => {
    const toRender = `<div id="toaster" class="toaster">
      ${text}
  </div>`
    const nav = document.querySelector('nav')
    nav.insertAdjacentHTML('beforeend', toRender)
    const toaster = document.getElementById('toaster');
    toaster.classList.add('show');
    const timer = setTimeout(() => {
        toaster.classList.remove('show');
        clearTimeout(timer)
    }, 2000)
}

const fetchAllProduct = async () => {
    const LOCAL_URL = 'http://localhost:5000/user/all-product';
    const PROD_URL = 'https://ecomm-webscript.onrender.com/user/all-product';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    
    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Server Error');
        }

        const result = await response.json();
        return result;
    }
    catch (error) {
        console.error('Error:', error);
        Toaster('internal Server Error');
    }
}

const postTotalPrice = async () => {
    const LOCAL_URL = 'http://localhost:5000/user/total-price';
    const PROD_URL = 'https://ecomm-webscript.onrender.com/user/total-price';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL

    const isLoginToken = await checkCookies;
    if (!isLoginToken[0]) {
        Toaster('Please log in to proceed.');
        return;
    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${isLoginToken[1]}`
            }   
        });

        if (!response.ok) {
            throw new Error('Server Error');
        }
    }
    catch (error) {
        console.error('Error:', error);
        Toaster('internal Server Error');
    }
}





export { logInCheck, checkCookies, Toaster, fetchAllProduct, postTotalPrice };