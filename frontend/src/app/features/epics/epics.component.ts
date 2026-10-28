import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { WorkItemService } from '../../core/services/work-item.service';
import { EpicStatus } from '../../core/models/project.model';
import { ModalComponent } from '../../shared/components/modal.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown.component';

@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, DropdownComponent],
  template: `
    <div class="w-full p-6 space-y-5 bg-slate-50 min-h-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Epics & Strategic Milestones</h2>
          <p class="text-xs text-slate-500">
            Time-bound strategic objectives grouping related work items
          </p>
        </div>
        @if (projectService.canEdit()) {
          <button
            type="button"
            (click)="isCreateOpen.set(true)"
            class="bg-sky-600 hover:bg-sky-700 text-white rounded-md px-3 py-1.5 text-xs font-medium"
          >
            + New Epic
          </button>
        }
      </div>

      <div class="space-y-3">
        @for (row of epicRows(); track row.epic.id) {
          <div class="bg-white border border-slate-200 rounded-md p-4 shadow-card space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <h3 class="text-sm font-semibold text-slate-900">{{ row.epic.name }}</h3>
                <span
                  class="px-2 py-0.5 rounded-md border text-[11px] font-medium"
                  [ngClass]="
                    row.epic.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : row.epic.status === 'IN_PROGRESS'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                  "
                >
                  {{ row.epic.status }}
                </span>
              </div>

              <div class="flex items-center gap-3">
                @if (row.epic.target_date) {
                  <span class="text-[11px] font-mono text-slate-500">
                    Target: {{ row.epic.target_date | date: 'MMM d, yyyy' }}
                  </span>
                }
                <button
                  type="button"
                  (click)="viewEpicTimeline(row.epic.id)"
                  class="text-xs font-medium text-sky-600 hover:underline"
                >
                  Open in Timeline →
                </button>
                @if (projectService.canEdit()) {
                  <button
                    type="button"
                    (click)="projectService.deleteEpic(row.epic.id)"
                    class="text-[11px] text-slate-400 hover:text-rose-600"
                  >
                    Delete
                  </button>
                }
              </div>
            </div>

            <p class="text-xs text-slate-600">{{ row.epic.description }}</p>

            <div class="space-y-1.5 pt-2 border-t border-slate-200">
              <div class="flex items-center justify-between text-[11px] text-slate-600">
                <span>Linked Work Items: {{ row.doneCount }}/{{ row.totalCount }} Done</span>
                <span class="font-mono font-medium">{{ row.percent }}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-emerald-600 transition-all"
                  [style.width.%]="row.percent"
                ></div>
              </div>
            </div>
          </div>
        }
      </div>

      <app-modal
        [isOpen]="isCreateOpen()"
        title="Create Strategic Epic"
        (closed)="isCreateOpen.set(false)"
      >
        <form (ngSubmit)="submitCreate()" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Epic Name</label>
            <input
              type="text"
              name="name"
              [(ngModel)]="newName"
              required
              placeholder="e.g., Enterprise SSO & Audit Logging"
              class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows="2"
              name="description"
              [(ngModel)]="newDesc"
              class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md"
            ></textarea>
          </div>
          <div class="grid grid-cols-3 gap-2.5">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <app-dropdown
                [options]="epicStatusOptions"
                [value]="newStatus"
                (valueChange)="onEpicStatusChange($event)"
                [fullWidth]="true"
              ></app-dropdown>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                [(ngModel)]="newStart"
                class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Target Date</label>
              <input
                type="date"
                name="targetDate"
                [(ngModel)]="newTarget"
                class="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md"
              />
            </div>
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
              Create Epic
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
})
export class EpicsComponent {
  readonly projectService = inject(ProjectService);
  readonly workItemService = inject(WorkItemService);
  private readonly router = inject(Router);

  readonly isCreateOpen = signal(false);
  newName = '';
  newDesc = '';
  newStatus: EpicStatus = 'PLANNED';
  newStart = '2026-10-28';
  newTarget = '2026-12-01';

  readonly epicStatusOptions: DropdownOption[] = [
    { value: 'PLANNED', label: 'PLANNED' },
    { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
    { value: 'COMPLETED', label: 'COMPLETED' },
  ];

  onEpicStatusChange(val: string): void {
    this.newStatus = val as EpicStatus;
  }

  readonly epicRows = computed(() => {
    const items = this.workItemService.items();
    return this.projectService.epics().map((epic) => {
      const linked = items.filter((i) => i.epic_id === epic.id);
      const done = linked.filter((i) => i.status === 'DONE').length;
      const percent = linked.length > 0 ? Math.round((done / linked.length) * 100) : 0;
      return {
        epic,
        totalCount: linked.length,
        doneCount: done,
        percent,
      };
    });
  });

  viewEpicTimeline(epicId: string): void {
    this.workItemService.updateFilter({ epic_id: epicId });
    this.workItemService.activeView.set('TIMELINE');
    this.router.navigate(['/projects', this.projectService.activeProjectId(), 'work-items']);
  }

  submitCreate(): void {
    if (!this.newName.trim()) return;
    this.projectService.createEpic(
      this.newName.trim(),
      this.newDesc.trim(),
      this.newStatus,
      this.newStart,
      this.newTarget
    );
    this.newName = '';
    this.newDesc = '';
    this.isCreateOpen.set(false);
  }
}
