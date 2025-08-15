import { appConfig } from '../config/app.config';
import type { FaceSwapResponse, ErrorResponse } from '../types';

export interface FaceSwapParams {
    imageBlob: Blob;
    sourceFaceId?: number;
    destinationFaceId?: number;
}

/**
 * Submit photo for face swapping
 */
export const submitFaceSwap = async (params: FaceSwapParams): Promise<FaceSwapResponse> => {
    const { imageBlob, sourceFaceId = 1, destinationFaceId = 1 } = params;

    try {
        const formData = new FormData();
        formData.append('image', imageBlob, 'captured-photo.jpg');
        formData.append('source_face_id', sourceFaceId.toString());
        formData.append('destination_face_id', destinationFaceId.toString());

        const response = await fetch(
            `${appConfig.api.baseUrl}${appConfig.api.faceSwapEndpoint}`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData: ErrorResponse = await response.json().catch(() => ({
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
            }));

            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result: FaceSwapResponse = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Face swap failed');
        }

        return result;
    } catch (error) {
        console.error('Face swap API error:', error);

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Network error occurred while processing your photo');
    }
};

/**
 * Check API health
 */
export const checkApiHealth = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${appConfig.api.baseUrl}/api/v1/health`);
        return response.ok;
    } catch {
        return false;
    }
};
