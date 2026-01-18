
# 🎨 How to Add a New Design Template

Since Hotelify uses **Server-Side Rendering (Next.js)** for maximum performance and SEO, templates are **React Components**, not just static HTML/CSS uploads.

This means you cannot "paste code" in the Admin Panel. Instead, you follow this **Developer Workflow**:

## Step 1: Register the Template (Admin Panel)

1.  Go to **Admin > Frontend > Template Marketplace**.
2.  Click **"Upload Theme"**.
3.  Fill in the metadata:
    *   **Name**: e.g., "Forest Lodge" (Remember this name!)
    *   **Category**: Premium
    *   **Thumbnail**: URL to an image.
4.  Click **Publish**.
    *   *Note: This only creates a database record so you can assign it to hotels. It doesn't allow design yet.*

## Step 2: Create the Component (VS Code)

1.  Create a new file: `src/components/templates/ForestLodgeTemplate.tsx`.
2.  Use the AI Prompt from the Admin page to generate the code, or copy an existing template like `LuxuryTemplate.tsx`.
3.  Ensure it accepts the standard props:
    ```tsx
    export default function ForestLodgeTemplate({ hotel, rooms, onBook }: { ... }) {
       // Your Design Code Here
    }
    ```

## Step 3: Register the Component (Page Logic)

1.  Open `src/app/sites/[site]/page.tsx`.
2.  Import your new component:
    ```tsx
    import ForestLodgeTemplate from "@/components/templates/ForestLodgeTemplate";
    ```
3.  Add it to the `switch` statement in `renderTemplate`:
    ```tsx
    const renderTemplate = () => {
        const templateName = hotel.template?.name || "Luxury";

        switch (templateName) {
            case "Modern Coastal":
                // ...
            case "Forest Lodge": 
                return <ForestLodgeTemplate hotel={hotel} rooms={rooms} onBook={setSelectedRoom} />;
            // ...
        }
    };
    ```

## 🤖 AI Prompt to Generate Code

**Copy and paste this ENTIRE block into your AI coding agent (like me!).**

> **Goal:** Create a new Hotel Template component for my Next.js Hotel App.
>
> **Requirements:**
> 1.  **Component Name**: `[Insert Template Name]Template` (e.g., `ForestLodgeTemplate`).
> 2.  **Tech Stack**: React, Tailwind CSS, Framer Motion, Lucide React Icons.
> 3.  **Data Source**: Do NOT use mock data. You MUST accept specific props and use them.
> 4.  **Functionality**: The "Book Now" buttons MUST call the `onBook(room)` function.
>
> **Strict Interface Definition:**
> Use these exact types. Do not change them.
>
> ```tsx
> import Image from 'next/image';
> import { motion } from 'framer-motion';
> // Import lucide icons as needed...
>
> // --- 1. Define Types ---
> interface HotelData {
>   id: string;
>   name: string;
>   contact: { phone: string; email: string; address: string };
>   coverImage: string; // Fallback if hero background missing
>   amenities: string[];
>   config: {
>     hero: { title: string; subtitle: string; backgroundImage: string };
>     about: { title: string; content: string };
>     contact: { phone: string; email: string; address: string };
>     colors: { primary: string; secondary: string };
>     gallery: string[];
>   };
> }
>
> interface RoomData {
>   id: string;
>   name: string;
>   price: number;
>   capacity: { adults: number; children: number };
>   description: string;
>   amenities: string[];
>   images: { url: string }[]; // Note: It is an array of objects
> }
>
> interface TemplateProps {
>   hotel: HotelData;
>   rooms: RoomData[];
>   onBook: (room: RoomData) => void;
> }
>
> // --- 2. Build Component ---
> export default function [InsertName]Template({ hotel, rooms, onBook }: TemplateProps) {
>   // HELPER: Use this to prevent crash if data is missing
>   const heroImage = hotel.config.hero.backgroundImage || hotel.coverImage || "/placeholder.jpg";
>   const heroTitle = hotel.config.hero.title || hotel.name;
>
>   return (
>      // ... IMPLEMENT DESIGN HERE ...
>      // IMPORTANT: When mapping rooms, use: 
>      // <button onClick={() => onBook(room)}>Book Now</button>
>   );
> }
> ```
>
> **Design Request:**
> Style this template to look: **[INSERT VIBE: e.g., "Minimalist, Japanese Zen, Bamboo fonts"]**.
> Use `hotel.config.colors.primary` if possible for main accents.

## Step 4: Test

1.  Go to **Admin > Hotels**.
2.  Assign "Forest Lodge" to a hotel.
3.  Visit the hotel's public link. It will now render your new React Component!
