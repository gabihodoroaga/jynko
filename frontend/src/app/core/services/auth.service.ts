import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { UserContext } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);

  readonly devUserOverride = signal<UserContext>({
    user_id: 'dev-user-1',
    email: 'dev@jynko.local',
    name: 'Local Developer',
  });

  readonly currentUser = signal<UserContext>({
    user_id: 'dev-user-1',
    email: 'dev@jynko.local',
    name: 'Local Developer',
  });

  loadCurrentUser(): void {
    this.api.get<UserContext>('/auth/me').subscribe({
      next: (user) => this.currentUser.set(user),
      error: () => {
        this.currentUser.set(this.devUserOverride());
      },
    });
  }

  setDevIdentity(user: UserContext): void {
    this.devUserOverride.set(user);
    this.currentUser.set(user);
  }
}
