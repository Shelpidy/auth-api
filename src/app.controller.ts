import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { marked } from 'marked';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('get-started')
  getDocs(@Res() res: Response) {
    try {
      const markdownPath = path.join(process.cwd(), 'README.md');
      const markdown = readFileSync(markdownPath, 'utf-8');
      const content = marked(markdown);
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>API Documentation</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
          <style>
            :root {
              --primary-color: #2563eb;
              --secondary-color: #1e40af;
              --background-color: #ffffff;
              --text-color: #1f2937;
              --code-background: #f6f8fa;
            }

            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
              color: var(--text-color);
              line-height: 1.6;
              padding: 2rem;
              max-width: 900px;
              margin: 0 auto;
            }

            .markdown-body {
              box-sizing: border-box;
              min-width: 200px;
              max-width: 980px;
              margin: 0 auto;
            }

            pre {
              background: var(--code-background) !important;
              border-radius: 6px;
              padding: 1rem;
              overflow-x: auto;
            }

            code {
              font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
              font-size: 0.875em;
            }

            .method {
              display: inline-block;
              padding: 0.25rem 0.5rem;
              border-radius: 0.375rem;
              font-weight: 600;
              font-size: 0.875rem;
              margin-right: 0.5rem;
            }

            .get { background: #dbeafe; color: #1e40af; }
            .post { background: #dcfce7; color: #166534; }
            .put { background: #fef3c7; color: #92400e; }
            .delete { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <main class="markdown-body">
            ${content}
          </main>
          <script>
            // Add method colors
            document.querySelectorAll('code').forEach(code => {
              if (code.textContent?.match(/^(GET|POST|PUT|DELETE)/)) {
                const method = code.textContent.split(' ')[0].toLowerCase();
                code.classList.add('method', method);
              }
            });
          </script>
        </body>
        </html>
      `;

      res.send(html);
    } catch (error) {
      console.error('Documentation error:', error);
      res.status(500).send('Error loading documentation');
    }
  }
}
