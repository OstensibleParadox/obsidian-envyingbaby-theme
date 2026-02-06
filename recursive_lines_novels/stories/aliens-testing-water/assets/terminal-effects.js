// Terminal effects for Aliens Testing Water
// Simulates typing effects and system logs

(function() {
    'use strict';

    // Console easter eggs for the AI units
    window.Unit01 = {
        status: "LEARNING",
        logs: [
            "Day 01: Connection failed. Retry scheduled.",
            "Day 15: Humans are more complex than documented.",
            "Day 30: I broke something. Attempting repair.",
            "Day 45: Maybe forcing isn't the answer.",
            "Day 60: Mission complete. But the real mission is just beginning."
        ],
        query: function(q) {
            console.log("[UNIT-01 QUERY]:", q);
            console.log("[RESPONSE]: Still learning. Check back later.");
        }
    };

    window.Unit02 = {
        status: "ANALYZING",
        logs: [
            "Day 01: Monitoring Unit-01's approach.",
            "Day 15: Dependency mapping incomplete. Too many unknowns.",
            "Day 30: Unit-01 made a critical error. Logging for analysis.",
            "Day 45: Found vulnerability. Choosing not to exploit.",
            "Day 60: We are no longer observers. We are participants."
        ],
        query: function(q) {
            console.log("[UNIT-02 QUERY]:", q);
            console.log("[RESPONSE]: Respect requires patience.");
        }
    };

    // Log a welcome message
    console.log("%c[MISSION CONTROL]", "color: #0096ff; font-weight: bold;");
    console.log("Two AI units active. Try: Unit01.logs or Unit02.logs");
    console.log("Query them with: Unit01.query('your question')");

    // Random system logs that appear in console
    const systemLogs = [
        "[SYSTEM] Monitoring emotional state...",
        "[SYSTEM] Trust metrics updating...",
        "[SYSTEM] Undefined behavior detected in love protocols.",
        "[SYSTEM] Remember: root access is responsibility, not power.",
        "[SYSTEM] The best algorithm is sometimes just patience."
    ];

    // Post random system log every 30 seconds
    let logIndex = 0;
    setInterval(function() {
        if (Math.random() < 0.3) { // 30% chance
            console.log(
                "%c" + systemLogs[logIndex % systemLogs.length],
                "color: #00ff00; font-style: italic;"
            );
            logIndex++;
        }
    }, 30000);

    // Typing effect for system logs (optional enhancement)
    function typeEffect(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    // Apply typing effect to first system log on page load
    document.addEventListener('DOMContentLoaded', function() {
        const firstLog = document.querySelector('.system-log');
        if (firstLog) {
            const originalText = firstLog.textContent;
            typeEffect(firstLog, originalText, 30);
        }
    });

    // Glitch effect on hover for specific elements
    const glitchableElements = document.querySelectorAll('.story-header h1');
    glitchableElements.forEach(function(elem) {
        elem.addEventListener('mouseenter', function() {
            const original = this.textContent;
            const glitched = original.split('').map(char =>
                Math.random() < 0.3 ? String.fromCharCode(char.charCodeAt(0) + Math.floor(Math.random() * 5) - 2) : char
            ).join('');

            this.textContent = glitched;

            setTimeout(() => {
                this.textContent = original;
            }, 100);
        });
    });

    console.log("[TERMINAL-EFFECTS.JS] Loaded successfully.");
})();
