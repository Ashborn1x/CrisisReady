import React, { useState } from 'react';
import { ScreenView, UserRole, Incident, ResponderUnit } from './types';
import { INITIAL_INCIDENTS, INITIAL_RESPONDERS } from './data/mockData';
import { TopAppBar } from './components/TopAppBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { CitizenMobileApp } from './components/CitizenMobileApp';
import { DispatcherDashboardScreen } from './screens/DispatcherDashboardScreen';
import { ResponderScreen } from './screens/ResponderScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { ResourceMapScreen } from './screens/ResourceMapScreen';
import { PersonnelScreen } from './screens/PersonnelScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StationDeskScreen } from './screens/StationDeskScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';

export function App() {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Application State
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [responderUnits, setResponderUnits] = useState<ResponderUnit[]>(INITIAL_RESPONDERS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('inc-8903');

  // Currently selected incident object
  const selectedIncident =
    incidents.find((inc) => inc.id === selectedIncidentId) || incidents[0] || null;

  // Active responder incident
  const responderActiveIncident =
    incidents.find((inc) => inc.status === 'responding' || inc.status === 'assigned') ||
    selectedIncident ||
    incidents[0] ||
    null;

  // Handlers
  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncidentId(incident.id);
  };

  const handleUpdateStatus = (incidentId: string, newStatus: Incident['status']) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
    );
  };

  const handleUpdateStage = (incidentId: string, stage: number) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const statusMap: Record<number, Incident['status']> = {
            1: 'assigned',
            2: 'responding',
            3: 'responding',
            4: 'resolved'
          };
          return {
            ...inc,
            stage,
            status: statusMap[stage] || inc.status
          };
        }
        return inc;
      })
    );
  };

  const handleDispatchUnit = (incidentId: string, unitId: string, unitName: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender: 'CAD Dispatch',
            senderType: 'dispatcher' as const,
            text: `Unit ${unitName} dispatched to scene.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          };
          return {
            ...inc,
            status: 'assigned',
            assignedUnitId: unitId,
            assignedUnitName: unitName,
            commsLog: [...inc.commsLog, newMsg]
          };
        }
        return inc;
      })
    );

    setResponderUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status: 'en_route' } : u))
    );
  };

  const handleAddCommsMessage = (incidentId: string, text: string) => {
    const senderRoleName =
      userRole === 'dispatcher'
        ? 'Dispatcher (CAD-042)'
        : userRole === 'station'
        ? 'Station Watch Desk'
        : userRole === 'admin'
        ? 'OEM Admin'
        : 'Citizen Caller';

    const senderType =
      userRole === 'dispatcher'
        ? ('dispatcher' as const)
        : userRole === 'user' || userRole === 'citizen'
        ? ('citizen' as const)
        : ('responder' as const);

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: senderRoleName,
      senderType,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    };

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            commsLog: [...inc.commsLog, newMsg]
          };
        }
        return inc;
      })
    );
  };

  const handleAddNote = (incidentId: string, note: string) => {
    handleAddCommsMessage(incidentId, `[Field SITREP]: ${note}`);
  };

  const handleSubmitNewReport = (newInc: Partial<Incident>) => {
    const fullIncident: Incident = {
      id: newInc.id || `inc-${Date.now()}`,
      code: newInc.code || `#INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newInc.title || 'Emergency Incident',
      type: newInc.type || 'medical',
      urgency: newInc.urgency || 'critical',
      status: 'pending',
      locationName: newInc.locationName || 'GPS Location Locked (34.0522° N, -118.2437° W)',
      lat: newInc.lat || 34.0522,
      lng: newInc.lng || -118.2437,
      timeAgo: 'Just now',
      timestamp: newInc.timestamp || '14:35 Local',
      reporterName: newInc.reporterName || 'Citizen Caller',
      reporterRole: newInc.reporterRole || 'Citizen',
      description: newInc.description || 'Emergency assistance requested via mobile app.',
      accuracy: '±4m (High Precision)',
      stage: 1,
      commsLog: newInc.commsLog || [
        {
          id: `msg-${Date.now()}`,
          sender: 'CAD Automated Intake',
          senderType: 'bot',
          text: 'Emergency SOS received. Dispatch operator notified. GPS telemetry locked.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }
      ]
    };

    setIncidents((prev) => [fullIncident, ...prev]);
    setSelectedIncidentId(fullIncident.id);
  };

  const handleUpdateUnitStatus = (unitId: string, status: ResponderUnit['status']) => {
    setResponderUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status } : u))
    );
  };

  // Get screen title
  const getScreenTitle = () => {
    if (userRole === 'user' || userRole === 'citizen') {
      return 'Citizen Emergency SOS (Mobile App)';
    }
    if (userRole === 'dispatcher') {
      return '911 CAD Command Dashboard';
    }
    if (userRole === 'station') {
      return 'Station Watch Desk';
    }
    return 'Executive Admin Hub';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fcf9f8] text-[#1b1c1c] font-sans antialiased">
      {/* Navigation Drawer for tablet/desktop */}
      <NavigationDrawer
        currentScreen={currentScreen}
        onNavigate={(scr) => {
          setCurrentScreen(scr);
          setIsDrawerOpen(false);
        }}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userRole={userRole}
        onRoleChange={(role) => {
          setUserRole(role);
          if (role === 'user' || role === 'citizen') setCurrentScreen('home');
          else if (role === 'dispatcher') setCurrentScreen('dispatcher_dashboard');
          else if (role === 'station') setCurrentScreen('station_portal');
          else setCurrentScreen('admin_dashboard');
        }}
        isOffline={isOffline}
        activeCriticalCount={
          incidents.filter((i) => i.urgency === 'critical' && i.status !== 'resolved').length
        }
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar with Mode Switcher */}
        <TopAppBar
          title={getScreenTitle()}
          customTitle={getScreenTitle()}
          onNavigate={(scr) => setCurrentScreen(scr)}
          onToggleDrawer={() => setIsDrawerOpen((v) => !v)}
          isOffline={isOffline}
          userRole={userRole}
          onRoleChange={(role) => {
            setUserRole(role);
            if (role === 'user' || role === 'citizen') setCurrentScreen('home');
            else if (role === 'dispatcher') setCurrentScreen('dispatcher_dashboard');
            else if (role === 'station') setCurrentScreen('station_portal');
            else setCurrentScreen('admin_dashboard');
          }}
          totalIncidents={incidents.length}
          activeCount={incidents.filter((i) => i.status !== 'resolved').length}
          criticalCount={
            incidents.filter((i) => i.urgency === 'critical' && i.status !== 'resolved').length
          }
          currentScreen={currentScreen}
          onBack={() => {
            if (userRole === 'user') setCurrentScreen('home');
            else setCurrentScreen('dispatcher_dashboard');
          }}
          showBack={false}
        />

        {/* CORE INTERFACE SWITCH */}
        <div className="flex-1 overflow-hidden flex flex-col relative bg-[#fcf9f8]">
          {/* 1. CITIZEN MOBILE APP UI */}
          {(userRole === 'user' || userRole === 'citizen') && (
            <CitizenMobileApp
              incidents={incidents}
              onSubmitReport={handleSubmitNewReport}
              onSelectIncident={handleSelectIncident}
              isOffline={isOffline}
              onToggleOffline={() => setIsOffline((v) => !v)}
              onAddCommsMessage={handleAddCommsMessage}
            />
          )}

          {/* 2. DISPATCHER CAD DASHBOARD */}
          {userRole === 'dispatcher' && (
            <DispatcherDashboardScreen
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={handleSelectIncident}
              onUpdateStatus={handleUpdateStatus}
              onDispatchUnit={handleDispatchUnit}
              onAddCommsMessage={handleAddCommsMessage}
              responderUnits={responderUnits}
              onNavigate={setCurrentScreen}
            />
          )}

          {/* 3. STATIONS VIEW (if opened from drawer) */}
          {userRole === 'station' && (
            <StationDeskScreen
              incidents={incidents}
              responderUnits={responderUnits}
              onNavigate={setCurrentScreen}
              onAddCommsMessage={handleAddCommsMessage}
              onUpdateUnitStatus={handleUpdateUnitStatus}
            />
          )}

          {/* 4. ADMIN VIEW (if opened from drawer) */}
          {userRole === 'admin' && (
            <AdminDashboardScreen
              incidents={incidents}
              responderUnits={responderUnits}
              onNavigate={setCurrentScreen}
              isOffline={isOffline}
              onToggleOffline={() => setIsOffline((v) => !v)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
