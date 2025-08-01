import logIn from './scripts/logInForm.js';
import { VerifiedSignUp } from './scripts/verifyToSignup.js';
import { handlePayment } from './scripts/PaymentHandler.js';

VerifiedSignUp()
logIn();
handlePayment()

import { fetchAllProduct, logInCheck, Toaster } from './scripts/utils.js';
import { addToCart, getFeaturedProduct, getUserPanelData } from './scripts/user.js';

const loginButton = document.querySelectorAll('.navbar-nav .nav-item .nav-link')[6];
const FeaturedScroll = document.querySelector('.featured-scroll')


fetchAllProduct().then(products => {
    let linkTocategory = []
    let categories = []

    const dropdownMenu = document?.querySelector('.dropdown-menu')
    dropdownMenu.innerHTML = ''
    products.forEach(({ category }) => {
        if (!linkTocategory.includes(category.toLocaleLowerCase().split(' ')[0])) {
            linkTocategory.push(category.toLocaleLowerCase().split(' ')[0])
        }
        if (!categories.includes(category)) {
            categories.push(category)
        }

    })

    const pathName = ['/index.html', '/cart.html', '/orders.html', '/contact.html', '/offers.html', '/']
    categories.forEach((cat, idx) => {
        const li = document.createElement('li')
        li.innerHTML =
            `<a class="dropdown-item" 
                href="${(location.pathname.split('/')[1] === 'Categories' || pathName.includes(location.pathname))
                ? '/Categories/' :
                '/'}${linkTocategory[idx]}.html">${cat}</a>`;
        dropdownMenu.append(li)
    })

    const cardContainer = document.querySelectorAll('.row.g-4')

    if (location.pathname === '/index.html' || location.pathname === '/') {
        cardContainer[0].innerHTML = ''
        categories.forEach((cat, idx) => {
            const div = document.createElement('div')
            div.className = 'col-6 col-md-4 col-lg-3'
            div.innerHTML = `
          <div class="card shadow  p-3 h-100">
            <h5 class="fw-bold mb-3 text-center text-primary">${cat}</h5>
            <div class="overflow-hidden ">
              <img
                src="https://pngimg.com/d/shopping_cart_PNG7.png"
                alt="Electronics" class="img-fluid category-image mb-3"
                style="transition: transform 0.4s; height: 220px; object-fit: cover; width: 100%;">
            </div>
            <a href="${(location.pathname.split('/')[1] === 'Categories' || pathName.includes(location.pathname))
                    ? '/Categories/' :
                    '/'}${linkTocategory[idx]}.html" class="text-decoration-none fw-semibold text-primary">See More</a>
          </div>`
            cardContainer[0].append(div)
        })
    }


    if (cardContainer[1]) {
        cardContainer[1].innerHTML = '';
    }
    products.forEach((product, idx) => {
        if (product.category.toLocaleLowerCase().split(' ')[0] !== location.pathname.split('/')[2]?.split('.')[0]) {

            return;
        }
        const cardDiv = document.createElement('div')
        cardDiv.className = 'product-card card flex-shrink-0'
        cardDiv.setAttribute('data-product-id', product._id)
        cardDiv.innerHTML = `
        <img src=${product.imageUrl} class="product-img" alt="${product.name}">
      <div class="product-body">
        <h6 class="product-title" title="Stylish Sneakers">${product.name}</h6>
        <p class="product-price">₹${product.price}</p>
        <span class="stock-badge ${product.stock !== 0 ? 'in-stock' : 'out-of-stock'}"">${product.stock !== 0 ? 'In Stock' : 'Out of stock'}</span>
        <a href= "" style="margin-top: 50px" class="btn btn-sm btn-primary w-100 mt-2">Add to Cart</a>
      </div>
        `
        cardContainer[1]?.append(cardDiv)
        const allProductCards = document?.querySelectorAll('.card a');
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
    });

})

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
        <span class="stock-badge ${dt.stock !== 0 ? 'in-stock' : 'out-of-stock'}"">${dt.stock !== 0 ? 'In Stock' : 'Out of stock'}</span>
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
    }
    else {
        loginButton.addEventListener('click', () => {
            window.location.href = '/login.html';
        });
    }
})



