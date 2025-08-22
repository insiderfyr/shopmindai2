import React from 'react';
import { WifiOff, RefreshCw, ExternalLink } from 'lucide-react';

interface ConnectionBannerProps {
  isVisible?: boolean;
  onRetry?: () => void;
  title?: string;
  message?: string;
  steps?: string[];
  extensionUrl?: string;
}

export default function ConnectionBanner({
  isVisible = true,
  onRetry,
  title = "Not Connected",
  message = "The application isn't connected to any external service.",
  steps = [
    "Open your application",
    "Check your connection settings",
    "Make sure the service is active",
    "Click refresh below"
  ],
  extensionUrl
}: ConnectionBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-stretch px-2 transition-all duration-300 ease-out pointer-events-auto h-auto scale-100 opacity-100 blur-none justify-end origin-bottom-right">
      <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-4 shadow-lg backdrop-blur">
        <div className="mb-3 flex items-center gap-3">
          <WifiOff className="size-5 text-[#4d8eff]" aria-hidden="true" />
          <h3 className="font-semibold text-blue-800">{title}</h3>
        </div>
        
        <div className="space-y-3 text-blue-700 text-sm">
          <p>{message}</p>
          
          <div className="space-y-2">
            <p className="font-medium">To connect:</p>
            <ol className="list-inside list-decimal space-y-1 pl-2 text-xs">
              {steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          
          <button
            type="button"
            onClick={onRetry}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4d8eff] px-3 py-2 font-medium text-sm text-white transition-colors hover:bg-[#3a6cd9]"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Retry Connection
          </button>
          
          {extensionUrl && (
            <div className="border-blue-200 border-t pt-2">
              <a
                href={extensionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4d8eff] text-xs hover:text-[#3a6cd9] hover:underline flex items-center gap-1"
              >
                Get Extension <ExternalLink className="size-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
