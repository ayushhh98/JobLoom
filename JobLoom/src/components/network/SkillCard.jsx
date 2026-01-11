import { motion } from "framer-motion";

export const getTrend = (trend) => {
    switch (trend) {
        case "up": return { icon: "↑", color: "text-emerald-500", bg: "bg-emerald-50" };
        case "down": return { icon: "↓", color: "text-rose-500", bg: "bg-rose-50" };
        default: return { icon: "—", color: "text-gray-400", bg: "bg-gray-50" };
    }
};

export function SkillProgress({ value }) {
    return (
        <div className="h-2 bg-indigo-50 rounded-full overflow-hidden w-full">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-500"
            />
        </div>
    );
}

export default function SkillCard({ skill, onEndorse }) {
    const trend = getTrend(skill.trend);

    return (
        <div
            className="group p-5 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.1)] transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {skill.name}
                    </h3>
                    <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full mt-1 inline-block uppercase tracking-wider">
                        {skill.category}
                    </span>
                </div>

                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${trend.bg} ${trend.color} font-bold text-lg`}>
                    {trend.icon}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-gray-500">Mastery</span>
                    <span className="text-gray-900">{skill.progress}%</span>
                </div>
                <SkillProgress value={skill.progress} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                        {skill.endorsements} endorsements
                    </span>
                </div>

                <button
                    onClick={() => onEndorse(skill.id)}
                    className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors relative overflow-hidden active:scale-95"
                    title="Endorse"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-up"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
                </button>
            </div>
        </div>
    );
}
