const productTable = document.querySelector('.product-table');
const productForm = document.querySelector('.add-product-form');


const LOCAL_URL = 'http://localhost:5000/login';
const PROD_URL = 'process.env.BackendURL/login';
const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

window.addEventListener('DOMContentLoaded', () => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

    if (!token && window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
    }
})

const loginButton = document.querySelectorAll('.navbar-nav .nav-item .nav-link')[6];
const loginForm = document.querySelector('.login-form');
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const result = await response.json();
        if (result.message === 'Invalid Credentials') {
            alert('Invalid email or password. Please try again.');
            return false;
        }
        cookieStore.set('token', result.token, { path: '/' });
        cookieStore.set('user', JSON.stringify(result.role), { path: '/' });
        // cookieStore.set('username', JSON.stringify(result.username), { path: '/' });
        if (result) {
            window.location.href = '/index.html';
            loginButton.innerHTML = '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Logout</a>'
        }
        // if (result === 'admin') {
        //     window.location.href = '/admin.html';
        // }
        alert('Login successful! Redirecting to home page...');
        return true;
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
    return false;
})



const addProduct = async (e) => {
    const LOCAL_URL = 'http://localhost:5000/admin/add-products';
    const PROD_URL = 'process.env.BackendURL/admin/add-products';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    e.preventDefault();
    const formData = new FormData(productForm);
    const tokenCookie = await cookieStore.get('token');

    if (!tokenCookie || !tokenCookie.value) {
        console.error('No token found in cookie store. Please log in.');
        throw new Error('Authentication token not found.');
    }

    const token = tokenCookie.value;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json(); // errorData is an object
            console.error('Failed to add item:', JSON.stringify(errorData, null, 2)); // <-- Use JSON.stringify for console.error
            throw new Error(`Failed to add item to cart: ${errorData.message || response.statusText}`);
        }
        // const result = await response.json();

        alert('Product added successfully!');
        productForm.reset();
        fetchProducts();

    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
}

const fetchProducts = async () => {
    const tokenCookie = await cookieStore.get('token');

    if (!tokenCookie || !tokenCookie.value) {
        console.error('No token found in cookie store. Please log in.');
        throw new Error('Authentication token not found.');
    }

    const token = tokenCookie.value;
    fetch('http://localhost:5000/admin/panel', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.error('Error fetching products:', data.message);
                return;
            }
            const PanelData = { products: data.products, users: data.users, order: data.order };
            productTable.innerHTML = ''; 
            console.log('PanelData:', PanelData);
            PanelData?.products.forEach(product => {
                const productRow = document.createElement('tr');
                productRow.innerHTML = `
          <td>${product.productId}</td>
          <td><img src="${product.imageUrl}" alt="Product" class="img-thumbnail"></td>
          <td>${product.name}</td>
          <td>Rs ${product.price}</td>
          <td>${product.stock}</td>
          <td>${product.category}</td>
          <td>
            <button class="btn btn-sm btn-primary me-1" data-bs-toggle="modal" data-bs-target="#editProductModal">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger">
              <i class="fas fa-trash"></i>
            </button>
          </td>
            `;
                productTable.appendChild(productRow);
            })
        })
        .catch(error => console.error('Error fetching products:', error));
}

fetchProducts();

productForm?.addEventListener('submit', addProduct);