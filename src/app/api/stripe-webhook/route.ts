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

const row = (label: string, value: string) =>
    `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">${label}</td><td style="padding:8px;border:1px solid #ddd;">${value}</td></tr>`;

function buildEmailHtml(
    formType: string,
    formData: Record<string, string>,
    amount: number,
    mode: string,
    sessionId: string,
    paymentMethod?: string
): string {
    const amountStr = (amount / 100).toFixed(2) + '€';
    const modeStr = mode === 'subscription' ? 'Abonnement mensuel (50€/mois)' : 'Paiement unique';

    const titles: Record<string, string> = {
        parrainage: '🫶 Nouveau Parrainage — Paiement CB',
        puits: '💧 Nouveau Puits financé',
        don: '🎁 Nouveau Don',
        colis: '📦 Nouveau Colis alimentaire',
    };
    const title = titles[formType] || 'Nouveau Paiement';

    const email = formData.email || 'N/A';
    const fullName = `${formData.prenom || ''} ${formData.nom || ''}`.trim();
    const adresse = [formData.adresse, formData.codePostal, formData.ville].filter(Boolean).join(', ');

    const stripeDashboardUrl = `https://dashboard.stripe.com/payments/${sessionId}`;

    let rows = '';
    rows += row('Montant', amountStr);
    rows += row('Type', modeStr);
    if (paymentMethod) rows += row('Méthode de paiement', paymentMethod);
    if (formData.productName) rows += row('Produit', formData.productName);
    if (fullName) rows += row('Nom complet', fullName);
    rows += row('Email', `<a href="mailto:${email}">${email}</a>`);
    if (formData.telephone) rows += row('Téléphone', formData.telephone);
    if (adresse) rows += row('Adresse', adresse);
    if (formType === 'puits' && formData.beneficiaire) rows += row('Bénéficiaire (plaque)', formData.beneficiaire);
    rows += row('ID Stripe', `<a href="${stripeDashboardUrl}" target="_blank">${sessionId}</a>`);

    return `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
            <h2 style="color:#1a1a2e;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">${title}</h2>
            <p style="color:#16a34a;font-weight:bold;">&#9989; Paiement validé avec succès</p>
            <table style="border-collapse:collapse;width:100%;">
                ${rows}
            </table>
            <p style="margin-top:16px;">
                <a href="${stripeDashboardUrl}" style="background:#1a1a2e;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:14px;">
                    Voir dans le dashboard Stripe →
                </a>
            </p>
            <p style="color:#9ca3af;font-size:11px;margin-top:16px;">Email généré automatiquement après validation du paiement Stripe.</p>
        </div>
    `;
}

function buildRenewalEmailHtml(
    formType: string,
    formData: Record<string, string>,
    invoice: Stripe.Invoice
): string {
    const amount = invoice.amount_paid;
    const amountStr = (amount / 100).toFixed(2) + '€';
    const email = formData.email || (invoice as any).customer_email || 'N/A';
    const fullName = `${formData.prenom || ''} ${formData.nom || ''}`.trim();
    const invoiceUrl = invoice.hosted_invoice_url || '#';

    let rows = '';
    rows += row('Montant prélevé', amountStr);
    rows += row('Type', 'Renouvellement abonnement mensuel');
    rows += row('Parrain/Marraine', fullName || email);
    rows += row('Email', `<a href="mailto:${email}">${email}</a>`);
    if (formData.telephone) rows += row('Téléphone', formData.telephone);
    rows += row('N° Facture', invoice.id || 'N/A');

    return `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
            <h2 style="color:#1a1a2e;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">🔄 Renouvellement Parrainage</h2>
            <p style="color:#16a34a;font-weight:bold;">&#9989; Prélèvement mensuel effectué</p>
            <table style="border-collapse:collapse;width:100%;">
                ${rows}
            </table>
            <p style="margin-top:16px;">
                <a href="${invoiceUrl}" style="background:#1a1a2e;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:14px;">
                    Voir la facture →
                </a>
            </p>
            <p style="color:#9ca3af;font-size:11px;margin-top:16px;">Email généré automatiquement après renouvellement d'abonnement Stripe.</p>
        </div>
    `;
}

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json({ error: 'No signature' }, { status: 400 });
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // ─── Paiement initial (CB, PayPal, etc.) ───────────────────────────────
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log('checkout.session.completed:', session.id, '| payment_status:', session.payment_status);

            const metadata = session.metadata || {};
            const formType = metadata.formType || 'don';
            const formData: Record<string, string> = JSON.parse(metadata.formData || '{}');

            // Pour les abonnements, payment_status peut être 'no_payment_required'
            // si le paiement est déclenché via invoice → on envoie quand même l'email
            const isPaid = session.payment_status === 'paid' || session.mode === 'subscription';

            if (isPaid) {
                try {
                    const amount = session.amount_total || 0;
                    const mode = session.mode || 'payment';

                    // Récupérer la méthode de paiement utilisée (CB, PayPal…)
                    let paymentMethod: string | undefined;
                    if (session.payment_intent && typeof session.payment_intent === 'string') {
                        try {
                            const pi = await stripe.paymentIntents.retrieve(session.payment_intent, {
                                expand: ['payment_method'],
                            });
                            const pm = pi.payment_method as Stripe.PaymentMethod | null;
                            if (pm?.type === 'card') {
                                paymentMethod = `Carte bancaire (${pm.card?.brand?.toUpperCase() || 'CB'} •••• ${pm.card?.last4 || '????'})`;
                            } else if (pm?.type === 'paypal') {
                                paymentMethod = 'PayPal';
                            } else if (pm?.type) {
                                paymentMethod = pm.type;
                            }
                        } catch {
                            // Non bloquant si la récupération échoue
                        }
                    }

                    const html = buildEmailHtml(formType, formData, amount, mode, session.id, paymentMethod);

                    const donorName = `${formData.prenom || ''} ${formData.nom || ''}`.trim();
                    const subjectSuffix = donorName || session.customer_email || 'Anonyme';

                    await sendBrevoEmail(
                        `[${formType.toUpperCase()}] Paiement validé — ${subjectSuffix}`,
                        html
                    );
                    console.log('Email envoyé pour:', formType, session.id);
                } catch (emailError) {
                    console.error('Erreur envoi email:', emailError);
                }
            }
        }

        // ─── Renouvellement d'abonnement mensuel (parrainage) ──────────────────
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object as Stripe.Invoice;

            // Ne traiter que les renouvellements (pas la création initiale, déjà gérée ci-dessus)
            if ((invoice as any).billing_reason === 'subscription_cycle') {
                console.log('invoice.payment_succeeded (renewal):', invoice.id);

                try {
                    const subscriptionId = typeof invoice.subscription === 'string'
                        ? invoice.subscription
                        : invoice.subscription?.id;

                    let formData: Record<string, string> = {};
                    let formType = 'parrainage';

                    if (subscriptionId) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                        formType = subscription.metadata?.formType || 'parrainage';
                        formData = JSON.parse(subscription.metadata?.formData || '{}');
                    }

                    const html = buildRenewalEmailHtml(formType, formData, invoice);
                    const donorName = `${formData.prenom || ''} ${formData.nom || ''}`.trim();

                    await sendBrevoEmail(
                        `[PARRAINAGE] Renouvellement mensuel — ${donorName || invoice.id}`,
                        html
                    );
                    console.log('Email renouvellement envoyé:', invoice.id);
                } catch (emailError) {
                    console.error('Erreur email renouvellement:', emailError);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
