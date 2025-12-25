/**
 * This file was generated from FileDisplayer.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, FileValue } from "mendix";

export interface FileDisplayerContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    file: DynamicValue<FileValue>;
    colorTemperature: number;
    saveButtonCaption: string;
    onSave?: ActionValue;
    deleteButtonCaption: string;
    onDelete?: ActionValue;
    cancelButtonCaption: string;
    onCancel?: ActionValue;
}

export interface FileDisplayerPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    file: string;
    colorTemperature: number | null;
    saveButtonCaption: string;
    onSave: {} | null;
    deleteButtonCaption: string;
    onDelete: {} | null;
    cancelButtonCaption: string;
    onCancel: {} | null;
}
