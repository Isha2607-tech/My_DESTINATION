import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../../data/categoryApi";
import { useAuth } from "../../context/AuthContext";
import { Loader2, ArrowRight, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const VendorSignup = () => {
  const [categories, setCategories] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    category: "",
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success) {
          setCategories(res.categories);
        }
      } catch (error) {
        toast.error("Failed to load categories.");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && !/^[a-zA-Z\s]*$/.test(value)) {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(formData).some((v) => !v.trim())) {
      toast.error("All fields are required.");
      return;
    }

    setLoadingSubmit(true);
    const res = await signup(formData);
    setLoadingSubmit(false);

    if (res.success) {
      toast.success("Account created successfully!");
      navigate("/wedding/vendor/onboarding/step-1");
    } else {
      toast.error(res.error || "Signup failed");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <div className="wedding-module min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
              Create an Account
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Join our network of premium wedding vendors
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name / Business Name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
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
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <div className="relative">
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
                  disabled={loadingInitial}
                >
                  <SelectTrigger className={`${inputClass} h-[50px]`}>
                    <SelectValue placeholder={loadingInitial ? "Loading categories..." : "Select Vendor Category"} />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    side="bottom" 
                    avoidCollisions={true} 
                    className="z-[100] max-h-[200px] overflow-y-auto bg-white shadow-2xl border-border"
                  >
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingInitial && (
                  <Loader2 className="w-4 h-4 animate-spin absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground" />
                )}
              </div>
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loadingSubmit || loadingInitial}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-background wedding-gradient hover:shadow-lg transition-all disabled:opacity-70"
            >
              {loadingSubmit ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border pt-6">
            Already have an account?{" "}
            <Link to="/wedding/vendor/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSignup;
