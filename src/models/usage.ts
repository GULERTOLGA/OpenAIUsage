// New interfaces to match the actual API response structure
export interface Amount {
  currency: string;
  value: number;
}

export interface Result {
  amount: Amount;
  line_item: string | null;
  object: string;
  organization_id: string;
  project_id: string;
}

export interface Bucket {
  end_time: number;
  object: string;
  results: Result[];
  start_time: number;
}

export interface CostsApiResponse {
  data: Bucket[];
  has_more: boolean;
  next_page: string | null;
  object: string;
}

// --- Data Processing Models (for easier consumption in components) ---

export interface DailyProjectCost {
  date: string; // YYYY-MM-DD format
  project_id: string;
  total_cost: number;
  models: { [key: string]: number }; // Breakdown by model/line_item
}

export interface AggregatedProjectUsage {
  project_id: string;
  total_cost: number;
  daily_costs: DailyProjectCost[];
  models_used: { [key: string]: number }; // Aggregated usage by model for this project
}

export class Usage {
  private rawData: CostsApiResponse;
  private aggregatedData: AggregatedProjectUsage[];
  private totalOverallCost: number;
  private overallModelUsage: { [key: string]: number };

  constructor(data: CostsApiResponse) {
    this.rawData = data;
    this.aggregatedData = this.processRawData(data);
    this.totalOverallCost = this.calculateTotalOverallCost();
    this.overallModelUsage = this.calculateOverallModelUsage();
  }

  private processRawData(data: CostsApiResponse): AggregatedProjectUsage[] {
    const projectMap = new Map<string, AggregatedProjectUsage>();

    data.data.forEach(bucket => {
      const date = new Date(bucket.start_time * 1000).toISOString().split('T')[0]; // YYYY-MM-DD

      bucket.results.forEach(result => {
        const projectId = result.project_id;
        const costValue = result.amount.value;
        const modelName = result.line_item || 'unknown_model';

        if (!projectMap.has(projectId)) {
          projectMap.set(projectId, {
            project_id: projectId,
            total_cost: 0,
            daily_costs: [],
            models_used: {},
          });
        }

        const project = projectMap.get(projectId)!;
        project.total_cost += costValue;

        // Find or create daily cost entry
        let dailyCostEntry = project.daily_costs.find(d => d.date === date);
        if (!dailyCostEntry) {
          dailyCostEntry = { date, project_id: projectId, total_cost: 0, models: {} };
          project.daily_costs.push(dailyCostEntry);
        }
        dailyCostEntry.total_cost += costValue;
        dailyCostEntry.models[modelName] = (dailyCostEntry.models[modelName] || 0) + costValue;

        // Aggregate models used for the project
        project.models_used[modelName] = (project.models_used[modelName] || 0) + costValue;
      });
    });

    // Sort daily costs within each project by date
    projectMap.forEach(project => {
      project.daily_costs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return Array.from(projectMap.values());
  }

  private calculateTotalOverallCost(): number {
    return this.aggregatedData.reduce((sum, project) => sum + project.total_cost, 0);
  }

  private calculateOverallModelUsage(): { [key: string]: number } {
    const overallUsage: { [key: string]: number } = {};
    this.aggregatedData.forEach(project => {
      Object.entries(project.models_used).forEach(([model, amount]) => {
        overallUsage[model] = (overallUsage[model] || 0) + amount;
      });
    });
    return overallUsage;
  }

  // Get all projects with aggregated data
  getProjects(): AggregatedProjectUsage[] {
    return this.aggregatedData;
  }

  // Get total cost for all projects
  getTotalCost(): number {
    return this.totalOverallCost;
  }

  // Get total cost for a specific project
  getProjectTotalCost(projectId: string): number {
    const project = this.aggregatedData.find(p => p.project_id === projectId);
    return project ? project.total_cost : 0;
  }

  // Get daily costs for a specific project
  getProjectDailyCosts(projectId: string): DailyProjectCost[] {
    const project = this.aggregatedData.find(p => p.project_id === projectId);
    return project ? project.daily_costs : [];
  }

  // Get all unique dates
  getAllDates(): string[] {
    const dates = new Set<string>();
    this.aggregatedData.forEach(project => {
      project.daily_costs.forEach(cost => {
        dates.add(cost.date);
      });
    });
    return Array.from(dates).sort();
  }

  // Get usage breakdown by model
  getUsageByModel(): { [key: string]: number } {
    return this.overallModelUsage;
  }

  // Get project count
  getProjectCount(): number {
    return this.aggregatedData.length;
  }

  // Get raw data
  getRawData(): CostsApiResponse {
    return this.rawData;
  }

  // Check if data is empty
  isEmpty(): boolean {
    return this.rawData.data.length === 0;
  }

  // Get projects sorted by total cost (descending)
  getProjectsByCost(): AggregatedProjectUsage[] {
    return [...this.aggregatedData].sort((a, b) => b.total_cost - a.total_cost);
  }
}
