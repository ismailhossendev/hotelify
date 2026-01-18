import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { signToken, setAuthCookie } from '@/lib/auth/token';
import { AuditLog } from '@/lib/db/models/AuditLog';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        let { email, phone, password, rememberMe } = await req.json();

        // Frontend sends 'email' even if it's a phone number
        // We need to detect if the 'email' field is actually a phone number
        let queryPhone = phone;
        let queryEmail = email?.toLowerCase();

        // If email looks like a phone number (has digits, no @)
        if (email && !email.includes('@')) {
            queryPhone = email;
            queryEmail = undefined; // It's strictly not an email if no @
        }

        if ((!queryEmail && !queryPhone) || !password) {
            return NextResponse.json(
                { error: 'Please provide email/phone and password' },
                { status: 400 }
            );
        }

        // Normalize Phone if present
        if (queryPhone) {
            const cleaned = queryPhone.replace(/\D/g, '');
            if (cleaned.length === 11 && cleaned.startsWith('01')) {
                queryPhone = `88${cleaned}`;
            } else if (cleaned.length === 13 && cleaned.startsWith('8801')) {
                queryPhone = cleaned;
            }
            // Logic: If user entered phone in email field, we prioritize looking up by phone
        }

        // Find user by email OR phone
        const user = await User.findOne({
            $or: [
                { email: queryEmail },
                { phone: queryPhone }
            ]
        }).select('+passwordHash');

        if (!user || !user.passwordHash) {
            // If user exists but has no password hash (e.g. OAuth only or corrupted), treat as invalid creds
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            // Log failed attempt
            await AuditLog.create({
                hotelId: user.hotelId,
                userId: user._id,
                action: 'failed_login',
                description: 'Invalid password provided',
                ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
                userAgent: req.headers.get('user-agent') || 'unknown'
            });

            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.isActive) {
            return NextResponse.json({ error: 'Your account is inactive. Please contact support.' }, { status: 403 });
        }

        // Success: Generate Token
        // 30 days if rememberMe, else 6 hours
        const expiresIn = rememberMe ? '30d' : '6h';
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 6 * 60 * 60;

        const token = signToken({
            userId: user._id.toString(),
            role: user.role,
            hotelId: user.hotelId?.toString()
        }, expiresIn);

        setAuthCookie(token, maxAge);

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        // Audit Log
        await AuditLog.create({
            hotelId: user.hotelId,
            userId: user._id,
            action: 'login',
            description: 'Successful login',
            ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown'
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.profile.name,
                email: user.email,
                role: user.role,
                hotelId: user.hotelId
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
