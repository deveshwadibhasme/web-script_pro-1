import { checkCookies, postTotalPrice, Toaster } from "./utils.js";


export const getUserPanelData = () => {
    const LOCAL_URL = 'http://localhost:5000/user/panel';
    const PROD_URL = 'https://ecomm-webscript.onrender.com/user/panel';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    const userPanelData = checkCookies.then(async (result) => {
        if (!result[0]) {
            console.log('User is not logged in');
            return;
        }
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${[result[1]]}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }

            const panel = await response.json();
            return panel.user;
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
    }).catch((err) => {
        console.error('Error fetching cart items:', err);
        return [[], ''];
    });
    return userPanelData;
}

export const getFeaturedProduct = async () => {
    const LOCAL_URL = 'http://localhost:5000/user/featured-product';
    const PROD_URL = 'https://ecomm-webscript.onrender.com/user/featured-product';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    try {
        const productData = await fetch(url, {
            method: 'GET'
        })

        if (!productData.ok) {
            throw new Error('Failed to Fetch')
        }

        const data = await productData.json()
        return data

    } catch (error) {
        console.error('Error fetching cart items:', error);
        return [];
    }
}

export const addToCart = (productId) => {
    const LOCAL_URL = 'http://localhost:5000/user/add-to-cart';
    const PROD_URL = 'https://ecomm-webscript.onrender.com/user/add-to-cart';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    checkCookies.then(async (result) => {
        if (!result[0]) {
            console.log('User is not logged in');
            Toaster('Log in to add item and use cart!!')
            return;
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${[result[1]]}`
                },
                body: JSON.stringify({ productId, quantity: 1 })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
            const results = await response.json()
            if (results.message === "Product already in cart.") {
                Toaster('Product already in cart.')
            }
            Toaster('Product Added')
            CartModule.render()
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
    }).catch((err) => {
        console.error('Error fetching cart items:', err);
        return [[], ''];
    });
}



const CartModule = (() => {
    let token = null;

    const LOCAL_URL = 'http://localhost:5000/user';
    const PROD_URL = 'https://ecomm-webscript.onrender.com/user';
    const baseUrl = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;



    const updatePrice = () => {
        const grossTotal = document.querySelectorAll('.gross-total');
        const totalPrice = document.querySelector('#totalPrice');
        const grandTotal = document.querySelector('#grandPrice');
        const valueArray = Array.from(grossTotal, ele => Number(ele.getAttribute('value')) || 0);
        const totalValue = valueArray.reduce((acc, val) => acc + val, 0);
        if (totalPrice) totalPrice.innerHTML = '₹' + totalValue;
        if (grandTotal) {
            grandTotal.innerHTML = '₹' + (totalValue + 100);
            grandTotal.setAttribute('value', totalValue + 100);
        }
        postTotalPrice()
    };

    const controlQuantity = async (qty, id) => {
        try {
            const response = await fetch(`${baseUrl}/add-to-cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: id, quantity: qty })
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Failed to update cart');

            if (result.message === 'Product removed from cart.') {
                Toaster('Product removed from cart.');
                document.querySelector(`[data-product-id="${id}"]`)?.closest('tr')?.remove();
            } else if (result.message === 'Product quantity updated.') {
                Toaster('Product quantity updated.');
                const input = document.querySelector(`input[data-product-id="${id}"]`);
                const price = input.dataset.productPrice;
                const grossTotal = input.closest('td').nextElementSibling;
                grossTotal.innerHTML = '₹' + (Number(price) * Number(qty));
                grossTotal.setAttribute('value', Number(price) * Number(qty));
            }
            postTotalPrice()
            updatePrice();

        } catch (err) {
            console.error('Cart update failed:', err);
        }
    };



    const renderCart = async () => {
        const cartList = document.querySelector('.cart-list');
        if (cartList) cartList.innerHTML = '';

        try {
            const checkResult = await checkCookies;
            if (!checkResult[0]) return console.log('User not logged in');
            token = checkResult[1];

            const response = await fetch(`${baseUrl}/get-cart`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch cart items');

            const { cart } = await response.json();

            cart.forEach(({ product, quantity }) => {
                const row = document.createElement('tr');
                row.className = 'cart-item';
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <img style="width:100px" src="${product.imageUrl}" class="rounded me-2" />
                            <span>${product.name}</span>
                        </div>
                    </td>
                    <td>₹${product.price}</td>
                    <td>
                        <input type="number" class="form-control quantity-control"
                            name="quantity" data-product-price="${product.price}"
                            data-product-id="${product._id}" value="${quantity}" min="1">
                    </td>
                    <td class="gross-total" value="${product.price * quantity}">₹${product.price * quantity}</td>
                    <td>
                        <button id="delete" value="-1" data-product-id="${product._id}" class="btn btn-sm btn-danger quantity-control">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                if (cartList) cartList.appendChild(row);
                postTotalPrice()
            });


            updatePrice();


            document.querySelectorAll('.quantity-control').forEach(control => {
                control.removeEventListener('change', handleChange);
                control.addEventListener('change', handleChange);
                if (control.id === 'delete') {
                    control.addEventListener('click', handleChange);
                }
            });

        } catch (err) {
            console.error('Error rendering cart:', err);
        }
    };

    let debounceTimer;
    const handleChange = (e) => {
        const value = e.target.value || -1;
        const productId = e.target.dataset.productId || e.currentTarget.dataset.productId;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            controlQuantity(value, productId);
        }, 1000);
    };


    const renderOrders = async () => {
        const checkResult = await checkCookies;
        if (!checkResult[0]) return console.log('User not logged in');
        token = checkResult[1];
        const response = await fetch(`${baseUrl}/get-orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        const { orders } = await response.json();
        console.log(orders);


        const tableBody = document.getElementById('orderTableBody');
        if (tableBody)
            tableBody.innerHTML = '';
        orders.forEach(order => {
            order.items.forEach(item => {
                const row = document.createElement('tr');

                const imageUrl = item.imageUrl

                const total = item.quantity * item.price;

                row.innerHTML = `
        <td data-label="Order ID">${order._id.slice(-6).toUpperCase()}</td>
        <td data-label="Product">
          <div class="product-cell">
            <img src="${imageUrl}" alt="${item.name}" />
            <div class="product-name">${item.name}</div>
          </div>
        </td>
        <td data-label="Quantity">${item.quantity}</td>
        <td data-label="Payment">${order.payment.method} - ${order.payment.isPaid ? 'Paid' : 'Unpaid'}</td>
        <td data-label="Total">₹${total.toFixed(2)}</td>
        <td data-label="Status"><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
        <td data-label="Action">
          <button class="action-btn" onclick="handleOrderAction('${order._id}')">Track</button>
        </td>
      `;

                tableBody.appendChild(row);
            });
        });

    }

    function handleOrderAction(orderId) {
        alert("Tracking order: " + orderId);
    }

    return {
        render: renderCart,
        update: controlQuantity,
        order: renderOrders,
    };
})();
CartModule.render();
CartModule.order()

