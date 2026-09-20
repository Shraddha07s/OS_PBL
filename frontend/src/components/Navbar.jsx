import React from 'react';
import { 
  Layers, 
  Cpu, 
  PlayCircle, 
  Compass, 
  Scale, 
  FlaskConical, 
  BarChart3, 
  BookOpen, 
  Info,
  Server
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, backendStatus }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'playground', label: 'Translation Playground', icon: Compass },
    { id: 'paging', label: 'Paging Simulator', icon: Cpu },
    { id: 'segmentation', label: 'Segmentation Simulator', icon: PlayCircle },
    { id: 'workload', label: 'Workload Generator', icon: FlaskConical },
    { id: 'comparison', label: 'Comparison', icon: Scale },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'analytics', label: 'Results & Analytics', icon: BarChart3 },
    { id: 'algorithms', label: 'Algorithms & Theory', icon: BookOpen },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <header className="navbar">
      <div className="nav-topbar">
        <div className="brand-section">
          <Layers size={22} color="#2563eb" />
          <div>
            <span className="brand-title">Memory Management Simulator</span>
            <span className="brand-subtitle" style={{ marginLeft: '8px' }}>Paging vs Segmentation</span>
          </div>
        </div>

        <div className="nav-badges">
          <span className="badge badge-blue">OS Course Project</span>
          <span className="badge badge-blue">Group 3</span>
          {backendStatus === 'online' ? (
            <span className="badge badge-green" title="Backend API connected">
              <Server size={12} /> Backend Online
            </span>
          ) : backendStatus === 'checking' ? (
            <span className="badge badge-amber">Checking API...</span>
          ) : (
            <span className="badge badge-red" title="FastAPI not responding on port 8000">
              Backend Offline
            </span>
          )}
        </div>
      </div>

      <nav className="nav-links-bar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
