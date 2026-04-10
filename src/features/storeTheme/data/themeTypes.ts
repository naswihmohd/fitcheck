import type { CategorySettingsProps } from "../../categoryManagement/data/categoryTypes";
import type { ProductCardThemeId } from "../../productsThemes/presentation/ProductCardThemes";

export interface StoreThemeProps {
    heroTheme?: "hero-1" | "hero-2" | "hero-3" | "hero-4" | "hero-5" | "hero-6" | "hero-7" | "hero-8" | "hero-9" | "hero-10" | "hero-11" | null;
    categorySettings?: CategorySettingsProps;
    productCardTheme?: ProductCardThemeId;
    trendingProductCardTheme?: ProductCardThemeId;
}