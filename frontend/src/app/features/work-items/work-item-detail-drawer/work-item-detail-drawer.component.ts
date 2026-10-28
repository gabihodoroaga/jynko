import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkItemService } from '../../../core/services/work-item.service';
import { ProjectService } from '../../../core/services/project.service';
import {
  ALL_PRIORITIES,
  ALL_STATUSES,
  SubWorkItem,
  WorkItemPriority,
  WorkItemStatus,
} from '../../../core/models/project.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge.component';
import { DropdownComponent, DropdownOption } from '../../../shared/components/dropdown.component';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-work-item-detail-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    DropdownComponent,
    MarkdownPipe,
  ],
  template: `
    @if (workItemService.selectedItem(); as item) {
      <div class="fixed inset-0 z-40 flex justify-end bg-slate-900/20 backdrop-blur-[1px]" (click)="workItemService.closeItemDetail()">
        <aside
          class="w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col shadow-xl overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <!-- Drawer Top Bar -->
          <div class="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
            <div class="flex items-center gap-2.5">
              <span class="font-mono text-xs font-semibold text-slate-500 px-2 py-0.5 rounded bg-white border border-slate-200">
                {{ item.key }}
              </span>
              <app-status-badge [status]="item.status"></app-status-badge>
              <app-priority-badge [priority]="item.priority"></app-priority-badge>
            </div>

            <div class="flex items-center gap-2">
              @if (projectService.canEdit()) {
                <button
                  type="button"
                  (click)="workItemService.deleteItem(item.id)"
                  class="px-2 py-1 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-medium text-rose-700"
                >
                  Delete
                </button>
              }
              <button
                type="button"
                (click)="workItemService.closeItemDetail()"
                class="text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-200/60 text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Drawer Body -->
          <div class="flex-1 overflow-y-auto p-5 space-y-6">
            <!-- Title & Description -->
            <div class="space-y-3">
              <input
                type="text"
                [ngModel]="item.title"
                (ngModelChange)="workItemService.updateItem(item.id, { title: $event })"
                [disabled]="!projectService.canEdit()"
                class="w-full text-base font-semibold text-slate-900 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none pb-1"
              />

              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Description (Markdown)
                </span>
                <button
                  type="button"
                  (click)="previewDesc.set(!previewDesc())"
                  class="text-[11px] text-sky-600 hover:underline"
                >
                  {{ previewDesc() ? 'Edit Markdown' : 'Preview Rendered' }}
                </button>
              </div>

              @if (previewDesc()) {
                <div
                  class="p-3 rounded-md bg-slate-50 border border-slate-200 min-h-[84px]"
                  [innerHTML]="item.description | markdown"
                ></div>
              } @else {
                <textarea
                  rows="4"
                  [ngModel]="item.description"
                  (ngModelChange)="workItemService.updateItem(item.id, { description: $event })"
                  [disabled]="!projectService.canEdit()"
                  placeholder="Add a detailed Markdown description..."
                  class="w-full p-2.5 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-slate-300"
                ></textarea>
              }
            </div>

            <!-- Metadata Attributes Grid (Styled Dropdowns) -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-md bg-slate-50 border border-slate-200">
              <div>
                <label class="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Status</label>
                <app-dropdown
                  [options]="statusOptions"
                  [value]="item.status"
                  (valueChange)="onStatusChange(item.id, $event)"
                  [disabled]="!projectService.canEdit()"
                  [fullWidth]="true"
                  size="sm"
                ></app-dropdown>
              </div>

              <div>
                <label class="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Priority</label>
                <app-dropdown
                  [options]="priorityOptions"
                  [value]="item.priority"
                  (valueChange)="onPriorityChange(item.id, $event)"
                  [disabled]="!projectService.canEdit()"
                  [fullWidth]="true"
                  size="sm"
                ></app-dropdown>
              </div>

              <div>
                <label class="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Assignee</label>
                <app-dropdown
                  [options]="assigneeOptions()"
                  [value]="item.assignee_id || ''"
                  (valueChange)="workItemService.updateItem(item.id, { assignee_id: $event })"
                  [disabled]="!projectService.canEdit()"
                  [fullWidth]="true"
                  size="sm"
                ></app-dropdown>
              </div>

              <div>
                <label class="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Module</label>
                <app-dropdown
                  [options]="moduleOptions()"
                  [value]="item.module_id || ''"
                  (valueChange)="workItemService.updateItem(item.id, { module_id: $event })"
                  [disabled]="!projectService.canEdit()"
                  [fullWidth]="true"
                  size="sm"
                ></app-dropdown>
              </div>

              <div>
                <label class="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Epic</label>
                <app-dropdown
                  [options]="epicOptions()"
                  [value]="item.epic_id || ''"
                  (valueChange)="workItemService.updateItem(item.id, { epic_id: $event })"
                  [disabled]="!projectService.canEdit()"
                  [fullWidth]="true"
                  size="sm"
                ></app-dropdown>
              </div>

              <div>
                <label class="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Cycle</label>
                <app-dropdown
                  [options]="cycleOptions()"
                  [value]="item.cycle_id || ''"
                  (valueChange)="workItemService.updateItem(item.id, { cycle_id: $event })"
                  [disabled]="!projectService.canEdit()"
                  [fullWidth]="true"
                  size="sm"
                ></app-dropdown>
              </div>
            </div>

            <!-- Sub-Work Items Section -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-semibold text-slate-900">
                  Sub-Work Items ({{ item.completed_sub_count }}/{{ item.sub_item_count }})
                </h4>
              </div>

              <div class="divide-y divide-slate-200 border border-slate-200 rounded-md bg-white">
                @for (sub of currentSubItems(); track sub.id) {
                  <div class="flex items-center justify-between px-3 py-2 text-xs">
                    <label class="flex items-center gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        [checked]="sub.is_completed"
                        (change)="toggleSub(item.id, sub)"
                        [disabled]="!projectService.canEdit()"
                        class="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span [ngClass]="sub.is_completed ? 'line-through text-slate-400' : 'text-slate-800'">
                        {{ sub.title }}
                      </span>
                    </label>
                    @if (projectService.canEdit()) {
                      <button
                        type="button"
                        (click)="workItemService.deleteSubItem(item.id, sub.id)"
                        class="text-slate-400 hover:text-rose-600 text-[11px]"
                      >
                        Remove
                      </button>
                    }
                  </div>
                } @empty {
                  <div class="px-3 py-2.5 text-xs text-slate-400">No sub-items yet.</div>
                }
              </div>

              @if (projectService.canEdit()) {
                <div class="flex gap-2">
                  <input
                    type="text"
                    [(ngModel)]="newSubTitle"
                    (keyup.enter)="addSubItem(item.id)"
                    placeholder="Add granular sub-task..."
                    class="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:border-slate-300"
                  />
                  <button
                    type="button"
                    (click)="addSubItem(item.id)"
                    class="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    + Add Sub-item
                  </button>
                </div>
              }
            </div>

            <!-- Threaded Discussion Comments -->
            <div class="space-y-3">
              <h4 class="text-xs font-semibold text-slate-900">
                Discussion Comments ({{ currentComments().length }})
              </h4>

              <div class="space-y-2.5">
                @for (cmt of currentComments(); track cmt.id) {
                  <div class="p-3 rounded-md bg-slate-50 border border-slate-200">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs font-semibold text-slate-800">{{ cmt.author_name }}</span>
                      <span class="text-[10px] font-mono text-slate-400">
                        {{ cmt.created_at | date: 'MMM d, HH:mm' }}
                      </span>
                    </div>
                    <div class="text-xs text-slate-700" [innerHTML]="cmt.body | markdown"></div>
                  </div>
                } @empty {
                  <div class="text-xs text-slate-400">No comments yet. Start the technical discussion below.</div>
                }
              </div>

              @if (projectService.canEdit()) {
                <div class="space-y-2">
                  <textarea
                    rows="2"
                    [(ngModel)]="newCommentBody"
                    placeholder="Write a comment (Markdown supported)..."
                    class="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-300"
                  ></textarea>
                  <div class="flex justify-end">
                    <button
                      type="button"
                      (click)="postComment(item.id)"
                      class="px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </aside>
      </div>
    }
  `,
})
export class WorkItemDetailDrawerComponent {
  readonly workItemService = inject(WorkItemService);
  readonly projectService = inject(ProjectService);

