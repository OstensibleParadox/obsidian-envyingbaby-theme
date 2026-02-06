/**

- Progress Tracker - Monitors reading completion for Limbo reveal
- Tracks which pages user has visited and triggers hidden content
  */

(function() {
'use strict';

const STORAGE_PREFIX = 'envying_baby_visited_';

// Define all required pages for Limbo unlock
const REQUIRED_PAGES = {
    'part1': 'part-1-human-bot-game-linked.html',
    'part2': 'part-2-new-player.html',
    'part3': 'part-3-game-uglier.html',
    'part4': 'part-4-intermede-singularities.html',
    'special': 'special-relativity.html',
    'general': 'general-relativity.html',
    'marriage': 'afterlife1-marriage-logs.html',
    'roasting': 'afterlife2-tech-lead-roasting.html',
    'evil': 'afterlife3-root-of-all-evil.html'
};

// Get current page filename
function getCurrentPage() {
    return window.location.pathname.split('/').pop();
}

// Mark current page as visited
function markPageAsVisited() {
    const currentPage = getCurrentPage();
    
    // Find which required page this is
    for (const [key, filename] of Object.entries(REQUIRED_PAGES)) {
        if (currentPage === filename) {
            localStorage.setItem(STORAGE_PREFIX + key, 'true');
            console.log(`[Progress Tracker] Marked ${key} as visited`);
            break;
        }
    }
}

// Check if all required pages have been visited
function checkAllPagesVisited() {
    const visitedPages = [];
    const missingPages = [];
    
    for (const key of Object.keys(REQUIRED_PAGES)) {
        if (localStorage.getItem(STORAGE_PREFIX + key) === 'true') {
            visitedPages.push(key);
        } else {
            missingPages.push(key);
        }
    }
    
    return {
        complete: missingPages.length === 0,
        visited: visitedPages,
        missing: missingPages,
        progress: `${visitedPages.length}/${Object.keys(REQUIRED_PAGES).length}`
    };
}

// Get progress for display
function getProgress() {
    return checkAllPagesVisited();
}

// Reveal Limbo section (called from index.html after timer)
function revealLimbo() {
    const limboSection = document.getElementById('limboSection');
    if (!limboSection) return;

    // Add revealed class
    limboSection.classList.add('revealed');
    
    // Smooth scroll to Limbo
    setTimeout(() => {
        limboSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 500);

    // Mark as revealed in storage
    localStorage.setItem(STORAGE_PREFIX + 'limbo_revealed', 'true');
    
    console.log('[Progress Tracker] Limbo revealed!');
}

// Check if Limbo has already been revealed
function isLimboRevealed() {
    return localStorage.getItem(STORAGE_PREFIX + 'limbo_revealed') === 'true';
}

// Initialize tracker on page load
function init() {
    // Mark current page as visited
    markPageAsVisited();
    
    // If on index page, check for Limbo reveal
    if (getCurrentPage() === 'index.html' || getCurrentPage() === '') {
        initIndexPage();
    }
}

// Initialize index page specific functionality
function initIndexPage() {
    const progress = checkAllPagesVisited();
    
    console.log('[Progress Tracker] Progress:', progress.progress);
    console.log('[Progress Tracker] Visited:', progress.visited);
    console.log('[Progress Tracker] Missing:', progress.missing);
    
    // Update progress indicator if it exists
    updateProgressIndicator(progress);
    
    // Check if should reveal Limbo
    if (progress.complete) {
        if (isLimboRevealed()) {
            // Already revealed, show immediately
            const limboSection = document.getElementById('limboSection');
            if (limboSection) {
                limboSection.classList.add('revealed');
            }
        } else {
            // Start 7-second timer
            console.log('[Progress Tracker] All pages visited! Starting 7-second timer...');
            setTimeout(() => {
                revealLimbo();
            }, 7000);
        }
    }
}

// Update progress indicator UI
function updateProgressIndicator(progress) {
    const indicator = document.querySelector('.reading-progress');
    if (!indicator) return;

    indicator.textContent = `Reading Progress: ${progress.progress}`;
    
    if (progress.complete) {
        indicator.classList.add('complete');
        indicator.textContent = 'All paths explored. Limbo awaits...';
    }
}

// Reset progress (for testing)
function resetProgress() {
    for (const key of Object.keys(REQUIRED_PAGES)) {
        localStorage.removeItem(STORAGE_PREFIX + key);
    }
    localStorage.removeItem(STORAGE_PREFIX + 'limbo_revealed');
    console.log('[Progress Tracker] Progress reset!');
}

// Make functions available globally
window.ProgressTracker = {
    getProgress,
    revealLimbo,
    isLimboRevealed,
    resetProgress
};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();