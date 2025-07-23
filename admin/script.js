const productTable = document.querySelector('.product-table');
const productForm = document.querySelector('.add-product-form');

const LOCAL_URL = 'http://localhost:5000/login';
const PROD_URL = 'https://ecomm-webscript.onrender.com/login';
const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;


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

window.addEventListener('DOMContentLoaded', () => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('adminToken='))
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
            Toaster('Invalid email or password. Please try again.');
            return false;
        }
        cookieStore.set('adminToken', result.token, { path: '/' });
        cookieStore.set('user', JSON.stringify(result.role), { path: '/' });
        // cookieStore.set('username', JSON.stringify(result.username), { path: '/' });
        if (result) {
            window.location.href = '/index.html';
            loginButton.innerHTML = '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Logout</a>'
        }
        // if (result === 'admin') {
        //     window.location.href = '/admin.html';
        // }
        Toaster(`Hello ${result.username} ,Login successful! Redirecting to home page...`);
        return true;
    } catch (error) {
        console.error('Error:', error);
        Toaster('Login failed. Please check your credentials and try again.');
    }
    return false;
})

const addProduct = async (e) => {
    const LOCAL_URL = 'http://localhost:5000/admin/add-products';
    const PROD_URL = 'https://ecomm-webscript.onrender.com/admin/add-products';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    e.preventDefault();
    const formData = new FormData(productForm);
    const tokenCookie = await cookieStore.get('adminToken');

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

        Toaster('Product added successfully!');
        productForm.reset();
        fetchProducts();

    } catch (error) {
        console.error('Error adding item to cart:', error);
        Toaster('Fix your Time or its server error!');
        throw error;
    }
}

productForm?.addEventListener('submit', addProduct);

const fetchPanelData = async () => {
    const tokenCookie = await cookieStore.get('adminToken');

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
            });



            //grahak
            const customerTable = document.querySelector('.customer-table');
            customerTable.innerHTML = '';
            PanelData?.users.forEach(user => {
                const userRow = document.createElement('tr');
                userRow.innerHTML = `
                    <td>${(user._id).slice(0, 5)}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${user.date || 'No Info'}</td>
                    <td>
                    <select class="user-status" style="padding:5px">
                        <option value=${user.adminRestrict ? "active" : "block"} style="padding:5px" class="badge bg-success">${!user.adminRestrict ? "Active" : "Block"} </option>
                        <option  value=${!user.adminRestrict ? "active" : "block"} style="padding:5px" class="badge bg-danger">${user.adminRestrict ? "Active" : "Block"} </option>
                    </select>
                    </td>
                    <td>
            <button class="btn btn-sm btn-info me-1 text-white" data-bs-toggle="modal" data-bs-target="#viewCustomerModal">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-danger">
              <i class="fas fa-trash"></i>
            </button>
          </td>`
                customerTable.appendChild(userRow);
                const userStatus = document.querySelector('td .user-status')
                userStatus.addEventListener('input', (input) => {
                    if (input.target.value === 'active') {
                        changeUserStatus(`block-user/${user._id}`)
                    }
                    if (input.target.value === 'block') {
                        changeUserStatus(`unblock-user/${user._id}`)
                    }
                })
            })
        })
        .catch(error => console.error('Error fetching products:', error));
}
fetchPanelData();

const changeUserStatus =  async (endPoint) => {
    const LOCAL_URL = `http://localhost:5000/admin/${endPoint}`;
    const PROD_URL = `https://ecomm-webscript.onrender.com/admin/${endPoint}`;
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    const tokenCookie = await cookieStore.get('adminToken');

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
        });

        if (!response.ok) {
            const errorData = await response.json(); // errorData is an object
            console.error('Failed to add item:', JSON.stringify(errorData, null, 2)); // <-- Use JSON.stringify for console.error
            throw new Error(`Failed to add item to cart: ${errorData.message || response.statusText}`);
        }
        // const result = await response.json();

        Toaster('User Status Changes successfully!');
        fetchPanelData()

    } catch (error) {
        console.error('Error adding item to cart:', error);
        Toaster('Fix your Time or its server error!');
        throw error;
    }
}

