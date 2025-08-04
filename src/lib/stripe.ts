'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect } from "next/navigation";
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
})

// 50 credits per dollar

export async function createCheckoutSession(credits: number) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_creation: 'always',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${credits} Credits`,
          },
          unit_amount: Math.round((credits / 50) * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    client_reference_id: userId.toString(),
    metadata: {
      credits,
    },
  })

  return redirect(session.url!)
}

