import React, { useState } from 'react';
import { ShieldCheck, Database, FileSpreadsheet, RefreshCw, Layers } from 'lucide-react';
import { mockProjects } from './data/mockProjects';
import StatsGrid from './components/StatsGrid';
import MapVisualization from './components/MapVisualization';
import Filters from './components/Filters';
import ProjectCard from './components/ProjectCard';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import Sidebar from './components/Sidebar';

export default function App() {
  const [projects, setProjects] = useState(mockProjects);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedOpinion, setSelectedOpinion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Selected project for modal deep-dive
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCounty('');
    setSelectedSector('');
    setSelectedOpinion('');
    setSelectedStatus('');
  };

  // Add a new citizen report to a specific project dynamically
  const handleAddCitizenReport = (projectId, newReport) => {
    setProjects(prevProjects => {
      const updated = prevProjects.map(p => {
        if (p.id === projectId) {
          const updatedReports = [newReport, ...p.citizenReports];
          // Recalculate average progress based on citizen ground reports if we want,
          // or just add it to the feed. Let's add it to the feed.
          return {
            ...p,
            citizenReports: updatedReports
          };
        }
        return p;
      });

      // Also update the active modal detail view if currently open
      const matched = updated.find(p => p.id === projectId);
      if (matched && selectedProject && selectedProject.id === projectId) {
        setSelectedProject(matched);
      }

      return updated;
    });
  };

  // Filter project database dynamically
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.implementationAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ward.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCounty = selectedCounty === '' || p.county.toLowerCase() === selectedCounty.toLowerCase();
    const matchesSector = selectedSector === '' || p.sector.toLowerCase() === selectedSector.toLowerCase();
    const matchesOpinion = selectedOpinion === '' || p.oagOpinion.toLowerCase() === selectedOpinion.toLowerCase();
    const matchesStatus = selectedStatus === '' || p.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCounty && matchesSector && matchesOpinion && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      <Sidebar activeSection={activeSection} onSelect={setActiveSection} />

      {/* ── Main Panel (shifted right of sidebar) ── */}
      <div className="material-main-panel">

        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="topbar-brand-title">WaziGov</h1>
              <p className="topbar-brand-sub">Public Finance Transparency &amp; Accountability</p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="status-pill">
              <span className="status-dot" />
              <Database size={13} />
              <span>System Active</span>
            </div>
            <a
              href="/WaziGov Final Proposal (7).pdf"
              target="_blank"
              className="btn-proposal"
            >
              <FileSpreadsheet size={14} />
              View Proposal
            </a>
          </div>
        </header>

        {/* Stats Cards Row */}
        <section>
          <StatsGrid projects={filteredProjects} />
        </section>

        {/* Main interactive directory workspace */}
        <main style={styles.mainGrid}>

          {/* Left: Filters + Project List */}
          <section style={styles.leftCol}>

            <Filters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCounty={selectedCounty}
              setSelectedCounty={setSelectedCounty}
              selectedSector={selectedSector}
              setSelectedSector={setSelectedSector}
              selectedOpinion={selectedOpinion}
              setSelectedOpinion={setSelectedOpinion}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              onReset={handleResetFilters}
            />

            {/* Results count */}
            <div style={styles.resultsHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} style={{ color: 'var(--accent-secondary)' }} />
                <span style={styles.resultsCount}>
                  Showing {filteredProjects.length} of {projects.length} Audited Projects
                </span>
              </div>
              {selectedCounty && (
                <span className="badge badge-clean" style={{ textTransform: 'capitalize' }}>
                  Filtered: {selectedCounty} County
                </span>
              )}
            </div>

            {filteredProjects.length > 0 ? (
              <div style={styles.projectGrid}>
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={setSelectedProject}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={styles.emptyState}>
                <RefreshCw size={44} style={styles.emptyIcon} />
                <h3 style={styles.emptyTitle}>No matching audit profiles found</h3>
                <p style={styles.emptyDesc}>Try expanding your filter parameters or search terms to find public projects.</p>
                <button className="btn-primary" style={{ marginTop: '12px' }} onClick={handleResetFilters}>
                  Reset Search Directory
                </button>
              </div>
            )}

          </section>

          {/* Right: Interactive Map */}
          <section style={styles.rightCol}>
            <MapVisualization
              activeCounty={selectedCounty}
              onSelectCounty={setSelectedCounty}
              projects={projects}
            />
          </section>

        </main>

        {/* Modal overlay */}
        {selectedProject && (
          <ProjectDetailsModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onAddCitizenReport={handleAddCitizenReport}
          />
        )}

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-brand">WaziGov Dashboard v1.0.0</div>
          <div className="footer-motto">
            "Transforming Read-Only government data into Read-Write accountability."
          </div>
          <div className="footer-credits">
            Designed for Public Audit Integration by Joseph Kariuki, Daniel Mwangi, Giovanni Opiyo (Group 0147)
          </div>
        </footer>

      </div>{/* end material-main-panel */}
    </div>
  );
}

const styles = {
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 0.75fr',
    gap: '24px',
    alignItems: 'start',
    width: '100%',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightCol: {
    position: 'sticky',
    top: '24px',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 4px',
  },
  resultsCount: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: '20px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    textAlign: 'center',
  },
  emptyIcon: {
    color: 'var(--text-muted)',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    fontSize: '1.1rem',
    color: 'var(--text-title)',
  },
  emptyDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    maxWidth: '300px',
    marginTop: '6px',
    lineHeight: '1.4',
  },
};
