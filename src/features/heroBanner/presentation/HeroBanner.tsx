import { useOutletContext, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { FiLayout, FiArrowRight, FiEdit2 } from "react-icons/fi";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { StoreThemeProps } from "../../storeTheme/data/themeTypes";
import HeroDesign1 from "../../heroThemes/presentation/components/HeroDesign1";
import HeroDesign2 from "../../heroThemes/presentation/components/HeroDesign2";
import HeroDesign3 from "../../heroThemes/presentation/components/HeroDesign3";
import HeroDesign4 from "../../heroThemes/presentation/components/HeroDesign4";
import HeroDesign5 from "../../heroThemes/presentation/components/HeroDesign5";
import HeroDesign6 from "../../heroThemes/presentation/components/HeroDesign6";
import HeroDesign7 from "../../heroThemes/presentation/components/HeroDesign7";
import HeroDesign8 from "../../heroThemes/presentation/components/HeroDesign8";
import HeroDesign9 from "../../heroThemes/presentation/components/HeroDesign9";
import HeroDesign10 from "../../heroThemes/presentation/components/HeroDesign10";
import HeroDesign11 from "../../heroThemes/presentation/components/HeroDesign11";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../general/redux/store";
import HeroBannerModal from "./components/HeroBannerModal";
import { fetchBannerData } from "../redux/bannerSlice";
import ThreeDotLoading from "../../../general/components/ThreeDotLoading";
import type { HeroBannerConfig } from "../../heroThemes/data/heroTypes";

const HeroBanner = () => {
  const { storeTheme, loading } = useOutletContext<{ storeTheme: StoreThemeProps, loading: boolean }>();
  const { bannerData, loading: bannerLoading, error } = useSelector((state: RootState) => state.banners);
  const dispatch: AppDispatch = useDispatch();
  const selectedBannerId = storeTheme?.heroTheme;
  const selectedBannerData = selectedBannerId ? bannerData?.heroBanners?.[selectedBannerId] : null;
  const navigate = useNavigate();
  const heroBanner = storeTheme?.heroTheme;
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (bannerData) return;
    dispatch(fetchBannerData());
  }, []);

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);


  // Map hero theme IDs to their components
  const heroThemeComponents: Record<string, ReactElement> = {
    "hero-1": <HeroDesign1 />,
    "hero-2": <HeroDesign2 />,
    "hero-3": <HeroDesign3 />,
    "hero-4": <HeroDesign4 />,
    "hero-5": <HeroDesign5 />,
    "hero-6": <HeroDesign6 />,
    "hero-7": <HeroDesign7 data={selectedBannerData as HeroBannerConfig | undefined} />,
    "hero-8": <HeroDesign8 />,
    "hero-9": <HeroDesign9 />,
    "hero-10": <HeroDesign10 />,
    "hero-11": <HeroDesign11 />,
  };

  // Get the selected hero theme component
  const selectedHeroComponent = heroBanner ? heroThemeComponents[heroBanner] : null;

  if (loading || bannerLoading) {
    return <ThreeDotLoading />;
  }

  return (
    <div className="space-y-6">
      {selectedHeroComponent ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg overflow-hidden shadow-lg"
        >
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Selected Hero Banner
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Current hero theme: {heroBanner?.replace("hero-", "Hero Design ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit Banner
                </button>
                <button
                  onClick={() => navigate("/store-theme")}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium text-sm"
                >
                  Change Theme
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="w-full">
            {selectedHeroComponent}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center"
        >
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <FiLayout className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Hero Banner Selected
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't selected a hero banner theme yet. Choose from our collection of beautiful hero designs to enhance your store's homepage.
            </p>
            <button
              onClick={() => navigate("/store-theme")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
            >
              Select Hero Theme
              <FiArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
      <HeroBannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedBannerId={heroBanner || null}
        bannerData={selectedBannerData || null}
        fullBannerData={bannerData || null}
      />
    </div>
  );
};

export default HeroBanner;
