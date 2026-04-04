export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  registry_model_id: string | null;
  provider: LLMProvider['id'];
  model: string;
  temperature: number;
  system_prompt?: string;
  capabilities: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export type AgentCreate = Omit<Agent, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;

export interface LLMProvider {
  id: 'openai' | 'anthropic' | 'google' | 'ollama' | 'other';
  name: string;
  logo_url: string;
}

export interface APIKey {
  id: string;
  provider: LLMProvider['id'];
  key_masked: string;
  is_valid: boolean;
  last_validated: string;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

// ── Model Registry ────────────────────────────────────────────────────────────

export interface RegistryModel {
  id: string;
  tenant_id: string;
  name: string;
  provider: string;
  litellm_prefix: string | null;
  model_id: string | null;
  status: 'active' | 'deprecated' | 'beta';
  tags: string[];
  context_window: number | null;
  created_at: string;
  updated_at: string;
}

export type RegistryModelCreate = Omit<RegistryModel, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;
export type RegistryModelUpdate = Partial<RegistryModelCreate>;

export interface APIKeyRecord {
  id: string;
  tenant_id: string;
  provider: string;
  key_masked: string;
  is_valid: boolean;
  last_validated: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureMapping {
  id: string;
  tenant_id: string;
  feature_id: string;
  feature_name: string;
  model_id: string;
  created_at: string;
  updated_at: string;
}

export interface Artifact {
  id: string
  name: string
  summary: string | null
  artifact_type: string
  file_url: string | null
  session_id: string | null
  subproject_id: string | null
  content: string | null
  created_at: string
}
