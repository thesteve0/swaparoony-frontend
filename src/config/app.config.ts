export interface AppConfig {
    api: {
        baseUrl: string;
        faceSwapEndpoint: string;
    };
    camera: {
        previewWidth: number;
        previewHeight: number;
        resizeWidth: number;
        resizeHeight: number;
        quality: number;
    };
}

export const appConfig: AppConfig = {
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
        faceSwapEndpoint: '/api/v1/swap',
    },
    camera: {
        previewWidth: parseInt(import.meta.env.VITE_CAMERA_PREVIEW_WIDTH || '1024'),
        previewHeight: parseInt(import.meta.env.VITE_CAMERA_PREVIEW_HEIGHT || '1024'),
        resizeWidth: parseInt(import.meta.env.VITE_CAMERA_RESIZE_WIDTH || '640'),
        resizeHeight: parseInt(import.meta.env.VITE_CAMERA_RESIZE_HEIGHT || '640'),
        quality: parseFloat(import.meta.env.VITE_CAMERA_QUALITY || '0.8'),
    },
};
