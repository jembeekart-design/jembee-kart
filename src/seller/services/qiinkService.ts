import axios, { AxiosInstance } from 'axios';

const QIINK_API_BASE_URL = process.env.NEXT_PUBLIC_QIINK_API_URL || 'https://api.qiink.io';
const QIINK_API_KEY = process.env.NEXT_PUBLIC_QIINK_API_KEY;

class QiinkService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: QIINK_API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${QIINK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async initializePayment(orderData: {
    orderId: string;
    amount: number;
    customerEmail: string;
    customerPhone: string;
    description: string;
  }) {
    try {
      const response = await this.client.post('/payments/initialize', orderData);
      return response.data;
    } catch (error) {
      throw new Error(`Qiink payment initialization failed: ${error}`);
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await this.client.get(`/payments/${reference}/verify`);
      return response.data;
    } catch (error) {
      throw new Error(`Qiink payment verification failed: ${error}`);
    }
  }

  async processPayout(sellerData: {
    sellerId: string;
    amount: number;
    bankAccount: string;
    bankCode: string;
  }) {
    try {
      const response = await this.client.post('/payouts/process', sellerData);
      return response.data;
    } catch (error) {
      throw new Error(`Qiink payout processing failed: ${error}`);
    }
  }

  async getTransactionHistory(sellerId: string, limit = 50) {
    try {
      const response = await this.client.get(
        `/sellers/${sellerId}/transactions?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Qiink transaction history: ${error}`);
    }
  }

  async getPayoutStatus(payoutId: string) {
    try {
      const response = await this.client.get(`/payouts/${payoutId}/status`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch payout status: ${error}`);
    }
  }
}

export const qiinkService = new QiinkService();
