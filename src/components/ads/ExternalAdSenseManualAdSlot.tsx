import { useEffect } from 'react';
import { useAdConfig } from '@/hooks/useAdConfig';
import { ALLOW_LIVE_SERVING } from '@/lib/ads/constants';

export const ExternalAdSenseManualAdSlot = ({ networkId }: { networkId: string }) => {
  const { config, loading } = useAdConfig(networkId);

  useEffect(() => {
    if (loading || !config || !config.enabled || ALLOW_LIVE_SERVING || config.killSwitch) return;
    if (config.isTestMode) {
      console.log(`[Test Mode] AdSense Manual Slot Rendered`);
    }
  }, [config, loading]);

  return <div className="external-adsense-ad-slot" />;
};
