import React from 'react';
import LoginForm from './components/LoginForm';

const Login: React.FC = () => {
    return (
        <div className="relative flex min-h-dvh items-center justify-center bg-gradient-to-br from-[#F3F8FF] via-white to-[#E7EEFF] px-4 py-8 sm:px-6 sm:py-12">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-10 right-[-6rem] h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
            </div>

            <div className="relative w-full max-w-[420px] rounded-3xl bg-white px-5 py-8 shadow-[0_35px_90px_-30px_rgba(13,44,80,0.45)] sm:rounded-[32px] sm:px-10 sm:py-12">
                <div className="mb-4 flex flex-col items-center text-center">
                    <img
                        src="/apple-touch-icon.png"
                        alt="OnRevv logo"
                        className="mb-5 h-auto w-full rounded-xl object-contain max-w-[80px]"
                    />
                    <h1 className="text-xl font-semibold text-secondary sm:text-2xl">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 sm:text-base">
                        Login to continue
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    );
};

export default Login;
