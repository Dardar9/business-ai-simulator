export interface Business {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: Date;
  agents: Agent[];
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  description: string;
  skills: string[];
  avatar: string;
}

export enum AgentRole {
  CEO = 'CEO',
  CTO = 'CTO',
  CFO = 'CFO',
  CMO = 'CMO',
  COO = 'COO',
  MARKETING_SPECIALIST = 'Marketing Specialist',
  SALES_MANAGER = 'Sales Manager',
  PRODUCT_MANAGER = 'Product Manager',
  AI_ENGINEER = 'AI Engineer',
  SOFTWARE_DEVELOPER = 'Software Developer',
  DATA_SCIENTIST = 'Data Scientist',
  BUSINESS_ANALYST = 'Business Analyst',
  HR_MANAGER = 'HR Manager',
  CUSTOMER_SUPPORT = 'Customer Support',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // Agent ID
  createdBy: string; // Agent ID
  createdAt: Date;
  dueDate: Date;
  completedAt?: Date;
  attachments?: string[];
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  content: string;
  createdBy: string; // Agent ID
  createdAt: Date;
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number; // in minutes
  attendees: string[]; // Agent IDs
  agenda: string[];
  notes?: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  createdBy: string; // Agent ID
  createdAt: Date;
  content: string;
  charts?: Chart[];
  attachments?: string[];
}

export interface Chart {
  id: string;
  type: ChartType;
  title: string;
  data: any;
  options?: any;
}

export enum ChartType {
  BAR = 'Bar',
  LINE = 'Line',
  PIE = 'Pie',
  DOUGHNUT = 'Doughnut',
  RADAR = 'Radar',
  POLAR_AREA = 'PolarArea',
  BUBBLE = 'Bubble',
  SCATTER = 'Scatter',
}
