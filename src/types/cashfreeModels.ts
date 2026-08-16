export interface CashfreeSettings {
  enabled: boolean;
  sandboxMode: boolean;
  appId: string;
  secretKey: string;
  webhookSecret: string;
  paymentGatewayName: string;
  autoSettlement: boolean;
}
