import { NotificationTemplate } from '@/lib/db/models/NotificationTemplate';
import dbConnect from '@/lib/db/connect';

// Default Templates
const DEFAULT_TEMPLATES: Record<string, (data: any) => string> = {
    otp: (data: { name: string, otp: string }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }
    .header { background-color: #7c3aed; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
    .content { padding: 40px 30px; text-align: center; color: #333333; }
    .otp-box { background-color: #f3f4f6; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #7c3aed; margin: 30px 0; display: inline-block; border: 2px dashed #ddd6fe; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .text { line-height: 1.6; font-size: 16px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verification Code</h1>
    </div>
    <div class="content">
      <p class="text">Hello ${data.name},</p>
      <p class="text">Thank you for registering. Please use the verification code below to complete your sign-up process.</p>
      <div class="otp-box">${data.otp}</div>
      <p class="text">This code will expire in 10 minutes.</p>
      <p class="text" style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Hotelify. All rights reserved.
    </div>
  </div>
</body>
</html>
`,
    welcome: (data: { name: string }) => `
<h1>Welcome to Hotelify, ${data.name}!</h1>
<p>We are excited to have you on board.</p>
`
};

export const EmailService = {
    getTemplate: async (type: string, data: any) => {
        try {
            await dbConnect();
            const template = await NotificationTemplate.findOne({ type });

            if (template && template.htmlContent) {
                let html = template.htmlContent;
                // Replace variables {{key}} with data[key]
                Object.keys(data).forEach(key => {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    html = html.replace(regex, data[key]);
                });
                return html;
            }
        } catch (error) {
            console.error('Error fetching email template:', error);
        }

        // Fallback to default
        if (DEFAULT_TEMPLATES[type]) {
            return DEFAULT_TEMPLATES[type](data);
        }

        return `<p>Email content not found for type: ${type}</p>`;
    },

    getSubject: async (type: string, defaultSubject: string) => {
        try {
            await dbConnect();
            const template = await NotificationTemplate.findOne({ type });
            if (template && template.subject) return template.subject;
        } catch (error) {
            console.error('Error fetching email subject:', error);
        }
        return defaultSubject;
    }
};
