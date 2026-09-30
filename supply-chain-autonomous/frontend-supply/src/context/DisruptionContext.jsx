import React, { createContext, useContext, useState, useEffect } from 'react';
import { disruptionsApi, notificationsApi } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

const DisruptionContext = createContext();

export const DisruptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeDisruptions, setActiveDisruptions] = useState([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [currentAgentStep, setCurrentAgentStep] = useState(null);
  const [agentStepLogs, setAgentStepLogs] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(2);

  // Load initial disruptions and listen for socket events
  useEffect(() => {
    const isAuthRoute =
      typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register'));

    if (!isAuthRoute || user) {
      loadDisruptions();
    }

    // Listen to real-time events
    socketService.on('agent:step', (stepData) => {
      setCurrentAgentStep(stepData);
      setAgentStepLogs((prev) => {
        const filtered = prev.filter((p) => p.step !== stepData.step);
        return [...filtered, stepData].sort((a, b) => a.step - b.step);
      });
    });

    socketService.on('demo:disruption_triggered', ({ disruption }) => {
      showToast({
        title: '🚨 CRITICAL DISRUPTION DETECTED',
        message: disruption.title,
        type: 'critical',
      });
      loadDisruptions();
    });

    socketService.on('dashboard:update', (payload) => {
      loadDisruptions();
      if (payload.type === 'DECISION_APPROVED') {
        showToast({
          title: '✅ RECOVERY DISPATCHED',
          message: 'Human approval confirmed. Logistics reroute initiated.',
          type: 'success',
        });
      }
    });

    return () => {
      socketService.off('agent:step');
      socketService.off('demo:disruption_triggered');
      socketService.off('dashboard:update');
    };
  }, []);

  const loadDisruptions = async () => {
    try {
      const res = await disruptionsApi.getAll();
      if (res.data?.success) {
        setActiveDisruptions(res.data.data.filter((d) => d.status === 'ACTIVE'));
      }
    } catch (e) {
      // Ignore initial offline error
    }
  };

  const showToast = (toast) => {
    setToastMessage(toast);
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const triggerDemoDisruption = async () => {
    setIsDemoRunning(true);
    setAgentStepLogs([]);
    setCurrentAgentStep({ step: 1, name: 'Disruption Ingestion', detail: 'Triggering simulated emergency telemetry...', status: 'IN_PROGRESS' });

    showToast({
      title: '⚡ SIMULATION TRIGGERED',
      message: 'Simulating Chakan Industrial Grid Outage & Initiating Autonomous Response Pipeline...',
      type: 'warning',
    });

    try {
      const res = await disruptionsApi.triggerDemo();
      if (res.data?.success) {
        loadDisruptions();
        showToast({
          title: '🤖 AI RECOVERY PLAN GENERATED',
          message: 'SupplyChain Guardian evaluated 6 options. Human approval ticket created.',
          type: 'info',
        });
      }
    } catch (err) {
      showToast({
        title: 'Simulation Error',
        message: err.response?.data?.error || err.message,
        type: 'critical',
      });
    } finally {
      setIsDemoRunning(false);
    }
  };

  return (
    <DisruptionContext.Provider
      value={{
        activeDisruptions,
        isDemoRunning,
        currentAgentStep,
        agentStepLogs,
        toastMessage,
        unreadNotificationCount,
        setUnreadNotificationCount,
        triggerDemoDisruption,
        showToast,
        loadDisruptions,
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'critical' ? '#881337' : toastMessage.type === 'warning' ? '#78350f' : '#064e3b',
            color: '#ffffff',
            padding: '1rem 1.4rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: '420px',
            animation: 'modalIn 0.3s ease',
          }}
        >
          <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{toastMessage.title}</span>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{toastMessage.message}</div>
        </div>
      )}
    </DisruptionContext.Provider>
  );
};

export const useDisruption = () => useContext(DisruptionContext);
