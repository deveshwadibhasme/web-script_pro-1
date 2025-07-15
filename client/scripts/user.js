import { checkCookies } from "./utils.js";

export const getUserPanelData = () => {
    const LOCAL_URL = 'http://localhost:5000/user/panel';
    const PROD_URL = 'process.env.BackendURL/user/panel';
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
    const PROD_URL = 'process.env.BackendURL/user/featured-product';
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
    const PROD_URL = 'process.env.BackendURL/user/add-to-cart';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    checkCookies.then(async (result) => {
        if (!result[0]) {
            console.log('User is not logged in');
            return;
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${[result[1]]}`
                },
                body: JSON.stringify({ productId: productId })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
            const results = await response.json()
            if (results.message === "Product already in cart.") {
                alert('Product already in cart.')
            }
            alert('Product Added')
            localStorage.setItem('userCart', JSON.stringify([{ productId: results.product, quantity: results.quantity }]));
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


const renderInCart = () => {
    const LOCAL_URL = 'http://localhost:5000/user/get-cart';
    const PROD_URL = 'process.env.BackendURL/user/get-cart';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    checkCookies.then( async (result)=>{
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
                alert("Server Error")
                throw new Error('Failed to fetch cart items');
            }
            const resultData = await response.json()
            console.log(resultData);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
    })
}

renderInCart()