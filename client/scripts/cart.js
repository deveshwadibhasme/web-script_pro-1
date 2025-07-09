import { checkCookies } from "./utils.js";

export const getCartItems = () => {
    const LOCAL_URL = 'http://localhost:5000/user/panel';
    const PROD_URL = 'https://your-production-url.com/user/panel'; 
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    const cartItems = checkCookies.then(async (result) => {
        if (!result[0]) {
            console.log('User is not logged in');
            return ;
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

            const cartItem = await response.json();
            return cartItem.cart;
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return [];
        }
    }).catch((err) => {
        console.error('Error fetching cart items:', err);
        return [];
    });
    return cartItems;
}

export const addToCart = async (productId) => {
    const LOCAL_URL = 'http://localhost:5000/user/cart';
    const PROD_URL = 'https://your-production-url.com/user/cart';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cookieStore.get('token')?.value}`
            },
            body: JSON.stringify({ productId })
        });

        if (!response.ok) {
            throw new Error('Failed to add item to cart');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding item to cart:', error);
        throw error;
    }
}