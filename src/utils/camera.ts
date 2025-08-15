import { appConfig } from '../config/app.config';
import type { CameraConstraints, CapturedPhoto } from '../types';

/**
 * Get user media stream for camera access
 */
export const getUserMediaStream = async (): Promise<MediaStream> => {
    try {
        const constraints: CameraConstraints = {
            video: {
                width: { ideal: appConfig.camera.previewWidth },
                height: { ideal: appConfig.camera.previewHeight },
                facingMode: 'user', // Front-facing camera preferred
            },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
    } catch (error) {
        console.error('Error accessing camera:', error);
        throw new Error('Unable to access camera. Please check permissions and try again.');
    }
};

/**
 * Stop all tracks in a media stream
 */
export const stopMediaStream = (stream: MediaStream | null): void => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
};

/**
 * Capture photo from video element and resize it
 */
export const captureAndResizePhoto = async (
    videoElement: HTMLVideoElement
): Promise<CapturedPhoto> => {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Unable to get canvas context');
            }

            // Set canvas size to target dimensions
            canvas.width = appConfig.camera.resizeWidth;
            canvas.height = appConfig.camera.resizeHeight;

            // Draw and resize the video frame to canvas
            ctx.drawImage(
                videoElement,
                0, 0, videoElement.videoWidth, videoElement.videoHeight,
                0, 0, canvas.width, canvas.height
            );

            // Convert canvas to blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create image blob'));
                        return;
                    }

                    const dataUrl = canvas.toDataURL('image/jpeg', appConfig.camera.quality);

                    resolve({
                        dataUrl,
                        blob,
                    });
                },
                'image/jpeg',
                appConfig.camera.quality
            );
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Check if camera is supported by the browser
 */
export const isCameraSupported = (): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};
