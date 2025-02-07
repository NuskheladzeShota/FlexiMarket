import stripe from '../../utils/stripe'
// import { supabase } from '../utils/supabaseClient'
import { buffer } from 'micro'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      // const session = event.data.object
      // Update your database or perform other actions
      break
    // Handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
}