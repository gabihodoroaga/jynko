import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = escaped.split('\n');
    const out: string[] = [];
    let inCode = false;

    for (const rawLine of lines) {
      const line = rawLine;
      if (line.trim().startsWith('```')) {
        if (!inCode) {
          inCode = true;
          out.push(
            '<pre class="my-2 p-3 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto"><code>'
          );
        } else {
          inCode = false;
          out.push('</code></pre>');
        }
        continue;
      }

      if (inCode) {
        out.push(line + '\n');
        continue;
      }

      if (line.startsWith('### ')) {
        out.push(
          `<h3 class="text-sm font-semibold text-slate-900 mt-4 mb-1">${this.inlineFormat(line.slice(4))}</h3>`
        );
      } else if (line.startsWith('## ')) {
        out.push(
          `<h2 class="text-base font-semibold text-slate-900 mt-5 mb-1.5 pb-1 border-b border-slate-200">${this.inlineFormat(line.slice(3))}</h2>`
        );
      } else if (line.startsWith('# ')) {
        out.push(
          `<h1 class="text-lg font-bold text-slate-900 mt-2 mb-2">${this.inlineFormat(line.slice(2))}</h1>`
        );
      } else if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
        out.push(
          `<div class="flex items-center gap-2 my-1 text-xs text-slate-500 line-through"><span class="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px]">✓</span><span>${this.inlineFormat(line.slice(6))}</span></div>`
        );
      } else if (line.startsWith('- [ ] ')) {
        out.push(
          `<div class="flex items-center gap-2 my-1 text-xs text-slate-700"><span class="inline-block w-3.5 h-3.5 rounded border border-slate-300 bg-white"></span><span>${this.inlineFormat(line.slice(6))}</span></div>`
        );
      } else if (line.startsWith('- ')) {
        out.push(
          `<div class="flex items-start gap-2 my-1 text-xs text-slate-700"><span class="text-slate-400 mt-0.5">•</span><span>${this.inlineFormat(line.slice(2))}</span></div>`
        );
      } else if (line.startsWith('&gt; ')) {
        out.push(
          `<blockquote class="my-2 pl-3 border-l-2 border-sky-600 text-xs italic text-slate-600 bg-slate-50 py-1 pr-2 rounded-r">${this.inlineFormat(line.slice(5))}</blockquote>`
        );
      } else if (line.trim() === '---') {
        out.push('<hr class="my-3 border-slate-200" />');
      } else if (line.trim() === '') {
        out.push('<div class="h-2"></div>');
      } else {
        out.push(
          `<p class="text-xs leading-relaxed text-slate-700 my-1">${this.inlineFormat(line)}</p>`
        );
      }
    }

    if (inCode) {
      out.push('</code></pre>');
    }

    return out.join('');
  }

  private inlineFormat(text: string): string {
    return text
      .replace(
        /`([^`]+)`/g,
        '<code class="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800">$1</code>'
      )
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  }
}
