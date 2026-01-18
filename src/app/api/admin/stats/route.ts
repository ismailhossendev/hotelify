import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import { User } from '@/lib/db/models/User';
import { Transaction } from '@/lib/db/models/Transaction'; // Force registration
import { getCurrentUser } from '@/lib/auth/token';
// Ensure model registration
const _Tx = Transaction;

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'super_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const [totalHotels, totalUsers, revenueStats, monthlyRevenue, pendingWithdrawals, smsStats, revenueGraph] = await Promise.all([
            Hotel.countDocuments({ isActive: true }),
            User.countDocuments({ isActive: true }),
            Transaction.aggregate([
                { $match: { type: 'credit', status: 'completed' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Transaction.aggregate([
                {
                    $match: {
                        type: 'credit',
                        status: 'completed',
                        createdAt: { $gte: currentMonthStart }
                    }
                },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Transaction.countDocuments({ type: 'debit', status: 'pending' }), // Pending Withdrawals
            // SMS Stats (Mocking cost for now as we don't have real logs yet)
            Promise.resolve({ count: 124, cost: 186 }),
            Transaction.aggregate([
                {
                    $match: {
                        type: 'credit',
                        status: 'completed',
                        createdAt: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        total: { $sum: "$amount" }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const stats = {
            totalHotels,
            totalUsers,
            activeSubscriptions: totalHotels,
            totalRevenue: revenueStats[0]?.total || 0,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            pendingWithdrawals,
            sms: smsStats,
            revenueGraph: revenueGraph.map(g => ({ date: g._id, amount: g.total }))
        };

        return NextResponse.json({ success: true, stats });

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
