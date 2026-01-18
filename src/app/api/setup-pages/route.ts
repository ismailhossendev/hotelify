
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Page } from '@/lib/db/models/Page';

export async function GET() {
    try {
        await connectDB();

        // Delete all existing pages to ensure fresh seed
        await Page.deleteMany({});

        const pages = [
            {
                title: "About Us",
                slug: "about",
                content: `
                    <div class="prose max-w-none">
                        <h2>আমাদের সম্পর্কে (About Us)</h2>
                        <p class="lead">হোটেলিফাই (Hotelify) বাংলাদেশে আপনার ভ্রমণ অভিজ্ঞতার বিশ্বস্ত সঙ্গী। ২০২৪ সালে প্রতিষ্ঠিত, আমাদের লক্ষ্য হলো ভ্রমণপিপাসুদের জন্য সেরা এবং সাশ্রয়ী মূল্যে আবাসন নিশ্চিত করা।</p>
                        
                        <h3>আমাদের মিশন</h3>
                        <p>আমাদের প্রধান লক্ষ্য হলো গ্রাহকদের সহজ, নিরাপদ এবং আনন্দদায়ক বুকিং অভিজ্ঞতা প্রদান করা। আমরা বিশ্বাস করি ভ্রমণ মানুষের মনকে প্রসারিত করে, এবং আমরা সেই যাত্রাকে মসৃণ করতে চাই।</p>
    
                        <h3>কেন আমাদের বেছে নেবেন?</h3>
                        <ul>
                            <li><strong>বিস্তৃত নির্বাচন:</strong> কক্সবাজার, সিলেট, বান্দরবান সহ সারা দেশের ৫০০+ সেরা হোটেল এবং রিসোর্ট।</li>
                            <li><strong>সেরা মূল্য:</strong> আমরা দিচ্ছি বেস্ট প্রাইস গ্যারান্টি। অন্য কোথাও কম দামে পেলে আমরা তা ম্যাচ করব।</li>
                            <li><strong>২৪/৭ সাপোর্ট:</strong> আমাদের ডেডিকেটেড সাপোর্ট টিম দিন-রাত আপনার পাশে আছে।</li>
                            <li><strong>নিরাপদ পেমেন্ট:</strong> আধুনিক এবং নিরাপদ পেমেন্ট গেটওয়ে দিয়ে নিশ্চিন্তে পেমেন্ট করুন।</li>
                        </ul>
    
                        <h3>আমাদের গল্প</h3>
                        <p>শুরুটা হয়েছিল ছোট পরিসরে, কিন্তু আজ আমরা হাজারো গ্রাহকের আস্থার প্রতীক। আমাদের টিম প্রতিনিয়ত কাজ করে যাচ্ছে আপনাদের জন্য নতুন নতুন গন্তব্য এবং সেরা ডিল নিয়ে আসতে।</p>
                    </div>
                `,
                isActive: true
            },
            {
                title: "Contact Us",
                slug: "contact",
                content: `
                    <div class="prose max-w-none">
                        <h2>যোগাযোগ করুন (Contact Us)</h2>
                        <p>আপনার যেকোনো প্রশ্ন, পরামর্শ বা প্রয়োজনে আমাদের সাথে যোগাযোগ করতে দ্বিধা করবেন না। আমাদের কাস্টমার সাপোর্ট টিম সর্বদা আপনার সেবায় নিয়োজিত।</p>
    
                        <div class="grid md:grid-cols-2 gap-6 my-8">
                            <div class="bg-blue-50 p-6 rounded-lg">
                                <h4 class="text-blue-700 font-bold mb-2">কাস্টমার সাপোর্ট</h4>
                                <p>আমাদের হটলাইন নাম্বারে কল করুন:</p>
                                <p class="text-2xl font-bold text-gray-800 my-2">+880 1700-000000</p>
                                <p class="text-sm text-gray-600">(সকাল ৯টা - রাত ১০টা)</p>
                            </div>
                            <div class="bg-purple-50 p-6 rounded-lg">
                                <h4 class="text-purple-700 font-bold mb-2">ইমেইল সাপোর্ট</h4>
                                <p>যেকোনো সময় ইমেইল করুন:</p>
                                <p class="text-xl font-bold text-gray-800 my-2">info@hotelify.com</p>
                                <p class="text-sm text-gray-600">(আমরা ২৪ ঘন্টার মধ্যে উত্তর দেই)</p>
                            </div>
                        </div>
    
                        <h3>আমাদের অফিস</h3>
                        <address class="not-italic bg-gray-50 p-4 rounded border-l-4 border-gray-300">
                            <strong>হোটেলিফাই প্রধান কার্যালয়</strong><br>
                            লেভেল ৫, হাউজ ১২, রোড ৪<br>
                            গুলশান-১, ঢাকা-১২১২<br>
                            বাংলাদেশ
                        </address>
                    </div>
                `,
                isActive: true
            },
            {
                title: "Terms & Conditions",
                slug: "terms",
                content: `
                    <div class="prose max-w-none">
                        <h2>Terms and Conditions</h2>
                        <p class="text-sm text-gray-500">Last Updated: January 14, 2026</p>
                        
                        <p>Welcome to Hotelify. Please read these terms and conditions carefully before using our service.</p>
    
                        <h3>1. Acceptance of Terms</h3>
                        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
    
                        <h3>2. Booking Policy</h3>
                        <ul>
                            <li>All bookings are subject to availability and confirmation by the hotel.</li>
                            <li>You must be at least 18 years of age to make a booking.</li>
                            <li>Rates are subject to change without prior notice until the booking is confirmed.</li>
                        </ul>
    
                        <h3>3. Payment & Fees</h3>
                        <p>Full payment or a deposit is required to secure your reservation. We accept major credit cards and mobile banking. All prices include applicable VAT and service charges unless stated otherwise.</p>
    
                        <h3>4. User Responsibilities</h3>
                        <p>You agree to provide accurate, current, and complete information during the booking process. You are responsible for maintaining the confidentiality of your account credentials.</p>
                    </div>
                `,
                isActive: true
            },
            {
                title: "Privacy Policy",
                slug: "privacy",
                content: `
                     <div class="prose max-w-none">
                        <h2>Privacy Policy</h2>
                        <p>At Hotelify, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
    
                        <h3>Information We Collect</h3>
                        <p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact support.</p>
                        <ul>
                            <li>Name, email address, phone number</li>
                            <li>Payment information (processed securely)</li>
                            <li>Booking history and preferences</li>
                        </ul>
    
                        <h3>How We Use Your Information</h3>
                        <p>We use your data to:</p>
                        <ul>
                            <li>Process and confirm your reservations</li>
                            <li>Send booking updates and support messages</li>
                            <li>Improve our platform and user experience</li>
                            <li>Send exclusive offers (only if you opt-in)</li>
                        </ul>
    
                        <h3>Data Security</h3>
                        <p>We implement industry-standard security measures to protect your data. We do not sell your personal information to third parties.</p>
                    </div>
                `,
                isActive: true
            },
            {
                title: "Help Center",
                slug: "help",
                content: `
                    <div class="prose max-w-none">
                        <h2>Help Center</h2>
                        <p>Find answers to common questions about booking, payments, and cancellations.</p>
                        
                        <div class="grid gap-4 mt-6">
                            <div class="border p-4 rounded hover:bg-gray-50">
                                <h4 class="font-bold text-blue-600">How do I cancel my booking?</h4>
                                <p>You can cancel your booking from the 'My Bookings' section in your profile. Cancellation fees may apply depending on the hotel policy.</p>
                            </div>
                            <div class="border p-4 rounded hover:bg-gray-50">
                                <h4 class="font-bold text-blue-600">Can I pay at the hotel?</h4>
                                <p>Some hotels offer 'Pay at Hotel' options. Look for this label when searching for rooms.</p>
                            </div>
                            <div class="border p-4 rounded hover:bg-gray-50">
                                <h4 class="font-bold text-blue-600">Is my payment secure?</h4>
                                <p>Yes, we use SSL encryption and secure payment gateways to ensure your financial data is safe.</p>
                            </div>
                        </div>
                    </div>
                 `,
                isActive: true
            },
            {
                title: "FAQs",
                slug: "faq",
                content: `
                    <div class="prose max-w-none">
                        <h2>Frequently Asked Questions</h2>
                        
                        <h3>Booking</h3>
                        <details class="mb-4 cursor-pointer group">
                            <summary class="font-bold p-2 bg-gray-100 rounded group-hover:bg-gray-200">Do I need an account to book?</summary>
                            <div class="p-2 text-gray-700">Yes, creating an account helps you track bookings and get exclusive deals.</div>
                        </details>
                         <details class="mb-4 cursor-pointer group">
                            <summary class="font-bold p-2 bg-gray-100 rounded group-hover:bg-gray-200">How do I get my booking confirmation?</summary>
                            <div class="p-2 text-gray-700">Confirmation is sent instantly via email and SMS after successful payment.</div>
                        </details>
    
                        <h3>Payments</h3>
                        <details class="mb-4 cursor-pointer group">
                            <summary class="font-bold p-2 bg-gray-100 rounded group-hover:bg-gray-200">What payment methods do you accept?</summary>
                            <div class="p-2 text-gray-700">We accept Visa, Mastercard, Bkash, Nagad, and Rocket.</div>
                        </details>
                    </div>
                 `,
                isActive: true
            },
            {
                title: "Cancellation Policy",
                slug: "cancellation-policy",
                content: `
                    <div class="prose max-w-none">
                        <h2>Cancellation Policy</h2>
                        <p class="text-red-500 font-bold">Please review the cancellation policy before booking.</p>
    
                        <h3>Standard Cancellation</h3>
                        <ul>
                            <li><strong>Free Cancellation:</strong> If cancelled 48 hours before check-in.</li>
                            <li><strong>Partial Refund:</strong> 50% refund if cancelled within 24-48 hours.</li>
                            <li><strong>No Refund:</strong> If cancelled less than 24 hours before check-in or in case of No-Show.</li>
                        </ul>
    
                        <h3>Non-Refundable Bookings</h3>
                        <p>Some special deals are non-refundable. This will be clearly mentioned during the booking process.</p>
    
                        <h3>Refund Process</h3>
                        <p>Refunds are processed within 5-7 working days to the original payment method.</p>
                    </div>
                `,
                isActive: true
            }
        ];

        await Page.insertMany(pages);
        return NextResponse.json({ success: true, message: "Recreated default pages with rich content", count: pages.length });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
