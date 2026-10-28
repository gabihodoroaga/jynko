import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkItemStatus } from '../../core/models/project.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium leading-4"
      [ngClass]="badgeClasses"
    >
      <span class="w-2 h-2 rounded-full" [ngClass]="dotClasses"></span>
      <span>{{ label }}</span>
    </span>
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status: WorkItemStatus = 'TODO';

  get label(): string {
    switch (this.status) {
      case 'BACKLOG':
        return 'Backlog';
      case 'TODO':
        return 'Todo';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'IN_REVIEW':
        return 'In Review';
      case 'DONE':
        return 'Done';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return this.status;
    }
  }

  get badgeClasses(): string {
    switch (this.status) {
      case 'BACKLOG':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'TODO':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IN_REVIEW':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'DONE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  get dotClasses(): string {
    switch (this.status) {
      case 'BACKLOG':
        return 'border border-dashed border-slate-500 bg-transparent';
      case 'TODO':
        return 'border border-slate-600 bg-transparent';
      case 'IN_PROGRESS':
        return 'bg-amber-500';
      case 'IN_REVIEW':
        return 'bg-sky-500';
      case 'DONE':
        return 'bg-emerald-600';
      case 'CANCELLED':
        return 'bg-rose-600';
      default:
        return 'bg-slate-400';
    }
  }
}
