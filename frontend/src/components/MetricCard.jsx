import React from 'react';

export default function MetricCard({ label, value, detail, badge, badgeType = 'blue' }) {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="metric-label">{label}</div>
        {badge && <span className={`badge badge-${badgeType}`}>{badge}</span>}
      </div>
      <div className="metric-value">{value}</div>
      {detail && <div className="metric-detail">{detail}</div>}
    </div>
  );
}
