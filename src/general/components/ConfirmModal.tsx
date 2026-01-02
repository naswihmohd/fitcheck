import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}


const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, message }) => {

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Background Overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="z-40 w-full m-2 bg-white lg:m-0 max-w-[355px] flex flex-col min-h-[150px] h-fit rounded-[14px] p-5"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >

                        {/* Content */}
                        <h6 className='text-sm font-medium whitespace-pre-line'>{message}</h6>

                        <div className='flex gap-2 justify-end mt-auto'>
                            <button
                                onClick={onClose}
                                className='max-w-[54px] border border-primary rounded-[5px] hover:bg-primary/50 cursor-pointer text-sm bg-primary text-white w-full py-1 h-fit duration-300'>
                                No
                            </button>
                            <button
                                onClick={() => { onConfirm(), onClose() }}
                                className='max-w-[54px] border border-primary rounded-[5px] cursor-pointer hover:bg-primary hover:text-white text-sm w-full py-1 h-fit duration-300'>
                                Yes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmModal;
