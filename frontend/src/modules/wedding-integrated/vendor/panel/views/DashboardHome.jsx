import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  ArrowUpRight, 
  Clock, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Loader2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import VendorLayout from "../layouts/VendorLayout";
import { weddingService } from "../../../../../services/weddingService";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalEnquiries: 0,
      newLeads: 0,
      profileViews: 0,
      shortlisted: 0,
      growth: {
        enquiries: "+0%",
        leads: "+0%",
        views: "+0%",
        shortlists: "+0%"
      }
    },
    recentLeads: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await weddingService.getVendorDashboardStats();
        if (response.success) {
          setData({
            stats: response.stats,
            recentLeads: response.recentLeads
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsConfig = [
    { label: "Total Enquiries", value: data.stats.totalEnquiries, icon: MessageCircle, growth: data.stats.growth?.enquiries || "+0%", color: "bg-blue-50 text-blue-500 shadow-blue-500/10", path: "/wedding/vendor/leads" },
    { label: "New Leads", value: data.stats.newLeads, icon: Users, growth: data.stats.growth?.leads || "+0%", color: "bg-emerald-50 text-emerald-500 shadow-emerald-500/10", path: "/wedding/vendor/leads" },
    { label: "Profile Views", value: data.stats.profileViews >= 1000 ? `${(data.stats.profileViews / 1000).toFixed(1)}K` : data.stats.profileViews, icon: Eye, growth: data.stats.growth?.views || "+0%", color: "bg-amber-50 text-amber-500 shadow-amber-500/10", path: "/wedding/vendor/profile" },
    { label: "Shortlisted", value: data.stats.shortlisted, icon: Heart, growth: data.stats.growth?.shortlists || "+0%", color: "bg-[#B06A6C]/10 text-[#B06A6C] shadow-[#B06A6C]/10", path: "/wedding/vendor/reviews" },
  ];

  if (loading) {
    return (
      <VendorLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-[#B06A6C] animate-spin" />
          <p className="text-[#8E7E77] font-black uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout title="Dashboard">
      <div className="space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {statsConfig.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                onClick={() => navigate(stat.path || '/wedding/vendor/leads')}
                className="bg-white rounded-[2rem] border border-[#F3E9E2] p-3.5 md:p-6 shadow-sm hover:shadow-xl hover:shadow-[#B06A6C]/5 transition-all duration-500 group animate-wedding-fade-up cursor-pointer hover:-translate-y-1"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className={`p-2 md:p-3 rounded-lg md:rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <div className="flex items-center gap-0.5 text-emerald-500 text-[9px] md:text-xs font-black">
                     <TrendingUp className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                     {stat.growth}
                  </div>
                </div>
                <div className="space-y-0">
                  <h3 className="text-lg md:text-3xl font-black text-[#4A3730] tracking-tight">{stat.value}</h3>
                  <p className="text-[8px] md:text-xs font-bold text-[#8E7E77] uppercase tracking-wider leading-none">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Leads */}
        <div className="space-y-5 animate-wedding-fade-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black text-[#4A3730] uppercase tracking-wider">
                Recent Enquiries
              </h3>
              <Link to="/wedding/vendor/leads" className="text-[11px] font-black text-[#B06A6C] uppercase tracking-widest hover:underline">
                View History
              </Link>
            </div>
            
            <div className="space-y-4">
               {data.recentLeads.length > 0 ? (
                 data.recentLeads.map((lead) => (
                  <div 
                    key={lead._id}
                    onClick={() => navigate('/wedding/vendor/leads')}
                    className="group bg-white rounded-[2rem] border border-[#F3E9E2] p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden cursor-pointer"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.25rem] md:rounded-2xl overflow-hidden shadow-sm shrink-0 bg-[#F3E9E2] flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#B06A6C]" />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-black text-[#4A3730] truncate">{lead.name}</h4>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          lead.status === 'New' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8E7E77]">
                          <Calendar className="w-3 h-3 text-[#B06A6C]" />
                          {lead.weddingDate ? format(new Date(lead.weddingDate), 'dd MMM yyyy') : 'No date'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8E7E77]">
                          <Clock className="w-3 h-3 text-[#B06A6C]" />
                          {lead.destination || 'General'}
                        </div>
                        <div className="font-black text-[#B06A6C] text-[11px]">{lead.budget || lead.budgetRange || 'No Budget'}</div>
                      </div>
                    </div>
                    <button className="absolute right-4 w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#B06A6C] hover:text-white transition-all group/btn shadow-inner">
                      <ArrowUpRight className="w-5 h-5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                ))
               ) : (
                 <div className="bg-white rounded-[2rem] border border-[#F3E9E2] border-dashed p-12 text-center">
                    <MessageCircle className="w-12 h-12 text-[#F3E9E2] mx-auto mb-3" />
                    <p className="text-[#8E7E77] font-bold">No enquiries yet</p>
                 </div>
               )}
            </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default DashboardHome;
