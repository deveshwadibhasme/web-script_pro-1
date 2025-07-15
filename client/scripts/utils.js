

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




export { logInCheck, checkCookies };