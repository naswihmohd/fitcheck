import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { FiMail, FiX } from 'react-icons/fi';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [resetEmail, setResetEmail] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const [resetSuccess, setResetSuccess] = useState(false);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setResetEmail('');
            setResetError(null);
            setResetSuccess(false);
        }
    }, [isOpen]);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetError(null);
        setResetSuccess(false);
        
        if (!resetEmail) {
            setResetError('Please enter your email address');
            return;
        }

        setIsResetting(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetSuccess(true);
        } catch (error) {
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case 'auth/invalid-email':
                        setResetError('The email address is not valid.');
                        break;
                    case 'auth/user-not-found':
                        setResetError('No account found with this email address.');
                        break;
                    default:
                        setResetError('Unable to send reset email. Please try again later.');
                }
            } else {
                setResetError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsResetting(false);
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants: Variants = {
        hidden: { 
            opacity: 0, 
            scale: 0.9,
            y: 20
        },
        visible: { 
            opacity: 1, 
            scale: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                damping: 25,
                stiffness: 300
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 20,
            transition: {
                duration: 0.2
            }
        }
    };

    if (typeof window === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_35px_90px_-30px_rgba(13,44,80,0.45)]"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600 focus:outline-none"
                            aria-label="Close"
                        >
                            <FiX className="h-6 w-6" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-secondary mb-2">
                                Reset Password
                            </h2>
                            <p className="text-sm text-gray-600">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {resetSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                    Password reset email sent! Please check your inbox and follow the instructions.
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(0,81,175,0.65)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-primary/30"
                                >
                                    Close
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                {resetError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {resetError}
                                    </motion.div>
                                )}

                                <div className="space-y-2">
                                    <div className="relative">
                                        <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-12 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isResetting}
                                        className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(0,81,175,0.65)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isResetting ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ForgotPasswordModal;
