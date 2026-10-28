import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkItemService } from '../../core/services/work-item.service';
import { ProjectService } from '../../core/services/project.service';
import { WorkItemViewMode } from '../../core/models/project.model';

interface SavedViewPreset {
  id: string;
  name: string;
  description: string;
  viewMode: WorkItemViewMode;
  statusFilter?: string;
  priorityFilter?: string;
}

@Component({
  selector: 'app-views',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full p-6 space-y-5 bg-slate-50 min-h-full">
      <div>
        <h2 class="text-base font-semibold text-slate-900">Saved Project Views</h2>
        <p class="text-xs text-slate-500">
          Pre-configured layouts across List, Board, Calendar, Timeline, and Spreadsheet modes
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (preset of presets; track preset.id) {
          <div
            (click)="openPreset(preset)"
            class="bg-white border border-slate-200 hover:border-slate-300 rounded-md p-4 shadow-card cursor-pointer transition-colors flex flex-col justify-between space-y-3"
          >
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-slate-900">{{ preset.name }}</h3>
                <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-600">
                  {{ preset.viewMode }}
                </span>
              </div>
              <p class="text-xs text-slate-600">{{ preset.description }}</p>
            </div>
            <div class="text-xs font-medium text-sky-600 pt-2 border-t border-slate-100">
              Open View →
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ViewsComponent {
  private readonly workItemService = inject(WorkItemService);
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  readonly presets: SavedViewPreset[] = [
    {
      id: 'v-all-board',
      name: 'All Work Items — Kanban Board',
      description: 'Full drag-and-drop Kanban board across all statuses.',
      viewMode: 'BOARD',
    },
    {
      id: 'v-urgent-list',
      name: 'High & Urgent Priority List',
      description: 'High-density list filtered to urgent engineering priorities.',
      viewMode: 'LIST',
      priorityFilter: 'HIGH',
    },
    {
      id: 'v-gantt',
      name: 'Engineering Roadmap Timeline',
      description: 'Gantt duration bars plotted from start_date to due_date.',
      viewMode: 'TIMELINE',
    },
    {
      id: 'v-calendar',
      name: 'Release Schedule Calendar',
      description: 'Monthly schedule grid of upcoming work item due dates.',
      viewMode: 'CALENDAR',
    },
    {
      id: 'v-spreadsheet',
      name: 'Bulk Edit Spreadsheet Grid',
      description: 'Inline-editable table for rapid sprint grooming and estimation.',
      viewMode: 'SPREADSHEET',
    },
  ];

  openPreset(preset: SavedViewPreset): void {
    this.workItemService.resetFilters();
    if (preset.statusFilter || preset.priorityFilter) {
      this.workItemService.updateFilter({
        status: preset.statusFilter ?? '',
        priority: preset.priorityFilter ?? '',
      });
    }
    this.workItemService.activeView.set(preset.viewMode);
    this.router.navigate(['/projects', this.projectService.activeProjectId(), 'work-items']);
  }
}
