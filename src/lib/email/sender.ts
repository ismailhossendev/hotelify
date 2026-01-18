import nodemailer from 'nodemailer';
import { SystemConfig } from '@/lib/db/models/SystemConfig';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions): Promise<boolean> {
    try {
        // Fetch SMTP config
        const configDoc = await SystemConfig.findOne({ key: 'platform_config' });
        const config = configDoc ? configDoc.value : {};

        // If SMTP is not configured, log and return (or throw?)
        if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
            console.warn('SMTP Settings not configured. Email to', to, 'subject', subject, 'was not sent.');
            console.warn('Content:', text);
            return false;
        }

        const transporter = nodemailer.createTransport({
            host: config.smtpHost,
            port: Number(config.smtpPort) || 587,
            secure: config.smtpSecure || false, // true for 465, false for other ports
            auth: {
                user: config.smtpUser,
                pass: config.smtpPass,
            },
        });

        // Send
        const info = await transporter.sendMail({
            from: config.smtpFrom || '"Hotelify" <no-reply@hotelify.com>',
            to,
            subject,
            text,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return true;

    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
