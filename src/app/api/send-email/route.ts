import { NextResponse } from 'next/server';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export async function POST(request: Request) {
    try {
        const { subject, html, attachments } = await request.json();

        if (!subject || !html) {
            return NextResponse.json(
                { error: 'subject et html sont requis' },
                { status: 400 }
            );
        }

        const payload: any = {
            sender: { name: 'Innocents France', email: 'association@innocentsfrance.org' },
            to: [{ email: 'contact@innocentsfrance.org', name: 'Innocents France' }],
            subject,
            htmlContent: html,
        };

        if (attachments && attachments.length > 0) {
            payload.attachment = attachments.map((att: any) => ({
                name: att.filename,
                content: att.content,
            }));
        }

        const response = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY || '',
                'content-type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Brevo error:', errorData);
            return NextResponse.json({ error: errorData }, { status: 400 });
        }

        const data = await response.json();
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'envoi de l\'email' },
            { status: 500 }
        );
    }
}
