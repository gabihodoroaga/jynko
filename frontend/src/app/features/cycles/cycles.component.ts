import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { WorkItemService } from '../../core/services/work-item.service';
import { ModalComponent } from '../../shared/components/modal.component';

@Component({
  selector: 'app-cycles',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="w-full p-6 space-y-5 bg-slate-50 min-h-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Sprint Cycles</h2>
          <p class="text-xs text-slate-500">
            Time-boxed iterations for scheduled execution in {{ projectService.activeProject()?.name }}
          </p>
        </div>
        @if (projectService.canEdit()) {
          <button
            type="button"
            (click)="isCreateOpen.set(true)"
            class="bg-sky-600 hover:bg-sky-700 text-white rounded-md px-3 py-1.5 text-xs font-medium"
          >
            + New Cycle
          </button>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (row of cycleRows(); track row.cycle.id) {
          <div class="bg-white border border-slate-200 rounded-md p-4 shadow-card flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-semibold text-slate-900">{{ row.cycle.name }}</h3>
                  @if (row.cycle.is_active) {
                    <span class="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-medium">
                      Active Cycle
                    </span>
                  } @else {
                    <span class="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-medium">
                      Completed / Planned
                    </span>
                  }
                </div>

                @if (projectService.canEdit()) {
                  <button
                    type="button"
                    (click)="projectService.deleteCycle(row.cycle.id)"
                    class="text-[11px] text-slate-400 hover:text-rose-600"
                  >
                    Delete
                  </button>
                }
              </div>

              <p class="text-xs text-slate-600">{{ row.cycle.description }}</p>

              <div class="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                <span>{{ row.cycle.start_date | date: 'MMM d, yyyy' }}</span>
                <span>→</span>
                <span>{{ row.cycle.end_date | date: 'MMM d, yyyy' }}</span>
              </div>
            </div>

            <!-- Progress & Actions -->
            <div class="space-y-2 pt-3 border-t border-slate-200">
              <div class="flex items-center justify-between text-[11px] text-slate-600">
                <span>Progress: {{ row.doneCount }}/{{ row.totalCount }} items completed</span>
                <span class="font-mono font-medium">{{ row.percent }}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-sky-600 transition-all"
                  [style.width.%]="row.percent"
                ></div>
              </div>
              <div class="flex justify-end pt-1">
                <button
                  type="button"
                  (click)="viewCycleItems(row.cycle.id)"
                  class="text-xs font-medium text-sky-600 hover:underline"
                >
                  View cycle items in Board →
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <app-modal
        [isOpen]="isCreateOpen()"
        title="Create Sprint Cycle"
        (closed)="isCreateOpen.set(false)"
      >
        <form (ngSubmit)="submitCreate()" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Cycle Name</label>
            <input
              type="text"
              name="name"
              [(ngModel)]="newName"
              required
              placeholder="e.g., Cycle 5 — Performance & Security"
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
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                [(ngModel)]="newStart"
                class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                [(ngModel)]="newEnd"
                class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
              />
            </div>
          </div>
          <label class="flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" name="isActive" [(ngModel)]="newIsActive" />
            Mark as Active Sprint Cycle
          </label>
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
              Create Cycle
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
})
export class CyclesComponent {
  readonly projectService = inject(ProjectService);
  readonly workItemService = inject(WorkItemService);
  private readonly router = inject(Router);

  readonly isCreateOpen = signal(false);
  newName = '';
  newDesc = '';
  newStart = '2026-11-04';
  newEnd = '2026-11-18';
  newIsActive = true;

  readonly cycleRows = computed(() => {
    const items = this.workItemService.items();
    return this.projectService.cycles().map((cycle) => {
      const linked = items.filter((i) => i.cycle_id === cycle.id);
      const done = linked.filter((i) => i.status === 'DONE').length;
      const percent = linked.length > 0 ? Math.round((done / linked.length) * 100) : 0;
      return {
        cycle,
        totalCount: linked.length,
        doneCount: done,
        percent,
      };
    });
  });

  viewCycleItems(cycleId: string): void {
    this.workItemService.updateFilter({ cycle_id: cycleId });
    this.workItemService.activeView.set('BOARD');
    this.router.navigate(['/projects', this.projectService.activeProjectId(), 'work-items']);
  }

  submitCreate(): void {
    if (!this.newName.trim()) return;
    this.projectService.createCycle(
      this.newName.trim(),
      this.newDesc.trim(),
      this.newStart,
      this.newEnd,
      this.newIsActive
    );
    this.newName = '';
    this.newDesc = '';
    this.isCreateOpen.set(false);
  }
}
