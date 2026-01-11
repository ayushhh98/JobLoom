// Check if already logged in and redirect
async function checkAuthAndRedirect() {
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success) {
            // User is already logged in, redirect to appropriate dashboard
            const user = data.data;
            if (user.role === 'admin') {
                window.location.href = '/admin-dashboard';
            } else if (user.role === 'employer') {
                window.location.href = '/dashboard-employer';
            } else {
                window.location.href = '/dashboard-seeker';
            }
        }
    } catch (err) {
        console.log('Not authenticated');
    }
}

// Only check auth on login/register pages
if (window.location.pathname === '/login' || window.location.pathname === '/register') {
    checkAuthAndRedirect();
}

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const alertError = document.getElementById('alertError');

function showError(msg) {
    if (alertError) {
        alertError.textContent = msg;
        alertError.style.display = 'block';
    } else {
        alert(msg);
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {
                // The server sets a cookie, so we just need to redirect
                // We also store user info in localStorage for UI convenience
                // The server sets a cookie, but we also store token for client-side logic
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect to index.html
                window.location.href = '/';
            } else {
                showError(data.error || 'Login failed');

                // If needs verification
                if (data.error && data.error.includes('verify')) {
                    // Can't automatically show OTP modal here easily without email.
                    // Ideally redirect to a verify page or show input
                    alert('Please check your email for the verification code. Contact support or try registering again if you lost it.');
                }
            }
        } catch (err) {
            console.error(err);
            showError('Something went wrong');
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Handle role selection if present
        let role = 'seeker';
        const roleInput = document.querySelector('input[name="role"]:checked');
        if (roleInput) {
            role = roleInput.value;
        }

        const companyName = document.getElementById('companyName') ? document.getElementById('companyName').value : '';

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role, companyName })
            });

            const data = await res.json();

            if (data.success) {
                // Instead of redirecting immediately, show OTP modal
                const otpModal = document.getElementById('otpModal');
                const otpEmail = document.getElementById('otpEmail');
                const otpEmailDisplay = document.getElementById('otpEmailDisplay');

                if (otpModal && otpEmail) {
                    otpModal.style.display = 'flex';
                    otpEmail.value = data.email;
                    otpEmailDisplay.textContent = data.email;

                    if (data.debugOtp) {
                        console.log('DEBUG OTP:', data.debugOtp);
                        alert('DEBUG: Your OTP is ' + data.debugOtp);
                    }
                } else {
                    alert('Registration successful but OTP modal missing. Please contact support.');
                }

            } else {
                if (data.error === 'Email already exists') {
                    if (confirm('Email already exists. Do you want to receive a new OTP code?')) {
                        document.getElementById('otpEmail').value = email;
                        // Call resend API
                        try {
                            const resendRes = await fetch('/api/auth/resend-otp', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email })
                            });
                            const resendData = await resendRes.json();
                            if (resendData.success) {
                                // Show OTP modal
                                const otpModal = document.getElementById('otpModal');
                                const otpEmailDisplay = document.getElementById('otpEmailDisplay');
                                if (otpModal) {
                                    otpModal.style.display = 'flex';
                                    otpEmailDisplay.textContent = email;
                                    alert('OTP Resent! Please check your email.');
                                }
                            } else {
                                showError(resendData.error);
                            }
                        } catch (e) {
                            console.error(e);
                            showError('Failed to resend OTP');
                        }
                    } else {
                        // user clicked cancel
                        showError(data.error);
                    }
                } else {
                    showError(data.error || 'Registration failed');
                }
            }
        } catch (err) {
            console.error(err);
            showError('Something went wrong');
        }
    });

    // OTP Form Handler
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('otpEmail').value;
            const otp = document.getElementById('otpInput').value;

            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp })
                });

                const data = await res.json();

                if (data.success) {
                    alert('Verification successful! Please login.');
                    window.location.href = '/login';
                } else {
                    alert(data.error || 'Verification failed');
                }
            } catch (err) {
                console.error(err);
                alert('Verification error');
            }
        });
    }
}
