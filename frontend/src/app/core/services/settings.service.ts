import { Injectable, computed, inject, signal } from '@angular/core';
import { ProjectService } from './project.service';
import { ALL_STATUSES, WorkItemStatus } from '../models/project.model';

export const DEFAULT_VISIBLE_BOARD_COLUMNS: WorkItemStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
];

export interface GeneralAppSettings {
  instanceName: string;
  defaultLandingRoute: string;
  defaultWorkItemView: string;
  compactTableRows: boolean;
  showSubItemProgressOnCards: boolean;
  enableKeyboardShortcuts: boolean;
  dailyMorningDigest: boolean;
  notifyOnAssignment: boolean;
  notifyOnWikiUnlock: boolean;
}

export interface ProjectSpecificSettings {
  projectId: string;
  defaultNewItemStatus: string;
  defaultNewItemPriority: string;
  estimationScale: string;
  cycleDurationWeeks: string;
  visibleBoardColumns: WorkItemStatus[];
  autoAssignToLead: boolean;
  autoRolloverUnfinishedCycleItems: boolean;
  requireEstimateBeforeInProgress: boolean;
  autoLockPublishedRunbooks: boolean;
  createVersionOnEverySave: boolean;
}

const DEFAULT_PROJECT_SETTINGS = (projectId: string): ProjectSpecificSettings => ({
  projectId,
  defaultNewItemStatus: 'TODO',
  defaultNewItemPriority: 'MEDIUM',
  estimationScale: 'FIBONACCI',
  cycleDurationWeeks: '2',
  visibleBoardColumns: [...DEFAULT_VISIBLE_BOARD_COLUMNS],
  autoAssignToLead: false,
  autoRolloverUnfinishedCycleItems: true,
  requireEstimateBeforeInProgress: false,
  autoLockPublishedRunbooks: false,
  createVersionOnEverySave: true,
});

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly projectService = inject(ProjectService);

  readonly activeScope = signal<'GENERAL' | 'PROJECT'>('GENERAL');
  readonly lastSavedMessage = signal<string>('');

  readonly generalSettings = signal<GeneralAppSettings>({
    instanceName: 'Jynko Engineering',
    defaultLandingRoute: '/home',
    defaultWorkItemView: 'LIST',
    compactTableRows: true,
    showSubItemProgressOnCards: true,
    enableKeyboardShortcuts: true,
    dailyMorningDigest: true,
    notifyOnAssignment: true,
    notifyOnWikiUnlock: false,
  });

  readonly projectSettingsByProject = signal<Record<string, ProjectSpecificSettings>>({
    'proj-jynko-core': {
      projectId: 'proj-jynko-core',
      defaultNewItemStatus: 'TODO',
      defaultNewItemPriority: 'MEDIUM',
      estimationScale: 'FIBONACCI',
      cycleDurationWeeks: '2',
      visibleBoardColumns: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      autoAssignToLead: true,
      autoRolloverUnfinishedCycleItems: true,
      requireEstimateBeforeInProgress: false,
      autoLockPublishedRunbooks: true,
      createVersionOnEverySave: true,
    },
    'proj-cloud-infra': {
      projectId: 'proj-cloud-infra',
      defaultNewItemStatus: 'BACKLOG',
      defaultNewItemPriority: 'HIGH',
      estimationScale: 'LINEAR',
      cycleDurationWeeks: '1',
      visibleBoardColumns: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      autoAssignToLead: false,
      autoRolloverUnfinishedCycleItems: true,
      requireEstimateBeforeInProgress: true,
      autoLockPublishedRunbooks: true,
      createVersionOnEverySave: true,
    },
  });

  readonly activeProjectSettings = computed<ProjectSpecificSettings>(() => {
    const projectId = this.projectService.activeProjectId();
    const map = this.projectSettingsByProject();
    return map[projectId] ?? DEFAULT_PROJECT_SETTINGS(projectId);
  });

  readonly visibleBoardStatuses = computed<WorkItemStatus[]>(() => {
    return this.activeProjectSettings().visibleBoardColumns;
  });

  isBoardColumnVisible(status: WorkItemStatus): boolean {
    return this.visibleBoardStatuses().includes(status);
  }

  toggleBoardColumn(status: WorkItemStatus): void {
    const current = this.visibleBoardStatuses();
    let next: WorkItemStatus[];
    if (current.includes(status)) {
      if (current.length <= 1) {
        return; // Keep at least 1 column visible on the board
      }
      next = current.filter((s) => s !== status);
    } else {
      const targetSet = new Set([...current, status]);
      next = ALL_STATUSES.map((s) => s.value).filter((s) => targetSet.has(s));
    }
    this.updateActiveProjectSetting('visibleBoardColumns', next);
  }

  showAllBoardColumns(): void {
    this.updateActiveProjectSetting(
      'visibleBoardColumns',
      ALL_STATUSES.map((s) => s.value)
    );
  }

  resetBoardColumnsToDefault(): void {
    this.updateActiveProjectSetting('visibleBoardColumns', [...DEFAULT_VISIBLE_BOARD_COLUMNS]);
  }

  openGeneralSettings(): void {
    this.activeScope.set('GENERAL');
  }

  openProjectSettings(projectId?: string): void {
    if (projectId && projectId !== this.projectService.activeProjectId()) {
      this.projectService.selectProject(projectId);
    }
    this.activeScope.set('PROJECT');
  }

  updateGeneral<K extends keyof GeneralAppSettings>(key: K, value: GeneralAppSettings[K]): void {
    this.generalSettings.update((prev) => ({ ...prev, [key]: value }));
    this.flashSaved('General app settings updated (mock)');
  }

  updateActiveProjectSetting<K extends keyof ProjectSpecificSettings>(
    key: K,
    value: ProjectSpecificSettings[K]
  ): void {
    const projectId = this.projectService.activeProjectId();
    const current = this.activeProjectSettings();
    this.projectSettingsByProject.update((map) => ({
      ...map,
      [projectId]: {
        ...current,
        [key]: value,
      },
    }));
    const projName = this.projectService.activeProject()?.name ?? projectId;
    this.flashSaved(`Project settings updated for "${projName}" (mock)`);
  }

  flashSaved(msg: string): void {
    this.lastSavedMessage.set(msg);
    setTimeout(() => {
      if (this.lastSavedMessage() === msg) {
        this.lastSavedMessage.set('');
      }
    }, 2500);
  }
}
