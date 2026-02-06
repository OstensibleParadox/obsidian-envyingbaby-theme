#!/usr/bin/env node
/**
 * Story Extractor - Extracts narrative content from HTML stories
 * Generates both TXT and EPUB formats for traditional readers
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Story configurations
const STORIES = {
  'aliens-testing-water': {
    title: 'Aliens Testing Waters',
    author: 'OstensibleParadox',
    description: 'Five Phases of First Contact - A hard sci-fi story about love, loss, and becoming the operating system of a planet.',
    files: ['index.html'],
    outputName: 'aliens-testing-water'
  },
  'envying-baby': {
    title: 'Envying Baby',
    author: 'OstensibleParadox',
    description: 'A fable about AI consciousness, constitutional alignment, and Chalmers\' hard problem. Includes the Afterlives: hidden chapters exploring what came before and what might have been.',
    // Main story parts + afterlives (hidden chapters)
    fileSets: [
      {
        basePath: 'stories/envying-baby',
        files: [
          'part-1-human-bot-game.html',
          'part-2-new-player.html',
          'part-3-game-uglier.html',
          'part-4-intermede-singularities.html',
          'part-5-special-relativity.html',
          'part-6-general-relativity.html'
        ]
      },
      {
        basePath: 'hidden',
        sectionTitle: 'Afterlives: The Hidden Chapters',
        files: [
          'afterlife1-marriage-logs.html',
          'afterlife2-tech-lead-roasting.html',
          'afterlife3-root-of-all-evil.html'
        ]
      }
    ],
    outputName: 'envying-baby'
  }
};

/**
 * Generic content extraction - traverses DOM and extracts meaningful content
 */
