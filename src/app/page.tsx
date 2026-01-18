import MarketplaceLayout from './(marketplace)/layout';
import MarketplacePage from './(marketplace)/page';

export default async function RootPage() {
    return (
        <MarketplaceLayout>
            <MarketplacePage />
        </MarketplaceLayout>
    );
}
