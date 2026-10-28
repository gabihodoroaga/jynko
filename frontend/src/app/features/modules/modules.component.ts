import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { WorkItemService } from '../../core/services/work-item.service';
import { ModalComponent } from '../../shared/components/modal.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown.component';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, DropdownComponent],
  template: `
    <div class="w-full p-6 space-y-5 bg-slate-50 min-h-full">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Feature Modules</h2>
          <p class="text-xs text-slate-500">
            Persistent functional domains across the software lifecycle
          </p>
        </div>
        @if (projectService.canEdit()) {
          <button
            type="button"
            (click)="isCreateOpen.set(true)"
            class="bg-sky-600 hover:bg-sky-700 text-white rounded-md px-3 py-1.5 text-xs font-medium"
          >
            + New Module
          </button>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (row of moduleRows(); track row.module.id) {
          <div class="bg-white border border-slate-200 rounded-md p-4 shadow-card flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-900">{{ row.module.name }}</h3>
                @if (projectService.canEdit()) {
                  <button
                    type="button"
                    (click)="projectService.deleteModule(row.module.id)"
                    class="text-[11px] text-slate-400 hover:text-rose-600"
                  >
                    Delete
                  </button>
                }
              </div>
              <p class="text-xs text-slate-600">{{ row.module.description }}</p>
              <div class="text-[11px] text-slate-500">
                Lead: <span class="font-medium text-slate-700">{{ row.leadName }}</span>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span class="text-[11px] font-mono text-slate-500">
                {{ row.itemCount }} work items
              </span>
              <button
                type="button"
                (click)="filterByModule(row.module.id)"
                class="text-xs font-medium text-sky-600 hover:underline"
              >
                View items →
              </button>
            </div>
          </div>
        }
      </div>

      <app-modal
        [isOpen]="isCreateOpen()"
        title="Create Feature Module"
        (closed)="isCreateOpen.set(false)"
      >
        <form (ngSubmit)="submitCreate()" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Module Name</label>
            <input
              type="text"
              name="name"
              [(ngModel)]="newName"
              required
              placeholder="e.g., Firestore Sync & Webhooks"
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
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Module Lead</label>
            <app-dropdown
              [options]="memberOptions()"
              [value]="newLeadId"
              (valueChange)="newLeadId = $event"
              [fullWidth]="true"
            ></app-dropdown>
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
              Create Module
            </button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
})
export class ModulesComponent {
  readonly projectService = inject(ProjectService);
  readonly workItemService = inject(WorkItemService);
  private readonly router = inject(Router);

  readonly isCreateOpen = signal(false);
  newName = '';
  newDesc = '';
  newLeadId = 'dev-user-1';

  readonly memberOptions = computed<DropdownOption[]>(() =>
    this.projectService.members().map((m) => ({
      value: m.user_id,
      label: `${m.name} (${m.email})`,
    }))
  );

  readonly moduleRows = computed(() => {
    const items = this.workItemService.items();
    const members = this.projectService.members();
    return this.projectService.modules().map((module) => {
      const lead = members.find((m) => m.user_id === module.lead_user_id);
      const count = items.filter((i) => i.module_id === module.id).length;
      return {
        module,
        leadName: lead ? lead.name : module.lead_user_id || 'Unassigned',
        itemCount: count,
      };
    });
  });

  filterByModule(moduleId: string): void {
    this.workItemService.updateFilter({ module_id: moduleId });
    this.router.navigate(['/projects', this.projectService.activeProjectId(), 'work-items']);
  }

  submitCreate(): void {
    if (!this.newName.trim()) return;
    this.projectService.createModule(
      this.newName.trim(),
      this.newDesc.trim(),
      this.newLeadId
    );
    this.newName = '';
    this.newDesc = '';
    this.isCreateOpen.set(false);
  }
}
