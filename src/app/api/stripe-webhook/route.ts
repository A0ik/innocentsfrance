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
    const email = formData.email || session.customer_email || 'N/A';

    let title = 'Nouveau paiement';
    if (formType === 'parrainage') title = 'Nouveau Parrainage (CB)';
    else if (formType === 'puits') title = 'Nouveau Puits financé';
    else if (formType === 'don') title = 'Nouveau Don';
    else if (formType === 'colis') title = 'Nouveau Colis alimentaire';

    const row = (label: string, value: string) =>
        `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${label}</td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`;

    let rows = '';
    rows += row('Montant', `${amount}€`);
    rows += row('Type', mode);

    if (formData.productName) {
        rows += row('Produit', formData.productName);
    }

    const fullName = `${formData.prenom || ''} ${formData.nom || ''}`.trim();
    if (fullName) {
        rows += row('Nom', fullName);
    }

    rows += row('Email', `<a href="mailto:${email}">${email}</a>`);

    if (formData.telephone) {
        rows += row('Téléphone', formData.telephone);
    }

    const adresse = [formData.adresse, formData.codePostal, formData.ville].filter(Boolean).join(', ');
    if (adresse) {
        rows += row('Adresse', adresse);
    }

    if (formType === 'puits' && formData.beneficiaire) {
        rows += row('Bénéficiaire (plaque)', formData.beneficiaire);
    }

    rows += row('ID Stripe', session.id);

    return `
        <h2 style="color: #1a1a2e;">${title}</h2>
        <p style="color: green; font-weight: bold;">&#9989; Paiement validé avec succès</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
            ${rows}
        </table>
        <p style="color: #888; font-size: 12px; margin-top: 16px;">Email généré automatiquement après validation du paiement Stripe.</p>
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

                    const donorName = `${formData.prenom || ''} ${formData.nom || ''}`.trim();
                    const subjectSuffix = donorName || session.customer_email || 'Anonyme';

                    await sendBrevoEmail(
                        `[${formType.toUpperCase()}] Paiement validé - ${subjectSuffix}`,
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
