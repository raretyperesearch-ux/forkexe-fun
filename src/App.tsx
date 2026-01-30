import AgentDiscovery from './AgentDiscovery';
import ClaimPage from './Claim';

export default function App() {
  // Simple routing based on pathname
  const path = window.location.pathname;

  if (path === '/claim') {
    return <ClaimPage />;
  }

  return <AgentDiscovery />;
}
