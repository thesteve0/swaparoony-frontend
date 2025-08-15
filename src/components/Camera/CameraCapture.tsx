import React, { useRef, useEffect, useState } from 'react';
import {
    Card,
    CardBody,
    Button,
    Alert,
    AlertVariant,
    Spinner,
    Gallery,
    GalleryItem,
    Title,
    Flex,
    FlexItem,
} from '@patternfly/react-core';
import {
    CameraIcon,
    UndoIcon,
    TrashIcon,
    PaperPlaneIcon,
} from '@patternfly/react-icons';

import {
    getUserMediaStream,
    stopMediaStream,
    captureAndResizePhoto,
    isCameraSupported
} from '../../utils/camera';
import { submitFaceSwap } from '../../utils/api';
import { appConfig } from '../../config/app.config';
import type { CapturedPhoto, FaceSwapResponse } from '../../types';

type CameraState = 'idle' | 'initializing' | 'ready' | 'captured' | 'processing' | 'results' | 'error';

export const CameraCapture: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [state, setState] = useState<CameraState>('idle');
    const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
    const [results, setResults] = useState<FaceSwapResponse | null>(null);
    const [error, setError] = useState<string>('');

    // Initialize camera on mount
    useEffect(() => {
        initializeCamera();

        return () => {
            stopMediaStream(stream);
        };
    }, []);

    const initializeCamera = async () => {
        if (!isCameraSupported()) {
            setError('Camera is not supported by this browser');
            setState('error');
            return;
        }

        setState('initializing');
        setError('');

        try {
            const mediaStream = await getUserMediaStream();
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            setState('ready');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
            setError(errorMessage);
            setState('error');
        }
    };

    const capturePhoto = async () => {
        if (!videoRef.current || state !== 'ready') return;

        try {
            const photo = await captureAndResizePhoto(videoRef.current);
            setCapturedPhoto(photo);
            setState('captured');

            // Stop camera stream to free up resources
            stopMediaStream(stream);
            setStream(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to capture photo';
            setError(errorMessage);
            setState('error');
        }
    };

    const clearPhoto = () => {
        setCapturedPhoto(null);
        setResults(null);
        initializeCamera();
    };

    const submitPhoto = async () => {
        if (!capturedPhoto) return;

        setState('processing');
        setError('');

        try {
            const response = await submitFaceSwap({
                imageBlob: capturedPhoto.blob,
                sourceFaceId: 1,
                destinationFaceId: 1,
            });

            setResults(response);
            setState('results');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to process photo';
            setError(errorMessage);
            setState('error');
        }
    };

    const startOver = () => {
        setCapturedPhoto(null);
        setResults(null);
        setState('idle');
        initializeCamera();
    };

    const renderCameraPreview = () => (
        <Card className="pf-v6-u-text-align-center">
            <CardBody>
                <div style={{
                    width: `${appConfig.camera.previewWidth}px`,
                    height: `${appConfig.camera.previewHeight}px`,
                    maxWidth: '100%',
                    margin: '0 auto',
                    position: 'relative',
                    border: '2px solid var(--pf-v6-global--BorderColor--100)',
                    borderRadius: 'var(--pf-v6-global--BorderRadius--sm)',
                    overflow: 'hidden',
                }}>
                    {state === 'initializing' && (
                        <div className="pf-v6-u-display-flex pf-v6-u-justify-content-center pf-v6-u-align-items-center"
                             style={{ height: '100%' }}>
                            <Spinner size="xl" />
                        </div>
                    )}

                    {state === 'ready' && (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    )}
                </div>

                {state === 'ready' && (
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={capturePhoto}
                        icon={<CameraIcon />}
                        className="pf-v6-u-mt-md"
                    >
                        Capture Photo
                    </Button>
                )}
            </CardBody>
        </Card>
    );

    const renderCapturedPhoto = () => (
        <Card className="pf-v6-u-text-align-center">
            <CardBody>
                <Title headingLevel="h3" size="lg" className="pf-v6-u-mb-md">
                    Your Photo
                </Title>

                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <img
                        src={capturedPhoto?.dataUrl}
                        alt="Captured photo"
                        style={{
                            width: '100%',
                            height: 'auto',
                            border: '2px solid var(--pf-v6-global--BorderColor--100)',
                            borderRadius: 'var(--pf-v6-global--BorderRadius--sm)',
                        }}
                    />
                </div>

                <Flex justifyContent={{ default: 'justifyContentCenter' }} className="pf-v6-u-mt-md">
                    <FlexItem>
                        <Button
                            variant="secondary"
                            onClick={clearPhoto}
                            icon={<UndoIcon />}
                        >
                            Retake
                        </Button>
                    </FlexItem>
                    <FlexItem>
                        <Button
                            variant="danger"
                            onClick={startOver}
                            icon={<TrashIcon />}
                        >
                            Clear
                        </Button>
                    </FlexItem>
                    <FlexItem>
                        <Button
                            variant="primary"
                            onClick={submitPhoto}
                            icon={<PaperPlaneIcon />}
                            isLoading={state === 'processing'}
                            isDisabled={state === 'processing'}
                        >
                            {state === 'processing' ? 'Processing...' : 'Submit'}
                        </Button>
                    </FlexItem>
                </Flex>
            </CardBody>
        </Card>
    );

    const renderResults = () => (
        <Card>
            <CardBody>
                <Title headingLevel="h3" size="lg" className="pf-v6-u-mb-md pf-v6-u-text-align-center">
                    Your Face Swap Results!
                </Title>

                {results && (
                    <>
                        <Alert
                            variant={AlertVariant.success}
                            title={results.message}
                            className="pf-v6-u-mb-lg"
                        />

                        <Gallery hasGutter minWidths={{ default: '250px' }}>
                            {results.swapped_images.map((image, index) => (
                                <GalleryItem key={index}>
                                    <Card>
                                        <CardBody className="pf-v6-u-text-align-center">
                                            <img
                                                src={`data:image/jpeg;base64,${image.image_data}`}
                                                alt={`Face swap result ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    maxWidth: '300px',
                                                    borderRadius: 'var(--pf-v6-global--BorderRadius--sm)',
                                                }}
                                            />
                                            <Title headingLevel="h4" size="md" className="pf-v6-u-mt-sm">
                                                {image.destination_name}
                                            </Title>
                                        </CardBody>
                                    </Card>
                                </GalleryItem>
                            ))}
                        </Gallery>

                        <div className="pf-v6-u-text-align-center pf-v6-u-mt-lg">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={startOver}
                            >
                                Try Another Photo
                            </Button>
                        </div>
                    </>
                )}
            </CardBody>
        </Card>
    );

    return (
        <div className="camera-capture">
            {error && (
                <Alert
                    variant={AlertVariant.danger}
                    title="Error"
                    className="pf-v6-u-mb-lg"
                >
                    {error}
                    {state === 'error' && (
                        <div className="pf-v6-u-mt-sm">
                            <Button variant="link" onClick={initializeCamera}>
                                Try Again
                            </Button>
                        </div>
                    )}
                </Alert>
            )}

            {(state === 'initializing' || state === 'ready') && renderCameraPreview()}
            {state === 'captured' && renderCapturedPhoto()}
            {state === 'results' && renderResults()}
        </div>
    );
};
