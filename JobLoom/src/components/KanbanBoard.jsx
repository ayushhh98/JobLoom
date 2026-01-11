import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = {
    'Applied': { title: 'Applied', color: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
    'Screening': { title: 'Screening', color: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
    'Interviewing': { title: 'Interview', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
    'Offer': { title: 'Offer', color: 'bg-pink-100 text-pink-800', border: 'border-pink-200' },
    'Accepted': { title: 'Hired', color: 'bg-green-100 text-green-800', border: 'border-green-200' },
    'Rejected': { title: 'Rejected', color: 'bg-red-50 text-red-800', border: 'border-red-200' }
};

const KanbanBoard = ({ applications, onStatusUpdate }) => {
    const [columns, setColumns] = useState({});

    // Group applications by status
    useEffect(() => {
        if (!applications) return;

        const newColumns = Object.keys(COLUMNS).reduce((acc, status) => {
            acc[status] = applications.filter(app => {
                let appStatus = app.status;
                // Normalize statuses
                if (appStatus === 'Shortlisted') appStatus = 'Screening';
                if (appStatus === 'Interview') appStatus = 'Interviewing';
                if (!COLUMNS[appStatus] && status === 'Applied') return true; // Default to Applied if unknown
                if (!COLUMNS[appStatus]) return false;
                return appStatus === status;
            });
            return acc;
        }, {});
        setColumns(newColumns);
    }, [applications]);

    const [draggedApp, setDraggedApp] = useState(null);

    const onDragStart = (e, app) => {
        setDraggedApp(app);
        e.dataTransfer.effectAllowed = 'move';
        // Add a ghost image or style if needed
        e.dataTransfer.setData('text/plain', app._id); // Firefox requires data
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const onDrop = (e, status) => {
        e.preventDefault();
        if (draggedApp && draggedApp.status !== status) {
            onStatusUpdate(draggedApp._id, status);
            setDraggedApp(null);
        }
    };

    return (
        <div className="flex overflow-x-auto pb-8 gap-6 h-[calc(100vh-250px)] min-h-[500px] w-full items-start">
            {Object.keys(COLUMNS).map(status => (
                <div
                    key={status}
                    className={`flex-shrink-0 w-80 flex flex-col bg-slate-50 rounded-xl border border-slate-200 h-full max-h-full transition-colors ${draggedApp ? 'hover:bg-slate-100' : ''}`}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, status)}
                >
                    {/* Column Header */}
                    <div className={`p-4 border-b border-gray-200 bg-white sticky top-0 z-10 rounded-t-xl flex justify-between items-center shadow-sm`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${COLUMNS[status].color.split(' ')[0].replace('text', 'bg').replace('100', '500')}`}></div>
                            <h3 className="font-bold text-slate-700">{COLUMNS[status].title}</h3>
                        </div>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500">
                            {columns[status]?.length || 0}
                        </span>
                    </div>

                    {/* Column Content */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        <AnimatePresence>
                            {columns[status]?.map(app => (
                                <motion.div
                                    key={app._id}
                                    layoutId={app._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative z-0 hover:z-10"
                                    draggable
                                    onDragStart={(e) => onDragStart(e, app)}
                                >
                                    {/* Card Content */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={app.applicant?.profilePhoto || `https://ui-avatars.com/api/?name=${app.applicant?.name || 'User'}`}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                alt={app.applicant?.name}
                                                onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${app.applicant?.name || 'User'}`}
                                            />
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">{app.applicant?.name || 'Unknown Candidate'}</h4>
                                                <p className="text-xs text-slate-500 truncate max-w-[140px] mt-0.5">{app.job?.title || 'Unknown Job'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {app.applicant?.skills?.slice(0, 2).map((skill, i) => (
                                            <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-200 font-medium">
                                                {typeof skill === 'string' ? skill : skill.name}
                                            </span>
                                        ))}
                                        {(app.applicant?.skills?.length > 2) && (
                                            <span className="text-[10px] text-slate-400 px-1 font-medium">+ {app.applicant.skills.length - 2}</span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-slate-400 mt-2 pt-3 border-t border-slate-50">
                                        <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                                        <div className="flex gap-2">
                                            {/* We can propagate an onSelect event here to open modal */}
                                            {/* For now, just a visual indicator */}
                                            {app.fitScore && (
                                                <span className={`font-bold ${app.fitScore > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                                                    {app.fitScore}% Match
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(!columns[status] || columns[status].length === 0) && (
                            <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                <p className="text-xs text-slate-400 font-medium">Empty</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;
