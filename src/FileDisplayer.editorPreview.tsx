import { ReactElement, createElement } from "react";
import { FileDisplayerPreviewProps } from "../typings/FileDisplayerProps";

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

export function preview(props: FileDisplayerPreviewProps): ReactElement {
    const normalizedColorTemperature = clampColorTemperature(props.colorTemperature);
    return (
        <div
            className="widget-file-viewer-preview"
            style={{
                ...props.styleObject,
                filter:
                    normalizedColorTemperature === 0 ? undefined : getColorTemperatureFilter(normalizedColorTemperature)
            }}
        >
            {props.file ? (
                <div className="widget-file-viewer-preview-file">📄 {props.file}</div>
            ) : (
                <div className="widget-file-viewer-preview-empty">Select a file</div>
            )}
            <div className="widget-file-viewer-preview-temp">Color temperature shift: {normalizedColorTemperature}</div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/FileDisplayer.css");
}
