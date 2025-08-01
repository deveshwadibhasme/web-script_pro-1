import { getUserPanelData } from "./user.js";
import { checkCookies, Toaster } from "./utils.js";

const checkOut = document.querySelector('#checkout');

export const handlePayment = () => {
    checkOut?.addEventListener('click', async (e) => {
        e.preventDefault();
        const LOCAL_URL = 'http://localhost:5000';
        const PROD_URL = 'https://ecomm-webscript.onrender.com';
        const baseUrl = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;


        const isLoginToken = await checkCookies;

        if (!isLoginToken[0]) {
            Toaster('Please log in to proceed to checkout.');
            return;
        }
        getUserPanelData().then(async (panelData) => {
            if (panelData.cart.length === 0) {
                Toaster('Your cart is empty. Please add items to your cart before checking out.');
                return;
            }
            try {
                const response = await fetch(`${baseUrl}/payment/create-order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${isLoginToken[1]}`
                    },
                    body: JSON.stringify({ panelData })
                });

                if (!response.ok) throw new Error('Failed to checkout');

                const result = await response.json();

                const order = result.order;

                const options = {
                    key: 'rzp_test_uKcZGSMuN7tEhw',
                    amount: order.amount,
                    currency: order.currency,
                    name: "Sell Anything",
                    description: "Your order",
                    image: "https://example.com/logo.png",
                    order_id: order.id, // ✅ Razorpay order ID from backend
                    handler: async function (response) {
                        // This function is called when payment is completed
                        const verifyRes = await fetch(baseUrl + '/payment/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${isLoginToken[1]}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            })
                        });

                        const result = await verifyRes.json();
                        if (result.success) {
                            Toaster("Payment verified successfully!");
                            const setOrder = await fetch(baseUrl + '/user/order', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${isLoginToken[1]}`
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                })
                            });

                            const result = await setOrder.json();
                            if (setOrder.ok) {
                                Toaster("Order placed successfully!");
                                // Optionally, redirect to orders page or clear cart
                                window.location.href = '/orders.html';
                            } else {
                                Toaster("Failed to place order. Please try again.");
                            }

                        } else {
                            Toaster("Payment verification failed!");
                        }
                    },
                    prefill: {
                        name: panelData.username,
                        email: panelData.email,
                        contact: panelData.phone
                    },
                    theme: {
                        color: "#3399cc"
                    }
                };

                const rzp = new Razorpay(options);
                rzp.open();


            } catch (err) {
                console.error('Checkout failed:', err);
            }
        }).catch((err) => {
            console.error('Error during checkout:', err);
            Toaster('An error occurred during checkout. Please try again later.');
        });


    })
}