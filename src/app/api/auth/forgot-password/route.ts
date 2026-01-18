
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/db/models/User";
import connectDB from "@/lib/db/connect";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/sender";
import { resetPasswordOtpTemplate } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json({ error: "Account not found. Please create a new account." }, { status: 404 });
        }

        // Generate 6-digit OTP (100000 to 999999 inclusive)
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Hash OTP for security
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        // Save hashed OTP to DB
        user.resetPasswordToken = otpHash;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        console.log(`[ForgotPassword] OPT Generated & Saved for ${user.email}`);
        console.log(`[ForgotPassword] Token: ${otpHash}`);
        console.log(`[ForgotPassword] Document Token after save: ${user.resetPasswordToken}`);

        // Generate Magic Link
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_My_URL || "http://localhost:3000";
        const magicLink = `${appUrl}/forgot-password?email=${encodeURIComponent(user.email)}&otp=${otp}&autoverify=true`;

        // Send Email
        const emailSent = await sendEmail({
            to: user.email,
            subject: "Reset Password OTP",
            html: resetPasswordOtpTemplate(user.profile?.name || "User", otp, magicLink)
        });

        if (!emailSent) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return NextResponse.json({ error: "Email could not be sent. Please try again later." }, { status: 500 });
        }

        return NextResponse.json({ message: "OTP sent to your email." });

    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
