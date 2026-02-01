import { useState } from 'react';
import AgentDiscovery from './AgentDiscovery';
import ClaimPage from './Claim';
import LoadingScreen from './LoadingScreen';

export default function App() {
  const [loading, setLoading] = useState(true);
  
  // Simple routing based on pathname
  const path = window.location.pathname;

  if (path === '/claim') {
    return <ClaimPage />;
  }

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} duration={2500} />}
      <AgentDiscovery />
    </>
  );
}
