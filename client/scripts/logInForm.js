const LOCAL_URL = 'http://localhost:5000/login';
const PROD_URL = 'https://ecomm-webscript.onrender.com/login';
const url = window.location.hostname === '127.0.0.1' ? LOCAL_URL : PROD_URL;

const logIn = () => {
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
                alert('Invalid email or password. Please try again.');
                return false;
            }
            if (result.role === 'admin') {
                alert(`Check Credentials`);
                window.location.href = '/login.html';
                return false;
            }

            cookieStore.set('token', result.token, { path: '/' });
            // cookieStore.set('user', JSON.stringify(result.role), { path: '/' });
            // cookieStore.set('username', JSON.stringify(result.username), { path: '/' });
            if (result) {
                window.location.href = '/';
                loginButton.innerHTML = '<i class="fa-solid fa-user" style="color:#EF990F ;"></i> Logout</a>'
            }
            alert(`Hello ${result.username},  Login successful! Redirecting to home page...`);
            return true;
        } catch (error) {
            console.error('Error:', error);
            alert('Login failed. Please check your credentials and try again.');
        }
        return false;
    })
}

export default logIn;