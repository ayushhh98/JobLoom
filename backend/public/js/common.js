document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // User Identity Logic
    async function checkUserIdentity() {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();

            if (data.success && navLinks) {
                const user = data.data;

                // 1. Hide Login/Register links
                const loginRegLinks = navLinks.querySelectorAll('li');
                loginRegLinks.forEach(li => {
                    const link = li.querySelector('a');
                    if (link) {
                        const href = link.getAttribute('href');
                        if (href === '/login' || href === '/register') {
                            li.style.display = 'none';
                        }
                    }
                });

                // 2. Add Dashboard link if it doesn't exist
                if (!document.querySelector('a[href*="/dashboard"]')) {
                    const dashboardLi = document.createElement('li');
                    let dashboardPath = '/dashboard-seeker';
                    if (user.role === 'employer') dashboardPath = '/dashboard-employer';
                    if (user.role === 'admin') dashboardPath = '/admin-dashboard';

                    dashboardLi.innerHTML = `<a href="${dashboardPath}" class="font-weight-bold">Dashboard</a>`;
                    navLinks.appendChild(dashboardLi);
                }

                // 3. Add User Identity with Dropdown if it doesn't exist
                if (!document.querySelector('.user-identityDropdown')) {
                    const identityLi = document.createElement('li');
                    identityLi.className = 'user-identityDropdown';

                    const photoSrc = user.profilePhoto || 'https://via.placeholder.com/32';

                    identityLi.innerHTML = `
                        <div class="user-trigger">
                            <div class="user-avatar-small">
                                <img src="${photoSrc}" alt="User Profile" class="user-avatar-nav">
                            </div>
                            <span class="user-email-nav" title="${user.email}">${user.email}</span>
                            <i class="fas fa-chevron-down dropdown-chevron"></i>
                        </div>
                        
                        <!-- Dropdown Menu -->
                        <div class="user-dropdown">
                            <a href="/profile" class="dropdown-item">
                                <i class="fas fa-user-circle"></i> My Profile
                            </a>
                            <div class="dropdown-item profile-upload-btn">
                                <i class="fas fa-camera"></i> Update Photo
                                <input type="file" id="navPhotoUpload" accept="image/*" style="display:none">
                            </div>
                            <a href="/profile#security" class="dropdown-item">
                                <i class="fas fa-cog"></i> Settings
                            </a>
                            <div class="dropdown-divider"></div>
                            <a href="#" id="logoutBtn" class="dropdown-item logout-link">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </div>
                    `;
                    navLinks.appendChild(identityLi);

                    // Toggle Dropdown
                    const trigger = identityLi.querySelector('.user-trigger');
                    const dropdown = identityLi.querySelector('.user-dropdown');

                    trigger.addEventListener('click', (e) => {
                        e.stopPropagation();
                        dropdown.classList.toggle('active');
                        trigger.querySelector('.dropdown-chevron').classList.toggle('rotate');
                    });

                    // Close dropdown when clicking outside
                    document.addEventListener('click', () => {
                        dropdown.classList.remove('active');
                        trigger.querySelector('.dropdown-chevron').classList.remove('rotate');
                    });

                    // Handle "Update Photo" item click to trigger hidden input
                    const uploadBtn = identityLi.querySelector('.profile-upload-btn');
                    const photoInput = identityLi.querySelector('#navPhotoUpload');
                    uploadBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        photoInput.click();
                    });

                    // Quick Photo Upload
                    photoInput.addEventListener('change', async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const formData = new FormData();
                        formData.append('profilePhoto', file);

                        try {
                            const res = await fetch('/api/users/profile', {
                                method: 'PUT',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.success) {
                                // Update all avatars on page
                                const newPhotoUrl = data.data.profilePhoto;
                                document.querySelectorAll('.user-avatar-nav, #previewPhoto').forEach(img => {
                                    img.src = newPhotoUrl;
                                });
                            }
                        } catch (err) {
                            console.error('Photo update failed', err);
                        }
                    });

                    // Attach logout listener
                    const logoutBtn = identityLi.querySelector('#logoutBtn');
                    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
                }

                // Remove legacy dynamic elements
                const legacyIdentity = document.querySelector('.user-identity');
                if (legacyIdentity) legacyIdentity.remove();

                const legacyLogout = Array.from(navLinks.children).find(li =>
                    li.querySelector('#logoutBtn') && !li.classList.contains('user-identityDropdown')
                );
                if (legacyLogout) legacyLogout.remove();
            }
        } catch (err) {
            console.log('User not logged in or fetch failed');
        }
    }

    async function handleLogout(e) {
        if (e) e.preventDefault();
        try {
            await fetch('/api/auth/logout');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout failed', err);
            // Fallback
            window.location.href = '/login';
        }
    }

    window.checkUserIdentity = checkUserIdentity;
    checkUserIdentity();

    // Global Logout Handler for existing buttons
    const logoutBtns = document.querySelectorAll('#logoutBtn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });

    // Reveal Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
});
