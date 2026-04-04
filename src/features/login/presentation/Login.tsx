import React, { useState } from 'react';
import logo from '../../../assets/images/logo.png';
import bgImage from '../../../assets/images/login-bg.png';
import { motion, AnimatePresence } from 'framer-motion';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';



const Login: React.FC = () => {

    const [showRegister, setShowRegister] = useState(false);

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F3F8FF] via-white to-[#E7EEFF] px-4 py-12">
            <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-10 right-[-6rem] h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
            </div>

            <div
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
                className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-white/70 shadow-[0_35px_90px_-30px_rgba(13,44,80,0.45)] backdrop-blur-lg lg:flex"
            >
                {/* Visual Panel */}
                <div className="relative hidden w-full overflow-hidden lg:block lg:w-1/2">
                    <div className="flex h-full flex-col items-center justify-center">
                        <div className='text-center bg-white/10 backdrop-blur-md px-4 py-6 rounded-2xl'>
                            <img src={logo} alt="Edwin Academy logo" className="max-w-[159px] mx-auto w-full" />
                            <h1 className="text-xl pt-4 font-semibold text-secondary">
                                Welcome to ShopMateEZ!
                            </h1>
                            <p className='font-semibold text-secondary text-base'>login to explore</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login/Register Form */}
                <div className="w-full py-20 rounded-l-4xl bg-white px-8 md:px-12 lg:w-1/2">
                    <div className="w-full max-w-md">
                        <AnimatePresence mode="wait">
                            {showRegister ? (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <RegisterForm />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <LoginForm />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Toggle Button */}
                        <div className="mt-6 text-center">
                            {showRegister ? (
                                <button
                                    type="button"
                                    onClick={() => setShowRegister(false)}
                                    className="text-sm text-gray-600 hover:text-primary transition-colors font-medium"
                                >
                                    Already have a company? <span className="text-primary font-semibold">Login</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowRegister(true)}
                                    className="text-sm text-gray-600 hover:text-primary transition-colors font-medium"
                                >
                                    Don't have a company? <span className="text-primary font-semibold">Create New Company</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
