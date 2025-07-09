import SignUp from './scripts/signUpForm.js';
import logIn from './scripts/logInForm.js';
SignUp();
logIn();

import { checkCookies, logInCheck } from './scripts/utils.js';
import { addToCart, getCartItems } from './scripts/cart.js';

const allProductCards = document.querySelectorAll('.card a');
const loginButton = document.querySelectorAll('.navbar-nav .nav-item .nav-link')[6];
const userCart = []

logInCheck.then(([isLoggedIn]) => {
    console.log(isLoggedIn);
    if (!isLoggedIn) {
        loginButton.innerHTML = '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Login</a>';
    }
    if (isLoggedIn) {
        loginButton.innerHTML = '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Logout</a>';
        loginButton.addEventListener('click', () => {
            // loginButton.innerHTML = isLoggedIn ? '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Logout</a>' : '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Login</a>';
            cookieStore.delete('token').then(() => {
                loginButton.innerHTML = '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Login</a>'
                alert('You have been logged out successfully.');
                // Optionally, you can redirect to the home page or reload the page
                // window.location.reload();
            }).catch(error => {
                console.error('Error logging out:', error);
                alert('An error occurred while logging out.');
            });
        });
        getCartItems().then(cartItems => {
            userCart.push(cartItems)
        });
    }
    else {
        loginButton.addEventListener('click', () => {
            window.location.href = '/login.html';
        });
    }
})

const addToCartLinks = Array.from(allProductCards).filter(link => link.innerText.trim() === 'Add to Cart');
addToCartLinks.forEach(card => {
    card.addEventListener('click', () => {
        logInCheck.then(isLoggedIn => {
            if (!isLoggedIn[0]) {
                alert('Please log in to add items to your cart.');
                return;
            }
            console.log(card);
            addToCart(card).then(response => {
                if (response.success) {
                    alert('Item added to cart successfully!');
                } else {
                    alert('Failed to add item to cart.');
                }
            }).catch(error => {
                console.error('Error adding item to cart:', error);
                alert('An error occurred while adding the item to your cart.');
            });
        }).catch(error => {
            console.error('Error checking login status:', error);
        })
    });
})