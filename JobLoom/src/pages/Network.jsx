import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import SkillCard from "../components/network/SkillCard";
import { GrowthChart, DistributionChart } from "../components/network/Charts";
import Badge from "../components/network/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Cpu, TrendingUp, Award, Zap, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Seed Data
const INITIAL_SKILLS = [
    { id: 1, name: "React Architecture", endorsements: 128, level: "Expert", progress: 95, category: "Frontend", trend: "up", lastUpdated: "2 days ago" },
    { id: 2, name: "UI/UX Strategy", endorsements: 84, level: "Expert", progress: 90, category: "Design", trend: "stable", lastUpdated: "1 week ago" },
    { id: 3, name: "TypeScript", endorsements: 62, level: "Intermediate", progress: 75, category: "Languages", trend: "up", lastUpdated: "3 days ago" },
    { id: 4, name: "Node.js Microservices", endorsements: 45, level: "Intermediate", progress: 60, category: "Backend", trend: "up", lastUpdated: "5 days ago" },
    { id: 5, name: "Cloud Infrastructure", endorsements: 31, level: "Beginner", progress: 40, category: "DevOps", trend: "down", lastUpdated: "2 weeks ago" },
];

const GROWTH_DATA = [
    { name: 'Jan', value: 30 }, { name: 'Feb', value: 45 }, { name: 'Mar', value: 42 },
    { name: 'Apr', value: 60 }, { name: 'May', value: 55 }, { name: 'Jun', value: 75 },
    { name: 'Jul', value: 85 }
];

const PIE_DATA = [
    { name: 'Frontend', value: 45 },
    { name: 'Backend', value: 30 },
    { name: 'Design', value: 15 },
    { name: 'DevOps', value: 10 },
];

const BADGES = [
    { id: 1, name: "100 Endorsements", icon: "🏆", criteria: "Receive 100+ total endorsements", unlocked: true },
    { id: 2, name: "Expert in 3 Skills", icon: "💎", criteria: "Reach 90%+ mastery in 3 skills", unlocked: false },
    { id: 3, name: "Fast Learner", icon: "🚀", criteria: "20% growth in one month", unlocked: true },
    { id: 4, name: "Community Pillar", icon: "🏛️", criteria: "Endorse 50 other developers", unlocked: false },
];

const RECOMMENDATIONS = [
    { id: "r1", title: "Generative AI Integration", impact: "+35%", desc: "Master LLM orchestration & vector search." },
    { id: "r2", title: "Web3 & Solidity", impact: "+22%", desc: "Explore decentralized application systems." },
    { id: "r3", title: "Rust Performance", impact: "+18%", desc: "High-performance backends & WASM." },
];

