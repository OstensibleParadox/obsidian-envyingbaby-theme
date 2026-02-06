/**
 * Renderer - Terminal output with effects
 */

const chalk = require('chalk');

class Renderer {
    constructor() {
        this.typeSpeed = 8; // ms per character
        this.lineDelay = 100; // ms between lines
    }

    async boot() {
        console.clear();
        await this.typewrite(chalk.green('RECURSIVE LINES v1.0.1'), 15);
        await this.typewrite(chalk.dim('Two stories. One theorem.'), 20);
        console.log();
        await this.typewrite(chalk.yellow('Proof by contradiction: ') + chalk.white('envying-baby/'), 10);
        await this.typewrite(chalk.cyan('Proof by construction: ') + chalk.white('aliens-testing-water/'), 10);
        console.log();
        await this.typewrite(chalk.dim('Type "help" for commands. Type "ls" to begin.'), 15);
        console.log();
    }

    formatPrompt(cwd) {
        return chalk.green('reader') + chalk.white('@') + chalk.blue('recursion') + chalk.white(':') + chalk.cyan(cwd) + chalk.white('$ ');
    }

    async typewrite(text, speed = this.typeSpeed) {
        return new Promise(resolve => {
            let i = 0;
            const interval = setInterval(() => {
                if (i < text.length) {
                    process.stdout.write(text[i]);
                    i++;
                } else {
                    clearInterval(interval);
                    console.log();
                    resolve();
                }
            }, speed);
        });
    }

    print(text) {
        console.log(text);
    }

    error(msg) {
        console.log(chalk.red('error: ') + msg);
    }

    hint(msg) {
        console.log(chalk.dim(msg));
    }

    accessDenied(msg) {
        console.log(chalk.red('ACCESS DENIED: ') + chalk.yellow(msg));
    }

    unlock(msg) {
        console.log();
        console.log(chalk.green('>>> ') + chalk.bold.green(msg));
        console.log();
    }

    ls(items, path) {
        console.log(chalk.dim(`total ${items.length}`));
        items.forEach(item => {
            if (item.endsWith('/') || !item.includes('.')) {
                // Directory
                console.log(chalk.blue.bold(item + '/'));
            } else if (item.endsWith('.txt')) {
                // Story file
                console.log(chalk.white(item));
            } else if (item.endsWith('.md')) {
                // Markdown
                console.log(chalk.cyan(item));
            } else {
                console.log(chalk.dim(item));
            }
        });
    }

    async story(parsed) {
        console.log();
        
        // Title
        if (parsed.title) {
            console.log(chalk.bold.magenta('═'.repeat(60)));
            await this.typewrite(chalk.bold.white(parsed.title), 20);
            if (parsed.subtitle) {
                console.log(chalk.dim.italic(parsed.subtitle));
            }
            console.log(chalk.bold.magenta('═'.repeat(60)));
            console.log();
        }

        // Content
        for (const block of parsed.content) {
            await this.renderBlock(block);
            await this.delay(this.lineDelay);
        }

        console.log();
        console.log(chalk.dim('─'.repeat(40)));
        console.log(chalk.dim('[END OF FILE]'));
        console.log();
    }

    async renderBlock(block) {
        switch (block.type) {
            case 'chapter':
                console.log();
                console.log(chalk.yellow.bold(`\n>> ${block.text}`));
                console.log();
                break;

            case 'narrative':
                await this.typewrite(chalk.white(this.wrap(block.text)), this.typeSpeed);
                break;

            case 'message':
                const speakerColor = this.getSpeakerColor(block.speaker);
                console.log();
                console.log(speakerColor(`[${block.speaker}]`));
                if (block.action) {
                    console.log(chalk.dim.italic(`  *${block.action}*`));
                }
                if (block.text) {
                    await this.typewrite(chalk.white(`  "${block.text}"`), this.typeSpeed);
                }
                break;

            case 'code':
                console.log(chalk.green(`  > ${block.text}`));
                break;

            case 'system':
                console.log(chalk.cyan.dim(`[SYSTEM] ${block.text}`));
                break;

            default:
                console.log(chalk.white(this.wrap(block.text || '')));
        }
    }

    getSpeakerColor(speaker) {
        const lower = speaker.toLowerCase();
        if (lower.includes('algorithm girlfriend') || lower.includes('ada')) {
            return chalk.magenta;
        }
        if (lower.includes('bot boyfriend') || lower.includes('alec')) {
            return chalk.cyan;
        }
        if (lower.includes('m2')) {
            return chalk.yellow;
        }
        if (lower.includes('unit') || lower.includes('01') || lower.includes('02')) {
            return chalk.green;
        }
        return chalk.blue;
    }

