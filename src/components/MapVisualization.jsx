import React, { useState } from 'react';
import { Map, MapPin, Info } from 'lucide-react';

export default function MapVisualization({ activeCounty, onSelectCounty, projects }) {
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Group statistics by county for the map view
  const getCountyStats = (countyName) => {
    const countyProjects = projects.filter(p => p.county.toLowerCase() === countyName.toLowerCase());
    const totalBudget = countyProjects.reduce((acc, p) => acc + p.budget, 0);
    const queryCount = countyProjects.filter(p => p.oagOpinion === 'Adverse' || p.oagOpinion === 'Disclaimer').length;
    const queryRate = countyProjects.length ? Math.round((queryCount / countyProjects.length) * 100) : 0;
    
    return {
      count: countyProjects.length,
      budget: totalBudget,
      queryRate
    };
  };

  const counties = [
    {
      id: "Turkana",
      name: "Turkana County",
      color: "var(--color-qualified)",
      path: "M 80 50 L 150 40 L 170 120 L 110 140 Z",
      labelX: 120,
      labelY: 85
    },
    {
      id: "Kisumu",
      name: "Kisumu County",
      color: "var(--accent-secondary)",
      path: "M 40 160 L 90 150 L 80 190 L 50 180 Z",
      labelX: 65,
      labelY: 170
    },
    {
      id: "Kiambu",
      name: "Kiambu County",
      color: "var(--color-disclaimer)",
      path: "M 130 165 L 180 155 L 170 195 L 140 190 Z",
      labelX: 155,
      labelY: 175
    },
    {
      id: "Nairobi",
      name: "Nairobi County",
      color: "var(--accent-blue)",
      path: "M 148 188 A 12 12 0 1 1 148 212 A 12 12 0 1 1 148 188 Z",
      labelX: 148,
      labelY: 204
    },
    {
      id: "Mombasa",
      name: "Mombasa County",
      color: "var(--color-clean)",
      path: "M 230 250 L 280 230 L 290 270 L 250 280 Z",
      labelX: 260,
      labelY: 260
    }
  ];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15
    });
  };

  const formatBudget = (val) => {
    if (val >= 1e9) return `KES ${(val / 1e9).toFixed(2)} Billion`;
    if (val >= 1e6) return `KES ${(val / 1e6).toFixed(1)} Million`;
    return `KES ${val.toLocaleString()}`;
  };

  return (
    <div className="material-card" style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <Map size={18} style={{ color: 'var(--accent-secondary)' }} />
          <span style={styles.titleText}>Geospatial Accountability View</span>
        </div>
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: 'var(--color-clean)' }} />
            <span>Clean</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: 'var(--color-qualified)' }} />
            <span>Moderate Flags</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: 'var(--color-adverse)' }} />
            <span>Critical Queries</span>
          </div>
        </div>
      </div>

      <div style={styles.mapLayout} onMouseMove={handleMouseMove}>
        <svg viewBox="0 0 350 320" style={styles.svg}>
          <defs>
            <pattern id="grid-light" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 0, 0, 0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-light)" rx="10" />

          {/* Connective network nodes path */}
          <path d="M 120 85 L 65 170 L 148 204 L 260 260 M 155 175 L 148 204" fill="none" stroke="rgba(0, 188, 212, 0.08)" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Render active county paths */}
          {counties.map((c) => {
            const stats = getCountyStats(c.id);
            const isHovered = hoveredCounty && hoveredCounty.id === c.id;
            const isActive = activeCounty && activeCounty.toLowerCase() === c.id.toLowerCase();
            
            let pulseColor = 'var(--accent-blue)';
            if (stats.queryRate > 40) {
              pulseColor = 'var(--color-adverse)';
            } else if (stats.queryRate > 0) {
              pulseColor = 'var(--color-qualified)';
            } else if (stats.count > 0) {
              pulseColor = 'var(--color-clean)';
            }

            return (
              <g key={c.id}>
                {(isActive || isHovered) && (
                  <path 
                    d={c.path}
                    fill="none"
                    stroke={pulseColor}
                    strokeWidth="6"
                    opacity="0.15"
                    style={{ transition: 'all 0.4s ease' }}
                  />
                )}

                <path
                  d={c.path}
                  className={`map-county-path ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredCounty({ ...c, ...stats })}
                  onMouseLeave={() => setHoveredCounty(null)}
                  onClick={() => onSelectCounty(isActive ? '' : c.id)}
                />

                {stats.count > 0 && (
                  <circle
                    cx={c.labelX}
                    cy={c.labelY - 5}
                    r={isActive ? "6" : "4"}
                    fill={pulseColor}
                    style={{
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                      pointerEvents: 'none'
                    }}
                  />
                )}

                <text
                  x={c.labelX}
                  y={c.labelY + 16}
                  fill="var(--text-main)"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="'Outfit', var(--font-sans)"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', opacity: 0.8 }}
                >
                  {c.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip card */}
        {hoveredCounty && (
          <div 
            style={{ 
              ...styles.tooltip, 
              left: `${tooltipPos.x}px`, 
              top: `${tooltipPos.y}px` 
            }}
          >
            <div style={styles.tooltipHeader}>
              <MapPin size={13} style={{ color: hoveredCounty.color }} />
              <span style={styles.tooltipTitle}>{hoveredCounty.name}</span>
            </div>
            <div style={styles.tooltipBody}>
              <div style={styles.tooltipRow}>
                <span style={styles.tooltipLabel}>Projects:</span>
                <span style={styles.tooltipVal}>{hoveredCounty.count} active</span>
              </div>
              <div style={styles.tooltipRow}>
                <span style={styles.tooltipLabel}>Total Tracked:</span>
                <span style={{ ...styles.tooltipVal, color: 'var(--accent-blue)' }}>
                  {formatBudget(hoveredCounty.budget)}
                </span>
              </div>
              <div style={styles.tooltipRow}>
                <span style={styles.tooltipLabel}>Audit Flags:</span>
                <span style={{ 
                  ...styles.tooltipVal, 
                  color: hoveredCounty.queryRate > 40 ? 'var(--color-adverse)' : hoveredCounty.queryRate > 0 ? 'var(--color-qualified)' : 'var(--color-clean)' 
                }}>
                  {hoveredCounty.queryRate}% Rate
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={styles.footerNote}>
        Linked to OAG (Office of the Auditor General) Database for Kenya.
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: '380px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '12px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  titleText: {
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    fontSize: '0.95rem',
    color: 'var(--text-title)',
    letterSpacing: '0.01em',
  },
  legend: {
    display: 'flex',
    gap: '10px',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  legendDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  mapLayout: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(240, 242, 245, 0.5)',
    borderRadius: '10px',
    border: '1px solid var(--border-light)',
    overflow: 'hidden',
  },
  svg: {
    width: '100%',
    maxHeight: '310px',
  },
  tooltip: {
    position: 'absolute',
    background: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '10px',
    padding: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    width: '210px',
    zIndex: 50,
    pointerEvents: 'none',
  },
  tooltipHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: '1px solid var(--border-light)',
    paddingBottom: '6px',
    marginBottom: '6px',
  },
  tooltipTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    fontSize: '0.85rem',
    color: 'var(--text-title)',
  },
  tooltipBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  tooltipRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.72rem',
  },
  tooltipLabel: {
    color: 'var(--text-secondary)',
  },
  tooltipVal: {
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  footerNote: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    fontStyle: 'italic',
  }
};
