import { useEffect } from 'react';
import { useAdConfig } from '@/hooks/useAdConfig';
import { ALLOW_LIVE_SERVING } from '@/lib/ads/constants';

export const ExternalAdSenseAuto = ({ networkId }: { networkId: string }) => {
  const { config, loading } = useAdConfig(networkId);

  useEffect(() => {
    if (loading || !config || !config.enabled || ALLOW_LIVE_SERVING || config.killSwitch) return;
    if (config.isTestMode) {
      console.log(`[Test Mode] AdSense Auto Initialized (Test Placeholder)`);
      return;
    }
  }, [config, loading]);

  return null;
};
