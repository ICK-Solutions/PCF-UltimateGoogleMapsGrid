import * as React from "react";
import {
    MapRecord,
    OptionSetColumnInfo,
    OptionSetDistinctValue,
    loadGoogleMapsApi,
    LookupColumnInfo,
    LookupDistinctValue,
    getDistinctLookupValues,
    buildColorMap,
    buildLegendItems,
    getDistinctOptionSetValues,
    getDistinctMultiSelectValues,
    DEFAULT_MARKER_COLOR,
    createShapedMarkerIcon,
    MarkerShape,
    parseMarkerStyleMapping,
    resolveMarkerStyle,
    getRecordMappingValue,
} from "../utils/mapUtils";
import MapLegend, { StyleLegendEntry } from "./MapLegend";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

interface OptionSetOption {
    Value: number;
    Color: string;
    Label: { UserLocalizedLabel: { Label: string } };
}

export interface MapComponentProps {
    apiKey: string;
    records: MapRecord[];
    markerStyleMappingJson: string;
    hasColorField: boolean;
    colorField: string;
    colorFieldEntityName: string;
    optionSetColumns: OptionSetColumnInfo[];
    lookupColumns: LookupColumnInfo[];
    mapHeight: number;
    primaryMarkerShape: string;
    onNavigate: (entityName: string, entityId: string) => void;
}

// ── Helpers de toggle Set (réutilisés pour légende couleur et légende style) ──

function toggleSetValue<T>(
    setValue: React.Dispatch<React.SetStateAction<Set<T>>>,
    value: T,
): void {
    setValue((prev) => {
        const next = new Set(prev);
        if (next.has(value)) {
            next.delete(value);
        } else {
            next.add(value);
        }
        return next;
    });
}

function setAllOrNone<T>(
    setValue: React.Dispatch<React.SetStateAction<Set<T>>>,
    allValues: T[],
    isAllActive: boolean,
): void {
    setValue(isAllActive ? new Set<T>() : new Set(allValues));
}

// ────────────────────────────────────────────────────────────────────────────

