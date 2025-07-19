import { Toaster } from "./utils.js";

const LOCAL_URL = 'http://localhost:5000/verify-otp';
const PROD_URL = 'https://ecomm-webscript.onrender.com/verify-otp';
const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

const SignUp = (SignUpForm) => {
    SignUpForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(SignUpForm);
        const data = Object.fromEntries(formData.entries());
        try {
            const response = await fetch(url, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                if(result.message === 'Email already exists') {
                    Toaster('Email already exists. Please use a different email.');
                    return;
                }
                Toaster('Registration successful:', result);
                window.location.pathname = '/login.html'; // Redirect to login page after successful registration
                // Redirect or show success message
            } else {
                console.error('Registration failed:', response);
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    }
    );
}
export default SignUp;