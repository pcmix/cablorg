/**
 * =================================
 * Main Entry Point
 * =================================
 * This function runs when the page is loaded.
 * It's responsible for two things:
 * 1. Loading the reusable HTML (Header/Footer)
 * 2. After loading, initializing all interactive components
 * (menu, theme toggle, cursor, particles)
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // We must load the HTML first, because the <header> contains
    // buttons that need to be initialized.
    loadHtmlComponents().then(() => {
        // Once header.html and footer.html are loaded,
        // we can safely find all the buttons and run our scripts.
        initializeSite();
    });

});

/**
 * =================================
 * HTML COMPONENT LOADER
 * =================================
 * Fetches header.html and footer.html and injects them into
 * the placeholder <div>s in index.html.
 */
async function loadHtmlComponents() {
    
    // Find the placeholders
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    // Create the fetch requests
    // We use .catch() to log errors if files are missing
    const loadHeader = fetch('header.html')
        .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch header: ${res.status} ${res.statusText}`);
            return res.text();
        })
        .then(data => {
            if (headerPlaceholder) headerPlaceholder.innerHTML = data;
        })
        .catch(err => console.error('Error loading header:', err));

    const loadFooter = fetch('footer.html')
        .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch footer: ${res.status} ${res.statusText}`);
            return res.text();
        })
        .then(data => {
            if (footerPlaceholder) footerPlaceholder.innerHTML = data;
        })
        .catch(err => console.error('Error loading footer:', err));
    
    // Wait for both to be loaded before proceeding
    return Promise.all([loadHeader, loadFooter]);
}


/**
 * =================================
 * SITE INITIALIZATION
 * =================================
 * This single function runs *after* header/footer are loaded.
 * It finds all the newly added buttons/links from those files
 * and adds all our interactive logic to them.
 */
function initializeSite() {
    // 1. Initialize Theme Toggle (finds buttons in header)
    setupThemeToggle();

    // 2. Initialize Mobile Menu (finds buttons in header)
    setupMobileMenu();

    // 3. Initialize Custom Cursor (adds hover to *all* links)
    setupCustomCursor();

    // 4. Initialize Particle Background
    setupParticleCanvas();
}


/**
 * =================================
 * 1. THEME TOGGLE LOGIC
 * =================================
 */
