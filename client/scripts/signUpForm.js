const LOCAL_URL = 'http://localhost:5000/register';
    const PROD_URL = 'https://your-production-url.com/register';
    const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

const SignUp = () => {
    const SignUpForm = document.querySelector('.sign-up-form');
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
                    alert('Email already exists. Please use a different email.');
                    return;
                }
                alert('Registration successful:', result);
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