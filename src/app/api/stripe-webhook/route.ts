import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-02-24.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json({ error: 'No signature' }, { status: 400 });
        }

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log('Payment successful:', session.id);

            // Extract metadata
            const metadata = session.metadata || {};
            const formType = metadata.formType;

            // Prepare payload for N8N
            const n8nPayload = {
                sessionId: session.id,
                email: session.customer_email,
                amount: session.amount_total,
                paymentStatus: session.payment_status,
                formType: formType,
                ...JSON.parse(metadata.formData || '{}')
            };

            // Send to appropriate N8N webhook based on form type
            let n8nWebhookUrl = '';
            
            if (formType === 'puits') {
                n8nWebhookUrl = `${process.env.NEXT_PUBLIC_N8N_BASE_URL}/webhook/puits-stripe`;
            } else if (formType === 'don') {
                n8nWebhookUrl = `${process.env.NEXT_PUBLIC_N8N_BASE_URL}/webhook/don-stripe`;
            } else if (formType === 'colis') {
                n8nWebhookUrl = `${process.env.NEXT_PUBLIC_N8N_BASE_URL}/webhook/colis-stripe`;
            }

            // Send to N8N only if payment succeeded
            if (n8nWebhookUrl && session.payment_status === 'paid') {
                try {
                    const n8nResponse = await fetch(n8nWebhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(n8nPayload),
                    });

                    if (!n8nResponse.ok) {
                        console.error('N8N webhook failed:', await n8nResponse.text());
                    } else {
                        console.log('Successfully sent to N8N:', formType);
                    }
                } catch (n8nError) {
                    console.error('Error sending to N8N:', n8nError);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
