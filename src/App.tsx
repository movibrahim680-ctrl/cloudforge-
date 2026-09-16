import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProject } from './context/ProjectContext';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

import { OverviewView } from './components/views/OverviewView';
import { ProjectsView } from './components/views/ProjectsView';
import { ServicesView } from './components/views/ServicesView';
import { ServiceDetailView } from './components/views/ServiceDetailView';
import { DeploymentsView } from './components/views/DeploymentsView';
import { DomainsView } from './components/views/DomainsView';
import { EnvVarsView } from './components/views/EnvVarsView';
import { UsageView } from './components/views/UsageView';
import { BillingView } from './components/views/BillingView';
import { ApiView } from './components/views/ApiView';
import { SettingsView } from './components/views/SettingsView';
import { CreateServiceWizard } from './components/views/CreateServiceWizard';

import { AuthModal } from './components/auth/AuthModal';
import { CreateProjectModal } from './components/projects/CreateProjectModal';
import { LandingPage } from './components/landing/LandingPage';
import { Service } from './types/cloudforge';

function MainDashboard() {
  const { isAuthenticated } = useAuth();
  const { refreshServices } = useProject();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(!isAuthenticated);

  if (showLanding && !isAuthenticated) {
    return (
      <LandingPage
        onOpenAuth={() => setIsAuthOpen(true)}
        onEnterDashboard={() => setShowLanding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Navbar */}
      <Navbar
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSelectedService(null);
          setIsWizardOpen(false);
          setShowLanding(false);
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedService(null);
            setIsWizardOpen(false);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-zinc-950">
          <div className="max-w-6xl mx-auto">
            {isWizardOpen ? (
              <CreateServiceWizard
                onComplete={() => {
                  setIsWizardOpen(false);
                  setActiveTab('services');
                }}
                onCancel={() => setIsWizardOpen(false)}
              />
            ) : selectedService ? (
              <ServiceDetailView
                service={selectedService}
                onBack={() => setSelectedService(null)}
                onRefresh={refreshServices}
              />
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewView
                    onNavigateTab={setActiveTab}
                    onOpenCreateProject={() => setIsCreateProjectOpen(true)}
                    onOpenCreateService={() => setIsWizardOpen(true)}
                  />
                )}

                {activeTab === 'projects' && (
                  <ProjectsView
                    onSelectProjectAndNavigate={() => setActiveTab('services')}
                    onOpenCreateProject={() => setIsCreateProjectOpen(true)}
                  />
                )}

                {activeTab === 'services' && (
                  <ServicesView
                    onOpenCreateService={() => setIsWizardOpen(true)}
                    onSelectService={(srv) => setSelectedService(srv)}
                  />
                )}

                {activeTab === 'deployments' && <DeploymentsView />}

                {activeTab === 'domains' && <DomainsView />}

                {activeTab === 'env' && <EnvVarsView />}

                {activeTab === 'usage' && <UsageView />}

                {activeTab === 'billing' && <BillingView />}

                {activeTab === 'api' && <ApiView />}

                {activeTab === 'settings' && <SettingsView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <MainDashboard />
      </ProjectProvider>
    </AuthProvider>
  );
}
