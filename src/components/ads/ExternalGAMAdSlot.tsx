import { useEffect } from 'react';
import { useAdConfig } from '@/hooks/useAdConfig';
import { ALLOW_LIVE_SERVING } from '@/lib/ads/constants';

export const ExternalGAMAdSlot = ({ networkId, adUnitId }: { networkId: string; adUnitId: string }) => {
  const { config, loading } = useAdConfig(networkId);

  useEffect(() => {
    if (loading || !config || !config.enabled || ALLOW_LIVE_SERVING || config.killSwitch) return;
    if (config.isTestMode) {
      console.log(`[Test Mode] GAM Ad Slot Rendered (ID: ${adUnitId})`);
    }
  }, [config, loading, adUnitId]);

  return <div id={adUnitId} className="external-gam-ad-slot" />;
};
