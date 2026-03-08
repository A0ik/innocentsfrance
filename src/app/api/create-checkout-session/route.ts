import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-02-24.acacia' as any,
});

export async function POST(request: Request) {
    try {
        const { email, amount, productName, mode, formType, formData, quantity } = await request.json();

        const isSubscription = mode === 'subscription';
        const qty = Math.max(1, parseInt(quantity) || 1);

        // ─── Identité client ────────────────────────────────────────────────────
        // On n'inclut customer_email que si l'email est réellement fourni
        // (une chaîne vide ferait échouer la validation Stripe)
        let customerParam: Record<string, string> = email
            ? { customer_email: email }
            : {};

        if (isSubscription && formData) {
            try {
                const customerCreateParams: Stripe.CustomerCreateParams = {};
                if (email) customerCreateParams.email = email;
                const fullName = [formData.prenom, formData.nom].filter(Boolean).join(' ');
                if (fullName) customerCreateParams.name = fullName;
                if (formData.telephone) customerCreateParams.phone = formData.telephone;
                customerCreateParams.metadata = { formType: formType || 'parrainage' };

                const customer = await stripe.customers.create(customerCreateParams);
                customerParam = { customer: customer.id } as any;
            } catch (err) {
                console.error('Customer creation failed, falling back to customer_email:', err);
                customerParam = email ? { customer_email: email } : {} as any;
            }
        }

        // ─── Paramètres de session ──────────────────────────────────────────────
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: productName || 'Don - Association Innocents France',
                            description: `Soutien pour : ${productName || 'Donation'}`,
                        },
                        unit_amount: amount || 5000,
                        ...(isSubscription && {
                            recurring: { interval: 'month' },
                        }),
                    },
                    quantity: qty,
                },
            ],
            mode: isSubscription ? 'subscription' : 'payment',
            success_url: `${request.headers.get('origin')}/?success=true`,
            cancel_url: `${request.headers.get('origin')}/?canceled=true`,
            ...customerParam,
            metadata: {
                formType: formType || 'don',
                formData: JSON.stringify(formData || {}),
            },
        };

        // Carte bancaire pour tous les modes (paiement unique et abonnement)
        sessionParams.payment_method_types = ['card'];

        if (isSubscription) {
            // Propager les métadonnées à l'abonnement pour les renouvellements
            sessionParams.subscription_data = {
                metadata: {
                    formType: formType || 'don',
                    formData: JSON.stringify(formData || {}),
                },
            };
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
