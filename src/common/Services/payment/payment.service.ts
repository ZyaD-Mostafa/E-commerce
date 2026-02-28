import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as string);
  }

  // create session checkout
  async checkOutSession({

    success_url = process.env.SUCCESS_URL as string,
    cancel_url = process.env.CANCEL_URL as string,
    mode = 'payment',
    discounts = [],
    metadata = {},
    line_items,
    customer_email
  }:Stripe.Checkout.SessionCreateParams) {
    const session = await this.stripe.checkout.sessions.create({
      customer_email,
      success_url,
      cancel_url,
      line_items,
      mode,
      discounts,
      metadata,
    });
    return session;
  }
}

