/**
 * Parse une coordonnée GPS en gérant les formats FR (virgule) et EN (point).
 */
export function parseCoordinate(value: unknown): number | null {
    if (value == null || value === "") return null;

    if (typeof value === "number") {
        return isFinite(value) ? value : null;
    }

    let str = `${value as string | number}`.trim();

    if (str.includes(",") && str.includes(".")) {
        str = str.replace(/,/g, "");
    } else if (str.includes(",")) {
        str = str.replace(",", ".");
    }

    const num = parseFloat(str);
    if (isNaN(num) || !isFinite(num)) return null;

    return num;
}

/**
 * Palette de couleurs distinctes pour les markers.
 */
export const COLOR_PALETTE: string[] = [
    "#E53935", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA",
    "#00ACC1", "#F4511E", "#3949AB", "#7CB342", "#D81B60",
    "#6D4C41", "#546E7A", "#C0CA33", "#26A69A", "#AB47BC",
];

export const DEFAULT_MARKER_COLOR = "#E53935";

/**
 * Génère un SVG de marker pin avec une couleur donnée.
 * Utilisé en interne comme shape par défaut.
 */
function createMarkerIcon(color: string, scale = 1): google.maps.Icon {
    const width = Math.round(28 * scale);
    const height = Math.round(40 * scale);
    const cx = Math.round(14 * scale);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 28 40">
        <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="14" cy="14" r="5" fill="#ffffff" opacity="0.9"/>
    </svg>`;

    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(width, height),
        anchor: new google.maps.Point(cx, height),
    };
}

/** Available marker shapes */
export type MarkerShape = "pin" | "diamond" | "circle" | "square" | "star" | "store" | "building" | "person" | "question" | "target" | "distributor" | "truck" | "wrench";

/**
 * Creates a marker icon with a specific shape and color.
 */
export function createShapedMarkerIcon(
    shape: MarkerShape,
    color: string,
    scale = 1,
): google.maps.Icon {
    switch (shape) {
        case "diamond":
            return createDiamondIcon(color, scale);
        case "circle":
            return createCircleIcon(color, scale);
        case "square":
            return createSquareIcon(color, scale);
        case "star":
            return createStarIcon(color, scale);
        case "store":
            return createStoreIcon(color, scale);
        case "building":
            return createBuildingIcon(color, scale);
        case "person":
            return createPersonIcon(color, scale);
        case "question":
            return createQuestionIcon(color, scale);
        case "target":
            return createTargetIcon(color, scale);
        case "distributor":
            return createDistributorIcon(color, scale);
        case "truck":
            return createTruckIcon(color, scale);
        case "wrench":
            return createWrenchIcon(color, scale);
        default:
            return createMarkerIcon(color, scale);
    }
}

function createDistributorIcon(color: string, scale: number): google.maps.Icon {
    const w = Math.round(28 * scale);
    const h = Math.round(36 * scale);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 28 36">
        <!-- Poignée du diable -->
        <path d="M10 4 L10 22" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M10 4 L14 4" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Plateau -->
        <path d="M8 22 L20 22" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Carton bas -->
        <rect x="11" y="14" width="9" height="8" rx="0.8" fill="${color}" stroke="#ffffff" stroke-width="1"/>
        <!-- Carton haut -->
        <rect x="11" y="6" width="9" height="8" rx="0.8" fill="${color}" stroke="#ffffff" stroke-width="1"/>
        <!-- Ligne séparation cartons -->
        <line x1="15.5" y1="6" x2="15.5" y2="22" stroke="#ffffff" stroke-width="0.8" opacity="0.7"/>
        <!-- Roue -->
        <circle cx="9" cy="28" r="3.5" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
        <circle cx="9" cy="28" r="1.2" fill="#ffffff"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(w, h),
        anchor: new google.maps.Point(w / 2, h),
    };
}

function createTruckIcon(color: string, scale: number): google.maps.Icon {
    const w = Math.round(34 * scale);
    const h = Math.round(28 * scale);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 34 28">
        <!-- Remorque -->
        <rect x="1" y="4" width="20" height="14" rx="1.5" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
        <!-- Cabine -->
        <path d="M21 8 L28 8 L31 14 L31 18 L21 18 Z" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
        <!-- Pare-brise -->
        <path d="M23 8.5 L27 8.5 L29.5 13 L23 13 Z" fill="#ffffff" opacity="0.85"/>
        <!-- Châssis -->
        <rect x="1" y="18" width="30" height="2.5" rx="0.5" fill="${color}" stroke="#ffffff" stroke-width="0.8"/>
        <!-- Roue arrière -->
        <circle cx="8" cy="23" r="3.5" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
        <circle cx="8" cy="23" r="1.3" fill="#ffffff"/>
        <!-- Roue avant -->
        <circle cx="27" cy="23" r="3.5" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
        <circle cx="27" cy="23" r="1.3" fill="#ffffff"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(w, h),
        anchor: new google.maps.Point(w / 2, h),
    };
}

function createWrenchIcon(color: string, scale: number): google.maps.Icon {
    const size = Math.round(30 * scale);
    const half = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 30 30">
        <!-- Fond cercle -->
        <circle cx="15" cy="15" r="13.5" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
        <!-- Manche -->
        <rect x="13" y="10" width="4" height="14" rx="1" fill="#ffffff" opacity="0.9"/>
        <!-- Tête ouverte -->
        <path d="M10 5 L13 10 L17 10 L20 5 L18 4 L15.5 8 L14.5 8 L12 4 Z" fill="#ffffff" opacity="0.9"/>
        <!-- Bout du manche -->
        <rect x="12.5" y="22" width="5" height="3" rx="1" fill="#ffffff" opacity="0.9"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(half, half),
    };
}

function createTargetIcon(color: string, scale: number): google.maps.Icon {
    const size = Math.round(30 * scale);
    const half = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r="13" fill="none" stroke="${color}" stroke-width="2.5"/>
        <circle cx="15" cy="15" r="8" fill="none" stroke="${color}" stroke-width="2"/>
        <circle cx="15" cy="15" r="3" fill="${color}"/>
        <line x1="15" y1="0" x2="15" y2="6" stroke="${color}" stroke-width="1.5"/>
        <line x1="15" y1="24" x2="15" y2="30" stroke="${color}" stroke-width="1.5"/>
        <line x1="0" y1="15" x2="6" y2="15" stroke="${color}" stroke-width="1.5"/>
        <line x1="24" y1="15" x2="30" y2="15" stroke="${color}" stroke-width="1.5"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(half, half),
    };
}

function createDiamondIcon(color: string, scale: number): google.maps.Icon {
    const size = Math.round(32 * scale);
    const half = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
        <polygon points="16,1 31,16 16,31 1,16" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="4" fill="#ffffff" opacity="0.9"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(half, half),
    };
}

function createCircleIcon(color: string, scale: number): google.maps.Icon {
    const size = Math.round(28 * scale);
    const half = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="12.5" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="14" cy="14" r="4" fill="#ffffff" opacity="0.9"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(half, half),
    };
}

function createSquareIcon(color: string, scale: number): google.maps.Icon {
    const size = Math.round(26 * scale);
    const half = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 26 26">
        <rect x="1" y="1" width="24" height="24" rx="3" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
        <circle cx="13" cy="13" r="4" fill="#ffffff" opacity="0.9"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(half, half),
    };
}

function createStarIcon(color: string, scale: number): google.maps.Icon {
    const size = Math.round(32 * scale);
    const half = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
        <polygon points="16,1 20.5,11 31,12.5 23,20 25,31 16,26 7,31 9,20 1,12.5 11.5,11" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(half, half),
    };
}

function createStoreIcon(color: string, scale: number): google.maps.Icon {
    const w = Math.round(32 * scale);
    const h = Math.round(32 * scale);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 32 32">
        <rect x="4" y="14" width="24" height="14" rx="1" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
        <polygon points="2,14 16,4 30,14" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
        <rect x="12" y="19" width="8" height="9" rx="0.5" fill="#ffffff" opacity="0.85"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(w, h),
        anchor: new google.maps.Point(w / 2, h),
    };
}

function createBuildingIcon(color: string, scale: number): google.maps.Icon {
    const w = Math.round(28 * scale);
    const h = Math.round(36 * scale);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 28 36">
        <rect x="4" y="4" width="20" height="32" rx="1.5" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
        <rect x="8" y="8" width="4" height="4" rx="0.5" fill="#ffffff" opacity="0.85"/>
        <rect x="16" y="8" width="4" height="4" rx="0.5" fill="#ffffff" opacity="0.85"/>
        <rect x="8" y="15" width="4" height="4" rx="0.5" fill="#ffffff" opacity="0.85"/>
        <rect x="16" y="15" width="4" height="4" rx="0.5" fill="#ffffff" opacity="0.85"/>
        <rect x="8" y="22" width="4" height="4" rx="0.5" fill="#ffffff" opacity="0.85"/>
        <rect x="16" y="22" width="4" height="4" rx="0.5" fill="#ffffff" opacity="0.85"/>
        <rect x="11" y="28" width="6" height="8" rx="0.5" fill="#ffffff" opacity="0.9"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(w, h),
        anchor: new google.maps.Point(w / 2, h),
    };
}

function createPersonIcon(color: string, scale: number): google.maps.Icon {
    const w = Math.round(28 * scale);
    const h = Math.round(36 * scale);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 28 36">
        <circle cx="14" cy="10" r="6" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
        <path d="M4 32 C4 22 24 22 24 32 L24 36 L4 36 Z" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(w, h),
        anchor: new google.maps.Point(w / 2, h),
    };
}

function createQuestionIcon(color: string, scale: number): google.maps.Icon {
    const size = Math.round(32 * scale);
    const half = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14.5" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
        <text x="16" y="22" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="20" fill="#ffffff">?</text>
    </svg>`;
    return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(size, size),
        anchor: new google.maps.Point(half, half),
    };
}