const MapComponent: React.FC<MapComponentProps> = ({
    apiKey,
    records,
    markerStyleMappingJson,
    hasColorField,
    colorField,
    colorFieldEntityName,
    optionSetColumns,
    lookupColumns,
    mapHeight,
    primaryMarkerShape,
    onNavigate,
}) => {
    const [apiLoaded, setApiLoaded] = React.useState(false);
    const [apiError, setApiError] = React.useState<string | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeFilters, setActiveFilters] = React.useState<Set<number>>(new Set());
    const [d365Colors, setD365Colors] = React.useState(new Map<number, string>());
    const [filtersExpanded, setFiltersExpanded] = React.useState(false);

    const [simpleFilters, setSimpleFilters] = React.useState<Record<string, number | null>>({});
    const [multiFilters, setMultiFilters] = React.useState<Record<string, Set<number>>>({});
    const [lookupFilters, setLookupFilters] = React.useState<Record<string, string | null>>({});

    // ── Marker Style Mapping ──
    const markerStyleMapping = React.useMemo(
        () => parseMarkerStyleMapping(markerStyleMappingJson),
        [markerStyleMappingJson],
    );
    const [mappingActiveValues, setMappingActiveValues] = React.useState<Set<number | null>>(new Set());

    const mapContainerRef = React.useRef<HTMLDivElement>(null);
    const mapRef = React.useRef<google.maps.Map | null>(null);
    const markersRef = React.useRef<google.maps.Marker[]>([]);
    const clustererRef = React.useRef<MarkerClusterer | null>(null);
    const infoWindowRef = React.useRef<google.maps.InfoWindow | null>(null);

    React.useEffect(() => {
        if (!hasColorField || !colorField || !colorFieldEntityName) return;

        const fetchUrl = `/api/data/v9.2/EntityDefinitions(LogicalName='${colorFieldEntityName}')/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$filter=LogicalName eq '${colorField}'&$expand=OptionSet`;

        fetch(fetchUrl, {
            method: "GET",
            headers: {
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "Accept": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data: Record<string, unknown>) => {
                const values = data.value as Record<string, unknown>[] | undefined;
                if (values?.[0]) {
                    const optionSet = (values[0].OptionSet as Record<string, unknown>)?.Options as OptionSetOption[] | undefined;
                    if (optionSet) {
                        const newColors = new Map<number, string>();
                        for (const opt of optionSet) {
                            if (opt.Color && opt.Color !== "") {
                                newColors.set(opt.Value, opt.Color);
                            }
                        }
                        setD365Colors(newColors);
                    }
                }
                return;
            })
            .catch((err: unknown) => {
                console.error("[GoogleMapsGrid] Failed to load optionset colors:", err);
            });
    }, [hasColorField, colorField, colorFieldEntityName]);

    React.useEffect(() => {
        if (!apiKey) {
            setApiError("Cle API Google Maps non configuree.");
            return;
        }
        loadGoogleMapsApi(apiKey)
            .then(() => { setApiLoaded(true); return; })
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : "Erreur inconnue";
                setApiError(message);
            });
    }, [apiKey]);

    React.useEffect(() => {
        if (!apiLoaded || !mapContainerRef.current || mapRef.current) return;

        mapRef.current = new google.maps.Map(mapContainerRef.current, {
            center: { lat: 46.603354, lng: 1.888334 },
            zoom: 6,
            minZoom: 3,
            restriction: {
                latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
                strictBounds: true,
            },
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT,
            },
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
        });

        infoWindowRef.current = new google.maps.InfoWindow();

        // Logo PARTNR.365
        const logoDiv = document.createElement("div");
        logoDiv.style.cssText = "margin:10px;padding:6px 12px;background:rgba(255,255,255,0.9);border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.15);cursor:pointer;display:flex;align-items:center;gap:6px;";
        logoDiv.innerHTML = '<span style="font-family:Segoe UI,Arial;font-size:11px;font-weight:600;color:#1565C0;">Developed by PARTNR.365\u00AE</span>';
        logoDiv.title = "partnr365.fr";
        logoDiv.addEventListener("click", () => {
            window.open("https://www.partnr365.fr", "_blank");
        });
        mapRef.current.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(logoDiv);

    }, [apiLoaded]);

    const colorMap = React.useMemo(() => buildColorMap(records, d365Colors), [records, d365Colors]);

    // ── Colonnes pour filtres (déclarées avant baseFilteredRecords) ──
    const simpleColumns = React.useMemo(
        () => optionSetColumns.filter((c) => c.type === "simple"),
        [optionSetColumns]
    );
    const multiColumns = React.useMemo(
        () => optionSetColumns.filter((c) => c.type === "multi"),
        [optionSetColumns]
    );

    const simpleDistinctValues = React.useMemo(() => {
        const result: Record<string, OptionSetDistinctValue[]> = {};
        for (const col of simpleColumns) {
            result[col.fieldName] = getDistinctOptionSetValues(records, col.fieldName);
        }
        return result;
    }, [records, simpleColumns]);

    const multiDistinctValues = React.useMemo(() => {
        const result: Record<string, OptionSetDistinctValue[]> = {};
        for (const col of multiColumns) {
            result[col.fieldName] = getDistinctMultiSelectValues(records, col.fieldName);
        }
        return result;
    }, [records, multiColumns]);

    const lookupDistinctValues = React.useMemo(() => {
        const result: Record<string, LookupDistinctValue[]> = {};
        for (const col of lookupColumns) {
            result[col.fieldName] = getDistinctLookupValues(records, col.fieldName);
        }
        return result;
    }, [records, lookupColumns]);

    React.useEffect(() => {
        const newMultiFilters: Record<string, Set<number>> = {};
        for (const col of multiColumns) {
            const distinct = multiDistinctValues[col.fieldName] ?? [];
            newMultiFilters[col.fieldName] = new Set(distinct.map((d) => d.value));
        }
        setMultiFilters(newMultiFilters);
    }, [multiColumns, multiDistinctValues]);

    const activeFilterCount = React.useMemo(() => {
        let count = 0;
        for (const key of Object.keys(simpleFilters)) {
            if (simpleFilters[key] != null) count++;
        }
        for (const col of multiColumns) {
            const allValues = multiDistinctValues[col.fieldName] ?? [];
            const checked = multiFilters[col.fieldName];
            if (checked && checked.size < allValues.length) count++;
        }
        for (const key of Object.keys(lookupFilters)) {
            if (lookupFilters[key] != null) count++;
        }
        return count;
    }, [simpleFilters, multiFilters, multiColumns, multiDistinctValues, lookupFilters]);

    // ── Filtrage étape 1 : tous les filtres SAUF les légendes ──
    const baseFilteredRecords = React.useMemo(() => {
        let result = records;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter((r) => {
                if (r.title.toLowerCase().includes(query)) return true;
                return r.fields.some((f) => f.value.toLowerCase().includes(query));
            });
        }

        for (const fieldName of Object.keys(simpleFilters)) {
            const selectedValue = simpleFilters[fieldName];
            if (selectedValue != null) {
                result = result.filter((r) => r.optionSetValues[fieldName] === selectedValue);
            }
        }

        for (const fieldName of Object.keys(lookupFilters)) {
            const selectedId = lookupFilters[fieldName];
            if (selectedId != null) {
                result = result.filter((r) => r.lookupValues[fieldName] === selectedId);
            }
        }

        for (const col of multiColumns) {
            const checkedValues = multiFilters[col.fieldName];
            if (!checkedValues) continue;
            const allValues = multiDistinctValues[col.fieldName] ?? [];
            if (checkedValues.size >= allValues.length) continue;
            if (checkedValues.size === 0) {
                result = [];
                break;
            }
            result = result.filter((r) => {
                const recordValues = r.multiSelectValues[col.fieldName];
                if (!recordValues || recordValues.length === 0) return false;
                return recordValues.some((v) => checkedValues.has(v));
            });
        }

        return result;
    }, [records, searchQuery, simpleFilters, multiFilters, multiColumns, multiDistinctValues, lookupFilters]);

    // ── Légendes (utilisent baseFilteredRecords) ──
    const legendItems = React.useMemo(
        () => (hasColorField ? buildLegendItems(baseFilteredRecords, colorMap) : []),
        [baseFilteredRecords, colorMap, hasColorField]
    );

    React.useEffect(() => {
        if (legendItems.length > 0) {
            setActiveFilters(new Set(legendItems.map((item) => item.value)));
        }
    }, [legendItems]);

    // allFiltersActive est dérivé — pas de state séparé à synchroniser
    const allFiltersActive = React.useMemo(
        () => activeFilters.size === legendItems.length,
        [activeFilters, legendItems]
    );

    // ── Style mapping legend entries ──
    const styleLegendEntries: StyleLegendEntry[] = React.useMemo(() => {
        if (!markerStyleMapping) return [];
        const cfg = markerStyleMapping;

        const labelMap = new Map<number, string>();
        const countMap = new Map<number | null, number>();

        for (const record of baseFilteredRecords) {
            const val = getRecordMappingValue(record, cfg.fieldName, colorField);
            const matchedEntry = val != null ? cfg.mappings.find((m) => m.value === val) : null;
            const key = matchedEntry ? val : null;
            countMap.set(key, (countMap.get(key) ?? 0) + 1);

            if (val != null && !labelMap.has(val)) {
                const recordLabel = cfg.fieldName === colorField
                    ? record.optionSetLabel
                    : record.optionSetLabels[cfg.fieldName] ?? "";
                if (recordLabel) {
                    labelMap.set(val, recordLabel);
                }
            }
        }

        const entries: StyleLegendEntry[] = [];
        for (const mapping of cfg.mappings) {
            const count = countMap.get(mapping.value) ?? 0;
            if (count > 0) {
                entries.push({
                    value: mapping.value,
                    shape: mapping.shape,
                    color: mapping.color ?? (hasColorField ? "#666666" : (colorMap.get(mapping.value) ?? DEFAULT_MARKER_COLOR)),
                    label: mapping.label ?? labelMap.get(mapping.value) ?? `Option ${mapping.value}`,
                    count,
                });
            }
        }

        const defaultCount = countMap.get(null) ?? 0;
        if (defaultCount > 0) {
            const def = cfg.default ?? { shape: "pin" as MarkerShape };
            entries.push({
                value: null,
                shape: def.shape,
                color: def.color ?? (hasColorField ? "#666666" : DEFAULT_MARKER_COLOR),
                label: "Autre",
                count: defaultCount,
            });
        }

        return entries;
    }, [baseFilteredRecords, markerStyleMapping, colorField, colorMap, hasColorField]);

    React.useEffect(() => {
        if (styleLegendEntries.length > 0) {
            setMappingActiveValues(new Set(styleLegendEntries.map((e) => e.value)));
        }
    }, [styleLegendEntries]);

    // mappingAllActive est dérivé — pas de state séparé à synchroniser
    const mappingAllActive = React.useMemo(
        () => mappingActiveValues.size === styleLegendEntries.length,
        [mappingActiveValues, styleLegendEntries]
    );

    // ── Filtrage étape 2 : appliquer les filtres de légende ──
    const filteredRecords = React.useMemo(() => {
        let result = baseFilteredRecords;

        if (hasColorField && !allFiltersActive) {
            result = result.filter(
                (r) => r.optionSetValue == null || activeFilters.has(r.optionSetValue)
            );
        }

        if (markerStyleMapping && !mappingAllActive) {
            const cfg = markerStyleMapping;
            result = result.filter((r) => {
                const val = getRecordMappingValue(r, cfg.fieldName, colorField);
                const matchedEntry = val != null ? cfg.mappings.find((m) => m.value === val) : null;
                const key = matchedEntry ? val : null;
                return mappingActiveValues.has(key);
            });
        }

        return result;
    }, [baseFilteredRecords, hasColorField, allFiltersActive, activeFilters, markerStyleMapping, mappingAllActive, mappingActiveValues, colorField]);

    // Mettre à jour les markers — dépendances explicites, pas de ref de rayon ici
    React.useEffect(() => {
        if (!apiLoaded || !mapRef.current) return;

        if (clustererRef.current) {
            clustererRef.current.clearMarkers();
        }
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        if (filteredRecords.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        const newMarkers: google.maps.Marker[] = [];

        for (const record of filteredRecords) {
            const position = { lat: record.lat, lng: record.lng };
            bounds.extend(position);

            let color: string;
            let markerIcon: google.maps.Icon;

            if (markerStyleMapping) {
                const shapeVal = getRecordMappingValue(record, markerStyleMapping.fieldName, colorField);
                const style = resolveMarkerStyle(markerStyleMapping, shapeVal, DEFAULT_MARKER_COLOR);

                if (hasColorField && record.optionSetValue != null) {
                    color = colorMap.get(record.optionSetValue) ?? DEFAULT_MARKER_COLOR;
                } else {
                    color = style.color;
                }
                markerIcon = createShapedMarkerIcon(style.shape, color);
            } else if (hasColorField && record.optionSetValue != null) {
                color = colorMap.get(record.optionSetValue) ?? DEFAULT_MARKER_COLOR;
                markerIcon = createShapedMarkerIcon((primaryMarkerShape as MarkerShape) ?? "pin", color);
            } else {
                color = DEFAULT_MARKER_COLOR;
                markerIcon = createShapedMarkerIcon((primaryMarkerShape as MarkerShape) ?? "pin", color);
            }

            const marker = new google.maps.Marker({
                position,
                title: record.title,
                icon: markerIcon,
                optimized: true,
            });

            marker.addListener("click", () => {
                if (!infoWindowRef.current || !mapRef.current) return;

                const content = buildInfoWindowContent(record, color, onNavigate);
                infoWindowRef.current.setContent(content);
                infoWindowRef.current.open(mapRef.current, marker);
            });

            newMarkers.push(marker);
        }

        markersRef.current = newMarkers;

        if (clustererRef.current) {
            clustererRef.current.clearMarkers();
            clustererRef.current.addMarkers(newMarkers);
        } else {
            clustererRef.current = new MarkerClusterer({
                map: mapRef.current,
                markers: newMarkers,
                renderer: {
                    render: ({ count, position }) => {
                        const size = Math.min(30 + Math.floor(count / 5) * 2, 56);
                        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#1565C0" fill-opacity="0.85" stroke="#fff" stroke-width="2"/>
                            <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dy=".35em" fill="#fff" font-size="${Math.max(12, size / 3)}px" font-family="Arial,sans-serif" font-weight="bold">${count}</text>
                        </svg>`;
                        return new google.maps.Marker({
                            position,
                            icon: {
                                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
                                scaledSize: new google.maps.Size(size, size),
                                anchor: new google.maps.Point(size / 2, size / 2),
                            },
                            label: { text: " ", color: "transparent" },
                            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
                        });
                    },
                },
            });
        }

        if (filteredRecords.length === 1) {
            mapRef.current.setCenter(bounds.getCenter());
            mapRef.current.setZoom(14);
        } else {
            mapRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
        }
    }, [apiLoaded, filteredRecords, colorMap, hasColorField, onNavigate, markerStyleMapping, colorField]);

    const handleLegendToggle = React.useCallback(
        (value: number) => { toggleSetValue(setActiveFilters, value); },
        []
    );

    const handleToggleAll = React.useCallback(() => {
        setAllOrNone(setActiveFilters, legendItems.map((i) => i.value), allFiltersActive);
    }, [allFiltersActive, legendItems]);

    const handleMappingToggle = React.useCallback(
        (value: number | null) => { toggleSetValue(setMappingActiveValues, value); },
        []
    );

    const handleMappingToggleAll = React.useCallback(() => {
        setAllOrNone(setMappingActiveValues, styleLegendEntries.map((e) => e.value), mappingAllActive);
    }, [mappingAllActive, styleLegendEntries]);

    const handleSimpleFilterChange = React.useCallback(
        (fieldName: string, value: string) => {
            setSimpleFilters((prev) => {
                const next = { ...prev };
                if (value === "__all__") {
                    delete next[fieldName];
                } else {
                    next[fieldName] = parseInt(value, 10);
                }
                return next;
            });
        },
        []
    );

    const handleLookupFilterChange = React.useCallback(
        (fieldName: string, value: string) => {
            setLookupFilters((prev) => {
                const next = { ...prev };
                if (value === "__all__") {
                    delete next[fieldName];
                } else {
                    next[fieldName] = value;
                }
                return next;
            });
        },
        []
    );

    const handleMultiFilterToggle = React.useCallback(
        (fieldName: string, value: number) => {
            setMultiFilters((prev) => {
                const current = prev[fieldName] ?? new Set<number>();
                const next = new Set(current);
                if (next.has(value)) {
                    next.delete(value);
                } else {
                    next.add(value);
                }
                return { ...prev, [fieldName]: next };
            });
        },
        []
    );

    const handleMultiFilterToggleAll = React.useCallback(
        (fieldName: string, allValues: number[], allChecked: boolean) => {
            setMultiFilters((prev) => {
                const next = allChecked ? new Set<number>() : new Set(allValues);
                return { ...prev, [fieldName]: next };
            });
        },
        []
    );

    const handleResetAllFilters = React.useCallback(() => {
        setSimpleFilters({});
        const resetMulti: Record<string, Set<number>> = {};
        for (const col of multiColumns) {
            const distinct = multiDistinctValues[col.fieldName] ?? [];
            resetMulti[col.fieldName] = new Set(distinct.map((d) => d.value));
        }
        setMultiFilters(resetMulti);
        setLookupFilters({});
    }, [multiColumns, multiDistinctValues]);

    if (apiError) {
        return (
            <div className="gmg-error">
                <div className="gmg-error-icon">{"\u26A0\uFE0F"}</div>
                <div className="gmg-error-text">{apiError}</div>
            </div>
        );
    }

    if (!apiLoaded) {
        return (
            <div className="gmg-loading">
                <div className="gmg-spinner" />
                <div>Chargement de Google Maps...</div>
            </div>
        );
    }

    const hasFilters = optionSetColumns.length > 0 || lookupColumns.length > 0;

    return (
        <div className="gmg-container" style={{ height: mapHeight > 0 ? `${mapHeight}px` : "100%" }}>
            <div className="gmg-toolbar">
                <div className="gmg-search">
                    <input
                        type="text"
                        className="gmg-search-input"
                        placeholder={"\uD83D\uDD0D Rechercher dans les enregistrements..."}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); }}
                    />
                    {searchQuery && (
                        <button
                            className="gmg-search-clear"
                            onClick={() => { setSearchQuery(""); }}
                            title="Effacer la recherche"
                        >
                            {"\u2715"}
                        </button>
                    )}
                </div>
                {hasFilters && (
                    <button
                        className={`gmg-filter-toggle ${filtersExpanded ? "expanded" : ""} ${activeFilterCount > 0 ? "has-active" : ""}`}
                        onClick={() => { setFiltersExpanded((prev) => !prev); }}
                        title={filtersExpanded ? "Masquer les filtres" : "Afficher les filtres"}
                    >
                        <span className="gmg-filter-icon">{"\u25BC"}</span>
                        Filtres
                        {activeFilterCount > 0 && (
                            <span className="gmg-filter-badge">{activeFilterCount}</span>
                        )}
                    </button>
                )}
                <div className="gmg-count">
                    {filteredRecords.length} / {records.length} enregistrement{records.length > 1 ? "s" : ""}
                </div>
            </div>

            {hasFilters && filtersExpanded && (
                <div className="gmg-filters">
                    {simpleColumns.length > 0 && (
                        <div className="gmg-filters-grid">
                            {simpleColumns.map((col) => {
                                const distinctValues = simpleDistinctValues[col.fieldName] ?? [];
                                if (distinctValues.length === 0) return null;
                                const currentValue = simpleFilters[col.fieldName];
                                return (
                                    <div key={col.fieldName} className="gmg-filter-item">
                                        <label className="gmg-filter-label">{col.displayName}</label>
                                        <select
                                            className="gmg-filter-select"
                                            value={currentValue != null ? currentValue.toString() : "__all__"}
                                            onChange={(e) => { handleSimpleFilterChange(col.fieldName, e.target.value); }}
                                        >
                                            <option value="__all__">Tous</option>
                                            {distinctValues.map((dv) => (
                                                <option key={dv.value} value={dv.value.toString()}>
                                                    {dv.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {lookupColumns.length > 0 && (
                        <div className="gmg-filters-grid">
                            {lookupColumns.map((col) => {
                                const distinctValues = lookupDistinctValues[col.fieldName] ?? [];
                                if (distinctValues.length === 0) return null;
                                const currentValue = lookupFilters[col.fieldName];
                                return (
                                    <div key={col.fieldName} className="gmg-filter-item">
                                        <label className="gmg-filter-label">{col.displayName}</label>
                                        <select
                                            className="gmg-filter-select"
                                            value={currentValue ?? "__all__"}
                                            onChange={(e) => { handleLookupFilterChange(col.fieldName, e.target.value); }}
                                        >
                                            <option value="__all__">Tous</option>
                                            {distinctValues.map((dv) => (
                                                <option key={dv.id} value={dv.id}>
                                                    {dv.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {multiColumns.length > 0 && (
                        <div className="gmg-multi-filters">
                            {multiColumns.map((col) => {
                                const distinctValues = multiDistinctValues[col.fieldName] ?? [];
                                if (distinctValues.length === 0) return null;
                                const checkedValues = multiFilters[col.fieldName] ?? new Set<number>();
                                const allChecked = checkedValues.size >= distinctValues.length;

                                return (
                                    <div key={col.fieldName} className="gmg-multi-filter-group">
                                        <div className="gmg-multi-filter-header">
                                            <span className="gmg-filter-label">{col.displayName}</span>
                                        </div>
                                        <div className="gmg-multi-filter-options">
                                            <label className="gmg-checkbox-item gmg-checkbox-all">
                                                <input
                                                    type="checkbox"
                                                    className="gmg-checkbox"
                                                    checked={allChecked}
                                                    onChange={() => {
                                                        handleMultiFilterToggleAll(
                                                            col.fieldName,
                                                            distinctValues.map((d) => d.value),
                                                            allChecked
                                                        );
                                                    }}
                                                />
                                                <span className="gmg-checkbox-label">
                                                    Tout {allChecked ? "d\u00E9s\u00E9lectionner" : "s\u00E9lectionner"}
                                                </span>
                                            </label>
                                            {distinctValues.map((dv) => (
                                                <label key={dv.value} className="gmg-checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        className="gmg-checkbox"
                                                        checked={checkedValues.has(dv.value)}
                                                        onChange={() => { handleMultiFilterToggle(col.fieldName, dv.value); }}
                                                    />
                                                    <span className="gmg-checkbox-label">
                                                        {dv.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeFilterCount > 0 && (
                        <button
                            className="gmg-filters-reset"
                            onClick={handleResetAllFilters}
                        >
                            {"\u2715"} Reinitialiser les filtres
                        </button>
                    )}
                </div>
            )}

            {hasColorField && legendItems.length > 0 && (
                <div className="gmg-legend">
                    <button
                        className={`gmg-legend-item gmg-legend-toggle-all ${allFiltersActive ? "active" : ""}`}
                        onClick={handleToggleAll}
                        title={allFiltersActive ? "Tout masquer" : "Tout afficher"}
                    >
                        Tous ({baseFilteredRecords.length})
                    </button>
                    {legendItems.map((item) => (
                        <button
                            key={item.value}
                            className={`gmg-legend-item ${activeFilters.has(item.value) ? "active" : "inactive"}`}
                            onClick={() => { handleLegendToggle(item.value); }}
                            title={`${item.label} (${item.count})`}
                        >
                            <span
                                className="gmg-legend-dot"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="gmg-legend-label">{item.label}</span>
                            <span className="gmg-legend-count">({item.count})</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="gmg-map" style={{ position: "relative" }}>
                <div ref={mapContainerRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
                {markerStyleMapping && styleLegendEntries.length > 0 && (
                    <MapLegend
                        entries={styleLegendEntries}
                        activeValues={mappingActiveValues}
                        allActive={mappingAllActive}
                        totalCount={baseFilteredRecords.length}
                        onToggle={handleMappingToggle}
                        onToggleAll={handleMappingToggleAll}
                    />
                )}
            </div>
        </div>
    );
};

function buildInfoWindowContent(
    record: MapRecord,
    color: string,
    onNavigate: (entityName: string, entityId: string) => void,
): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "gmg-infowindow";
    container.style.cssText = "min-width:280px;max-width:380px;font-family:Segoe UI,Arial,sans-serif;font-size:13px;padding:4px;";

    const title = document.createElement("div");
    title.style.cssText = `font-size:15px;font-weight:600;color:${color};cursor:pointer;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid ${color};`;
    title.textContent = record.title || "(Sans titre)";
    title.title = "Ouvrir la fiche";
    title.addEventListener("click", () => {
        onNavigate(record.entityName, record.entityId);
    });
    container.appendChild(title);

    for (const field of record.fields) {
        if (!field.value) continue;
        const row = document.createElement("div");
        row.style.cssText = "margin-bottom:4px;line-height:1.4;";

        const label = document.createElement("span");
        label.style.cssText = "color:#666;font-size:11px;display:block;";
        label.textContent = field.displayName;

        const value = document.createElement("span");
        value.style.cssText = "color:#333;";
        value.textContent = field.value;

        row.appendChild(label);
        row.appendChild(value);
        container.appendChild(row);
    }

    const link = document.createElement("div");
    link.style.cssText = "margin-top:8px;padding-top:6px;border-top:1px solid #eee;";
    const anchor = document.createElement("a");
    anchor.href = "#";
    anchor.style.cssText = `color:${color};text-decoration:none;font-size:12px;font-weight:500;`;
    anchor.textContent = "Ouvrir la fiche";
    anchor.addEventListener("click", (e) => {
        e.preventDefault();
        onNavigate(record.entityName, record.entityId);
    });
    link.appendChild(anchor);
    container.appendChild(link);

    return container;
}

export default MapComponent;