import React, { useState } from 'react';
import ConnectionBanner from './ConnectionBanner';

export default function ConnectionBannerExample() {
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // Simulează o încercare de reconectare
    setTimeout(() => {
      if (retryCount >= 2) {
        setIsConnected(true);
      }
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setRetryCount(0);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleDisconnect}
          className="rounded-xl bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Simulate Disconnect
        </button>
        <button
          onClick={() => setIsConnected(true)}
          className="rounded-xl bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Simulate Connect
        </button>
      </div>

      <ConnectionBanner
        isVisible={!isConnected}
        onRetry={handleRetry}
        title="Not Connected"
        message="Connection not established."
        steps={[
          "Check your connection settings",
          "Verify network connectivity",
          "Try refreshing the page",
          "Contact support if issues persist"
        ]}
      />

      {isConnected && (
        <div className="rounded-2xl border border-green-200 bg-green-50/90 p-4 shadow-lg">
          <h3 className="font-semibold text-green-800">Connected!</h3>
          <p className="text-green-700">The application is now connected.</p>
        </div>
      )}
    </div>
  );
}
