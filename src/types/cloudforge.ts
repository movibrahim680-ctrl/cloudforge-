export type Region = 'Europe' | 'North America' | 'Asia';

export type SourceType = 'github' | 'docker' | 'upload';

export type RuntimeType = 'node' | 'docker' | 'python' | 'static';

export type ServiceStatus = 
  | 'idle' 
  | 'queued'
  | 'building' 
  | 'deploying' 
  | 'running' 
  | 'success'
  | 'stopped' 
  | 'failed' 
  | 'cancelled'
  | 'provider_not_connected';

export type DeploymentStatus = 
  | 'queued' 
  | 'building' 
  | 'deploying' 
  | 'success' 
  | 'failed' 
  | 'cancelled' 
  | 'provider_not_connected';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  region: Region;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  source_type: SourceType;
  source_url: string;
  runtime: RuntimeType;
  branch: string;
  build_command: string;
  start_command: string;
  port: number;
  region: Region;
  public_url: string;
  status: ServiceStatus;
  health_status?: 'healthy' | 'unhealthy' | 'unknown';
  last_deployed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  service_id: string;
  user_id: string;
  status: DeploymentStatus;
  trigger: 'manual' | 'git_push' | 'redeploy' | 'api';
  commit_hash?: string;
  commit_message?: string;
  duration_seconds?: number;
  error_message?: string;
  created_at: string;
  finished_at?: string;
}

export interface DeploymentLog {
  id: string;
  deployment_id: string;
  service_id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'stdout' | 'stderr';
  message: string;
}

export interface EnvironmentVariable {
  id: string;
  service_id: string;
  project_id: string;
  user_id: string;
  key: string;
  value: string;
  is_secret: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomDomain {
  id: string;
  service_id: string;
  project_id: string;
  user_id: string;
  domain_name: string;
  status: 'pending' | 'active' | 'failed';
  ssl_active: boolean;
  dns_records?: {
    type: 'CNAME' | 'A';
    name: string;
    value: string;
    verified: boolean;
  }[];
  created_at: string;
}

export interface UsageMetric {
  id: string;
  project_id: string;
  service_id?: string;
  cpu_usage_pct: number;
  memory_mb: number;
  request_count: number;
  timestamp: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'hobby' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled';
  current_period_end: string;
}

export interface ProviderInfo {
  type: string;
  name: string;
  connected: boolean;
  version: string;
  supportedRuntimes: RuntimeType[];
  region: string;
  message?: string;
}

export interface CreateServiceInput {
  project_id: string;
  name: string;
  source_type: SourceType;
  source_url: string;
  runtime: RuntimeType;
  branch: string;
  build_command: string;
  start_command: string;
  port: number;
  region: Region;
  env_vars?: { key: string; value: string; is_secret?: boolean }[];
}
