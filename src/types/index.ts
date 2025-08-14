// API Response Types
export interface SwappedImage {
    image_data: string;
    destination_name: string;
}

export interface FaceSwapResponse {
    success: boolean;
    message: string;
    swapped_images: SwappedImage[];
    faces_detected_in_source: number;
}

export interface ErrorResponse {
    success: boolean;
    error: string;
    detail?: string;
}

// Camera Types
export interface CameraConstraints {
    video: {
        width: { ideal: number };
        height: { ideal: number };
        facingMode: string;
    };
}

// App State Types
export interface CapturedPhoto {
    dataUrl: string;
    blob: Blob;
}