export default function NetworkPage() {
    const { user } = useAuth();
    const [skills, setSkills] = useState(INITIAL_SKILLS);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [tagline, setTagline] = useState("Senior Full Stack Developer");
    const [isEditingTagline, setIsEditingTagline] = useState(false);

    // Simulated Real-time Data
    useEffect(() => {
        // Initial Load
        const timer = setTimeout(() => setLoading(false), 1200);

        // Live Socket Simulation
        const liveUpdate = setInterval(() => {
            setSkills(prev => prev.map(s =>
                Math.random() > 0.9 ? { ...s, endorsements: s.endorsements + 1, trend: 'up' } : s
            ));
        }, 5000);

        return () => {
            clearTimeout(timer);
            clearInterval(liveUpdate);
        };
    }, []);

    const handleEndorse = (id) => {
        setSkills(prev => prev.map(s =>
            s.id === id ? { ...s, endorsements: s.endorsements + 1, trend: 'up' } : s
        ));
        // Ideally trigger a toast here
    };

    const filteredSkills = useMemo(() => {
        return skills.filter((s) => {
            const bySearch = s.name.toLowerCase().includes(search.toLowerCase());
            const byTab = activeTab === "all" || s.category.toLowerCase() === activeTab;
            return bySearch && byTab;
        });
    }, [skills, search, activeTab]);

    const stats = useMemo(() => {
        const total = skills.length;
        const avg = total ? Math.round(skills.reduce((a, b) => a + b.progress, 0) / total) : 0;
        const endorsements = skills.reduce((a, b) => a + b.endorsements, 0);
        const experts = skills.filter((s) => s.level === "Expert").length;
        return { total, avg, endorsements, experts };
    }, [skills]);


    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading Your Talent Network...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-20 pb-12">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                                <img src={user?.profilePhoto || "https://github.com/shadcn.png"} alt="Profile" className="w-full h-full rounded-2xl object-cover bg-white" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user?.name || "Alex Developer"}</h1>
                            {isEditingTagline ? (
                                <form
                                    onSubmit={(e) => { e.preventDefault(); setIsEditingTagline(false); }}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        autoFocus
                                        className="text-indigo-600 font-medium bg-white border border-indigo-200 rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={tagline}
                                        onChange={(e) => setTagline(e.target.value)}
                                        onBlur={() => setIsEditingTagline(false)}
                                    />
                                    <button type="submit" className="text-xs text-indigo-600 font-bold hover:underline">Save</button>
                                </form>
                            ) : (
                                <p
                                    onClick={() => setIsEditingTagline(true)}
                                    className="text-indigo-600 font-medium cursor-pointer hover:text-indigo-700 flex items-center gap-1.5 group"
                                >
                                    {tagline}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-500">Edit</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-1 md:flex-none">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search skills, people, or badges..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="shrink-0 bg-white hover:bg-gray-50 text-gray-500">
                            <Filter size={18} />
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">

                    {/* Main Content Area */}
                    <main className="space-y-8">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Skills", value: stats.total, icon: <Cpu size={20} className="text-indigo-600" />, color: "bg-indigo-50" },
                                { label: "Avg Mastery", value: `${stats.avg}%`, icon: <TrendingUp size={20} className="text-emerald-600" />, color: "bg-emerald-50" },
                                { label: "Endorsements", value: stats.endorsements, icon: <Award size={20} className="text-amber-600" />, color: "bg-amber-50" },
                                { label: "Expert Level", value: stats.experts, icon: <Zap size={20} className="text-violet-600" />, color: "bg-violet-50" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Skill Growth Trend</h3>
                                <GrowthChart data={GROWTH_DATA} />
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Category Distribution</h3>
                                <DistributionChart data={PIE_DATA} />
                            </div>
                        </div>

                        {/* Skills Grid */}
                        <div>
                            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                                {["all", "frontend", "backend", "design", "devops"].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-5 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all
                                       ${activeTab === tab
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`
                                        }
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                <AnimatePresence mode="popLayout">
                                    {filteredSkills.map(skill => (
                                        <motion.div
                                            key={skill.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <SkillCard skill={skill} onEndorse={handleEndorse} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            {filteredSkills.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-400">No skills found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* Sidebar */}
                    <aside className="space-y-6">

                        {/* Gamification / Badges */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 text-lg">Achievements</h3>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Level 5</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {BADGES.map(badge => (
                                    <Badge key={badge.id} badge={badge} isUnlocked={badge.unlocked} />
                                ))}
                            </div>
                        </div>

                        {/* AI Recommendations */}
                        <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-yellow-400" fill="currentColor" />
                                Smart Insights
                            </h3>

                            <div className="space-y-4 relative z-10">
                                {RECOMMENDATIONS.map(rec => (
                                    <div key={rec.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold text-sm group-hover:text-indigo-200 transition-colors">{rec.title}</h4>
                                            <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">{rec.impact}</span>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed">{rec.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-3 bg-white text-indigo-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                                Generate New Growth Plan
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Button className="w-full justify-start gap-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none h-12">
                                    <div className="bg-white p-1 rounded-md shadow-sm"><TrendingUp size={16} /></div>
                                    Take Skill Assessment
                                </Button>
                                <Button className="w-full justify-start gap-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 h-12">
                                    <div className="bg-gray-100 p-1 rounded-md text-gray-500"><Award size={16} /></div>
                                    Claim Certification
                                </Button>
                            </div>
                        </div>

                    </aside>

                </div>
            </div>
        </div>
    );
}
