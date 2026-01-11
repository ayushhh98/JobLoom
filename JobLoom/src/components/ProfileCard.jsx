import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Github, Globe, Mail, MapPin, Briefcase, CheckCircle, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const ensureProtocol = (url) => {
    if (!url) return '';
    let cleanUrl = url.replace(/^[\s\/]+/, '').replace(/\s+$/, '');
    if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
    }
    return cleanUrl;
};

export default function ProfileCard({ user }) {
    if (!user) return null;

    const skills = user.skills
        ? (typeof user.skills === 'string' ? user.skills.split(',') : (Array.isArray(user.skills) ? user.skills : []))
        : [];

    return (
        <div className="flex items-center justify-center p-0 mb-10 w-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full"
            >
                <Card className="relative overflow-hidden rounded-none md:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-white border-0 md:border border-gray-100/50">

                    {/* Banner with Animated Gradient & Pattern - Height 100px */}
                    <div className="absolute top-0 left-0 w-full h-[100px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
                        <div className="absolute inset-0 opacity-10 flex bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 p-16 bg-black/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    {/* Spacer for Banner content - Height 100px */}
                    <div className="h-[80px] relative z-0" />

                    {/* Adjusted negative margin (-mt-12) to prevent clipping with short banner */}
                    <CardContent className="relative px-6 md:px-12 pb-12 -mt-12 z-10">

                        {/* Header / Identity Row */}
                        <div className="flex flex-col md:flex-row items-start gap-9">

                            {/* Avatar Group */}
                            <div className="flex-shrink-0 relative group">
                                <div className="relative">
                                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-[2rem] border-4 border-white shadow-2xl overflow-hidden bg-white transition-transform duration-300 group-hover:scale-[1.02]">
                                        <img
                                            src={user.profilePhoto || "https://via.placeholder.com/150"}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Online Status Indicator */}
                                    <span className="absolute bottom-4 right-[-8px] flex h-6 w-6">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 border-2 border-white"></span>
                                    </span>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 w-full pt-4 md:pt-[60px] h-[10]">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                                                {user.name}
                                            </h1>

                                        </div>

                                        <p className="text-2xl text-indigo-600 font-medium mb-4">
                                            {user.headline || 'Senior Full Stack Developer'}
                                        </p>

                                        {/* Meta Data Grid */}
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-500 font-medium text-base">
                                            <div className="flex items-center gap-2">
                                                <span className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                                                    <MapPin size={18} />
                                                </span>
                                                {user.location || 'San Francisco, CA'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                                                    <Mail size={18} />
                                                </span>
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                                                    <Briefcase size={18} />
                                                </span>
                                                {user.experience || '5+ Years'} Experience
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                        <Button className="flex-1 md:flex-none h-14 rounded-xl px-10 bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-lg shadow-gray-900/20 active:scale-95 transition-all text-lg">
                                            Hire Me
                                        </Button>
                                        {user.resume && (
                                            <a href={user.resume} target="_blank" rel="noreferrer" className="flex-1 md:flex-none">
                                                <Button variant="outline" className="w-full h-14 rounded-xl border-2 px-8 font-semibold hover:border-gray-900 hover:text-white-900 transition-all gap-2 text-lg">
                                                    <Download size={20} /> CV
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">

                            {/* Left Column: Stats & Skills */}
                            <div className="lg:col-span-2 space-y-12">

                                {/* Stats Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 h-[50]">
                                    {[
                                        { label: "Projects", value: user.stats?.projects || "50+" },
                                        { label: "Happy Clients", value: user.stats?.happyClients || "30+" },
                                        { label: "Years Exp.", value: user.stats?.yearsExperience || "5+" },
                                        { label: "Awards", value: user.stats?.awards || "12" },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                            <p className="text-4xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{stat.value}</p>
                                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-2">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* About Section */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        Professional Summary
                                        <div className="h-px bg-gray-200 flex-1 ml-4"></div>
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {user.about || "Passionate and results-driven senior developer with a track record of delivering high-performance web solutions. Specialized in full-stack development using the MERN stack, cloud infrastructure, and modern UI/UX principles. Dedicated to writing clean, maintainable code and solving complex business problems."}
                                    </p>
                                </div>

                                {/* Skills Section */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        Technical Expertise
                                        <div className="h-px bg-gray-200 flex-1 ml-4"></div>
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {skills.length > 0 ? skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-6 py-3 rounded-xl bg-gray-50 text-gray-700 text-sm font-semibold border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-default"
                                            >
                                                {skill.trim()}
                                            </span>
                                        )) : (
                                            <span className="text-gray-500 italic">No skills added yet</span>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Right Column: Social & Details */}
                            <div className="space-y-8">
                                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Connect</h4>
                                    <div className="space-y-4">
                                        {user.social?.linkedin && (
                                            <a href={ensureProtocol(user.social.linkedin)} target="_blank" rel="noreferrer" className="block">
                                                <Button variant="outline" className="w-full justify-start h-14 rounded-xl bg-white border-gray-200 hover:border-blue-500 hover:text-blue-600 group text-gray-600 text-base">
                                                    <Linkedin size={22} className="mr-3 group-hover:scale-110 transition-transform" />
                                                    LinkedIn
                                                    <ExternalLink size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Button>
                                            </a>
                                        )}
                                        {user.social?.github && (
                                            <a href={ensureProtocol(user.social.github)} target="_blank" rel="noreferrer" className="block">
                                                <Button variant="outline" className="w-full justify-start h-14 rounded-xl bg-white border-gray-200 hover:border-gray-900 hover:text-gray-900 group text-gray-600 text-base">
                                                    <Github size={22} className="mr-3 group-hover:scale-110 transition-transform" />
                                                    GitHub
                                                    <ExternalLink size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Button>
                                            </a>
                                        )}
                                        {user.social?.portfolio && (
                                            <a href={ensureProtocol(user.social.portfolio)} target="_blank" rel="noreferrer" className="block">
                                                <Button variant="outline" className="w-full justify-start h-14 rounded-xl bg-white border-gray-200 hover:border-emerald-500 hover:text-emerald-600 group text-gray-600 text-base">
                                                    <Globe size={22} className="mr-3 group-hover:scale-110 transition-transform" />
                                                    Portfolio
                                                    <ExternalLink size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Button>
                                            </a>
                                        )}
                                        {(!user.social?.linkedin && !user.social?.github && !user.social?.portfolio) && (
                                            <p className="text-sm text-gray-400 italic">No social links provided</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
                                    <h4 className="text-sm font-bold opacity-90 uppercase tracking-wider mb-4">Availability</h4>
                                    <p className="text-3xl font-bold mb-2">Open to Work</p>
                                    <p className="text-indigo-100 text-base mb-8">I am currently available for freelance projects and full-time opportunities.</p>
                                    <Button className="w-full bg-white text-indigo-600 hover:bg-gray-100 border-none h-12 text-base font-semibold">
                                        Schedule a Call
                                    </Button>
                                </div>
                            </div>

                        </div>

                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
