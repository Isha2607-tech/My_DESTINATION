import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Lock, Bell, BellOff, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { userService } from "../../../services/apiService";
import ScrollReveal from "../components/ScrollReveal";
import { toast } from "react-hot-toast";

const AccountSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: ""
  });

  const [preferences, setPreferences] = useState({
    whatsapp: true,
    promotions: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        profileImage: data.profileImage || ""
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      if (error === "Not authorized, no token" || error.message === "Not authorized, no token") {
        toast.error("Please login to access settings");
      } else {
        toast.error("Failed to load profile details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await userService.updateProfile(profile);
      toast.success("Profile updated successfully!");
      // Update local storage if needed
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...profile }));
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafb] pb-20 pt-8 md:pt-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-6 md:mb-10">
          <Link 
            to="/wedding" 
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-4 md:mb-6 group"
          >
            <div className="p-2 rounded-full border border-slate-200 group-hover:border-primary transition-colors bg-white shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Home
          </Link>

          <ScrollReveal>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-5xl font-black text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Account Settings
                </h1>
                <p className="text-muted-foreground font-medium">
                  Manage your personal details and app preferences.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={100}>
          <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] border border-slate-100 shadow-xl p-6 md:p-10 space-y-8 relative overflow-hidden">
            
            {/* Header / Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
              <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-md bg-slate-100 flex items-center justify-center">
                {profile.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10" style={{ color: "#81313A" }} />
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {profile.name}
                </h2>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-center sm:justify-start">
                  <Mail className="w-4 h-4 text-primary" />
                  {profile.email || "No email provided"}
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSave}>
              {/* Profile Fields */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-primary/60" />
                      </div>
                      <input 
                        type="text" 
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-50/50 border border-slate-100 text-slate-900 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 ml-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-primary/60" />
                      </div>
                      <input 
                        type="tel" 
                        name="phone"
                        value={profile.phone}
                        readOnly // Phone is usually not changeable without OTP
                        className="w-full bg-slate-100 border border-slate-100 text-slate-500 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none cursor-not-allowed font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-primary/60" />
                    </div>
                    <input 
                      type="email" 
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="w-full bg-slate-50/50 border border-slate-100 text-slate-900 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4 pt-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Preferences</h3>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">WhatsApp Updates</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Receive booking and enquiry updates</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setPreferences({ ...preferences, whatsapp: !preferences.whatsapp })}
                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${preferences.whatsapp ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${preferences.whatsapp ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200 text-slate-500 rounded-xl">
                      <BellOff className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">Email Promotions</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Marketing emails and offers</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setPreferences({ ...preferences, promotions: !preferences.promotions })}
                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${preferences.promotions ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${preferences.promotions ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex gap-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
};

export default AccountSettingsPage;
