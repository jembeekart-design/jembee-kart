// src/lib/admin-config/mlmTypes.ts

export interface MLMPageConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
}

export interface CashbackConfig {
  enabled: boolean;

  minimumTransfer: number;

  transferFunction: string;

  pageTitle: string;
  pageSubtitle: string;

  searchPlaceholder: string;

  wallets: {
    main: string;
    commission: string;
    reward: string;
    cashback: string;
  };

  buttons: {
    transfer: string;
    history: string;
    confirm: string;
    cancel: string;
  };

  filters: string[];

  transactionTypes: string[];

  statusTypes: string[];
}

export interface MLMPages {
  affiliate: MLMPageConfig;
  dashboard: MLMPageConfig;
  earnings: MLMPageConfig;
  cashback: MLMPageConfig;
  watchEarn: MLMPageConfig;
  notifications: MLMPageConfig;
}

export interface MLMConfig {
  enabled: boolean;

  pages: MLMPages;

  cashback: CashbackConfig;
}