  readonly statuses = ALL_STATUSES;
  readonly priorities = ALL_PRIORITIES;
  readonly previewDesc = signal<boolean>(false);

  readonly statusOptions: DropdownOption[] = ALL_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));
  readonly priorityOptions: DropdownOption[] = ALL_PRIORITIES.map((p) => ({
    value: p.value,
    label: p.label,
  }));
  readonly assigneeOptions = computed<DropdownOption[]>(() => [
    { value: '', label: 'Unassigned' },
    ...this.projectService.members().map((m) => ({ value: m.user_id, label: m.name })),
  ]);
  readonly moduleOptions = computed<DropdownOption[]>(() => [
    { value: '', label: 'None' },
    ...this.projectService.modules().map((m) => ({ value: m.id, label: m.name })),
  ]);
  readonly epicOptions = computed<DropdownOption[]>(() => [
    { value: '', label: 'None' },
    ...this.projectService.epics().map((e) => ({ value: e.id, label: e.name })),
  ]);
  readonly cycleOptions = computed<DropdownOption[]>(() => [
    { value: '', label: 'None' },
    ...this.projectService.cycles().map((c) => ({ value: c.id, label: c.name })),
  ]);

  newSubTitle = '';
  newCommentBody = '';

  readonly currentSubItems = computed<SubWorkItem[]>(() => {
    const id = this.workItemService.selectedItemId();
    if (!id) return [];
    return this.workItemService.subItemsByItem()[id] ?? [];
  });

  readonly currentComments = computed(() => {
    const id = this.workItemService.selectedItemId();
    if (!id) return [];
    return this.workItemService.commentsByItem()[id] ?? [];
  });

  onStatusChange(itemId: string, status: string): void {
    this.workItemService.updateItem(itemId, { status: status as WorkItemStatus });
  }

  onPriorityChange(itemId: string, priority: string): void {
    this.workItemService.updateItem(itemId, { priority: priority as WorkItemPriority });
  }

  addSubItem(itemId: string): void {
    const t = this.newSubTitle.trim();
    if (!t) return;
    this.workItemService.addSubItem(itemId, t);
    this.newSubTitle = '';
  }

  toggleSub(itemId: string, sub: SubWorkItem): void {
    this.workItemService.toggleSubItem(itemId, sub);
  }

  postComment(itemId: string): void {
    const b = this.newCommentBody.trim();
    if (!b) return;
    this.workItemService.addComment(itemId, b);
    this.newCommentBody = '';
  }
}
