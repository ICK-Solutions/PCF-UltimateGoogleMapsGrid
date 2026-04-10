import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import MapComponent from "./components/MapComponent";
import { MapRecord, OptionSetColumnInfo, LookupColumnInfo, parseCoordinate, parseMultiSelectValue, parseMultiSelectLabel } from "./utils/mapUtils";
export class GoogleMapsGrid implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private context!: ComponentFramework.Context<IInputs>;
    private notifyOutputChanged!: () => void;

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary
    ): void {
        this.context = context;
        this.notifyOutputChanged = notifyOutputChanged;
        context.parameters.dataSet.paging.setPageSize(5000);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.context = context;
        const dataSet = context.parameters.dataSet;

        const apiKey = context.parameters.GoogleMapsApiKey?.raw ?? "";
        const latField = context.parameters.LatitudeField?.raw ?? "";
        const lngField = context.parameters.LongitudeField?.raw ?? "";
        const titleField = context.parameters.TitleField?.raw ?? "";
        const colorField = context.parameters.ColorOptionSetField?.raw ?? "";
        const mapHeight = context.parameters.MapHeight?.raw ?? 500;

        // Les params non déclarés dans ManifestTypes nécessitent ce cast — contrainte ESLint connue
        const params = context.parameters as unknown as Record<string, { raw?: unknown } | undefined>;
        const getStr = (name: string): string => (params[name]?.raw as string | undefined) ?? "";

        const primaryMarkerShape = getStr("PrimaryMarkerShape") || "pin";
        const markerStyleMappingJson = getStr("MarkerStyleMapping");

        if (!apiKey || !latField || !lngField || !titleField) {
            return React.createElement(
                "div",
                {
                    style: {
                        padding: "20px",
                        color: "#d32f2f",
                        fontFamily: "Segoe UI, Arial, sans-serif",
                        fontSize: "14px",
                        backgroundColor: "#ffebee",
                        borderRadius: "4px",
                        border: "1px solid #ef9a9a",
                    },
                },
                "Configuration incomplete. Veuillez renseigner : Google Maps API Key, Champ Latitude, Champ Longitude et Champ Titre."
            );
        }

        if (dataSet.loading) {
            return React.createElement(
                "div",
                {
                    style: {
                        padding: "20px",
                        textAlign: "center" as const,
                        fontFamily: "Segoe UI, Arial, sans-serif",
                        color: "#666",
                    },
                },
                "Chargement des donnees..."
            );
        }

        if (dataSet.paging.hasNextPage) {
            dataSet.paging.loadNextPage();
            return React.createElement(
                "div",
                {
                    style: {
                        padding: "20px",
                        textAlign: "center" as const,
                        fontFamily: "Segoe UI, Arial, sans-serif",
                        color: "#666",
                    },
                },
                `Chargement des enregistrements (${dataSet.sortedRecordIds.length} charges)...`
            );
        }

        const lookupColumns = this.detectLookupColumns(dataSet, latField, lngField, titleField, colorField);
        const optionSetColumns = this.detectOptionSetColumns(dataSet, latField, lngField, titleField, colorField);
        const records = this.extractRecords(dataSet, latField, lngField, titleField, colorField, optionSetColumns, lookupColumns);
        const hasColorField = !!colorField;

        return React.createElement(MapComponent, {
            apiKey,
            records,
            markerStyleMappingJson,
            hasColorField,
            colorField,
            colorFieldEntityName: hasColorField ? dataSet.getTargetEntityType() : "",
            optionSetColumns,
            lookupColumns,
            mapHeight,
            primaryMarkerShape,
            onNavigate: this.handleNavigate.bind(this),
        });
    }

    private detectOptionSetColumns(
        dataSet: ComponentFramework.PropertyTypes.DataSet,
        latField: string,
        lngField: string,
        titleField: string,
        colorField: string
    ): OptionSetColumnInfo[] {
        const excluded = new Set([latField, lngField, titleField, colorField]);
        const result: OptionSetColumnInfo[] = [];

        for (const col of dataSet.columns) {
            if (excluded.has(col.name)) continue;
            if (col.name.startsWith("_") || col.name === "entityimage") continue;

            if (col.dataType === "OptionSet") {
                result.push({
                    fieldName: col.name,
                    displayName: col.displayName ?? col.name,
                    type: "simple",
                });
            } else if (col.dataType === "MultiSelectPicklist") {
                result.push({
                    fieldName: col.name,
                    displayName: col.displayName ?? col.name,
                    type: "multi",
                });
            }
        }

        return result;
    }

    private detectLookupColumns(
        dataSet: ComponentFramework.PropertyTypes.DataSet,
        latField: string,
        lngField: string,
        titleField: string,
        colorField: string
    ): LookupColumnInfo[] {
        const excluded = new Set([latField, lngField, titleField, colorField]);
        const result: LookupColumnInfo[] = [];

        for (const col of dataSet.columns) {
            if (excluded.has(col.name)) continue;
            if (col.name.startsWith("_") || col.name === "entityimage") continue;

            if (col.dataType === "Lookup.Simple") {
                result.push({
                    fieldName: col.name,
                    displayName: col.displayName ?? col.name,
                });
            }
        }

        return result;
    }

    private extractRecords(
        dataSet: ComponentFramework.PropertyTypes.DataSet,
        latField: string,
        lngField: string,
        titleField: string,
        colorField: string,
        optionSetColumns: OptionSetColumnInfo[],
        lookupColumns: LookupColumnInfo[]
    ): MapRecord[] {
        const records: MapRecord[] = [];
        const columns = dataSet.columns;
        const entityName = dataSet.getTargetEntityType();

        for (const recordId of dataSet.sortedRecordIds) {
            const record = dataSet.records[recordId];
            if (!record) continue;

            const lat = parseCoordinate(record.getValue(latField));
            const lng = parseCoordinate(record.getValue(lngField));

            if (lat == null || lng == null) continue;
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

            const title = record.getFormattedValue(titleField) ?? "";

            let optionSetValue: number | null = null;
            let optionSetLabel = "";
            if (colorField) {
                const rawVal = record.getValue(colorField);
                if (rawVal != null) {
                    if (typeof rawVal === "number") {
                        optionSetValue = rawVal;
                    } else if (typeof rawVal === "string") {
                        const parsed = parseInt(rawVal, 10);
                        optionSetValue = isNaN(parsed) ? null : parsed;
                    }
                }
                optionSetLabel = record.getFormattedValue(colorField) ?? "";
            }

            const optionSetValues: Record<string, number | null> = {};
            const optionSetLabels: Record<string, string> = {};
            const multiSelectValues: Record<string, number[]> = {};
            const multiSelectLabels: Record<string, string[]> = {};

            for (const osCol of optionSetColumns) {
                if (osCol.type === "simple") {
                    const rawVal = record.getValue(osCol.fieldName);
                    if (rawVal != null) {
                        if (typeof rawVal === "number") {
                            optionSetValues[osCol.fieldName] = rawVal;
                        } else if (typeof rawVal === "string") {
                            const parsed = parseInt(rawVal, 10);
                            optionSetValues[osCol.fieldName] = isNaN(parsed) ? null : parsed;
                        } else {
                            optionSetValues[osCol.fieldName] = null;
                        }
                    } else {
                        optionSetValues[osCol.fieldName] = null;
                    }
                    optionSetLabels[osCol.fieldName] = record.getFormattedValue(osCol.fieldName) ?? "";
                } else {
                    const rawVal = record.getValue(osCol.fieldName);
                    multiSelectValues[osCol.fieldName] = parseMultiSelectValue(rawVal);
                    const formattedVal = record.getFormattedValue(osCol.fieldName) ?? "";
                    multiSelectLabels[osCol.fieldName] = parseMultiSelectLabel(formattedVal);
                }
            }

            const lookupValues: Record<string, string | null> = {};
            const lookupLabels: Record<string, string> = {};

            for (const lkpCol of lookupColumns) {
                const formatted = record.getFormattedValue(lkpCol.fieldName) ?? "";
                lookupValues[lkpCol.fieldName] = formatted || null;
                lookupLabels[lkpCol.fieldName] = formatted;
            }

            const fields: { displayName: string; value: string }[] = [];
            for (const col of columns) {
                if (
                    col.name === latField ||
                    col.name === lngField ||
                    col.name === titleField ||
                    col.name === colorField
                ) {
                    continue;
                }
                if (col.name.startsWith("_") || col.name === "entityimage") continue;

                const formattedValue = record.getFormattedValue(col.name);
                if (formattedValue) {
                    fields.push({
                        displayName: col.displayName ?? col.name,
                        value: formattedValue,
                    });
                }
            }

            if (optionSetLabel) {
                const colDef = columns.filter((c) => c.name === colorField);
                fields.unshift({
                    displayName: (colDef.length > 0 ? colDef[0].displayName : null) ?? colorField,
                    value: optionSetLabel,
                });
            }

            records.push({
                id: recordId,
                entityName,
                entityId: (record.getNamedReference()?.id as unknown as string) ?? recordId,
                lat,
                lng,
                title,
                optionSetValue,
                optionSetLabel,
                optionSetValues,
                optionSetLabels,
                multiSelectValues,
                multiSelectLabels,
                lookupValues,
                lookupLabels,
                fields,
            });
        }

        return records;
    }

    private handleNavigate(entityName: string, entityId: string): void {
        if (this.context?.navigation) {
            void this.context.navigation.openForm({
                entityName,
                entityId,
            });
        }
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // React cleanup handled by the framework for virtual controls
    }
}