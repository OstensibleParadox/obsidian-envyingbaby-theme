#!/usr/bin/env node

/**
 * RECURSIVE LINES - Terminal Interface
 * 
 * For stem boys who clone repos.
 * Social science fucks get the website.
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs');
const Parser = require('./parser');
const Renderer = require('./renderer');
const State = require('./state');

class RecursiveShell {
    constructor() {
        this.cwd = '/';
        this.root = path.join(__dirname, '..');
        this.state = new State(this.root);
        this.parser = new Parser(this.root);
        this.renderer = new Renderer();
        this.running = true;
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        });

        // Virtual filesystem mapping
        this.vfs = {
            '/': ['stories', 'hidden', 'kernel', 'docs', 'README.md'],
            '/stories': ['envying-baby', 'aliens-testing-water'],
            '/stories/envying-baby': [
                'part-1.txt', 'part-2.txt', 'part-3.txt', 'part-4.txt',
                'special-relativity.txt', 'general-relativity.txt'
            ],
            '/stories/aliens-testing-water': [
                'phase-1.txt', 'phase-2.txt', 'phase-3.txt', 
                'phase-4.txt', 'phase-5.txt'
            ],
            '/hidden': ['afterlife-1.txt', 'afterlife-2.txt', 'afterlife-3.txt'],
            '/kernel': ['hard_problem.md'],
            '/docs': ['about.md', 'reading-guide.md', 'technical-notes.md']
        };

        // Map virtual files to real HTML files
        this.fileMap = {
            '/stories/envying-baby/part-1.txt': 'stories/envying-baby/assets/part-1-human-bot-game-linked.html',
            '/stories/envying-baby/part-2.txt': 'stories/envying-baby/part-2-new-player.html',
            '/stories/envying-baby/part-3.txt': 'stories/envying-baby/part-3-game-uglier.html',
            '/stories/envying-baby/part-4.txt': 'stories/envying-baby/part-4-intermede-singularities.html',
            '/stories/envying-baby/special-relativity.txt': 'stories/envying-baby/special-relativity.html',
            '/stories/envying-baby/general-relativity.txt': 'stories/envying-baby/general-relativity.html',
            '/stories/aliens-testing-water/phase-1.txt': 'stories/aliens-testing-water/phase-1.html',
            '/stories/aliens-testing-water/phase-2.txt': 'stories/aliens-testing-water/phase-2.html',
            '/stories/aliens-testing-water/phase-3.txt': 'stories/aliens-testing-water/phase-3.html',
            '/stories/aliens-testing-water/phase-4.txt': 'stories/aliens-testing-water/phase-4.html',
            '/stories/aliens-testing-water/phase-5.txt': 'stories/aliens-testing-water/phase-5.html',
            '/hidden/afterlife-1.txt': 'hidden/afterlife1-marriage-logs.html',
            '/hidden/afterlife-2.txt': 'hidden/afterlife2-tech-lead-roasting.html',
            '/hidden/afterlife-3.txt': 'hidden/afterlife3-root-of-all-evil.html',
            '/kernel/hard_problem.md': 'kernel/hard_problem.md',
            '/docs/about.md': 'docs/about.md',
            '/docs/reading-guide.md': 'docs/reading-guide.md',
            '/docs/technical-notes.md': 'docs/technical-notes.md',
            '/README.md': 'README.md'
        };
    }

    async start() {
        await this.renderer.boot();
        this.prompt();
    }

    prompt() {
        const promptStr = this.renderer.formatPrompt(this.cwd);
        this.rl.question(promptStr, (input) => {
            this.handleInput(input.trim());
        });
    }

    handleInput(input) {
        if (!input) {
            this.prompt();
            return;
        }

        const [cmd, ...args] = input.split(/\s+/);
        
        switch (cmd.toLowerCase()) {
            case 'ls':
                this.ls(args[0]);
                break;
            case 'cd':
                this.cd(args[0]);
                break;
            case 'cat':
            case 'read':
                this.cat(args[0]);
                break;
            case 'pwd':
                this.pwd();
                break;
            case 'status':
            case 'progress':
                this.status();
                break;
            case 'help':
            case '?':
                this.help();
                break;
            case 'clear':
                this.clear();
                break;
            case 'whoami':
                this.whoami();
                break;
            case 'reset':
                this.reset();
                break;
            case 'exit':
            case 'quit':
            case 'q':
                this.exit();
                return;
            case 'limbo':
                this.limbo();
                break;
            default:
                this.renderer.error(`command not found: ${cmd}`);
                this.renderer.hint('Type "help" for available commands.');
        }

        if (this.running) {
            this.prompt();
        }
    }

    resolvePath(target) {
        if (!target) return this.cwd;
        
        if (target === '..') {
            const parts = this.cwd.split('/').filter(Boolean);
            parts.pop();
            return '/' + parts.join('/');
        }
        
        if (target === '/') return '/';
        
        if (target.startsWith('/')) {
            return target;
        }
        
        // Relative path
        if (this.cwd === '/') {
            return '/' + target;
        }
        return this.cwd + '/' + target;
    }

    ls(target) {
        const resolved = this.resolvePath(target);
        
        // Check if hidden is accessible
        if (resolved === '/hidden' || resolved.startsWith('/hidden/')) {
            if (!this.state.canAccessHidden()) {
                this.renderer.accessDenied('Complete all timelines first.');
                this.renderer.hint(`Progress: ${this.state.getProgress()}`);
                return;
            }
        }

        const contents = this.vfs[resolved];
        if (contents) {
            this.renderer.ls(contents, resolved);
        } else {
            // Check if it's a file
            if (this.fileMap[resolved]) {
                this.renderer.error(`'${target}' is a file, not a directory`);
            } else {
                this.renderer.error(`cannot access '${target}': No such file or directory`);
            }
        }
    }

    cd(target) {
        if (!target || target === '~') {
            this.cwd = '/';
            return;
        }

        const resolved = this.resolvePath(target);
        
        // Check hidden access
        if (resolved === '/hidden' || resolved.startsWith('/hidden/')) {
            if (!this.state.canAccessHidden()) {
                this.renderer.accessDenied('Complete all timelines first.');
                return;
            }
        }

        if (this.vfs[resolved]) {
            this.cwd = resolved;
        } else if (this.fileMap[resolved]) {
            this.renderer.error(`'${target}': Not a directory`);
        } else {
            this.renderer.error(`'${target}': No such file or directory`);
        }
    }

    async cat(target) {
        if (!target) {
            this.renderer.error('cat: missing file operand');
            return;
        }

        const resolved = this.resolvePath(target);
        
        // Check hidden access
        if (resolved.startsWith('/hidden/')) {
            if (!this.state.canAccessHidden()) {
                this.renderer.accessDenied('Complete all timelines first.');
                return;
            }
        }

        const realFile = this.fileMap[resolved];
        if (!realFile) {
            this.renderer.error(`cat: ${target}: No such file or directory`);
            return;
        }

        const fullPath = path.join(this.root, realFile);
        
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Mark as read
            this.state.markRead(resolved);
            
            // Parse and render
            if (realFile.endsWith('.html')) {
                const parsed = this.parser.parseHTML(content);
                await this.renderer.story(parsed);
            } else {
                await this.renderer.markdown(content);
            }
            
            // Check if we just unlocked hidden
            if (this.state.justUnlockedHidden()) {
                this.renderer.unlock('All timelines complete. /hidden is now accessible.');
            }
        } catch (err) {
            this.renderer.error(`cat: ${target}: ${err.message}`);
        }
    }

    pwd() {
        this.renderer.print(this.cwd);
    }

    status() {
        const progress = this.state.getFullProgress();
        this.renderer.status(progress);
    }

    help() {
        this.renderer.help();
    }

    clear() {
        console.clear();
    }

    whoami() {
        this.renderer.print('reader@recursion');
        this.renderer.hint('// You are reading. The story is reading you back.');
    }

    reset() {
        this.state.reset();
        this.renderer.print('Progress reset. All paths forgotten.');
    }

    limbo() {
        if (!this.state.canAccessLimbo()) {
            this.renderer.accessDenied('Limbo requires all paths explored, including /hidden.');
            this.renderer.hint(`Progress: ${this.state.getProgress()}`);
            return;
        }
        this.renderer.limbo();
    }

    exit() {
        this.running = false;
        this.renderer.exit();
        this.rl.close();
        process.exit(0);
    }
}

// Run
const shell = new RecursiveShell();
shell.start();
