import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, ArrowRight, Loader2, Shield, User, Gift } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import leafBg from '../../assets/leaf_background.png';
import logo from '../../assets/rokologin-removebg-preview.png';
import { authService } from '../../services/apiService';
import toast from 'react-hot-toast';

const UserSignup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        referralCode: ''
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(120);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (location.state?.phone) {
            setFormData(prev => ({ ...prev, phone: location.state.phone }));
        }
        const storedCode = localStorage.getItem('referralCode');
        if (storedCode && !formData.referralCode) {
            setFormData(prev => ({ ...prev, referralCode: storedCode }));
        }
    }, [location]);

    useEffect(() => {
        let interval;
        if (step === 2 && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, resendTimer === 0]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || formData.name.length < 3) return setError('Please enter your full name');
        if (formData.phone.length !== 10) return setError('Please enter a valid 10-digit phone number');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) return setError('Please enter a valid email address');

        try {
            setLoading(true);
            await authService.sendOtp(formData.phone, 'register', 'user', formData.email);
            setResendTimer(120);
            setCanResend(false);
            setStep(2);
        } catch (err) {
            const errorMessage = err.message || '';
            const isDuplicate = err.requiresLogin || err.status === 409 || errorMessage.toLowerCase().includes('already exists');
            if (isDuplicate) {
                setError(`${errorMessage} Redirecting to login...`);
                setTimeout(() => navigate('/login', { state: { phone: formData.phone } }), 2000);
            } else {
                setError(errorMessage || 'Failed to send OTP');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
        if (value === '' && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
    };

    const handleResendOTP = async () => {
        if (!canResend) return;
        try {
            setLoading(true);
            setError('');
            await authService.sendOtp(formData.phone, 'register');
            setResendTimer(120);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            toast.success('OTP sent successfully!');
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) return setError('Please enter complete OTP');

        try {
            setLoading(true);
            const payload = {
                phone: formData.phone,
                otp: otpString,
                name: formData.name,
                email: formData.email || undefined,
                referralCode: formData.referralCode || undefined
            };
            await authService.verifyOtp(payload);
            try {
                window.dispatchEvent(new CustomEvent('fcm:register'));
            } catch (fcmErr) { }
            // Direct redirect to respective panel
            const userRaw = localStorage.getItem('user');
            const user = userRaw ? JSON.parse(userRaw) : null;
            
            let defaultRedirect = '/home';
            if (user?.role === 'partner') {
                defaultRedirect = '/hotel/dashboard';
            } else if (user?.role === 'vendor') {
                defaultRedirect = '/wedding/vendor/dashboard';
            }
            
            navigate(defaultRedirect, { replace: true });
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9F5] flex flex-col font-sans selection:bg-[#39593f] selection:text-white overflow-hidden relative">
            {/* Top Nature Plate */}
            <div className="relative h-[45dvh] w-full overflow-hidden">
                <img
                    src={leafBg}
                    alt="Nature"
                    className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                </div>
            </div>

            {/* Curvy Form Card */}
            <motion.main
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="flex-1 bg-white relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] -mt-16 pb-4"
            >
                {/* Asymmetrical Wave Curve Decorator */}
                <div className="absolute top-0 left-0 w-full -translate-y-[98%] pointer-events-none z-0">
                    <svg
                        viewBox="0 0 500 80"
                        preserveAspectRatio="none"
                        className="w-full h-20 fill-white"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M0,80 C150,0 350,110 500,30 L500,80 L0,80 Z" />
                    </svg>
                </div>

                <div className="max-w-sm mx-auto h-full flex flex-col px-8 pt-4">
                    <div className="mb-4 text-center">
                        <h2 className="text-2xl font-black text-[#39593f]">Create Account</h2>
                        <p className="text-[#A3B18A] text-xs font-bold mt-1 tracking-tight">Join My Destination & Start Your Journey</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                            >
                                <form onSubmit={handleSendOTP} className="space-y-3">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <label className="text-[#39593f] font-black text-[10px] uppercase tracking-widest block mb-1 px-1">Full Name</label>
                                            <div className="flex items-center bg-[#F8F9F5] rounded-2xl border-2 border-transparent transition-all focus-within:border-[#A3B18A] focus-within:bg-white h-14">
                                                <User size={18} className="ml-4 text-[#A3B18A]" />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="John Doe"
                                                    className="flex-1 bg-transparent px-4 text-[#39593f] font-black placeholder:text-[#DAD7CD]/80 outline-none h-full"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="text-[#39593f] font-black text-[10px] uppercase tracking-widest block mb-1 px-1">Phone Number</label>
                                            <div className="flex items-center bg-[#F8F9F5] rounded-2xl border-2 border-transparent transition-all focus-within:border-[#A3B18A] focus-within:bg-white h-14">
                                                <Phone size={18} className="ml-4 text-[#A3B18A]" />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                                    placeholder="9876543210"
                                                    maxLength={10}
                                                    className="flex-1 bg-transparent px-4 text-[#39593f] font-black placeholder:text-[#DAD7CD]/80 outline-none h-full"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="text-[#39593f] font-black text-[10px] uppercase tracking-widest block mb-1 px-1">Email <span className="lowercase text-[9px]">(Optional)</span></label>
                                            <div className="flex items-center bg-[#F8F9F5] rounded-2xl border-2 border-transparent transition-all focus-within:border-[#A3B18A] focus-within:bg-white h-14">
                                                <Mail size={18} className="ml-4 text-[#A3B18A]" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="you@example.com"
                                                    className="flex-1 bg-transparent px-4 text-[#39593f] font-black placeholder:text-[#DAD7CD]/80 outline-none h-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-[#F8F9F5] p-3 rounded-2xl border border-[#DAD7CD]/30 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Gift size={14} className="text-[#39593f]" />
                                                <span className="text-[9px] font-black text-[#39593f] uppercase tracking-widest">Referral Code</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.referralCode}
                                                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                                                placeholder="FRIEND100"
                                                className="w-full bg-white px-4 py-2 rounded-xl border border-[#DAD7CD]/30 text-[#39593f] font-black placeholder:text-[#DAD7CD]/80 outline-none h-10 uppercase tracking-widest text-center text-xs"
                                            />
                                            {formData.referralCode && (
                                                <p className="text-[8px] text-[#A3B18A] font-black text-center animate-pulse tracking-tighter">₹100 CREDIT WILL BE APPLIED</p>
                                            )}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-red-500 text-[11px] font-bold bg-red-50 py-3 px-4 rounded-xl border border-red-100 italic">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#39593f] text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-[#39593f]/30 hover:bg-[#39593f] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="text-center">
                                    <h3 className="text-xl font-black text-[#39593f]">Verify Account</h3>
                                    <p className="text-[#A3B18A] text-xs mt-2 font-bold">
                                        Sent to <span className="text-[#39593f] font-black">+91 {formData.phone}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOTP} className="space-y-8">
                                    <div className="flex gap-2.5 justify-center">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOTPChange(index, e.target.value)}
                                                onKeyDown={(e) => e.key === 'Backspace' && !digit && index > 0 && document.getElementById(`otp-${index - 1}`)?.focus()}
                                                className="w-11 h-14 bg-[#F8F9F5] border-2 border-transparent rounded-2xl text-center text-[#39593f] text-2xl font-black focus:border-[#A3B18A] focus:bg-white outline-none transition-all shadow-sm"
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>

                                    <div className="text-center">
                                        {canResend ? (
                                            <button type="button" onClick={handleResendOTP} className="text-[#39593f] font-black text-xs hover:underline">Resend OTP</button>
                                        ) : (
                                            <p className="text-[#DAD7CD] text-xs font-black italic">Resend available in <span className="text-[#39593f]">{resendTimer}s</span></p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-[#39593f] text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-[#39593f]/30 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Create My Account'}
                                        </button>
                                        <button type="button" onClick={() => setStep(1)} className="w-full text-[#A3B18A] text-[10px] font-black hover:text-[#39593f]">Back to Edit Details</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-4 pt-4 border-t border-[#F8F9F5] text-center">
                        <p className="text-[#A3B18A] text-sm font-bold">
                            Already have an account?{' '}
                            <button onClick={() => navigate('/login')} className="text-[#39593f] font-black hover:underline ml-1">Log in</button>
                        </p>
                    </div>
                </div>
            </motion.main>
        </div>
    );
};

export default UserSignup;
