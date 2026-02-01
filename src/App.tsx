import { Analytics } from '@vercel/analytics/react';
import { Analytics } from '@vercel/analytics/react';
import { useState } from 'react';
import AgentDiscovery from './AgentDiscovery';
import ClaimPage from './Claim';
import LoadingScreen from './LoadingScreen';
import AdminPage from './AdminPage';
import VerifyPage from './VerifyPage';

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

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <AgentDiscovery /><Analytics />
    </>
  );
}