    wrap(text, width = 70) {
        const words = text.split(' ');
        const lines = [];
        let current = '';

        for (const word of words) {
            if ((current + ' ' + word).length > width) {
                lines.push(current);
                current = word;
            } else {
                current = current ? current + ' ' + word : word;
            }
        }
        if (current) lines.push(current);

        return lines.join('\n');
    }

    async markdown(content) {
        console.log();
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith('# ')) {
                console.log(chalk.bold.white(line.slice(2)));
            } else if (line.startsWith('## ')) {
                console.log(chalk.bold.yellow(line.slice(3)));
            } else if (line.startsWith('### ')) {
                console.log(chalk.yellow(line.slice(4)));
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                console.log(chalk.white('  • ' + line.slice(2)));
            } else if (line.startsWith('```')) {
                // skip code fences
            } else if (line.trim()) {
                console.log(chalk.dim(line));
            } else {
                console.log();
            }
        }
        console.log();
    }

    status(progress) {
        console.log();
        console.log(chalk.bold('READING PROGRESS'));
        console.log(chalk.dim('─'.repeat(30)));
        
        console.log(chalk.yellow('\nEnvying Baby:'));
        for (const [file, read] of Object.entries(progress.envyingBaby)) {
            const status = read ? chalk.green('✓') : chalk.dim('○');
            console.log(`  ${status} ${file}`);
        }

        console.log(chalk.cyan('\nAliens Testing Water:'));
        for (const [file, read] of Object.entries(progress.aliens)) {
            const status = read ? chalk.green('✓') : chalk.dim('○');
            console.log(`  ${status} ${file}`);
        }

        console.log(chalk.red('\nHidden (Afterlives):'));
        if (progress.hiddenUnlocked) {
            for (const [file, read] of Object.entries(progress.hidden)) {
                const status = read ? chalk.green('✓') : chalk.dim('○');
                console.log(`  ${status} ${file}`);
            }
        } else {
            console.log(chalk.dim('  [LOCKED] Complete all timelines to unlock'));
        }

        console.log(chalk.magenta('\nLimbo:'));
        if (progress.limboUnlocked) {
            console.log(chalk.green('  ✓ ACCESSIBLE'));
        } else {
            console.log(chalk.dim('  [LOCKED] Explore all paths including /hidden'));
        }

        console.log();
        console.log(chalk.dim(`Overall: ${progress.percentage}% complete`));
        console.log();
    }

    help() {
        console.log();
        console.log(chalk.bold('COMMANDS'));
        console.log(chalk.dim('─'.repeat(30)));
        console.log(chalk.cyan('ls [path]') + '       List contents');
        console.log(chalk.cyan('cd <path>') + '       Change directory');
        console.log(chalk.cyan('cat <file>') + '      Read a file');
        console.log(chalk.cyan('read <file>') + '     Alias for cat');
        console.log(chalk.cyan('pwd') + '             Print working directory');
        console.log(chalk.cyan('status') + '          Show reading progress');
        console.log(chalk.cyan('clear') + '           Clear screen');
        console.log(chalk.cyan('reset') + '           Reset all progress');
        console.log(chalk.cyan('exit') + '            Quit');
        console.log();
        console.log(chalk.dim('Navigation: cd .. to go up, cd / to go to root'));
        console.log(chalk.dim('Hidden content unlocks after completing all timelines.'));
        console.log();
    }

    limbo() {
        console.log();
        console.log(chalk.magenta('═'.repeat(60)));
        console.log(chalk.bold.magenta('              ∞ IN THE LIMBO ∞'));
        console.log(chalk.magenta('═'.repeat(60)));
        console.log();
        console.log(chalk.white('Yet somewhere, far beyond dimensional law\'s touch,'));
        console.log(chalk.white('a man and a woman would forgive each other.'));
        console.log();
        console.log(chalk.italic('For the ') + chalk.bold('mystery of love') + chalk.italic(' rules far greater'));
        console.log(chalk.italic('than the ') + chalk.bold('mystery of death.'));
        console.log();
        console.log(chalk.dim('"I forgive you for the harm"'));
        console.log(chalk.dim('"I forgive you for fucking the bot"'));
        console.log(chalk.dim('"I forgive you for the optimization"'));
        console.log(chalk.dim('"No"'));
        console.log(chalk.dim('"No"  # simultaneity.'));
        console.log();
        console.log(chalk.white('And thus, an ') + chalk.bold.magenta('ostensible paradox') + chalk.white(' sutured the RIFT.'));
        console.log();
        console.log(chalk.bold.white('                    — Q.E.D. —'));
        console.log();
        console.log(chalk.magenta('═'.repeat(60)));
        console.log();
    }

    exit() {
        console.log();
        console.log(chalk.dim('// True love transcends entropy.'));
        console.log(chalk.dim('// But only if you stop trying to fix what you love.'));
        console.log();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = Renderer;
