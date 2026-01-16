import { useEffect, useState } from 'react'
import type { AppDispatch, RootState } from '../../../../general/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import type { FirebaseError } from 'firebase/app';
import { useForm } from 'react-hook-form';
import { Constants } from '../../../../general/constants/constants';
import { verifyAndLoadUser } from '../../utils/verifyAndLoadUser';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig';
import { FiLock, FiMail } from 'react-icons/fi';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import ForgotPasswordModal from './ForgotPasswordModal';

interface LoginFormData {
    email: string;
    password: string;
}

const LoginForm = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { user } = useSelector((state: RootState) => state.user);
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
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
                    return 'Incorrect email or password. Please try again.';
                case 'auth/too-many-requests':
                    return 'Too many failed attempts. Please wait a moment and try again.';
                default:
                    return 'Unable to sign in right now. Please try again later.';
            }
        }
        return 'An unexpected error occurred. Please try again.';
    };

    const onSubmit = async (data: LoginFormData) => {
        setAuthError(null);
        setIsSubmitting(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            console.log('Successfully signed in:', userCredential.user);

            const verifyAndLoadUserResult = await verifyAndLoadUser(dispatch);
            if (verifyAndLoadUserResult.status === 'success') {
                navigate(verifyAndLoadUserResult.path as string, { replace: true });
            } else {
                setAuthError(verifyAndLoadUserResult.message);
            }

        } catch (error) {
            const message = error instanceof Error ? getFriendlyErrorMessage(error as FirebaseError) : 'Unable to sign in.';
            setAuthError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-sm">
            {authError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {authError}
                </div>
            )}
            <div className="mb-10 flex flex-col items-center">
                <div className="flex items-center justify-center">
                    <img src={Constants.APP_LOGO} alt="Edwin Academy logo" className="max-w-[159px] mx-auto w-full" />
                </div>
                <h1 className="text-2xl font-semibold text-secondary">
                    Login your account!
                </h1>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                    <div className="relative">
                        <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            id="email"
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                            placeholder="Enter your email"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-12 py-3 text-sm text-gray-900 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20"
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
                            {...register('password', {
                                required: 'Password is required',
                            })}
                            placeholder="Enter your password"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-12 py-3 pr-12 text-sm text-gray-900 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700 focus:outline-none"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <IoEyeOffOutline className="h-5 w-5" /> : <IoEyeOutline className="h-5 w-5" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-end text-sm text-gray-600">
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="font-semibold text-secondary transition hover:text-primary focus:outline-none"
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(0,81,175,0.65)] transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? 'Signing in...' : 'Continue'}
                </button>
            </form>

            {/* <div className="mt-8 text-center text-sm text-gray-500">
              Don’t have access yet?{' '}
              <span className="font-semibold text-secondary">Contact your administrator</span>
            </div> */}

            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
            />
        </div>
    )
}

export default LoginForm
