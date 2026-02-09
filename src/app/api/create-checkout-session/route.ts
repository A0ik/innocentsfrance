import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-02-24.acacia' as any, // Bypass strict version check to avoid build errors with latest SDK
});

export async function POST(request: Request) {
    try {
        const { email, name, amount, productName, mode, formType, formData } = await request.json();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: productName || 'Don - Association Innocents France',
                            description: `Soutien pour : ${productName || 'Donation'}`,
                        },
                        unit_amount: amount || 5000, // Default to 5000 (50€) if not provided
                        ...(mode === 'subscription' && {
                            recurring: {
                                interval: 'month',
                            },
                        }),
                    },
                    quantity: 1,
                },
            ],
            mode: mode || 'payment', // 'payment' (one-time) or 'subscription'
            success_url: `${request.headers.get('origin')}/?success=true`, // Redirects to Home or specific page
            cancel_url: `${request.headers.get('origin')}/?canceled=true`,
            customer_email: email,
            metadata: {
                formType: formType || 'don',
                formData: JSON.stringify(formData || {}),
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
