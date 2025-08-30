import { appConfig } from '../config/app.config';
import { blobToBase64 } from './camera';
import type { FaceSwapResponse, ErrorResponse } from '../types';

export interface FaceSwapParams {
    imageBlob: Blob;
    sourceFaceId?: number;
    destinationFaceId?: number;
}

/**
 * Submit photo for face swapping using KServe JSON format
 */
export const submitFaceSwap = async (params: FaceSwapParams): Promise<FaceSwapResponse> => {
    const { imageBlob, sourceFaceId = 1, destinationFaceId = 1 } = params;

    try {
        // Convert blob to base64
        const base64Image = await blobToBase64(imageBlob);

        // Create JSON payload for KServe
        const payload = {
            image: base64Image,
            source_face_id: sourceFaceId,
            destination_face_id: destinationFaceId,
        };

        const response = await fetch(
            `${appConfig.api.baseUrl}${appConfig.api.faceSwapEndpoint}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
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
