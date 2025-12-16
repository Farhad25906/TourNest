// payment.service.ts - UPDATED VERSION
import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";


const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as any;
      
      // Find and update the payment
      const payment = await prisma.payment.updateMany({
        where: {
          transactionId: paymentIntent.id,
          status: PaymentStatus.PENDING
        },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          gatewayResponse: paymentIntent
        }
      });

      // If this is for a subscription, activate it
      if (paymentIntent.metadata?.subscriptionId) {
        await prisma.subscription.update({
          where: {
            id: paymentIntent.metadata.subscriptionId
          },
          data: {
            status: 'ACTIVE'
          }
        });

        // Update host's tour limit
        const subscription = await prisma.subscription.findUnique({
          where: { id: paymentIntent.metadata.subscriptionId },
          include: { plan: true }
        });

        if (subscription) {
          await prisma.host.update({
            where: { id: subscription.hostId },
            data: {
              tourLimit: subscription.plan.tourLimit,
              currentTourCount: 0
            }
          });
        }
      }

      // If this is for a booking, update booking payment status
      if (paymentIntent.metadata?.bookingId) {
        await prisma.booking.update({
          where: {
            id: paymentIntent.metadata.bookingId
          },
          data: {
            paymentStatus: PaymentStatus.COMPLETED
          }
        });
      }

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as any;
      
      await prisma.payment.updateMany({
        where: {
          transactionId: paymentIntent.id
        },
        data: {
          status: PaymentStatus.FAILED,
          gatewayResponse: paymentIntent
        }
      });
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as any;

      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;
      const subscriptionId = session.metadata?.subscriptionId;

      // Update booking payment status if exists
      if (bookingId) {
        await prisma.booking.update({
          where: {
            id: bookingId
          },
          data: {
            paymentStatus: session.payment_status === "paid" ? PaymentStatus.COMPLETED : PaymentStatus.PENDING
          }
        });
      }

      // Update payment record if exists
      if (paymentId) {
        await prisma.payment.update({
          where: {
            id: paymentId
          },
          data: {
            status: session.payment_status === "paid" ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
            paymentGatewayData: session
          }
        });
      }

      // Activate subscription if exists
      if (subscriptionId) {
        await prisma.subscription.update({
          where: {
            id: subscriptionId
          },
          data: {
            status: 'ACTIVE'
          }
        });

        const subscription = await prisma.subscription.findUnique({
          where: { id: subscriptionId },
          include: { plan: true }
        });

        if (subscription) {
          await prisma.host.update({
            where: { id: subscription.hostId },
            data: {
              tourLimit: subscription.plan.tourLimit,
              currentTourCount: 0
            }
          });
        }
      }

      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};

export const PaymentService = {
  handleStripeWebhookEvent
}