// Interactive Background Effects
document.addEventListener('DOMContentLoaded', function() {
    // Custom Cursor Effects
    const cursor = document.getElementById('customCursor');
    const cursorTrail = document.getElementById('cursorTrail');
    
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    
    // Mouse movement tracking
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Smooth cursor animation
    function animateCursor() {
        // Main cursor follows mouse with slight delay
        const diffX = mouseX - trailX;
        const diffY = mouseY - trailY;
        
        trailX += diffX * 0.1;
        trailY += diffY * 0.1;
        
        cursor.style.left = trailX + 'px';
        cursor.style.top = trailY + 'px';
        
        // Trail follows with more delay
        const trailDiffX = mouseX - cursorTrail.offsetLeft;
        const trailDiffY = mouseY - cursorTrail.offsetTop;
        
        cursorTrail.style.left = (cursorTrail.offsetLeft + trailDiffX * 0.05) + 'px';
        cursorTrail.style.top = (cursorTrail.offsetTop + trailDiffY * 0.05) + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Interactive hover effects
    const interactiveElements = document.querySelectorAll('.interactive-element');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.background = 'radial-gradient(circle, rgba(107, 70, 193, 0.8) 0%, rgba(107, 70, 193, 0.2) 70%, transparent 100%)';
            cursorTrail.style.transform = 'scale(1.2)';
        });
        
        element.addEventListener('mouseleave', function() {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'radial-gradient(circle, rgba(212, 175, 55, 0.8) 0%, rgba(212, 175, 55, 0.2) 70%, transparent 100%)';
            cursorTrail.style.transform = 'scale(1)';
        });
    });
    
    // Parallax effect for geometric shapes
    const shapes = document.querySelectorAll('.shape');
    
    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
    
    // Dynamic particle generation
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(${Math.random() > 0.5 ? '212, 175, 55' : '107, 70, 193'}, ${Math.random() * 0.5 + 0.2})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '-1';
        
        document.body.appendChild(particle);
        
        // Animate particle
        const animation = particle.animate([
            { 
                transform: 'translateY(0px) translateX(0px)',
                opacity: 1
            },
            { 
                transform: `translateY(-${window.innerHeight + 100}px) translateX(${(Math.random() - 0.5) * 200}px)`,
                opacity: 0
            }
        ], {
            duration: Math.random() * 3000 + 2000,
            easing: 'linear'
        });
        
        animation.onfinish = () => {
            particle.remove();
        };
    }
    
    // Create particles periodically
    setInterval(createParticle, 2000);
    
    // Glow effect on scroll
    let ticking = false;
    
    function updateGlowEffect() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        document.querySelectorAll('.glow-text').forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateGlowEffect);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Interactive background color changes
    const colorSchemes = [
        { primary: '212, 175, 55', secondary: '107, 70, 193', accent: '59, 130, 246' },
        { primary: '107, 70, 193', secondary: '59, 130, 246', accent: '212, 175, 55' },
        { primary: '59, 130, 246', secondary: '212, 175, 55', accent: '107, 70, 193' }
    ];
    
    let currentScheme = 0;
    
    function changeColorScheme() {
        currentScheme = (currentScheme + 1) % colorSchemes.length;
        const scheme = colorSchemes[currentScheme];
        
        document.documentElement.style.setProperty('--primary-gold', `rgb(${scheme.primary})`);
        document.documentElement.style.setProperty('--accent-purple', `rgb(${scheme.secondary})`);
        document.documentElement.style.setProperty('--accent-blue', `rgb(${scheme.accent})`);
    }
    
    // Change color scheme every 30 seconds
    setInterval(changeColorScheme, 30000);
    
    // Performance optimization
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            // Initialize heavy animations when browser is idle
            document.body.classList.add('animations-loaded');
        });
    } else {
        setTimeout(() => {
            document.body.classList.add('animations-loaded');
        }, 100);
    }
});

// Reduced motion support
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-smooth', 'none');
    document.documentElement.style.setProperty('--transition-bounce', 'none');
}

