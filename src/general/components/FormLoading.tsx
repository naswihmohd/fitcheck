'use client';

import { motion } from 'framer-motion';

const FormLoading = () => {
    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="text-primary flex justify-center items-center w-full h-full text-xl font-semibold"
            >
                <div className="three-body">
                    <div className="three-body__dot"></div>
                    <div className="three-body__dot"></div>
                    <div className="three-body__dot"></div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FormLoading;
