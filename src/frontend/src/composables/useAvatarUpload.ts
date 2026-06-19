/**
 * Shared composable for avatar upload/delete.
 * Stores images in the backend mia.avatars table via /api/v1/avatars.
 */

import { apiClient } from '../api/client';

export interface AvatarResponse {
  id: string;
  url: string;
  filename: string;
  content_type: string;
  entity_type: string;
  entity_id: string | null;
}

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export function useAvatarUpload() {
  /** Returns an error message if the file is invalid, or null if OK. */
  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.has(file.type)) {
      return 'Selecciona una imagen válida (JPG, PNG, GIF o WebP)';
    }
    if (file.size > MAX_SIZE) {
      return 'La imagen no debe superar los 5 MB';
    }
    return null;
  }

  /**
   * Upload a file and persist it in mia.avatars.
   * @param file       Image file to upload
   * @param entityType 'user' | 'agent'
   * @param entityId   Optional: user sub or agent UUID
   */
  async function uploadAvatar(
    file: File,
    entityType: 'user' | 'agent',
    entityId?: string,
  ): Promise<AvatarResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    if (entityId) formData.append('entity_id', entityId);
    return apiClient.post<AvatarResponse>('/api/v1/avatars', formData);
  }

  /** Extract avatar UUID from a /api/v1/avatars/{id} URL. */
  function extractAvatarId(url: string): string | null {
    const match = url.match(/\/api\/v1\/avatars\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    return match ? match[1] : null;
  }

  /** Delete avatar by URL. No-ops silently if URL is not a DB avatar URL. */
  async function deleteAvatar(url: string): Promise<void> {
    const id = extractAvatarId(url);
    if (!id) return;
    await apiClient.delete(`/api/v1/avatars/${id}`);
  }

  return { validateFile, uploadAvatar, deleteAvatar, extractAvatarId };
}
