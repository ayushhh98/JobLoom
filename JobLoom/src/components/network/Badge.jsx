import { motion } from "framer-motion";

export default function Badge({ badge, isUnlocked }) {
    return (
        <motion.div
            className={`flex flex-col items-center p-4 rounded-xl border ${isUnlocked ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-gray-100 opacity-50 grayscale'}`}
            whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
        >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner ${isUnlocked ? 'bg-white' : 'bg-gray-200'}`}>
                {badge.icon}
            </div>
            <h4 className="font-bold text-gray-900 text-sm text-center mb-1">{badge.name}</h4>
            <span className="text-xs text-center text-gray-500">{badge.criteria}</span>
            {isUnlocked && (
                <div className="mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Unlocked
                </div>
            )}
        </motion.div>
    );
}
