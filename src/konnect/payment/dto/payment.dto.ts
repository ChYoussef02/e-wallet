export interface PaymentDto {
  receiverWalletId: string;
  token: string;
  amount: number;
  type: string;
  description: string;
  acceptedPaymentMethods: string[];
  lifespan: number;
  checkoutForm: boolean;
  addPaymentFeesToAmount: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  orderId: string;
  webhook: string;
  silentWebhook: boolean;
  successUrl: string;
  failUrl: string;
  theme: string;
}

export interface PaymentResponseDto {
  payUrl: string;
  paymentRef: string;
}

export interface ErrorSource {
  field: string;
}

export interface ErrorDetail {
  code: string;
  target: string;
  message: string;
  source: ErrorSource;
}

export interface ErrorResponse {
  errors: ErrorDetail[];
}
