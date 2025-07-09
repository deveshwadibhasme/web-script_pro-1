

let checkCookies = cookieStore?.get('token').then(token => {
    if (token?.value !== 'undefined') {
        return [true,token?.value];
    }
    else {
        console.log('No token found');
        return [false];
    }
}).catch(error => {
    console.error('Error checking token:', error);
    return false;
});

let logInCheck = checkCookies.then(result => {
    if(!result[0]) {
        console.log('User is not logged in');
        return [false];
    }
    return result;
}).catch(error => {
    console.error('Error in logInCheck:', error);
    return false;
});



export { logInCheck ,checkCookies };

