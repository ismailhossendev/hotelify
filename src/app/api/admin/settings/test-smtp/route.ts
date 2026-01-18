import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getCurrentUser } from '@/lib/auth/token';

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        // Allow super_admin only
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure } = body;

        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
            return NextResponse.json({ error: 'Missing SMTP configuration fields' }, { status: 400 });
        }

        // Create Transporter
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: smtpSecure, // true 465, false others usually
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // Verify connection
        try {
            await transporter.verify();
            return NextResponse.json({ success: true, message: 'SMTP Connection Successful' });
        } catch (smtpError: any) {
            console.error('SMTP Verify Error:', smtpError);
            return NextResponse.json({
                success: false,
                error: smtpError.message || 'Connection failed'
            });
        }

    } catch (error) {
        console.error('Test SMTP Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
