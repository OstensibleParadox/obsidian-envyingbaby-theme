/**
 * Parser - Extracts narrative content from HTML files
 */

const cheerio = require('cheerio');

class Parser {
    constructor(root) {
        this.root = root;
    }

    parseHTML(html) {
        const $ = cheerio.load(html);
        const result = {
            title: '',
            subtitle: '',
            content: []
        };

        // Get title
        result.title = $('.chapter-title').first().text() || 
                       $('h1').first().text() || 
                       $('title').text();
        
        result.subtitle = $('.chapter-subtitle').first().text() || '';

        // Parse different content types
        
        // Narratives
        $('.narrative').each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
                result.content.push({ type: 'narrative', text });
            }
        });

        // Messages (chat format)
        $('.message').each((i, el) => {
            const $el = $(el);
            const isUser = $el.hasClass('message-user');
            const isAssistant = $el.hasClass('message-assistant');
            
            let speaker = '';
            if (isUser) {
                speaker = $el.find('.message-label.user').text().trim() || 'USER';
            } else if (isAssistant) {
                speaker = $el.find('.message-label.assistant').text().trim() || 'ASSISTANT';
            }

            const action = $el.find('.message-text.action').text().trim();
            const dialogue = $el.find('.message-text').not('.action').map((i, t) => $(t).text().trim()).get().join(' ');

            if (speaker || dialogue) {
                result.content.push({
                    type: 'message',
                    speaker: speaker.replace(/\s+/g, ' ').trim(),
                    action,
                    text: dialogue
                });
            }
        });

        // Code blocks
        $('.code-block, .code-content, pre, code').each((i, el) => {
            const text = $(el).text().trim();
            if (text && text.length < 500) { // Skip huge code blocks
                result.content.push({ type: 'code', text });
            }
        });

        // Chapter dividers
        $('.chapter-divider h3, .chapter-divider h2').each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
                result.content.push({ type: 'chapter', text });
            }
        });

        // System notes / technical
        $('.system-note, .technical-note').each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
                result.content.push({ type: 'system', text });
            }
        });

        // Fallback: if content is empty, grab all paragraph text
        if (result.content.length === 0) {
            $('p, .story-text, .content').each((i, el) => {
                const text = $(el).text().trim();
                if (text && text.length > 20) {
                    result.content.push({ type: 'narrative', text });
                }
            });
        }

        // Also check for main content areas
        if (result.content.length === 0) {
            const mainContent = $('.main-content, .story-content, .chat-area, article, main').text();
            if (mainContent) {
                // Split into paragraphs
                mainContent.split(/\n\n+/).forEach(para => {
                    const text = para.trim();
                    if (text && text.length > 20) {
                        result.content.push({ type: 'narrative', text });
                    }
                });
            }
        }

        return result;
    }
}

module.exports = Parser;
