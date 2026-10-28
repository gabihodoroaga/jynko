import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEditorComponent } from '../page-editor/page-editor.component';
import { VersionHistoryComponent } from '../version-history/version-history.component';

@Component({
  selector: 'app-page-detail',
  standalone: true,
  imports: [
    CommonModule,
    PageEditorComponent,
    VersionHistoryComponent,
  ],
  template: `
    <div class="flex h-full overflow-hidden bg-white">
      <div class="flex-1 overflow-hidden">
        <app-page-editor (toggleHistory)="isHistoryOpen.set(!isHistoryOpen())"></app-page-editor>
      </div>

      <app-version-history
        [isOpen]="isHistoryOpen()"
        (closed)="isHistoryOpen.set(false)"
      ></app-version-history>
    </div>
  `,
})
export class PageDetailComponent {
  readonly isHistoryOpen = signal<boolean>(false);
}
