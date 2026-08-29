export interface RocketRideExecutionInput {
  pipeline_name: string;
  payload: Record<string, any>;
  options?: {
    use_cloud?: boolean;
    timeout_ms?: number;
  };
}

export interface RocketRideExecutionOutput {
  success: boolean;
  pipeline_name: string;
  trace_id: string;
  execution_time_ms: number;
  approx_cost: number;
  data: Record<string, any>;
  error?: string;
}

export interface RocketRidePipelineTelemetry {
  id?: string;
  pipeline_name: string;
  records_count: number;
  execution_time_ms: number;
  approx_cost: number;
  status: 'success' | 'failed' | 'escalated';
  error_log?: string | null;
  escalations_count: number;
  trace_id: string;
  created_at?: string;
}
