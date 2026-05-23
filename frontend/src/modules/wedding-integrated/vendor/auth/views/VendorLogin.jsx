import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { getVendor } from "../../data/vendorApi"; // To check if they are onboarded

const VendorLogin = () => {
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, route away
  useEffect(() => {
    if (user) {
      navigate("/wedding/vendor/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("All fields are required.");
      return;
    }

    setLoadingSubmit(true);
    const res = await login(formData.email, formData.password);
    
    if (res.success) {
      toast.success("Welcome back!");
      // Check if they have an active vendor profile
      const vendorRes = await getVendor();
      if (vendorRes?.vendor?.status !== 'draft') {
        navigate("/wedding/vendor/dashboard");
      } else {
        navigate("/wedding/vendor/onboarding/step-1");
      }
    } else {
      toast.error(res.error || "Login failed");
      setLoadingSubmit(false); // Only reset loading on failure, success navigates away
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <div className="wedding-module min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Vendor Portal
            </span>
          </Link>
        </div>

        <div className="bg-card py-8 px-6 shadow-xl rounded-3xl border border-border sm:px-10 animate-wedding-fade-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sign in to manage your vendor dashboard
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputClass} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full flex justify-center items-center gap-2 mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-background wedding-gradient hover:shadow-lg transition-all disabled:opacity-70"
            >
              {loadingSubmit ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Log in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-6">
            Don't have an account?{" "}
            <Link to="/wedding/vendor/signup" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign up today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
