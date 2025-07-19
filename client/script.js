import logIn from './scripts/logInForm.js';
import {VerifiedSignUp} from './scripts/verifyToSignup.js';
VerifiedSignUp()
logIn();

import { checkCookies, logInCheck, Toaster } from './scripts/utils.js';
import { addToCart, getFeaturedProduct, getUserPanelData } from './scripts/user.js';

const loginButton = document.querySelectorAll('.navbar-nav .nav-item .nav-link')[6];
const FeaturedScroll = document?.querySelector('.featured-scroll')


getFeaturedProduct().then(data => {
    data.forEach((dt) => {
        const featuredDiv = document.createElement('div')
        featuredDiv.className = 'product-card card flex-shrink-0'
        featuredDiv.setAttribute('data-product-id', dt._id)
        featuredDiv.innerHTML = `
        <img src=${dt.imageUrl} class="product-img" alt="${dt.name}">
      <div class="product-body">
        <h6 class="product-title" title="Stylish Sneakers">${dt.name}</h6>
        <p class="product-price">₹${dt.price}</p>
        <span class="stock-badge ${data.stock !== 0 ? 'in-stock' : 'out-of-stock'}"">${data.stock !== 0 ? 'In Stock' : 'Out of stock'}</span>
        <a href= "" style="margin-top: 50px" class="btn btn-sm btn-primary w-100 mt-2">Add to Cart</a>
      </div>
        `
        FeaturedScroll?.append(featuredDiv)
    })
    const allProductCards = document?.querySelectorAll('.featured-scroll .card a');
    const addToCartLinks = Array.from(allProductCards)
    .filter(link => link.innerText.trim() === 'Add to Cart');
    addToCartLinks.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            logInCheck.then(([isLoggedIn]) => {
                if (!isLoggedIn) {
                    Toaster('Please log in to add items to your cart.');
                    return;
                }
                event.preventDefault();
                const productId = card.parentElement.parentElement.getAttribute('data-product-id');
                addToCart(productId)
            });
        })
    })
})

logInCheck.then(([isLoggedIn]) => {
    console.log(isLoggedIn);
    if (!isLoggedIn) {
        loginButton.innerHTML = '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Login</a>';
    }
    if (isLoggedIn) {
        loginButton.innerHTML = '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Logout</a>';
        loginButton.addEventListener('click', () => {
            cookieStore.delete('token').then(() => {
                loginButton.innerHTML = '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Login</a>'
                Toaster('You have been logged out successfully.');
            }).catch(error => {
                console.error('Error logging out:', error);
                Toaster('An error occurred while logging out.');
            });
        });
        getUserPanelData().then(panelData => {
            console.log(panelData)
        });
    }
    else {
        loginButton.addEventListener('click', () => {
            window.location.href = '/login.html';
        });
    }
})

