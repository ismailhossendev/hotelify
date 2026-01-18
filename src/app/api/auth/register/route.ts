import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { signToken, setAuthCookie } from '@/lib/auth/token';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(11, 'Invalid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['vendor_admin', 'guest']).default('guest'), // Only allow self-registration for these roles
});

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { name, email, password, role } = validation.data;
        let { phone } = validation.data;

        // Normalize Bangladeshi Phone Number
        // Remove non-digits
        const cleanedPhone = phone.replace(/\D/g, '');

        // Check for common formats: 01xxxxxxxxx (11 digits) or 8801xxxxxxxxx (13 digits)
        if (cleanedPhone.length === 11 && cleanedPhone.startsWith('01')) {
            phone = `88${cleanedPhone}`;
        } else if (cleanedPhone.length === 13 && cleanedPhone.startsWith('8801')) {
            phone = cleanedPhone;
        }
        // If it doesn't match these strict BD formats but passed Zod min(11), we keep it as is (could be international or other format)
        // But user explicitly requested standardization for this format.

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or phone already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Fetch System Config for OTP Logic
        const { SystemConfig } = await import('@/lib/db/models/SystemConfig');
        const configDoc = await SystemConfig.findOne({ key: 'platform_config' });
        const config = configDoc ? configDoc.value : {};

        // Determine if OTP is mandatory
        // Vendors (vendor_admin) -> ALWAYS Mandatory
        // Customers/Guests -> Depends on customerOtpMandatory setting (default true)
        const isVendor = role === 'vendor_admin';
        const customerOtpMandatory = config.customerOtpMandatory !== false; // Default true if undefined
        const canSkipVerification = !isVendor && !customerOtpMandatory;

        // Create user
        const user = await User.create({
            profile: { name },
            email: email?.toLowerCase(),
            phone,
            passwordHash,
            role,
            isActive: true,
            isVerified: false,
            otp,
            otpExpires
        });

        // Send OTP Email
        if (email) {
            const { sendEmail } = await import('@/lib/email/sender');
            const { EmailService } = await import('@/lib/email/service'); // Use new service

            const emailHtml = await EmailService.getTemplate('otp', { name, otp });
            const emailSubject = await EmailService.getSubject('otp', 'Verify your account');

            await sendEmail({
                to: email,
                subject: emailSubject,
                html: emailHtml
            });
        }

        return NextResponse.json({
            success: true,
            requiresVerification: true,
            canSkipVerification,
            userId: user._id,
            message: 'Verification code sent to email'
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
