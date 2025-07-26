export interface Project {
  id: string;
  object: string;
  created: number;
  updated: number;
  title?: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  archived: boolean;
  organization_id: string;
  permission?: string;
  status?: string;
  created_at?: number;
  archived_at?: number | null;
}

export interface ProjectsResponse {
  data: Project[];
  object: string;
  has_more: boolean;
}

export class ProjectsManager {
  private projects: Map<string, Project> = new Map();

  constructor(projects: Project[]) {
    projects.forEach(project => {
      this.projects.set(project.id, project);
    });
  }

  getProjectName(projectId: string): string {
    const project = this.projects.get(projectId);
    if (!project) {
      return projectId; // Return ID if project not found
    }
    return project.title || project.name || 'İsimsiz Proje';
  }

  getProject(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  hasProject(projectId: string): boolean {
    return this.projects.has(projectId);
  }
} 