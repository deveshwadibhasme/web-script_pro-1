import SignUp from "./signUpForm.js"
import { Toaster } from "./utils.js";

const verifyForm = document.querySelector('.verify-form')
const signUpForm = document.querySelector('.sign-up-form')
const LOCAL_URL = 'http://localhost:5000/register';
const PROD_URL = 'https://ecomm-webscript.onrender.com/register';
const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;
export const VerifiedSignUp = () => {
    signUpForm?.setAttribute('hidden','')

    verifyForm?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(verifyForm);
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
                if (result.message === 'Email already exists') {
                    Toaster('Email already exists. Please use a different email.');
                    return;
                }
                if(result.message === 'Failed to send OTP email'){
                    Toaster('Check Your Internet Connection.');
                }
                if(result.message === 'Phone number already registered'){
                    Toaster('Phone number already registered');
                }
                Toaster('OTP Sent to your email.');
                SignUp(signUpForm)
                signUpForm.removeAttribute('hidden')
                verifyForm.setAttribute('hidden','')
            } else {
                console.error('Registration failed:', response);
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    }
    );

}


