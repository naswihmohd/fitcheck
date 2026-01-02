import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface BlockShowingModalProps {
  isOpen: boolean;
  branchName?: string;
}

const BlockShowingModal: React.FC<BlockShowingModalProps> = ({ isOpen, branchName }) => {
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
          />

          {/* Modal Content */}
          <motion.div
            className="z-40 w-full m-2 bg-white lg:m-0 max-w-[380px] flex flex-col min-h-[170px] h-fit rounded-[14px] p-5"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              Branch access blocked
            </h4>

            <p className="text-sm text-gray-600">
              {branchName ? (
                <>
                  The branch <span className="font-medium">{branchName}</span> is currently{' '}
                  <span className="font-semibold text-red-500">disabled</span>. Please contact
                  your administrator to reactivate access.
                </>
              ) : (
                <>
                  Your branch is currently{' '}
                  <span className="font-semibold text-red-500">disabled</span>. Please contact
                  your administrator to reactivate access.
                </>
              )}
            </p>

            <div className="flex justify-end mt-6">
              <span className="inline-flex items-center rounded-[5px] bg-gray-100 px-4 py-1 text-xs font-medium text-gray-700">
                Access restricted
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default BlockShowingModal;


