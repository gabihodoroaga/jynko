import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageService } from '../../../core/services/page.service';
import { ProjectService } from '../../../core/services/project.service';
import { PageTreeNode } from '../../../core/models/page.model';

@Component({
  selector: 'app-page-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-64 border-r border-slate-200 bg-slate-50 h-full flex flex-col">
      <div class="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200">
        <span class="text-xs font-semibold text-slate-700">Pages Hierarchy</span>
        @if (projectService.canEdit()) {
          <button
            type="button"
            (click)="createRootPage()"
            class="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-medium"
          >
            + New Page
          </button>
        }
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        @for (node of pageService.pageTree(); track node.page.id) {
          <div class="space-y-0.5">
            <!-- Root Node -->
            <div
              (click)="pageService.selectPage(node.page.id)"
              class="group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors"
              [ngClass]="
                pageService.activePageId() === node.page.id
                  ? 'bg-white text-sky-700 font-medium border border-slate-200 shadow-card'
                  : 'text-slate-700 hover:bg-slate-100'
              "
            >
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-slate-400 text-[11px]">📄</span>
                <span class="truncate">{{ node.page.title }}</span>
                @if (node.page.is_locked) {
                  <span class="text-[10px] text-amber-600" title="Page is locked">🔒</span>
                }
              </div>

              @if (projectService.canEdit()) {
                <button
                  type="button"
                  (click)="createChildPage($event, node)"
                  class="opacity-0 group-hover:opacity-100 text-[11px] text-slate-400 hover:text-sky-600 px-1"
                  title="Add nested child page"
                >
                  +
                </button>
              }
            </div>

            <!-- Nested Child Nodes -->
            @if (node.children.length > 0) {
              <div class="pl-4 border-l border-slate-200 ml-3 space-y-0.5">
                @for (child of node.children; track child.page.id) {
                  <div
                    (click)="pageService.selectPage(child.page.id)"
                    class="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors"
                    [ngClass]="
                      pageService.activePageId() === child.page.id
                        ? 'bg-white text-sky-700 font-medium border border-slate-200 shadow-card'
                        : 'text-slate-600 hover:bg-slate-100'
                    "
                  >
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="text-slate-400 text-[10px]">↳</span>
                      <span class="truncate">{{ child.page.title }}</span>
                      @if (child.page.is_locked) {
                        <span class="text-[10px] text-amber-600">🔒</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        } @empty {
          <div class="px-3 py-4 text-xs text-slate-400 text-center">
            No pages in this collection yet.
          </div>
        }
      </div>
    </div>
  `,
})
export class PageTreeComponent {
  readonly pageService = inject(PageService);
  readonly projectService = inject(ProjectService);

  createRootPage(): void {
    this.pageService.createPage('Untitled Page');
  }

  createChildPage(event: MouseEvent, parent: PageTreeNode): void {
    event.stopPropagation();
    this.pageService.createPage('Nested Sub-Page', parent.page.id, parent.page.collection_id);
  }
}
