import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageService } from '../../../core/services/page.service';
import { ProjectService } from '../../../core/services/project.service';
import { ModalComponent } from '../../../shared/components/modal.component';

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white border-b border-slate-200">
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
          Collections:
        </span>
        <button
          type="button"
          (click)="pageService.activeCollectionId.set('')"
          class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
          [ngClass]="
            pageService.activeCollectionId() === ''
              ? 'bg-sky-50 text-sky-700 border border-sky-200'
              : 'text-slate-600 hover:bg-slate-100 border border-transparent'
          "
        >
          All Pages
        </button>

        @for (col of pageService.collections(); track col.id) {
          <button
            type="button"
            (click)="pageService.activeCollectionId.set(col.id)"
            class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
            [ngClass]="
              pageService.activeCollectionId() === col.id
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'text-slate-600 hover:bg-slate-100 border border-transparent'
            "
          >
            {{ col.name }}
          </button>
        }
      </div>

      @if (projectService.canEdit()) {
        <button
          type="button"
          (click)="isCreateOpen.set(true)"
          class="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
        >
          + Collection
        </button>
      }

      <app-modal
        [isOpen]="isCreateOpen()"
        title="New Page Collection"
        (closed)="isCreateOpen.set(false)"
      >
        <form (ngSubmit)="submitCreate()" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Collection Name</label>
            <input
              type="text"
              name="colName"
              [(ngModel)]="newName"
              required
              placeholder="e.g., Security & Compliance"
              class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows="2"
              name="colDesc"
              [(ngModel)]="newDesc"
              class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md"
            ></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              (click)="isCreateOpen.set(false)"
              class="px-3 py-1.5 rounded-md border border-slate-200 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-3 py-1.5 rounded-md bg-sky-600 text-white text-xs font-medium"
            >
              Create Collection
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
})
export class CollectionListComponent {
  readonly pageService = inject(PageService);
  readonly projectService = inject(ProjectService);

  readonly isCreateOpen = signal(false);
  newName = '';
  newDesc = '';

  submitCreate(): void {
    if (!this.newName.trim()) return;
    this.pageService.createCollection(this.newName.trim(), this.newDesc.trim());
    this.newName = '';
    this.newDesc = '';
    this.isCreateOpen.set(false);
  }
}
