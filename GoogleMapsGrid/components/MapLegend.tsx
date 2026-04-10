import * as React from "react";
import { createMiniShapeSvg, MarkerShape } from "../utils/mapUtils";

export interface StyleLegendEntry {
    value: number | null; // null = default/unmatched
    shape: MarkerShape;
    color: string;
    label: string;
    count: number;
}

export interface MapLegendProps {
    entries: StyleLegendEntry[];
    activeValues: Set<number | null>;
    allActive: boolean;
    totalCount: number;
    onToggle: (value: number | null) => void;
    onToggleAll: () => void;
}

const MapLegend: React.FC<MapLegendProps> = ({
    entries,
    activeValues,
    allActive,
    totalCount,
    onToggle,
    onToggleAll,
}) => {
    const [collapsed, setCollapsed] = React.useState(false);

    if (entries.length === 0) return null;

    return (
        <div
            style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                zIndex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: "12px",
                maxWidth: "220px",
                overflow: "hidden",
                userSelect: "none",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    borderBottom: collapsed ? "none" : "1px solid #e0e0e0",
                    cursor: "pointer",
                }}
                onClick={() => { setCollapsed((prev) => !prev); }}
            >
                <span style={{ fontWeight: 600, color: "#333" }}>
                    L&eacute;gende
                </span>
                <span
                    style={{
                        fontSize: "10px",
                        color: "#999",
                        transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        display: "inline-block",
                    }}
                >
                    &#9660;
                </span>
            </div>

            {/* Body */}
            {!collapsed && (
                <div style={{ padding: "4px 0" }}>
                    {/* Tous */}
                    <button
                        onClick={onToggleAll}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            width: "100%",
                            padding: "4px 10px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: allActive ? 600 : 400,
                            color: allActive ? "#333" : "#999",
                            textAlign: "left",
                        }}
                        title={allActive ? "Tout masquer" : "Tout afficher"}
                    >
                        <span
                            style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "3px",
                                border: "2px solid #666",
                                backgroundColor: allActive ? "#666" : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            {allActive && (
                                <span style={{ color: "#fff", fontSize: "10px", fontWeight: 700 }}>&#10003;</span>
                            )}
                        </span>
                        <span>Tous ({totalCount})</span>
                    </button>

                    {/* Entries */}
                    {entries.map((entry) => {
                        const isActive = activeValues.has(entry.value);
                        const svgHtml = createMiniShapeSvg(entry.shape, entry.color, 16);
                        return (
                            <button
                                key={entry.value ?? "__default__"}
                                onClick={() => { onToggle(entry.value); }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    width: "100%",
                                    padding: "4px 10px",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    color: isActive ? "#333" : "#bbb",
                                    opacity: isActive ? 1 : 0.5,
                                    textAlign: "left",
                                    transition: "opacity 0.2s",
                                }}
                                title={`${entry.label} (${entry.count})`}
                            >
                                <span
                                    style={{ width: "16px", height: "16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                                    dangerouslySetInnerHTML={{ __html: svgHtml }}
                                />
                                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {entry.label}
                                </span>
                                <span style={{ color: "#999", fontSize: "11px", flexShrink: 0 }}>
                                    ({entry.count})
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MapLegend;