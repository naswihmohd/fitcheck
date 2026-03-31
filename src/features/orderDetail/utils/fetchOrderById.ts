import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import type { OrdersProps } from "../../orders/data/orderTypes";

const COLLECTION_NAME = "orders";

const fetchOrderById = async (orderId: string): Promise<OrdersProps | null> => {
    try {
        const orderDocRef = doc(db, COLLECTION_NAME, orderId);
        const orderSnapshot = await getDoc(orderDocRef);

        if (!orderSnapshot.exists()) {
            return null;
        }

        const orderData = orderSnapshot.data() as Omit<OrdersProps, "orderId"> & Partial<OrdersProps>;

        return {
            ...(orderData as OrdersProps),
            orderId: orderData.orderId || orderSnapshot.id,
        };
    } catch (error) {
        throw new Error("Failed to fetch order: " + (error as Error).message);
    }
};

export default fetchOrderById;