/**
 * Charge l'API Google Maps JS dynamiquement (une seule fois par page).
 */
let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsApi(apiKey: string): Promise<void> {
    if (loadPromise) return loadPromise;

    if (typeof google !== "undefined" && google.maps) {
        loadPromise = Promise.resolve();
        return loadPromise;
    }

    loadPromise = new Promise<void>((resolve, reject) => {
        const callbackName = "__gmapsCallback_" + Date.now().toString();
        const win = window as unknown as Record<string, unknown>;
        win[callbackName] = () => {
            delete win[callbackName];
            resolve();
        };

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&libraries=marker`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            loadPromise = null;
            delete win[callbackName];
            reject(new Error("Echec du chargement de l'API Google Maps. Verifiez votre cle API."));
        };
        document.head.appendChild(script);
    });

    return loadPromise;
}

export type OptionSetType = "simple" | "multi";

export interface OptionSetColumnInfo {
    fieldName: string;
    displayName: string;
    type: OptionSetType;
}

export interface LookupColumnInfo {
    fieldName: string;
    displayName: string;
}

export interface LookupDistinctValue {
    id: string;
    label: string;
    count: number;
}

export interface OptionSetDistinctValue {
    value: number;
    label: string;
    count: number;
}

export interface MapRecord {
    id: string;
    entityName: string;
    entityId: string;
    lat: number;
    lng: number;
    title: string;
    optionSetValue: number | null;
    optionSetLabel: string;
    /** Valeurs des optionsets simples : fieldName → valeur unique */
    optionSetValues: Record<string, number | null>;
    optionSetLabels: Record<string, string>;
    /** Valeurs des optionsets multi-select : fieldName → tableau de valeurs */
    multiSelectValues: Record<string, number[]>;
    multiSelectLabels: Record<string, string[]>;
    /** Valeurs des lookups : fieldName → formattedValue (pas GUID) */
    lookupValues: Record<string, string | null>;
    lookupLabels: Record<string, string>;
    fields: { displayName: string; value: string }[];
}

export interface LegendItem {
    value: number;
    label: string;
    color: string;
    count: number;
}

export function buildColorMap(
    records: MapRecord[],
    d365Colors?: Map<number, string>
): Map<number, string> {
    const colorMap = new Map<number, string>();
    let colorIndex = 0;

    for (const record of records) {
        if (record.optionSetValue != null && !colorMap.has(record.optionSetValue)) {
            const d365Color = d365Colors?.get(record.optionSetValue);
            if (d365Color) {
                colorMap.set(record.optionSetValue, d365Color);
            } else {
                colorMap.set(record.optionSetValue, COLOR_PALETTE[colorIndex % COLOR_PALETTE.length]);
                colorIndex++;
            }
        }
    }

    return colorMap;
}

export function buildLegendItems(records: MapRecord[], colorMap: Map<number, string>): LegendItem[] {
    const countMap = new Map<number, { label: string; count: number }>();

    for (const record of records) {
        if (record.optionSetValue != null) {
            const existing = countMap.get(record.optionSetValue);
            if (existing) {
                existing.count++;
            } else {
                countMap.set(record.optionSetValue, {
                    label: record.optionSetLabel ?? `Option ${record.optionSetValue}`,
                    count: 1,
                });
            }
        }
    }

    const items: LegendItem[] = [];
    countMap.forEach((data, value) => {
        items.push({
            value,
            label: data.label,
            color: colorMap.get(value) ?? DEFAULT_MARKER_COLOR,
            count: data.count,
        });
    });

    items.sort((a, b) => a.label.localeCompare(b.label));
    return items;
}

export function getDistinctOptionSetValues(
    records: MapRecord[],
    fieldName: string
): OptionSetDistinctValue[] {
    const countMap = new Map<number, { label: string; count: number }>();

    for (const record of records) {
        const val = record.optionSetValues[fieldName];
        if (val != null) {
            const existing = countMap.get(val);
            if (existing) {
                existing.count++;
            } else {
                countMap.set(val, {
                    label: record.optionSetLabels[fieldName] ?? `Option ${val}`,
                    count: 1,
                });
            }
        }
    }

    const items: OptionSetDistinctValue[] = [];
    countMap.forEach((data, value) => {
        items.push({ value, label: data.label, count: data.count });
    });

    items.sort((a, b) => a.label.localeCompare(b.label));
    return items;
}

export function getDistinctMultiSelectValues(
    records: MapRecord[],
    fieldName: string
): OptionSetDistinctValue[] {
    const countMap = new Map<number, { label: string; count: number }>();

    for (const record of records) {
        const values = record.multiSelectValues[fieldName];
        const labels = record.multiSelectLabels[fieldName];
        if (!values || values.length === 0) continue;

        for (let i = 0; i < values.length; i++) {
            const val = values[i];
            const label = labels?.[i] ?? `Option ${val}`;
            const existing = countMap.get(val);
            if (existing) {
                existing.count++;
            } else {
                countMap.set(val, { label, count: 1 });
            }
        }
    }

    const items: OptionSetDistinctValue[] = [];
    countMap.forEach((data, value) => {
        items.push({ value, label: data.label, count: data.count });
    });

    items.sort((a, b) => a.label.localeCompare(b.label));
    return items;
}

export function getDistinctLookupValues(
    records: MapRecord[],
    fieldName: string
): LookupDistinctValue[] {
    const countMap = new Map<string, { label: string; count: number }>();

    for (const record of records) {
        const id = record.lookupValues[fieldName];
        if (id != null) {
            const existing = countMap.get(id);
            if (existing) {
                existing.count++;
            } else {
                countMap.set(id, {
                    label: record.lookupLabels[fieldName] ?? id,
                    count: 1,
                });
            }
        }
    }

    const items: LookupDistinctValue[] = [];
    countMap.forEach((data, id) => {
        items.push({ id, label: data.label, count: data.count });
    });

    items.sort((a, b) => a.label.localeCompare(b.label));
    return items;
}

/**
 * Parse une valeur multi-select Dataverse (ex: "1,3,5" ou "1;3;5") en tableau de nombres.
 */
export function parseMultiSelectValue(value: unknown): number[] {
    if (value == null || value === "") return [];

    const str = typeof value === "string" ? value : `${value as number}`;
    const parts = str.includes(";") ? str.split(";") : str.split(",");
    const result: number[] = [];

    for (const part of parts) {
        const num = parseInt(part.trim(), 10);
        if (!isNaN(num)) {
            result.push(num);
        }
    }

    return result;
}

/**
 * Parse un label multi-select formaté (ex: "Client; Prospect") en tableau de strings.
 */
export function parseMultiSelectLabel(value: string): string[] {
    if (!value) return [];
    return value.split(";").map((s) => s.trim()).filter((s) => s.length > 0);
}

// ── Marker Style Mapping ──

export interface MarkerStyleMappingEntry {
    value: number;
    shape: MarkerShape;
    color?: string;
    label?: string;
}

export interface MarkerStyleMappingConfig {
    fieldName: string;
    mappings: MarkerStyleMappingEntry[];
    default?: { shape: MarkerShape; color?: string };
}

export function parseMarkerStyleMapping(raw: string | null): MarkerStyleMappingConfig | null {
    if (!raw?.trim()) return null;
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
        const obj = parsed as Record<string, unknown>;
        if (typeof obj.fieldName !== "string" || !Array.isArray(obj.mappings)) return null;
        return parsed as MarkerStyleMappingConfig;
    } catch {
        console.warn("[GoogleMapsGrid] Failed to parse MarkerStyleMapping JSON:", raw);
        return null;
    }
}

export function resolveMarkerStyle(
    config: MarkerStyleMappingConfig,
    optionSetValue: number | null,
    fallbackColor: string,
): { shape: MarkerShape; color: string } {
    if (optionSetValue != null) {
        const entry = config.mappings.find((m) => m.value === optionSetValue);
        if (entry) {
            return { shape: entry.shape, color: entry.color ?? fallbackColor };
        }
    }
    const def = config.default ?? { shape: "pin" };
    return { shape: def.shape, color: def.color ?? fallbackColor };
}

export function getRecordMappingValue(
    record: MapRecord,
    fieldName: string,
    colorField: string,
): number | null {
    if (fieldName === colorField) {
        return record.optionSetValue;
    }
    return record.optionSetValues[fieldName] ?? null;
}

/** Create a mini SVG string for legend display */
export function createMiniShapeSvg(shape: MarkerShape, color: string, size = 16): string {
    switch (shape) {
        case "diamond":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><polygon points="16,1 31,16 16,31 1,16" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
        case "circle":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12.5" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
        case "square":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 26 26"><rect x="1" y="1" width="24" height="24" rx="3" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
        case "star":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><polygon points="16,1 20.5,11 31,12.5 23,20 25,31 16,26 7,31 9,20 1,12.5 11.5,11" fill="${color}" stroke="#fff" stroke-width="1.5"/></svg>`;
        case "store":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><rect x="4" y="14" width="24" height="14" rx="1" fill="${color}"/><polygon points="2,14 16,4 30,14" fill="${color}" stroke="#fff" stroke-width="1.5"/></svg>`;
        case "building":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 36"><rect x="4" y="4" width="20" height="32" rx="1.5" fill="${color}" stroke="#fff" stroke-width="1.5"/></svg>`;
        case "person":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 36"><circle cx="14" cy="10" r="6" fill="${color}" stroke="#fff" stroke-width="1.5"/><path d="M4 32 C4 22 24 22 24 32 L24 36 L4 36 Z" fill="${color}" stroke="#fff" stroke-width="1.5"/></svg>`;
        case "question":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14.5" fill="${color}" stroke="#fff" stroke-width="1.5"/><text x="16" y="22" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="20" fill="#fff">?</text></svg>`;
        case "target":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="none" stroke="${color}" stroke-width="2.5"/><circle cx="15" cy="15" r="8" fill="none" stroke="${color}" stroke-width="2"/><circle cx="15" cy="15" r="3" fill="${color}"/></svg>`;
        case "distributor":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 36"><path d="M10 4 L10 22" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><path d="M10 4 L14 4" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><path d="M8 22 L20 22" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/><rect x="11" y="14" width="9" height="8" rx="0.8" fill="${color}" stroke="#fff" stroke-width="1"/><rect x="11" y="6" width="9" height="8" rx="0.8" fill="${color}" stroke="#fff" stroke-width="1"/><circle cx="9" cy="28" r="3.5" fill="${color}" stroke="#fff" stroke-width="1.2"/><circle cx="9" cy="28" r="1.2" fill="#fff"/></svg>`;
        case "truck":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 34 28"><rect x="1" y="4" width="20" height="14" rx="1.5" fill="${color}" stroke="#fff" stroke-width="1.2"/><path d="M21 8 L28 8 L31 14 L31 18 L21 18 Z" fill="${color}" stroke="#fff" stroke-width="1.2"/><path d="M23 8.5 L27 8.5 L29.5 13 L23 13 Z" fill="#fff" opacity="0.85"/><rect x="1" y="18" width="30" height="2.5" rx="0.5" fill="${color}"/><circle cx="8" cy="23" r="3.5" fill="${color}" stroke="#fff" stroke-width="1.2"/><circle cx="8" cy="23" r="1.3" fill="#fff"/><circle cx="27" cy="23" r="3.5" fill="${color}" stroke="#fff" stroke-width="1.2"/><circle cx="27" cy="23" r="1.3" fill="#fff"/></svg>`;
        case "wrench":
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13.5" fill="${color}" stroke="#fff" stroke-width="1.5"/><rect x="13" y="10" width="4" height="14" rx="1" fill="#fff" opacity="0.9"/><path d="M10 5 L13 10 L17 10 L20 5 L18 4 L15.5 8 L14.5 8 L12 4 Z" fill="#fff" opacity="0.9"/><rect x="12.5" y="22" width="5" height="3" rx="1" fill="#fff" opacity="0.9"/></svg>`;
        default: // pin
            return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.4)}" viewBox="0 0 28 40"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
    }
}