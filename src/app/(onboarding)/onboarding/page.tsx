import { getCurrentUser } from "@/lib/auth/token";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (user.hotelId) {
        redirect("/dashboard");
    }

    return <OnboardingForm />;
}
