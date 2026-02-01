import { useState } from 'react';
import AgentDiscovery from './AgentDiscovery';
import ClaimPage from './Claim';
import LoadingScreen from './LoadingScreen';
import AdminPage from './AdminPage';

export default function App() {
  const [loading, setLoading] = useState(true);
  
  // Simple routing based on pathname
  const path = window.location.pathname;

  if (path === '/claim') {
    return <ClaimPage />;
  }

  if (path === '/admin') {
    return <AdminPage />;
  }

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <AgentDiscovery />
    </>
  );
}
