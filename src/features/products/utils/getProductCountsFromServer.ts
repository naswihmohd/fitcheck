import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

export const getProductCountsFromServer = async () => {
    const productsRef = collection(db, "products");

    // Total Products
    const totalSnap = await getCountFromServer(productsRef);

    // Active Products
    const activeQuery = query(productsRef, where("isActive", "==", true));
    const activeSnap = await getCountFromServer(activeQuery);

    // Trending Products
    const trendingQuery = query(productsRef, where("isTrending", "==", true));
    const trendingSnap = await getCountFromServer(trendingQuery);

    const inactiveProducts = totalSnap.data().count - activeSnap.data().count;

    return {
        totalProducts: totalSnap.data().count,
        activeProducts: activeSnap.data().count,
        inactiveProducts: inactiveProducts,
        trendingProducts: trendingSnap.data().count,
    };
};