import { checkCookies, Toaster } from "./utils.js";

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
            return [panel.cart, panel.username];
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
                body: JSON.stringify({ productId })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
            const results = await response.json()
            if (results.message === "Product already in cart.") {
                Toaster('Product already in cart.')
            }
            Toaster('Product Added')
            renderInCart()
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
    }).catch((err) => {
        console.error('Error fetching cart items:', err);
        return [[], ''];
    });
}

const controlQuantity = async (qty, id, token) => {
    const LOCAL_URL = 'http://localhost:5000/user/add-to-cart';
    const PROD_URL = 'https://ecomm-webscript.onrender.com/user/add-to-cart';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;
    try {
        const response = await fetch(url, {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId: id, quantity: qty })
        });
        const result = await response.json()
        const cartList = document.querySelector('.cart-list')
        cartList.innerHTML = ''
        if (result.message === 'Product removed from cart.') {
            Toaster('Product removed from cart.')
            renderInCart()
        }
        if (result.message === 'Product quantity updated.') {
            Toaster('Product quantity updated.')
            renderInCart()
        }


        if (!response.ok) {
            throw new Error('Failed to fetch cart items');
        }

    }
    catch (error) {
        console.error('Error fetching cart items:', error);
        return [];
    }
}

const renderInCart = () => {
    const LOCAL_URL = 'http://localhost:5000/user/get-cart';
    const PROD_URL = 'https://ecomm-webscript.onrender.com/user/get-cart';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;


    checkCookies.then(async (result) => {
        if (!result[0]) {
            console.log('User is not logged in');
            return;
        }
        try {
            const response = await fetch(url, {
                'method': 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${[result[1]]}`
                },
            });

            if (!response.ok) {
                Toaster("Server Error")
                throw new Error('Failed to fetch cart items');
            }
            const { cart } = await response.json()
            const cartList = document.querySelector('.cart-list')
            cart.map(({ product, quantity }) => {
                const cartDiv = document.createElement('tr')
                cartDiv.className = 'cart-item'
                cartDiv.innerHTML = `   
            <td>
              <div class="d-flex align-items-center">
                <img style="width:100px" src=${product.imageUrl} class="rounded me-2" alt="Product Image" />
                <span>${product.name}</span>
              </div>
            </td>
            <td>₹${product.price}</td>
            <td>
              <input type="number" class="form-control quantity-control" name="quantity" data-product-price = ${product.price} data-product-id=${product._id} value=${quantity} min="1">
            </td>
            <td class="gross-total" value="0" >₹ 0</td>
            <td>
              <button id="delete" value="-1" data-product-id=${product._id} class="btn btn-sm btn-danger quantity-control">
                <i class="fas fa-trash"></i>
              </button>
            </td>`
                cartList?.append(cartDiv)
            })
            const quantityControl = document.querySelectorAll('td .quantity-control')
            const grossTotal = document.querySelectorAll('.gross-total')
            const grandTotal = document.querySelector('#grandPrice')
            function updatePrice() {
                grossTotal.forEach((ele) => {
                    const price = ele.previousElementSibling.childNodes[1].dataset.productPrice
                    const quantity = ele.previousElementSibling.childNodes[1].getAttribute('value')
                    const x = Number(quantity)
                    quantityControl.value = x
                    ele.previousElementSibling.childNodes[1].setAttribute('value', x)
                    ele.innerHTML = '₹' + Number(price) * Number(x)
                    ele.setAttribute('value', Number(price) * Number(x))
                })
                const totalPrice = document.querySelector('#totalPrice')
                const valueArray = Array.from(grossTotal, ele => Number(ele.getAttribute('value')));
                if (grossTotal.length <= valueArray.length && totalPrice && grandTotal) {
                    const totalValue = valueArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
                    totalPrice.innerHTML = '₹' + totalValue
                    grandTotal.innerHTML = '₹' + (totalValue + 100)
                    grandTotal.setAttribute('value', totalValue + 100)
                }
            }
            updatePrice()
            quantityControl.forEach(control => {
                control.removeEventListener('change', handleQuantityChange);
                control.addEventListener('change', handleQuantityChange);
                if (control.id === 'delete') {
                    control.addEventListener('click', handleQuantityChange);
                }
            });
            let debounceTimer = null;
            function handleQuantityChange(e) {
                const newValue = e.target.value || -1;
                const productId = e.target.dataset.productId || e.currentTarget.dataset.productId;;
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    controlQuantity(newValue, productId, [result[1]]);
                    console.log('Debounced update');
                }, 1500);
            }


        } catch (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
    })
}

renderInCart()