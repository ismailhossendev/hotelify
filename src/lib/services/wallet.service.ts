import mongoose from 'mongoose';
import { Hotel } from '@/lib/db/models/Hotel';
import { Transaction } from '@/lib/db/models/Transaction';
import { AuditLog } from '@/lib/db/models/AuditLog';

interface DeductResult {
    success: boolean;
    remainingCredits: number;
    error?: string;
}

export async function deductSMSCredits(
    hotelId: string,
    credits: number,
    reason: string,
    userId?: string
): Promise<DeductResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const hotel = await Hotel.findById(hotelId).session(session);

        if (!hotel) {
            await session.abortTransaction();
            return { success: false, remainingCredits: 0, error: 'Hotel not found' };
        }

        const currentCredits = hotel.wallet.smsCredits;

        if (currentCredits < credits) {
            await session.abortTransaction();
            return {
                success: false,
                remainingCredits: currentCredits,
                error: 'Insufficient SMS credits'
            };
        }

        const newBalance = currentCredits - credits;

        await Hotel.updateOne(
            { _id: hotelId },
            { $set: { 'wallet.smsCredits': newBalance } },
            { session }
        );

        await Transaction.create([{
            hotelId,
            userId,
            type: 'sms_deduct',
            amount: -credits,
            currency: 'CREDIT',
            balanceBefore: currentCredits,
            balanceAfter: newBalance,
            status: 'completed',
            description: reason
        }], { session });

        if (userId) { // Logs need user
            await AuditLog.create([{
                hotelId,
                userId,
                action: 'update',
                entityType: 'Hotel',
                entityId: hotelId,
                changes: {
                    before: { smsCredits: currentCredits },
                    after: { smsCredits: newBalance }
                },
                description: `SMS credits deducted: ${reason}`
            }], { session });
        }

        await session.commitTransaction();

        return { success: true, remainingCredits: newBalance };

    } catch (error) {
        await session.abortTransaction();
        console.error('SMS deduction error:', error);
        return { success: false, remainingCredits: 0, error: 'Transaction failed' };
    } finally {
        session.endSession();
    }
}

export async function topUpSMSCredits(
    hotelId: string,
    credits: number,
    transactionId: string,
    paymentMethod: 'bkash' | 'nagad' | 'card',
    userId: string
): Promise<DeductResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const hotel = await Hotel.findById(hotelId).session(session);

        if (!hotel) {
            await session.abortTransaction();
            return { success: false, remainingCredits: 0, error: 'Hotel not found' };
        }

        const currentCredits = hotel.wallet.smsCredits;
        const newBalance = currentCredits + credits;

        await Hotel.updateOne(
            { _id: hotelId },
            { $set: { 'wallet.smsCredits': newBalance } },
            { session }
        );

        await Transaction.create([{
            hotelId,
            userId,
            type: 'sms_topup',
            amount: credits,
            currency: 'CREDIT',
            balanceBefore: currentCredits,
            balanceAfter: newBalance,
            paymentMethod,
            paymentGateway: { transactionId },
            status: 'completed',
            description: `SMS top-up: ${credits} credits`
        }], { session });

        await session.commitTransaction();

        return { success: true, remainingCredits: newBalance };

    } catch (error) {
        await session.abortTransaction();
        return { success: false, remainingCredits: 0, error: 'Transaction failed' };
    } finally {
        session.endSession();
    }
}

export async function getSMSBalance(hotelId: string): Promise<number> {
    const hotel = await Hotel.findById(hotelId).select('wallet.smsCredits');
    return hotel?.wallet.smsCredits ?? 0;
}
