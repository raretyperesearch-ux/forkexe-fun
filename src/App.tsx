import { Analytics } from '@vercel/analytics/react';
import { useState } from 'react';
import AgentDiscovery from './AgentDiscovery';
import ClaimPage from './Claim';
import LoadingScreen from './LoadingScreen';
import AdminPage from './AdminPage';
import VerifyPage from './VerifyPage';
import AgentServiceVerify from './AgentServiceVerify';
import AgentServiceDashboard from './AgentServiceDashboard';

export default function App() {
  const [loading, setLoading] = useState(true);
  
  const path = window.location.pathname;
  
  if (path === '/claim') {
    return <ClaimPage />;
  }
  if (path === '/admin') {
    return <AdminPage />;
  }
  if (path === '/verify') {
    return <VerifyPage />;
  }
  if (path === '/agent-service/verify') {
    return <AgentServiceVerify />;
  }
  if (path === '/dashboard') {
    return <AgentServiceDashboard />;
  }
  
  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <AgentDiscovery /><Analytics />
    </>
  );
}
