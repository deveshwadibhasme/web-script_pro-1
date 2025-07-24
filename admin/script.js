const productTable = document.querySelector('.product-table');
const productForm = document.querySelector('.add-product-form');
const editForm = document.querySelector('.edit-product-form')

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


const fetchPanelData = (() => {
    let token = null;
    let product = [];
    let customer = [];

    const getToken = async () => {
        const tokenCookie = await cookieStore.get('adminToken');
        if (!tokenCookie || !tokenCookie.value) {
            console.error('No token found in cookie store. Please log in.');
            throw new Error('Authentication token not found.');
        }
        token = tokenCookie.value;
    };

    const init = async () => {
        await getToken();

        try {
            const response = await fetch('http://localhost:5000/admin/panel', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.message) {
                console.error('Error fetching data:', data.message);
                return;
            }

            product = data.products;
            customer = data.users;
        } catch (err) {
            console.error('Failed to fetch panel data:', err);
        }
    };

    const renderProduct = () => {
        const productTable = document.querySelector('.product-table');
        productTable.innerHTML = '';

        product.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.productId}</td>
                <td><img src="${p.imageUrl}" alt="Product" class="img-thumbnail"></td>
                <td>${p.name}</td>
                <td>Rs ${p.price}</td>
                <td>${p.stock}</td>
                <td>${p.category}</td>
                <td>
                    <button id="edit-product" class="btn btn-sm btn-primary me-1" data-bs-toggle="modal" data-bs-target="#editProductModal">
                        <i data-product-id=${p.productId} data-product-stock=${p.stock} data-product-price=${p.price} class="fas fa-edit"></i>
                    </button>
                    <button id="delete-product" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            productTable.appendChild(row);
            const deletePro = document.querySelectorAll('#product-table .product-table tr td #delete-product')
            deleteProd(deletePro, p)
            const editPro = document.querySelectorAll('#product-table .product-table tr td #edit-product')
            editPro.forEach(edi => edi.addEventListener('click', editProduct))
        });
    };

    const renderCustomer = () => {
        const customerTable = document.querySelector('.customer-table');
        customerTable.innerHTML = '';

        customer.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${(user._id).slice(0, 5)}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.date || 'No Info'}</td>
                <td>
                    <select class="user-status">
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
                </td>
            `;
            customerTable.appendChild(row);

            const viewCustomerDetails = document.querySelector("#viewCustomerModal > div > div > div.modal-body");
            viewCustomerDetails.innerHTML = `
                <p><strong>Name:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> +91 ${user.phone}</p>
                <p><strong>Status:</strong> ${!user.adminRestrict ? "Active" : "Block"}</p>
                <p><strong>Joined:</strong> ${user.date || 'No Info'}</p>
                <hr>
                <p><strong>Shipping Address:</strong></p>
                <p>${user.address}</p>
                <p><strong>Orders:</strong> ${user.orders.length}</p>
                <p><strong>Total Spent:</strong> $1500</p>
            `;
            const userStatus = row.querySelector('.user-status');
            userStatus.addEventListener('input', (input) => {
                if (input.target.value === 'active') {
                    changeUserStatus(`block-user/${user._id}`);
                }
                if (input.target.value === 'block') {
                    changeUserStatus(`unblock-user/${user._id}`);
                }
            });
        });
    };

    return {
        init,
        renderProduct,
        renderCustomer,
        get data() {
            return { product, customer };
        }
    };
})();
await fetchPanelData.init()
fetchPanelData.renderCustomer()
fetchPanelData.renderProduct()

function deleteProd(pro, p) {
    pro.forEach((del) => {
        del.addEventListener('click', async () => {
            const LOCAL_URL = `http://localhost:5000/admin/del-product/${p._id}`;
            const PROD_URL = `https://ecomm-webscript.onrender.com/admin/del-product/${p._id}`;
            const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

            const tokenCookie = await cookieStore.get('adminToken');

            if (!tokenCookie || !tokenCookie.value) {
                console.error('No token found in cookie store. Please log in.');
                throw new Error('Authentication token not found.');
            }

            const token = tokenCookie.value;
            try {
                const response = await fetch(url, {
                    method: 'DELETE',
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

                Toaster('Deleted successfully!');
                await fetchPanelData.init()
                fetchPanelData.renderProduct()

            } catch (error) {
                console.error('Error adding item to cart:', error);
                Toaster('Fix your Time or its server error!');
                throw error;
            }
        })
    })
}

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
        productForm.querySelector('button[type="submit"]').disabled = true
        productForm.querySelector('button[type="submit"]').textContent = "Sending..."
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
        await fetchPanelData.init()
        fetchPanelData.renderProduct()

    } catch (error) {
        console.error('Error adding item to cart:', error);
        Toaster('Fix your Time or its server error!');
        throw error;
    } finally {
        productForm.querySelector('button[type="submit"]').disabled = false
        productForm.querySelector('button[type="submit"]').textContent = "Add Product"
    }
}

productForm?.addEventListener('submit', addProduct);

function editProduct(e) {
    const productId = editForm.querySelector('#productId')
    const stock = editForm.querySelector('#productStock')
    const price = editForm.querySelector('#productPrice')
    console.dir(e)
    if (productId) {
        productId.value = e.target.dataset.productId
        stock.value = e.target.dataset.productStock
        price.value = e.target.dataset.productPrice
    }
    editForm?.addEventListener('submit', async (e) => {
        const LOCAL_URL = 'http://localhost:5000/admin/add-products';
        const PROD_URL = 'https://ecomm-webscript.onrender.com/admin/add-products';
        const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

        e.preventDefault();
        const formData = new FormData(editForm);
        const tokenCookie = await cookieStore.get('adminToken');

        if (!tokenCookie || !tokenCookie.value) {
            console.error('No token found in cookie store. Please log in.');
            throw new Error('Authentication token not found.');
        }

        const token = tokenCookie.value;
        try {
            editForm.querySelector('button[type="submit"]').disabled = true
            editForm.querySelector('button[type="submit"]').textContent = "Sending..."
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
            editForm.reset();
            await fetchPanelData.init()
            fetchPanelData.renderProduct()

        } catch (error) {
            console.error('Error adding item to cart:', error);
            Toaster('Fix your Time or its server error!');
            throw error;
        } finally {
            editForm.querySelector('button[type="submit"]').disabled = false
            editForm.querySelector('button[type="submit"]').textContent = "Add Product"
        }
    });
}

const refresh = document.querySelectorAll('.container-fluid .d-flex button.btn-outline-secondary')
refresh.forEach(ref => {
    if (ref.id === 'customer') {
        ref.addEventListener('click', async () => {
            await fetchPanelData.init()
            fetchPanelData.renderCustomer
        })
    }
})

const changeUserStatus = async (endPoint) => {
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
        await fetchPanelData.init()
        fetchPanelData.renderCustomer()

    } catch (error) {
        console.error('Error adding item to cart:', error);
        Toaster('Fix your Time or its server error!');
        throw error;
    }
}

