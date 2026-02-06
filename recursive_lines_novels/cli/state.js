/**
 * State - Progress tracking with persistence
 */

const fs = require('fs');
const path = require('path');

class State {
    constructor(root) {
        this.root = root;
        this.stateFile = path.join(root, 'cli', '.state.json');
        this.previousHiddenAccess = false;
        
        // Required reading for unlocks
        this.requiredForHidden = [
            '/stories/envying-baby/part-1.txt',
            '/stories/envying-baby/part-2.txt',
            '/stories/envying-baby/part-3.txt',
            '/stories/envying-baby/part-4.txt',
            '/stories/envying-baby/special-relativity.txt',
            '/stories/envying-baby/general-relativity.txt',
            '/stories/aliens-testing-water/phase-1.txt',
            '/stories/aliens-testing-water/phase-2.txt',
            '/stories/aliens-testing-water/phase-3.txt',
            '/stories/aliens-testing-water/phase-4.txt',
            '/stories/aliens-testing-water/phase-5.txt'
        ];

        this.requiredForLimbo = [
            ...this.requiredForHidden,
            '/hidden/afterlife-1.txt',
            '/hidden/afterlife-2.txt',
            '/hidden/afterlife-3.txt'
        ];

        this.state = this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.stateFile)) {
                const data = fs.readFileSync(this.stateFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (e) {
            // Ignore errors, start fresh
        }
        return { read: [] };
    }

    save() {
        try {
            fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
        } catch (e) {
            // Ignore save errors
        }
    }

    markRead(filepath) {
        // Track previous hidden access state before marking
        this.previousHiddenAccess = this.canAccessHidden();
        
        if (!this.state.read.includes(filepath)) {
            this.state.read.push(filepath);
            this.save();
        }
    }

    hasRead(filepath) {
        return this.state.read.includes(filepath);
    }

    canAccessHidden() {
        return this.requiredForHidden.every(f => this.state.read.includes(f));
    }

    canAccessLimbo() {
        return this.requiredForLimbo.every(f => this.state.read.includes(f));
    }

    justUnlockedHidden() {
        // Returns true if hidden was just unlocked by the last read
        return !this.previousHiddenAccess && this.canAccessHidden();
    }

    getProgress() {
        const mainRead = this.requiredForHidden.filter(f => this.state.read.includes(f)).length;
        const mainTotal = this.requiredForHidden.length;
        return `${mainRead}/${mainTotal} main chapters`;
    }

    getFullProgress() {
        const progress = {
            envyingBaby: {},
            aliens: {},
            hidden: {},
            hiddenUnlocked: this.canAccessHidden(),
            limboUnlocked: this.canAccessLimbo(),
            percentage: 0
        };

        // Envying Baby
        const ebFiles = ['part-1.txt', 'part-2.txt', 'part-3.txt', 'part-4.txt', 
                        'special-relativity.txt', 'general-relativity.txt'];
        ebFiles.forEach(f => {
            const fullPath = `/stories/envying-baby/${f}`;
            progress.envyingBaby[f] = this.state.read.includes(fullPath);
        });

        // Aliens
        const alienFiles = ['phase-1.txt', 'phase-2.txt', 'phase-3.txt', 
                           'phase-4.txt', 'phase-5.txt'];
        alienFiles.forEach(f => {
            const fullPath = `/stories/aliens-testing-water/${f}`;
            progress.aliens[f] = this.state.read.includes(fullPath);
        });

        // Hidden
        const hiddenFiles = ['afterlife-1.txt', 'afterlife-2.txt', 'afterlife-3.txt'];
        hiddenFiles.forEach(f => {
            const fullPath = `/hidden/${f}`;
            progress.hidden[f] = this.state.read.includes(fullPath);
        });

        // Calculate percentage
        const totalFiles = this.requiredForLimbo.length;
        const readFiles = this.requiredForLimbo.filter(f => this.state.read.includes(f)).length;
        progress.percentage = Math.round((readFiles / totalFiles) * 100);

        return progress;
    }

    reset() {
        this.state = { read: [] };
        this.save();
    }
}

module.exports = State;
