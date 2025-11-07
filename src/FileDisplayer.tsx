import React, { ReactElement, createElement, useState, useEffect } from "react";
import { FileDisplayerContainerProps } from "../typings/FileDisplayerProps";
import "./ui/FileDisplayer.css";

type FileType = "image" | "pdf" | "download";

const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
};

const getFileType = (filename: string): FileType => {
    const ext = getFileExtension(filename);
    if (imageExtensions.includes(ext)) {
        return "image";
    }
    if (ext === "pdf") {
        return "pdf";
    }
    return "download";
};

const clampColorTemperature = (value?: number | null): number => {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return 0;
    }
    return Math.min(100, Math.max(0, value));
};

const getColorTemperatureFilter = (intensity: number): string => {
    if (intensity <= 0) {
        return "none";
    }

    const ratio = intensity / 100;
    const sepia = (0.75 * ratio).toFixed(2);
    const saturate = (1 + 0.6 * ratio).toFixed(2);
    const hueRotate = (16 * ratio).toFixed(2);

    return `sepia(${sepia}) saturate(${saturate}) hue-rotate(${hueRotate}deg)`;
};

export function FileDisplayer({
    file,
    class: className,
    style,
    colorTemperature
}: FileDisplayerContainerProps): ReactElement {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [filename, setFilename] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [zoom, setZoom] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!file) {
            setError("No file selected");
            setFileUrl(null);
            return;
        }

        if (file.status !== "available" || !file.value) {
            setError("File not available");
            setFileUrl(null);
            return;
        }

        const uri = file.value.uri;
        if (!uri) {
            setError("Invalid file URL");
            setFileUrl(null);
            return;
        }

        const name = file.value.name || uri.split("/").pop() || "file";
        const fileType = getFileType(name);

        setFilename(name);
        setError("");
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
        setIsLoading(true);

        if (fileType === "image") {
            setFileUrl(uri);
            setIsLoading(false);
        } else if (fileType === "pdf") {
            // For PDFs, use blob URL to display in iframe
            fetch(uri)
                .then(response => response.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    setFileUrl(blobUrl);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch PDF:", err);
                    setFileUrl(uri);
                    setIsLoading(false);
                });
        } else {
            // For all other files (Office, etc.) - just download
            setFileUrl(null);
            setIsLoading(false);
        }

        // Cleanup will be handled by separate effect
    }, [file]);

    // Cleanup blob URLs when component unmounts or fileUrl changes
    useEffect(() => {
        return () => {
            if (fileUrl && fileUrl.startsWith("blob:")) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    const handleZoomIn = (): void => {
        setZoom(prev => Math.min(prev + 0.25, 5));
    };

    const handleZoomOut = (): void => {
        setZoom(prev => Math.max(prev - 0.25, 0.25));
    };

    const handleReset = (): void => {
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };

    const handleRotate = (): void => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleDownload = (): void => {
        if (!file || !file.value || !file.value.uri) {
            return;
        }

        const link = document.createElement("a");
        link.href = file.value.uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleMouseDown = (e: React.MouseEvent): void => {
        if (getFileType(filename) !== "image") {
            return;
        }
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent): void => {
        if (!isDragging || getFileType(filename) !== "image") {
            return;
        }
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = (): void => {
        setIsDragging(false);
    };

    const normalizedColorTemperature = clampColorTemperature(colorTemperature);
    const contentFilter = getColorTemperatureFilter(normalizedColorTemperature);

    const renderViewer = (): ReactElement => {
        if (isLoading) {
            return (
                <div className="widget-file-viewer-empty">
                    <p>Loading file...</p>
                </div>
            );
        }

        const fileType = getFileType(filename);
        const isImage = fileType === "image";
        const isPDF = fileType === "pdf";
        const showControls = isImage || isPDF;

        if (!showControls) {
            return (
                <div className="widget-file-viewer-download-only">
                    <div className="widget-file-viewer-file-info">
                        <span className="widget-file-viewer-file-icon">📄</span>
                        <span className="widget-file-viewer-file-name">{filename}</span>
                    </div>
                    <button className="widget-file-viewer-btn-large" onClick={handleDownload} type="button">
                        <span className="widget-file-viewer-icon">↓</span>
                        Download
                    </button>
                </div>
            );
        }

        return (
            <div className="widget-file-viewer-container">
                <div className="widget-file-viewer-toolbar">
                    <button className="widget-file-viewer-btn" onClick={handleZoomIn} title="Zoom In" type="button">
                        <span className="widget-file-viewer-icon">⊕</span>
                    </button>
                    <button className="widget-file-viewer-btn" onClick={handleZoomOut} title="Zoom Out" type="button">
                        <span className="widget-file-viewer-icon">⊖</span>
                    </button>
                    <button
                        className="widget-file-viewer-btn"
                        onClick={handleRotate}
                        title="Rotate"
                        type="button"
                        disabled={!isImage}
                    >
                        <span className="widget-file-viewer-icon">↻</span>
                    </button>
                    <button className="widget-file-viewer-btn" onClick={handleReset} title="Reset" type="button">
                        <span className="widget-file-viewer-icon">⌂</span>
                    </button>
                    <button
                        className="widget-file-viewer-btn widget-file-viewer-btn-primary"
                        onClick={handleDownload}
                        title="Download"
                        type="button"
                    >
                        <span className="widget-file-viewer-icon">↓</span>
                    </button>
                </div>
                <div
                    className="widget-file-viewer-content"
                    style={contentFilter === "none" ? undefined : { filter: contentFilter }}
                >
                    {isImage && (
                        <img
                            src={fileUrl || undefined}
                            alt={filename}
                            className="widget-file-viewer-image"
                            style={{
                                transform: `rotate(${rotation}deg) scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                                cursor: isDragging ? "grabbing" : "grab"
                            }}
                            draggable={false}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                    )}
                    {isPDF && <iframe src={fileUrl || undefined} className="widget-file-viewer-pdf" title={filename} />}
                </div>
            </div>
        );
    };

    return (
        <div className={`widget-file-viewer ${className}`} style={style}>
            {error ? (
                <div className="widget-file-viewer-error">
                    <p>{error}</p>
                </div>
            ) : (
                renderViewer()
            )}
        </div>
    );
}
