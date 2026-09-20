import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import api from './services/api';

// Pages
import Dashboard from './pages/Dashboard';
import AddressTranslationPlayground from './pages/AddressTranslationPlayground';
import PagingSimulator from './pages/PagingSimulator';
import SegmentationSimulator from './pages/SegmentationSimulator';
import WorkloadGenerator from './pages/WorkloadGenerator';
import Comparison from './pages/Comparison';
import Experiments from './pages/Experiments';
import ResultsAnalytics from './pages/ResultsAnalytics';
import AlgorithmsTheory from './pages/AlgorithmsTheory';
import AboutProject from './pages/AboutProject';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  const checkBackend = async () => {
    try {
      await api.checkHealth();
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} backendStatus={backendStatus} />;
      case 'playground':
        return <AddressTranslationPlayground />;
      case 'paging':
        return <PagingSimulator />;
      case 'segmentation':
        return <SegmentationSimulator />;
      case 'workload':
        return <WorkloadGenerator />;
      case 'comparison':
        return <Comparison />;
      case 'experiments':
        return <Experiments setActivePage={setActivePage} />;
      case 'analytics':
        return <ResultsAnalytics />;
      case 'algorithms':
        return <AlgorithmsTheory />;
      case 'about':
        return <AboutProject />;
      default:
        return <Dashboard setActivePage={setActivePage} backendStatus={backendStatus} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        backendStatus={backendStatus} 
      />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}
