import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import dbConnect from './connect';
import { Plan } from './models/Plan';
import { User } from './models/User';
import { Hotel } from './models/Hotel';
import { Room } from './models/Room';
import { SiteConfig } from './models/SiteConfig';
import { Page } from './models/Page';
import bcrypt from 'bcryptjs';

async function seed() {
    await dbConnect();
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await Plan.deleteMany({});
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await SiteConfig.deleteMany({});
    await Page.deleteMany({});
    await SiteConfig.deleteMany({});

    // Create Plans
    const plans = await Plan.insertMany([
        {
            name: 'Basic',
            slug: 'basic',
            price: { monthly: 999, yearly: 9990 },
            features: {
                maxRooms: 10,
                posEnabled: false,
                customDomainEnabled: false,
                housekeepingEnabled: false,
                smsNotifications: false,
                multiCurrency: false
            },
            isActive: true
        },
        {
            name: 'Pro',
            slug: 'pro',
            price: { monthly: 2499, yearly: 24990 },
            features: {
                maxRooms: 50,
                posEnabled: true,
                customDomainEnabled: true,
                housekeepingEnabled: true,
                smsNotifications: true,
                multiCurrency: false
            },
            isActive: true
        },
        {
            name: 'Enterprise',
            slug: 'enterprise',
            price: { monthly: 4999, yearly: 49990 },
            features: {
                maxRooms: -1, // Unlimited
                posEnabled: true,
                customDomainEnabled: true,
                housekeepingEnabled: true,
                smsNotifications: true,
                multiCurrency: true
            },
            isActive: true
        }
    ]);
    console.log('✅ Plans created');

    // Create Super Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = await User.create({
        email: 'admin@hotelify.com',
        phone: '+8801700000000',
        passwordHash: hashedPassword,
        role: 'super_admin',
        profile: { name: 'Super Admin' },
        isActive: true,
        isVerified: true
    });
    console.log('✅ Super Admin created (admin@hotelify.com / admin123)');

    // Demo Hotels Data - High Quality Demo Stations
    const hotelsData = [
        {
            name: 'Hotel The Cox Today',
            slug: 'hotel-cox-today',
            city: "Cox's Bazar",
            district: "Cox's Bazar",
            description: 'Experience the pinnacle of luxury at Hotel The Cox Today. Located steps away from the worlds longest natural sea beach, we offer world-class hospitality, breathtaking ocean views, and premium amenities for an unforgettable stay.',
            starRating: 5,
            amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Airport Shuttle', 'Conference Hall'],
            coverImage: "https://images.unsplash.com/photo-1571896349842-6e53ce41be03?auto=format&fit=crop&q=80"
        },
        {
            name: 'Grand Sultan Tea Resort',
            slug: 'grand-sultan-sylhet',
            city: 'Sylhet',
            district: 'Sylhet',
            description: 'Nestled within 13.2 acres of lush green tea gardens, Grand Sultan Tea Resort & Golf is the ultimate luxury escape. Enjoy our 9-hole golf course, triple-tier swimming pool, and exquisite dining options.',
            starRating: 5,
            amenities: ['Free WiFi', 'Swimming Pool', 'Tea Garden Tours', 'Golf Course', 'Spa', 'Fine Dining', 'Helipad'],
            coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"
        },
        {
            name: 'Pan Pacific Sonargaon',
            slug: 'pan-pacific-dhaka',
            city: 'Dhaka',
            district: 'Dhaka',
            description: 'An oasis of luxury in the heart of Dhaka. Pan Pacific Sonargaon offers 5-star accommodations, superior service, and easy access to the city’s business and diplomatic districts.',
            starRating: 5,
            amenities: ['Free WiFi', 'Swimming Pool', 'Health Club', 'Business Center', 'Multiple Restaurants', 'Bar', 'Sauna'],
            coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80"
        }
    ];

    // Create Hotels and Rooms
    const proPlan = plans[1]; // Pro plan for demo hotels

    for (const hotelData of hotelsData) {
        // Create vendor user for each hotel
        const vendorPassword = await bcrypt.hash('vendor123', 10);
        const vendor = await User.create({
            email: `${hotelData.slug}@hotelify.com`,
            phone: `+8801${Math.floor(100000000 + Math.random() * 900000000)}`,
            passwordHash: vendorPassword,
            role: 'vendor_admin',
            profile: { name: `${hotelData.name} Admin` },
            isActive: true,
            isVerified: true
        });

        // Create hotel
        const hotel = await Hotel.create({
            name: hotelData.name,
            slug: hotelData.slug,
            ownerId: vendor._id,
            planId: proPlan._id,
            starRating: hotelData.starRating,
            description: hotelData.description,
            amenities: hotelData.amenities,
            coverImage: hotelData.coverImage,
            contact: {
                address: {
                    street: 'Main Road',
                    city: hotelData.city,
                    district: hotelData.district,
                    country: 'Bangladesh'
                },
                phone: `+8801${Math.floor(100000000 + Math.random() * 900000000)}`,
                email: `info@${hotelData.slug}.com`
            },
            domain: {
                subdomain: hotelData.slug
            },
            policies: {
                checkInTime: '14:00',
                checkOutTime: '11:00',
                cancellationHours: 24
            },
            isActive: true
        });

        // Update vendor with hotelId
        await User.findByIdAndUpdate(vendor._id, { hotelId: hotel._id });

        // Create rooms for each hotel
        const roomTypes = [
            {
                name: 'Deluxe King',
                type: 'deluxe',
                price: 5500 + (hotelData.starRating * 700),
                capacity: { adults: 2, children: 1 },
                description: "Elegant room with king-size bed, city/ocean view, and modern amenities including flat-screen TV and mini-bar.",
                images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80"]
            },
            {
                name: 'Executive Suite',
                type: 'suite',
                price: 12500 + (hotelData.starRating * 1000),
                capacity: { adults: 2, children: 2 },
                description: "Spacious suite with separate living area, premium bedding, and panoramic views. Includes access to executive lounge.",
                images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80"]
            },
            {
                name: 'Presidential Suite',
                type: 'suite',
                price: 25000 + (hotelData.starRating * 2000),
                capacity: { adults: 4, children: 2 },
                description: "The ultimate in luxury. Expansive suite with dining area, kitchenette, jacuzzi, and dedicated butler service.",
                images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80"]
            }
        ];

        for (let i = 0; i < roomTypes.length; i++) {
            const roomType = roomTypes[i];
            // Create 2-3 rooms of each type
            const roomCount = Math.floor(Math.random() * 2) + 2;
            for (let j = 1; j <= roomCount; j++) {
                await Room.create({
                    hotelId: hotel._id,
                    name: `${roomType.name} ${100 + (i * 10) + j}`,
                    roomType: roomType.type,
                    basePrice: roomType.price,
                    capacity: roomType.capacity,
                    description: roomType.description,
                    amenities: ['AC', 'TV', 'Hot Water', 'Toiletries', 'WiFi', 'Mini Bar'],
                    images: roomType.images.map(url => ({ url })),
                    isActive: true,
                    housekeepingStatus: 'clean',
                    // Add some pricing logic for demonstration
                    weekendPricing: {
                        enabled: true,
                        price: roomType.price * 1.2, // 20% higher on weekends
                        days: [5, 6] // Friday, Saturday
                    }
                });
            }
        }

        console.log(`✅ Created: ${hotelData.name} (${hotelData.city})`);
    }

    // Create default SiteConfig with featured hotels and all sections
    const allHotels = await Hotel.find({}).limit(3);
    await SiteConfig.create({
        hero: {
            title: 'Find your perfect stay',
            subtitle: 'Search hundreds of hotels, resorts, and vacation rentals for your next trip.',
            backgroundImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80'
        },
        featured: {
            title: 'Trending Destinations',
            subtitle: 'Most popular choices for travelers from Bangladesh',
            hotels: allHotels.map(h => h._id)
        },
        categories: {
            enabled: true,
            title: 'Browse by Category',
            subtitle: 'Find the perfect accommodation for your travel style',
            items: [
                { id: 'resort', name: 'Resorts', description: 'Luxury beach and mountain resorts', icon: 'Mountain', color: 'bg-blue-500' },
                { id: 'villa', name: 'Villas', description: 'Private villas for families', icon: 'Home', color: 'bg-green-500' },
                { id: 'budget', name: 'Budget Hotels', description: 'Affordable comfortable stays', icon: 'Wallet', color: 'bg-orange-500' },
                { id: 'couple', name: 'Couple Friendly', description: 'Perfect for romantic getaways', icon: 'Heart', color: 'bg-pink-500' },
                { id: 'boutique', name: 'Boutique Hotels', description: 'Unique designer properties', icon: 'Sparkles', color: 'bg-purple-500' },
                { id: 'hotel', name: 'Hotels', description: 'Traditional hotel experiences', icon: 'Building2', color: 'bg-gray-600' }
            ]
        },
        destinations: {
            enabled: true,
            title: 'Popular Destinations',
            subtitle: 'Discover the most sought-after travel destinations in Bangladesh',
            items: [
                { name: "Cox's Bazar", image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&q=80', hotelCount: 89, startingPrice: 3500 },
                { name: "Kuakata", image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80', hotelCount: 34, startingPrice: 2800 },
                { name: "Sylhet", image: 'https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb?auto=format&fit=crop&q=80', hotelCount: 56, startingPrice: 3200 },
                { name: "Bandarban", image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80', hotelCount: 42, startingPrice: 2500 },
                { name: "Sundarbans", image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a0123?auto=format&fit=crop&q=80', hotelCount: 18, startingPrice: 4500 },
                { name: "Dhaka", image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80', hotelCount: 124, startingPrice: 3000 }
            ]
        },
        offers: {
            enabled: true,
            title: 'Exclusive Offers & Deals',
            subtitle: 'Grab amazing discounts and save on your next booking',
            items: [
                {
                    title: 'Summer Beach Escape',
                    discount: '30% OFF',
                    description: 'Book any beach resort and save big this summer season',
                    promoCode: 'SUMMER30',
                    validUntil: '2024-03-31',
                    bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
                    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&q=80'
                },
                {
                    title: 'Weekend Getaway Special',
                    discount: '25% OFF',
                    description: 'Flat discount on all weekend bookings at luxury hotels',
                    promoCode: 'WEEKEND25',
                    validUntil: '2024-02-29',
                    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
                    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80'
                },
                {
                    title: 'Early Bird Bonus',
                    discount: '20% OFF',
                    description: 'Book 30 days in advance and enjoy exclusive savings',
                    promoCode: 'EARLY20',
                    validUntil: '2024-12-31',
                    bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
                    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80'
                }
            ]
        },
        testimonials: {
            enabled: true,
            title: 'What Our Guests Say',
            subtitle: 'Hear from travelers who made unforgettable memories',
            items: [
                {
                    name: 'Sarah Johnson',
                    location: 'New York, USA',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
                    rating: 5,
                    hotel: 'Hotel The Cox Today',
                    review: 'Absolutely stunning property with breathtaking ocean views. The staff went above and beyond to make our honeymoon special. Will definitely be back!'
                },
                {
                    name: 'John Smith',
                    location: 'London, UK',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
                    rating: 5,
                    hotel: 'Pan Pacific Sonargaon',
                    review: 'Five-star service all the way! The facilities were world-class and the location was perfect for exploring Dhaka.'
                },
                {
                    name: 'Emily Chen',
                    location: 'Singapore',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
                    rating: 5,
                    hotel: 'Grand Sultan Tea Resort',
                    review: 'A hidden gem in the tea gardens! The tranquility and natural beauty were exactly what we needed.'
                }
            ]
        },
        features: [
            { icon: 'ShieldCheck', title: "Secure Booking", description: "Your payments are protected with bank-level security." },
            { icon: 'Clock', title: "24/7 Support", description: "Our team is here to help you anytime, day or night." },
            { icon: 'Heart', title: "Best Price Guarantee", description: "Find a lower price? We'll match it." }
        ],
        header: {
            contact: {
                phone: "+880 1700-000000",
                email: "info@hotelify.com"
            },
            navigation: [
                { label: "Home", href: "/" },
                { label: "Browse Hotels", href: "/hotels" },
                { label: "Destinations", href: "/destinations" },
                { label: "Offers & Deals", href: "/offers" },
                { label: "About Us", href: "/about" }
            ],
            topBarLinks: [
                { label: "List Your Property", href: "/become-partner" },
                { label: "Help & Support", href: "/help" }
            ]
        },
        footer: {
            description: "Discover and book the best hotels across Bangladesh. Your comfort is our priority.",
            socialLinks: {
                facebook: "https://facebook.com",
                twitter: "https://twitter.com",
                instagram: "https://instagram.com",
                linkedin: "https://linkedin.com"
            },
            quickLinks: [
                { label: "Browse Hotels", href: "/hotels" },
                { label: "Popular Destinations", href: "/destinations" },
                { label: "Offers & Deals", href: "/offers" },
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" }
            ],
            supportLinks: [
                { label: "Help Center", href: "/help" },
                { label: "FAQs", href: "/faq" },
                { label: "Cancellation Policy", href: "/cancellation-policy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" }
            ],
            copyrightText: "© 2024 Hotelify. All rights reserved."
        }
    });
    console.log(`✅ Created default SiteConfig with all homepage sections configured`);

    // Seed Static Pages
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
    console.log(`✅ Created ${pages.length} default static pages`);

    console.log('\n🎉 Database seeded with Premium Demo Data!');
    console.log('\n📋 Login Credentials:');
    console.log('   Super Admin: admin@hotelify.com / admin123');
    console.log('   Vendors:');
    hotelsData.forEach(h => {
        console.log(`   - ${h.name}: ${h.slug}@hotelify.com / vendor123`);
    });

    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
