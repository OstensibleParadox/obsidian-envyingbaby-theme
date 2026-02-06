/**
 * Secret Trigger - Easter egg activation system
 * For the Aliens Testing Water story
 */

(function() {
    'use strict';

    // Konami code detector
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', function(e) {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateSecret();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateSecret() {
        console.log('%c[SYSTEM] Secret protocol activated...', 'color: #ff9900');
        document.body.style.transition = 'all 0.5s ease';
        document.body.classList.toggle('secret-mode');
    }

    // Console hint
    console.log('%c[HINT] Some secrets require the right sequence...', 'color: #666; font-style: italic');
})();
