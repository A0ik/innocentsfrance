import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-02-24.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

async function sendBrevoEmail(subject: string, html: string) {
    const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY || '',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            sender: { name: 'Innocents France', email: 'association@innocentsfrance.org' },
            to: [{ email: 'contact@innocentsfrance.org', name: 'Innocents France' }],
            subject,
            htmlContent: html,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
    }

    return response.json();
}

function buildEmailHtml(formType: string, formData: any, session: Stripe.Checkout.Session): string {
    const amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : 'N/A';
    const mode = session.mode === 'subscription' ? 'Abonnement mensuel' : 'Paiement unique';

    let title = 'Nouveau paiement';
    if (formType === 'parrainage') title = 'Nouveau Parrainage (CB)';
    else if (formType === 'puits') title = 'Nouveau Puits financé';
    else if (formType === 'don') title = 'Nouveau Don';
    else if (formType === 'colis') title = 'Nouveau Colis alimentaire';

    let specificFields = '';
    if (formType === 'puits' && formData.beneficiaire) {
        specificFields = `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Bénéficiaire (plaque)</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.beneficiaire}</td></tr>`;
    }
    if (formData.productName) {
        specificFields += `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Produit</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.productName}</td></tr>`;
    }

    return `
        <h2>${title}</h2>
        <p style="color: green; font-weight: bold;">Paiement validé avec succès</p>
        <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Montant</td><td style="padding: 8px; border: 1px solid #ddd;">${amount}€</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Type</td><td style="padding: 8px; border: 1px solid #ddd;">${mode}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nom</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.prenom || ''} ${formData.nom || ''}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${formData.email || session.customer_email}">${formData.email || session.customer_email}</a></td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Téléphone</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.telephone || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Adresse</td><td style="padding: 8px; border: 1px solid #ddd;">${formData.adresse || ''}, ${formData.codePostal || ''} ${formData.ville || ''}</td></tr>
            ${specificFields}
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">ID Stripe</td><td style="padding: 8px; border: 1px solid #ddd;">${session.id}</td></tr>
        </table>
    `;
}

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

            const metadata = session.metadata || {};
            const formType = metadata.formType || 'don';
            const formData = JSON.parse(metadata.formData || '{}');

            // Send email only if payment succeeded
            if (session.payment_status === 'paid') {
                try {
                    const html = buildEmailHtml(formType, formData, session);

                    await sendBrevoEmail(
                        `[${formType.toUpperCase()}] Paiement validé - ${formData.prenom || ''} ${formData.nom || ''}`,
                        html
                    );

                    console.log('Email sent successfully for:', formType);
                } catch (emailError) {
                    console.error('Error sending email:', emailError);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
