
import { useState } from 'react';
import toast from 'react-hot-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';
import ConfirmModal from '../../../../general/components/ConfirmModal';
import { updateProductCardThemeLocal, updateTrendingProductCardThemeLocal } from '../../../categoryManagement/redux/themeSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../general/redux/store';
import type { ProductCardThemeId } from '../ProductCardThemes';
import { useNavigate } from 'react-router';

interface ProductThemeChooseButtonProps {
    id: string;
    isSelected: boolean;
    setSelectedTheme: () => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    from: "all-products" | "trending";
}

const ProductThemeChooseButton = ({ id, isSelected, setSelectedTheme, loading, setLoading, from }: ProductThemeChooseButtonProps) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const handleConfirmChoose = async () => {
        const themeKey = from === "all-products" ? "productCardTheme" : "trendingProductCardTheme";
        try {
            setLoading(true);
            const docRef = doc(db, 'general', 'themes');
            await setDoc(docRef, { [themeKey]: id }, { merge: true });

            if (from === "all-products") {
                dispatch(updateProductCardThemeLocal(id as ProductCardThemeId));
            } else {
                dispatch(updateTrendingProductCardThemeLocal(id as ProductCardThemeId));
            }
            toast.success(`Product card theme ${id} chosen successfully!`);
            navigate(-1)
            setSelectedTheme();
        } catch (error) {
            console.error('Error saving product card theme:', error);
            toast.error('Failed to save product card theme. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleClick = () => {
        if (isSelected || loading) return;
        setIsConfirmOpen(true);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${isSelected
                        ? "bg-primary text-white"
                        : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                    }`}
            >
                {isSelected ? "Chosen" : "Choose product card"}
            </button>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmChoose}
                message="Changing this product card theme will update the user UI.
Are you sure you want to continue?"
            />
        </>
    )
}

export default ProductThemeChooseButton
