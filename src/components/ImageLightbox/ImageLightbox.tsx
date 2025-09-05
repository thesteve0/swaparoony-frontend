import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    ModalBody,
    Button,
    Flex,
    FlexItem,
} from '@patternfly/react-core';
import {
    PlusIcon,
    MinusIcon,
    TimesIcon,
} from '@patternfly/react-icons';

interface ImageLightboxProps {
    isOpen: boolean;
    imageUrl: string;
    altText: string;
    onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ 
    isOpen, 
    imageUrl, 
    altText, 
    onClose 
}) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);

    // Reset zoom and position when modal opens
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.25, 4));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleMouseDown = (event: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: event.clientX - position.x,
                y: event.clientY - position.y,
            });
        }
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: event.clientX - dragStart.x,
                y: event.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (event: React.WheelEvent) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    const handleBackdropClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            variant="large"
            aria-labelledby="lightbox-title"
            onEscapePress={onClose}
        >
            <ModalBody style={{ padding: 0, position: 'relative' }}>
                {/* Controls Bar */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 1000,
                    background: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: '0 0 0 8px',
                    padding: '8px',
                }}>
                    <Flex>
                        <FlexItem>
                            <Button
                                variant="plain"
                                onClick={handleZoomOut}
                                isDisabled={zoom <= 0.5}
                                icon={<MinusIcon />}
                                aria-label="Zoom out"
                            />
                        </FlexItem>
                        <FlexItem>
                            <span style={{ 
                                color: 'white', 
                                padding: '0 8px',
                                fontSize: '14px',
                                lineHeight: '32px',
                            }}>
                                {Math.round(zoom * 100)}%
                            </span>
                        </FlexItem>
                        <FlexItem>
                            <Button
                                variant="plain"
                                onClick={handleZoomIn}
                                isDisabled={zoom >= 4}
                                icon={<PlusIcon />}
                                aria-label="Zoom in"
                            />
                        </FlexItem>
                        <FlexItem>
                            <Button
                                variant="plain"
                                onClick={onClose}
                                icon={<TimesIcon />}
                                aria-label="Close lightbox"
                            />
                        </FlexItem>
                    </Flex>
                </div>

                {/* Image Container */}
                <div
                    style={{
                        width: '100%',
                        height: '80vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    }}
                    onClick={handleBackdropClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt={altText}
                        style={{
                            maxWidth: zoom > 1 ? 'none' : '100%',
                            maxHeight: zoom > 1 ? 'none' : '100%',
                            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                            transition: isDragging ? 'none' : 'transform 0.2s ease',
                            userSelect: 'none',
                            pointerEvents: 'none',
                        }}
                        draggable={false}
                    />
                </div>

                {/* Instructions */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px 16px',
                    fontSize: '12px',
                    textAlign: 'center',
                }}>
                    Use mouse wheel to zoom • Drag to pan when zoomed • Click outside image or press ESC to close
                </div>
            </ModalBody>
        </Modal>
    );
};