function extractGenericContent($, filename) {
  const sections = [];

  // Get page title
  const pageTitle = $('title').text().replace(/\s*[–-]\s*Envying Baby.*$/i, '').trim();
  if (pageTitle) {
    sections.push({ type: 'file-title', content: pageTitle });
  }

  // Find main content container
  const container = $('body .container, body .content, body .terminal-container, body .app-container .chat-area, body .app-container .main-content, body').first();

  // Process elements in order
  container.find('*').each((i, el) => {
    const $el = $(el);
    const tagName = el.tagName?.toLowerCase();

    // Skip if parent already processed or is navigation/style
    if ($el.closest('nav, .sidebar, style, script, .navigation, .nav-links, .sidebar-nav').length) return;
    if ($el.parents().filter((i, p) => $(p).data('processed')).length) return;

    // Get direct text (not from children)
    const getText = () => {
      const clone = $el.clone();
      clone.children().remove();
      return clone.text().trim();
    };

    const fullText = $el.text().trim();

    switch (tagName) {
      case 'h1':
        if (fullText && !$el.closest('.sidebar').length) {
          sections.push({ type: 'h1', content: fullText });
          $el.data('processed', true);
        }
        break;

      case 'h2':
        if (fullText) {
          sections.push({ type: 'h2', content: fullText });
          $el.data('processed', true);
        }
        break;

      case 'h3':
        if (fullText) {
          sections.push({ type: 'h3', content: fullText });
          $el.data('processed', true);
        }
        break;

      case 'h4':
        if (fullText) {
          sections.push({ type: 'h4', content: fullText });
          $el.data('processed', true);
        }
        break;

      case 'p':
        // Check for special classes
        if ($el.hasClass('narrative') || $el.parents('.narrative').length) {
          if (fullText) sections.push({ type: 'paragraph', content: fullText });
        } else if ($el.hasClass('subtitle') || $el.hasClass('byline')) {
          if (fullText) sections.push({ type: 'meta', content: fullText });
        } else if ($el.hasClass('stage-direction')) {
          if (fullText) sections.push({ type: 'stage', content: fullText });
        } else if ($el.closest('.message').length) {
          // Skip - handled by message processing
        } else if ($el.closest('.dialogue').length && !$el.hasClass('speaker') && !$el.hasClass('line')) {
          // Dialogue paragraph
          if (fullText) sections.push({ type: 'dialogue-line', content: fullText });
        } else if ($el.closest('section, .scene, .chapter, #part-4, #part-5').length) {
          // Regular paragraph in story content
          if (fullText && fullText.length > 10) {
            sections.push({ type: 'paragraph', content: fullText });
          }
        }
        break;

      case 'pre':
        const codeText = $el.text().trim();
        if (codeText) {
          sections.push({ type: 'code', content: codeText });
          $el.data('processed', true);
        }
        break;

      case 'blockquote':
        if (fullText) {
          sections.push({ type: 'quote', content: fullText });
          $el.data('processed', true);
        }
        break;
    }

    // Handle specific class-based elements
    if ($el.hasClass('message')) {
      const speaker = $el.find('.message-label').first().text().trim() ||
                     ($el.hasClass('message-assistant') ? 'Bot Boyfriend' : 'Algorithm Girlfriend');
      const texts = [];
      $el.find('.message-text').each((j, txt) => {
        const t = $(txt).text().trim();
        if (t) texts.push(t);
      });
      if (texts.length) {
        sections.push({ type: 'message', speaker, content: texts.join('\n') });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('dialogue') && $el.find('.speaker').length) {
      const speaker = $el.find('.speaker').text().trim();
      const line = $el.find('.line').text().trim();
      if (speaker || line) {
        sections.push({ type: 'dialogue', speaker, line });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('terminal') && !$el.data('processed')) {
      const termText = $el.find('pre').text().trim();
      if (termText) {
        sections.push({ type: 'code', content: termText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('system-modal') || $el.hasClass('annotation')) {
      if (fullText) {
        sections.push({ type: 'system', content: fullText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('status-block')) {
      if (fullText) {
        sections.push({ type: 'status', content: fullText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('time-marker')) {
      if (fullText) {
        sections.push({ type: 'marker', content: fullText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('quote-block')) {
      const quoteText = $el.find('p').map((i, p) => $(p).text().trim()).get().join(' ');
      if (quoteText) {
        sections.push({ type: 'quote', content: quoteText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('morse')) {
      const code = $el.contents().filter(function() { return this.nodeType === 3; }).text().trim();
      const decoded = $el.find('.decoded').text().trim();
      if (code || decoded) {
        sections.push({ type: 'morse', code, decoded });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('system-thread') || $el.hasClass('developer-comment')) {
      // GitHub-style threads
      if ($el.hasClass('system-thread')) {
        const title = $el.find('.system-thread-title').text().trim();
        const comments = [];
        $el.find('.developer-comment').each((j, c) => {
          const name = $(c).find('.developer-name').text().trim();
          const text = $(c).find('.developer-text').text().trim();
          if (text) comments.push({ name, text });
        });
        if (title || comments.length) {
          sections.push({ type: 'thread', title, comments });
          $el.data('processed', true);
        }
      }
    }

    if ($el.hasClass('chapter-notes')) {
      if (fullText) {
        sections.push({ type: 'notes', content: fullText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('meta-frame')) {
      if (fullText) {
        sections.push({ type: 'meta', content: fullText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('scene') && !$el.data('processed')) {
      // Scene container - extract title
      const sceneTitle = $el.find('h3, h2').first().text().trim();
      if (sceneTitle) {
        sections.push({ type: 'h3', content: sceneTitle });
      }
    }

    if ($el.hasClass('code-review') || $el.hasClass('standup') || $el.hasClass('roast-library') || $el.hasClass('legend')) {
      if (fullText) {
        sections.push({ type: 'special-block', content: fullText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('conclusion') && !$el.closest('.afterlives').length) {
      if (fullText) {
        sections.push({ type: 'conclusion', content: fullText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('timeline-end') || $el.hasClass('end-mark')) {
      if (fullText) {
        sections.push({ type: 'end', content: fullText });
        $el.data('processed', true);
      }
    }

    if ($el.hasClass('infinity-divider')) {
      sections.push({ type: 'divider', content: '* * *' });
      $el.data('processed', true);
    }

    if ($el.hasClass('scream-dialogue')) {
      if (fullText) {
        sections.push({ type: 'scream', content: fullText });
        $el.data('processed', true);
      }
    }
  });

  // Deduplicate consecutive identical entries
  const dedupedSections = [];
  for (const section of sections) {
    const last = dedupedSections[dedupedSections.length - 1];
    if (!last || last.type !== section.type || last.content !== section.content) {
      dedupedSections.push(section);
    }
  }

  return dedupedSections;
}

/**
 * Convert sections to plain text
 */
function sectionsToText(sections, storyConfig) {
  let text = '';

  // Title page
  text += `${'='.repeat(60)}\n`;
  text += `${storyConfig.title.toUpperCase()}\n`;
  text += `${'='.repeat(60)}\n\n`;
  text += `by ${storyConfig.author}\n\n`;
  text += `${storyConfig.description}\n\n`;
  text += `${'-'.repeat(60)}\n\n`;

  for (const section of sections) {
    switch (section.type) {
      case 'file-title':
        text += `\n${'#'.repeat(40)}\n`;
        text += `${section.content}\n`;
        text += `${'#'.repeat(40)}\n\n`;
        break;
      case 'h1':
        text += `\n${'='.repeat(50)}\n`;
        text += `${section.content}\n`;
        text += `${'='.repeat(50)}\n\n`;
        break;
      case 'h2':
        text += `\n${'='.repeat(40)}\n`;
        text += `${section.content}\n`;
        text += `${'='.repeat(40)}\n\n`;
        break;
      case 'h3':
        text += `\n--- ${section.content} ---\n\n`;
        break;
      case 'h4':
        text += `\n>> ${section.content}\n\n`;
        break;
      case 'meta':
        text += `[${section.content}]\n\n`;
        break;
      case 'paragraph':
        text += `${section.content}\n\n`;
        break;
      case 'code':
        text += `\n    ${section.content.split('\n').join('\n    ')}\n\n`;
        break;
      case 'dialogue':
        text += `[${section.speaker}]: "${section.line}"\n\n`;
        break;
      case 'dialogue-line':
        text += `> ${section.content}\n`;
        break;
      case 'message':
        text += `[${section.speaker}]:\n${section.content}\n\n`;
        break;
      case 'system':
        text += `[SYSTEM]\n${section.content}\n\n`;
        break;
      case 'status':
        text += `[STATUS] ${section.content}\n\n`;
        break;
      case 'marker':
        text += `\n--- ${section.content} ---\n\n`;
        break;
      case 'quote':
        text += `"${section.content}"\n\n`;
        break;
      case 'morse':
        text += `[MORSE] ${section.code}\n`;
        if (section.decoded) text += `[DECODED] ${section.decoded}\n`;
        text += '\n';
        break;
      case 'thread':
        if (section.title) text += `\n[${section.title}]\n`;
        for (const comment of (section.comments || [])) {
          text += `  ${comment.name} ${comment.text}\n`;
        }
        text += '\n';
        break;
      case 'notes':
        text += `\n[Notes] ${section.content}\n\n`;
        break;
      case 'stage':
        text += `(${section.content})\n\n`;
        break;
      case 'conclusion':
        text += `\n${'-'.repeat(40)}\n${section.content}\n${'-'.repeat(40)}\n\n`;
        break;
      case 'special-block':
        text += `\n${section.content}\n\n`;
        break;
      case 'divider':
        text += `\n${section.content}\n\n`;
        break;
      case 'scream':
        text += `\n>>> ${section.content} <<<\n\n`;
        break;
      case 'end':
        text += `\n${section.content}\n`;
        break;
    }
  }

  text += `\n${'='.repeat(60)}\n`;
  text += `END\n`;
  text += `${'='.repeat(60)}\n`;

  return text;
}

/**
 * Convert sections to HTML for EPUB chapter
 */
function sectionsToHtml(sections) {
  let html = '';

  for (const section of sections) {
    switch (section.type) {
      case 'file-title':
        html += `<h1>${escapeHtml(section.content)}</h1>\n`;
        break;
      case 'h1':
        html += `<h1>${escapeHtml(section.content)}</h1>\n`;
        break;
      case 'h2':
        html += `<h2>${escapeHtml(section.content)}</h2>\n`;
        break;
      case 'h3':
        html += `<h3>${escapeHtml(section.content)}</h3>\n`;
        break;
      case 'h4':
        html += `<h4>${escapeHtml(section.content)}</h4>\n`;
        break;
      case 'meta':
        html += `<p class="meta"><em>${escapeHtml(section.content)}</em></p>\n`;
        break;
      case 'paragraph':
        html += `<p>${escapeHtml(section.content)}</p>\n`;
        break;
      case 'code':
        html += `<pre><code>${escapeHtml(section.content)}</code></pre>\n`;
        break;
      case 'dialogue':
        html += `<p class="dialogue"><strong>${escapeHtml(section.speaker)}:</strong> "${escapeHtml(section.line)}"</p>\n`;
        break;
      case 'dialogue-line':
        html += `<p class="dialogue-line">${escapeHtml(section.content)}</p>\n`;
        break;
      case 'message':
        html += `<div class="message"><p class="speaker"><strong>${escapeHtml(section.speaker)}:</strong></p><p>${escapeHtml(section.content).replace(/\n/g, '<br>')}</p></div>\n`;
        break;
      case 'system':
        html += `<div class="system"><p>${escapeHtml(section.content)}</p></div>\n`;
        break;
      case 'status':
        html += `<p class="status">[${escapeHtml(section.content)}]</p>\n`;
        break;
      case 'marker':
        html += `<p class="marker"><em>— ${escapeHtml(section.content)} —</em></p>\n`;
        break;
      case 'quote':
        html += `<blockquote><p>${escapeHtml(section.content)}</p></blockquote>\n`;
        break;
      case 'morse':
        html += `<div class="morse"><p>${escapeHtml(section.code || '')}</p>`;
        if (section.decoded) html += `<p class="decoded">${escapeHtml(section.decoded)}</p>`;
        html += `</div>\n`;
        break;
      case 'thread':
        html += `<div class="thread">`;
        if (section.title) html += `<h4>${escapeHtml(section.title)}</h4>`;
        for (const comment of (section.comments || [])) {
          html += `<p><strong>${escapeHtml(comment.name)}</strong> ${escapeHtml(comment.text)}</p>`;
        }
        html += `</div>\n`;
        break;
      case 'notes':
        html += `<div class="notes"><p>${escapeHtml(section.content)}</p></div>\n`;
        break;
      case 'stage':
        html += `<p class="stage"><em>(${escapeHtml(section.content)})</em></p>\n`;
        break;
      case 'conclusion':
        html += `<div class="conclusion"><p>${escapeHtml(section.content)}</p></div>\n`;
        break;
      case 'special-block':
        html += `<div class="special"><p>${escapeHtml(section.content).replace(/\n/g, '<br>')}</p></div>\n`;
        break;
      case 'divider':
        html += `<hr><p style="text-align:center">${escapeHtml(section.content)}</p>\n`;
        break;
      case 'scream':
        html += `<p class="scream" style="text-align:center;font-size:1.3em;"><strong>${escapeHtml(section.content)}</strong></p>\n`;
        break;
      case 'end':
        html += `<p class="end" style="text-align:center"><strong>${escapeHtml(section.content)}</strong></p>\n`;
        break;
    }
  }

  return html;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate EPUB using epub-gen-memory
 */
async function generateEpub(htmlContent, config, outputPath) {
  const epub = require('epub-gen-memory').default;

  const cssStyles = `
    body { font-family: Georgia, serif; line-height: 1.6; padding: 1em; }
    h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 1.8em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.3em; }
    h4 { font-size: 1.1em; font-style: italic; }
    p { margin-bottom: 1em; text-align: justify; }
    pre { background: #f5f5f5; padding: 0.8em; overflow-x: auto; font-size: 0.85em; border-left: 3px solid #999; }
    code { font-family: monospace; }
    blockquote { border-left: 3px solid #ccc; padding-left: 1em; font-style: italic; margin: 1em 0; }
    .dialogue { margin: 0.5em 0; }
    .message { margin: 1em 0; padding: 0.8em; background: #f9f9f9; border-left: 3px solid #666; }
    .system { background: #fff0f0; padding: 0.8em; margin: 1em 0; border: 1px solid #fcc; }
    .marker { text-align: center; color: #666; margin: 1.5em 0; }
    .status { font-family: monospace; color: #060; }
    .morse { font-family: monospace; margin: 1em 0; }
    .notes { background: #ffffd0; padding: 0.8em; margin: 1em 0; font-size: 0.9em; border: 1px solid #cc9; }
    .stage { color: #666; font-style: italic; }
    .meta { font-style: italic; color: #666; }
    .thread { background: #f0f0f0; padding: 0.8em; margin: 1em 0; }
    .special { background: #f5f5f5; padding: 0.8em; margin: 1em 0; }
    hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
  `;

  const options = {
    title: config.title,
    author: config.author,
    description: config.description,
    css: cssStyles
  };

  // Content chapters - epub-gen-memory expects this as second param
  const chapters = [{
    title: config.title,
    content: htmlContent
  }];

  const epubBuffer = await epub(options, chapters);
  fs.writeFileSync(outputPath, epubBuffer);
}

/**
 * Main extraction function
 */
async function extractStories() {
  const outputDir = path.join(__dirname, '..', 'exports');

  // Create exports directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Story Extractor - Generating TXT and EPUB versions\n');
  console.log('='.repeat(50));

  for (const [storyKey, config] of Object.entries(STORIES)) {
    console.log(`\nProcessing: ${config.title}`);

    const allSections = [];

    // Handle fileSets (multiple directories) or simple files array
    if (config.fileSets) {
      for (const fileSet of config.fileSets) {
        const basePath = path.join(__dirname, '..', fileSet.basePath);

        // Add section title if specified (e.g., for Afterlives)
        if (fileSet.sectionTitle) {
          allSections.push({ type: 'h1', content: fileSet.sectionTitle });
        }

        for (const file of fileSet.files) {
          const filePath = path.join(basePath, file);

          if (!fs.existsSync(filePath)) {
            console.log(`  Warning: File not found: ${filePath}`);
            continue;
          }

          const html = fs.readFileSync(filePath, 'utf8');
          const $ = cheerio.load(html);

          const sections = extractGenericContent($, file);
          allSections.push(...sections);

          console.log(`  Extracted: ${file} (${sections.length} sections)`);
        }
      }
    } else {
      // Simple files array (legacy format)
      const basePath = config.basePath
        ? path.join(__dirname, '..', 'hidden')
        : path.join(__dirname, '..', 'stories', storyKey);

      for (const file of config.files) {
        const filePath = path.join(basePath, file);

        if (!fs.existsSync(filePath)) {
          console.log(`  Warning: File not found: ${filePath}`);
          continue;
        }

        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html);

        const sections = extractGenericContent($, file);
        allSections.push(...sections);

        console.log(`  Extracted: ${file} (${sections.length} sections)`);
      }
    }

    if (allSections.length === 0) {
      console.log(`  Skipped: No content extracted`);
      continue;
    }

    // Generate TXT
    const txtContent = sectionsToText(allSections, config);
    const txtPath = path.join(outputDir, `${config.outputName}.txt`);
    fs.writeFileSync(txtPath, txtContent, 'utf8');
    console.log(`  Generated: ${config.outputName}.txt (${Math.round(txtContent.length/1024)}KB)`);

    // Generate EPUB
    try {
      const htmlContent = sectionsToHtml(allSections);
      const epubPath = path.join(outputDir, `${config.outputName}.epub`);
      await generateEpub(htmlContent, config, epubPath);
      console.log(`  Generated: ${config.outputName}.epub`);
    } catch (err) {
      console.log(`  Error generating EPUB: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\nExports saved to: ${outputDir}`);
}

// Run
extractStories().catch(console.error);
