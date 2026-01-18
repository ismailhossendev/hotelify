
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import dbConnect from './connect';
import { Template } from './models/Template';

async function seedTemplates() {
    await dbConnect();
    console.log('🌱 Seeding Templates...');

    // Clear existing templates
    await Template.deleteMany({});

    const templates = [
        {
            name: 'Modern Coastal',
            description: 'A breezy, light theme perfect for beach resorts and coastal properties. Features full-width headers and light typography.',
            thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80',
            previewUrl: 'https://example.com/modern-coastal',
            category: 'free',
            sortOrder: 1
        },
        {
            name: 'Urban Luxury',
            description: 'Dark, sophisticated design for city hotels. Emphasizes gallery views and high-end amenity showcases.',
            thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80',
            previewUrl: 'https://example.com/urban-luxury',
            category: 'premium',
            sortOrder: 2
        },
        {
            name: 'Eco Retreat',
            description: 'Earth tones and organic layouts for nature resorts and eco-lodges. Focus on sustainability messaging.',
            thumbnail: 'https://images.unsplash.com/photo-1571896349842-6e53ce41be03?auto=format&fit=crop&q=80',
            previewUrl: 'https://example.com/eco-retreat',
            category: 'premium',
            sortOrder: 3
        },
        {
            name: 'Boutique Classic',
            description: 'Elegant serif typography and white space. Ideal for small, historic, or boutique properties.',
            thumbnail: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80',
            previewUrl: '', // No preview to test "No Preview" button
            category: 'free',
            sortOrder: 4
        }
    ];

    await Template.insertMany(templates);
    console.log(`✅ Seeded ${templates.length} templates`);
    process.exit(0);
}

seedTemplates().catch((err) => {
    console.error('❌ Template Seed failed:', err);
    process.exit(1);
});
