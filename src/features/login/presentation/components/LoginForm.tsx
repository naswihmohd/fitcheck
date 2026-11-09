import { useEffect, useState } from 'react'
import type { RootState } from '../../../../general/redux/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import type { FirebaseError } from 'firebase/app';
import { useForm } from 'react-hook-form';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig';
import { FiLock, FiMail } from 'react-icons/fi';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';
import ForgotPasswordModal from './ForgotPasswordModal';
import { isAllowedEmail } from '../../constants/allowedEmails';

interface LoginFormData {
    email: string;
    password: string;
}

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { user } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const getFriendlyErrorMessage = (error: FirebaseError | Error) => {
        if ('code' in error) {
            switch (error.code) {
                case 'auth/invalid-email':
                    return 'The email address is not valid.';
                case 'auth/user-disabled':
                    return 'This user account has been disabled. Please contact support.';
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    return 'Incorrect email or password. Please try again.';
                case 'auth/too-many-requests':
                    return 'Too many failed attempts. Please wait a moment and try again.';
                case 'auth/popup-closed-by-user':
                    return 'Sign-in cancelled. Popup was closed before completion.';
                case 'auth/popup-blocked':
                    return 'Sign-in popup was blocked by your browser. Please allow popups.';
                case 'auth/cancelled-popup-request':
                    return 'Sign-in request was cancelled.';
                default:
                    return 'Unable to sign in right now. Please try again later.';
            }
        }
        return 'An unexpected error occurred. Please try again.';
    };

    const handleGoogleSignIn = async () => {
        setAuthError(null);
        setIsGoogleSubmitting(true);
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await signInWithPopup(auth, provider);

            const email = result.user?.email;
            if (!isAllowedEmail(email)) {
                await signOut(auth);
                setAuthError(`Access denied. The email "${email || 'unknown'}" is not authorized to sign in.`);
                return;
            }

            navigate('/', { replace: true });
        } catch (error: any) {
            if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
                return;
            }
            const message = error instanceof Error ? getFriendlyErrorMessage(error as FirebaseError) : 'Unable to sign in with Google.';
            setAuthError(message);
        } finally {
            setIsGoogleSubmitting(false);
        }
    };

    const onSubmit = async (data: LoginFormData) => {
        setAuthError(null);

        if (!isAllowedEmail(data.email)) {
            setAuthError(`Access denied. The email "${data.email}" is not authorized to sign in.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            if (!isAllowedEmail(userCredential.user?.email)) {
                await signOut(auth);
                setAuthError('Access denied. This email is not authorized to sign in.');
                return;
            }
            navigate('/', { replace: true });
        } catch (error) {
            const message = error instanceof Error ? getFriendlyErrorMessage(error as FirebaseError) : 'Unable to sign in.';
            setAuthError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            {authError && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {authError}
                </div>
            )}

            {/* Google Sign-in on top */}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting || isSubmitting}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
                <FcGoogle className="h-5 w-5 shrink-0" />
                <span>{isGoogleSubmitting ? 'Signing in with Google...' : 'Sign in with Google'}</span>
            </button>

            <div className="relative my-5 flex items-center justify-center">
                <div className="w-full border-t border-gray-200" />
                <span className="absolute bg-white px-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                    or continue with email
                </span>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                    <div className="relative">
                        <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            placeholder="Enter your email"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-12 py-3.5 text-sm text-gray-900 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20"
                        />
                    </div>
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <div className="relative flex items-center">
                        <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            {...register('password', {
                                required: 'Password is required',
                            })}
                            placeholder="Enter your password"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-12 py-3.5 pr-12 text-sm text-gray-900 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 transition hover:text-gray-700 focus:outline-none"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <IoEyeOffOutline className="h-5 w-5" /> : <IoEyeOutline className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="cursor-pointer text-xs font-medium text-primary hover:underline focus:outline-none"
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(0,81,175,0.65)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? 'Signing in...' : 'Continue'}
                </button>
            </form>

            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
            />
        </div>
    )
}

export default LoginForm
