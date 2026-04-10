import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { ProductProps } from "../../products/data/productTypes";
import ProductsArea1 from "./components/ProductsAreaDesigns/ProductsArea1";
import ProductsArea2 from "./components/ProductsAreaDesigns/ProductsArea2";
import ProductsArea3 from "./components/ProductsAreaDesigns/ProductsArea3";
import ProductsArea4 from "./components/ProductsAreaDesigns/ProductsArea4";
import { dummyProducts } from "../data/dummyProducts";
import ProductThemeChooseButton from "./components/ProductThemeChooseButton";
import type { RootState } from "../../../general/redux/store";
import { useSelector } from "react-redux";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router";

export const themeSections: {
    id: ProductCardThemeId;
    title: string;
    RenderComponent: ComponentType<{ products: ProductProps[]; showActions?: boolean }>;
}[] = [
        { id: "card-1", title: "Products Area Theme 1", RenderComponent: ProductsArea1 },
        { id: "card-2", title: "Products Area Theme 2", RenderComponent: ProductsArea2 },
        { id: "card-3", title: "Products Area Theme 3", RenderComponent: ProductsArea3 },
        { id: "card-4", title: "Products Area Theme 4", RenderComponent: ProductsArea4 },
    ];

export type ProductCardThemeId = "card-1" | "card-2" | "card-3" | "card-4";

const ProductCardThemes = ({ from }: { from: "all-products" | "trending" }) => {
    const { storeTheme } = useSelector((state: RootState) => state.theme);
    const [selectedTheme, setSelectedTheme] = useState<ProductCardThemeId>("card-1");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (from === "trending") {
            if (storeTheme?.trendingProductCardTheme) {
                setSelectedTheme(storeTheme.trendingProductCardTheme);
            }
        } else {
            if (storeTheme?.productCardTheme) {
                setSelectedTheme(storeTheme.productCardTheme);
            }
        }
    }, [storeTheme, from]);

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <header className="space-y-1">
                    <h1 className="text-xl font-semibold sm:text-2xl">Product Card Themes</h1>
                    <p className="text-sm text-neutral-600">
                        Preview all product area themes and choose one product card design.
                    </p>
                </header>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                    <FiArrowLeft className="h-4 w-4" aria-hidden />
                    Back
                </button>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
                Selected product card theme:{" "}
                <span className="font-semibold uppercase">{selectedTheme}</span>
            </div>

            {themeSections.map(({ id, title, RenderComponent }) => {
                const isSelected = selectedTheme === id;

                return (
                    <article
                        key={id}
                        className={`space-y-4 rounded-xl border p-4 sm:p-5 ${isSelected
                            ? "border-primary bg-primary/5"
                            : "border-neutral-200 bg-white"
                            }`}
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
                            <ProductThemeChooseButton
                                id={id}
                                isSelected={isSelected}
                                setSelectedTheme={() => setSelectedTheme(id as ProductCardThemeId)}
                                loading={loading}
                                setLoading={setLoading}
                                from={from}
                            />
                        </div>

                        <RenderComponent products={dummyProducts} />
                    </article>
                );
            })}
        </section>
    );
};

export default ProductCardThemes;