function setupThemeToggle() {
    // Find all theme buttons (mobile and desktop)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    const themeToggleBtnDesktop = document.getElementById('theme-toggle-desktop');
    const themeToggleDarkIconDesktop = document.getElementById('theme-toggle-dark-icon-desktop');
    const themeToggleLightIconDesktop = document.getElementById('theme-toggle-light-icon-desktop');

    // Function to set the icon state (sun/moon)
    function setIconState() {
        if (document.documentElement.classList.contains('dark')) {
            if(themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden');
            if(themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
            if(themeToggleLightIconDesktop) themeToggleLightIconDesktop.classList.add('hidden');
            if(themeToggleDarkIconDesktop) themeToggleDarkIconDesktop.classList.remove('hidden');
        } else {
            if(themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');
            if(themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
            if(themeToggleDarkIconDesktop) themeToggleDarkIconDesktop.classList.add('hidden');
            if(themeToggleLightIconDesktop) themeToggleLightIconDesktop.classList.remove('hidden');
        }
    }
    
    setIconState(); // Set initial icon on load

    // Function to toggle the theme
    function toggleTheme() {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        }
        setIconState();
    }

    // Add listeners to both buttons
    if(themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if(themeToggleBtnDesktop) themeToggleBtnDesktop.addEventListener('click', toggleTheme);
}


/**
 * =================================
 * 2. MOBILE MENU LOGIC
 * =================================
 */
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuSlide = document.getElementById('mobile-menu-slide');
    const menuOverlay = document.getElementById('menu-overlay');

    function openMenu() {
        if(mobileMenuSlide) mobileMenuSlide.classList.remove('translate-x-full');
        if(menuOverlay) {
            menuOverlay.classList.remove('hidden');
            setTimeout(() => menuOverlay.classList.remove('opacity-0'), 10);
        }
        document.body.classList.add('overflow-hidden');
    }

    function closeMenu() {
        if(mobileMenuSlide) mobileMenuSlide.classList.add('translate-x-full');
        if(menuOverlay) {
            menuOverlay.classList.add('opacity-0');
            setTimeout(() => menuOverlay.classList.add('hidden'), 300);
        }
        document.body.classList.remove('overflow-hidden');
    }

    if(mobileMenuButton) mobileMenuButton.addEventListener('click', openMenu);
    if(menuOverlay) menuOverlay.addEventListener('click', closeMenu);
    
    // Close menu if a link inside it is clicked
    if(mobileMenuSlide) {
        mobileMenuSlide.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
}


/**
 * =================================
 * 3. CUSTOM CURSOR LOGIC
 * =================================
 */
function setupCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return; // Don't run if cursor element is missing

    // Check for touch device - if so, hide cursor and stop
    if (!window.matchMedia('(pointer: fine)').matches) {
        cursor.style.display = 'none';
        return;
    }

    // Stores target (mouse) and current (dot) positions
    let cursorState = {
        target: { x: window.innerWidth/2, y: window.innerHeight/2 },
        current: { x: window.innerWidth/2, y: window.innerHeight/2 },
        smoothing: 0.1 // Smaller value = smoother
    };
    
    // Update target on mouse move
    window.addEventListener('mousemove', (e) => {
        cursorState.target.x = e.clientX;
        cursorState.target.y = e.clientY;
    });

    // Add hover effect to ALL links and buttons
    // We must re-run this *after* the header/footer are loaded,
    // which is why this is inside initializeSite()
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    
    // Animation loop for smooth (lerped) movement
    function animateCursor() {
        let { target, current, smoothing } = cursorState;

        // Lerp (Linear Interpolation)
        current.x += (target.x - current.x) * smoothing;
        current.y += (target.y - current.y) * smoothing;
        
        // Apply transform to the cursor element
        cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor(); // Start the animation loop
}


/**
 * =================================
 * 4. PARTICLE CANVAS LOGIC
 * =================================
 */
function setupParticleCanvas() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return; // Don't run if canvas is not on this page
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: undefined, y: undefined };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });
    
    function getParticleColors() {
        const isDark = document.documentElement.classList.contains('dark');
        return {
            particleLightness: isDark ? '70%' : '50%'
        };
    }

    // Particle Class
    class Particle {
        constructor(x, y, radius, velocity, hue) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.velocity = velocity;
            this.hue = hue;
        }

        draw() {
            const { particleLightness } = getParticleColors();
            ctx.fillStyle = `hsl(${this.hue}, 100%, ${particleLightness})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            this.hue = (this.hue + 0.5) % 360; // Update hue (RGB cycle)

            // --- Repel from mouse ---
            const repelRadius = 100;
            const maxForce = 2;

            if (mouse.x !== undefined && mouse.y !== undefined) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < repelRadius) {
                    let angle = Math.atan2(dy, dx);
                    let force = (repelRadius - dist) / repelRadius; 
                    this.velocity.x += Math.cos(angle) * force * maxForce;
                    this.velocity.y += Math.sin(angle) * force * maxForce;
                }
            }

            // Apply friction
            this.velocity.x *= 0.97;
            this.velocity.y *= 0.97;
            
            // Speed cap
            const maxSpeed = 1.5;
            const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > maxSpeed) {
                this.velocity.x = (this.velocity.x / speed) * maxSpeed;
                this.velocity.y = (this.velocity.y / speed) * maxSpeed;
            }
            
            // Keep particles moving slightly
            if (Math.abs(this.velocity.x) < 0.05) this.velocity.x += (Math.random() - 0.5) * 0.05;
            if (Math.abs(this.velocity.y) < 0.05) this.velocity.y += (Math.random() - 0.5) * 0.05;

            // Update position
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            // Bounce off walls
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.velocity.x = -this.velocity.x * 0.5;
            } else if (this.x + this.radius > canvas.width) {
                this.x = canvas.width - this.radius;
                this.velocity.x = -this.velocity.x * 0.5;
            }
            
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.velocity.y = -this.velocity.y * 0.5;
            } else if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.velocity.y = -this.velocity.y * 0.5;
            }
            
            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        let particleCount = window.innerWidth < 768 ? 40 : 80;
        for (let i = 0; i < particleCount; i++) {
            let radius = Math.random() * 1.5 + 1;
            let x = Math.random() * (canvas.width - radius * 2) + radius;
            let y = Math.random() * (canvas.height - radius * 2) + radius;
            let velocity = { x: (Math.random() - 0.5) * 0.2, y: (Math.random() - 0.5) * 0.2 };
            let hue = Math.random() * 360;
            particles.push(new Particle(x, y, radius, velocity, hue));
        }
    }

    // Main animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => p.update());
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeCanvas();
            initParticles();
        }, 250);
    });
}

