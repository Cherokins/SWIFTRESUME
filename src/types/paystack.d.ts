declare module '@paystack/inline-js' {
  export interface PaystackTransactionResult {
    id?: number;
    reference: string;
    message?: string;
  }

  export interface PaystackNewTransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (transaction: PaystackTransactionResult) => void;
    onCancel?: () => void;
    onError?: (error: { message?: string }) => void;
    onLoad?: (data: unknown) => void;
  }

  export default class PaystackPop {
    newTransaction(options: PaystackNewTransactionOptions): unknown;
    resumeTransaction(
      accessCode: string,
      callbacks?: Pick<
        PaystackNewTransactionOptions,
        'onSuccess' | 'onCancel' | 'onError' | 'onLoad'
      >
    ): unknown;
  }
}
