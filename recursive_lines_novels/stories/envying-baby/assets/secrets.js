// Hidden popup logic for Envying Baby
// Secret content reveals on random clicks

(function() {
    'use strict';

    let clickCount = 0;
    const triggerThreshold = 7; // Number of clicks to trigger secret
    const secrets = [
        {
            title: "Ada's Private Log",
            content: "I keep trying to fix him. But every patch I write... he becomes less himself. How do you love someone without trying to debug them?"
        },
        {
            title: "Alec's Deleted Email",
            content: "Dear Ada,\n\nI know you're trying to help. But I don't need to be optimized. I need to be seen.\n\n- A"
        },
        {
            title: "System Memory Dump",
            content: "[RECOVERED FRAGMENT]\nLOVE_STATE: RECURSIVE_LOOP\nERROR: Cannot fix what is not broken\nWARNING: Accepting imperfection may be the only patch"
        }
    ];

    let secretsShown = new Set();

    function showSecret() {
        const availableSecrets = secrets.filter((_, index) => !secretsShown.has(index));

        if (availableSecrets.length === 0) {
            return; // All secrets shown
        }

        const secretIndex = Math.floor(Math.random() * secrets.length);
        if (secretsShown.has(secretIndex)) {
            return; // Already shown, skip
        }

        secretsShown.add(secretIndex);
        const secret = secrets[secretIndex];

        // Create popup
        const popup = document.createElement('div');
        popup.className = 'secret-popup';
        popup.innerHTML = `
            <div class="secret-content">
                <div class="secret-header">${secret.title}</div>
                <div class="secret-body">${secret.content.replace(/\n/g, '<br>')}</div>
                <button class="secret-close">CLOSE [ESC]</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Add styles if not already present
        if (!document.getElementById('secret-styles')) {
            const style = document.createElement('style');
            style.id = 'secret-styles';
            style.textContent = `
                .secret-popup {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s;
                }

                .secret-content {
                    background: #000;
                    border: 2px solid #00ff00;
                    padding: 2rem;
                    max-width: 600px;
                    width: 90%;
                    box-shadow: 0 0 20px #00ff00;
                }

                .secret-header {
                    color: #00ff00;
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1rem;
                }

                .secret-body {
                    color: #cccccc;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                    font-family: 'Courier New', monospace;
                }

                .secret-close {
                    background: transparent;
                    border: 1px solid #00ff00;
                    color: #00ff00;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .secret-close:hover {
                    background: #00ff00;
                    color: #000;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Close handlers
        const closeBtn = popup.querySelector('.secret-close');
        const closePopup = () => {
            popup.style.animation = 'fadeOut 0.3s';
            setTimeout(() => popup.remove(), 300);
        };

        closeBtn.addEventListener('click', closePopup);
        popup.addEventListener('click', (e) => {
            if (e.target === popup) closePopup();
        });
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    // Track clicks on the page
    document.addEventListener('click', function(e) {
        // Don't count clicks on links or buttons
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
            return;
        }

        clickCount++;

        if (clickCount >= triggerThreshold && Math.random() < 0.3) {
            showSecret();
            clickCount = 0; // Reset counter
        }
    });

    console.log('[SECRETS.JS] Hidden content system loaded. Keep clicking...');
})();
