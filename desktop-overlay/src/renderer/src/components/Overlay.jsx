import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Inbox, Plus } from 'lucide-react';
import audioFile from '../../../../assets/drumSound.wav';

import { fetchLatestNotifications, markNotificationsAsRead } from '../hooks/notis';

export default function Overlay() {
    const [notifications, setNotifications] = useState([]);

    // This key forces Framer Motion to replay animations when it increments
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        const triggerReplay = () => setAnimationKey(prev => prev + 1);
        window.addEventListener('replay-animations', triggerReplay);
        return () => window.removeEventListener('replay-animations', triggerReplay);
    }, []);

    // Fetch notifications every 2 seconds
    useEffect(() => {
        const pollNotis = async () => {
            try {
                const newNotis = await fetchLatestNotifications();
                console.log(`Contents of get new notifications: ${newNotis}`);
                if (newNotis && newNotis.length > 0) {
                    setNotifications((prev) => {
                        const existingIds = new Set(prev.map(n => n.id));
                        const uniqueNew = newNotis.filter(n => !existingIds.has(n.id)); // This makes uniqueNew an array of IDs we haven't seen yet.

                        if (uniqueNew.length > 0) {
                            const audio = new Audio(audioFile);
                            audio.volume = 0.5;
                            audio.play().catch(err => console.error("Audio playback blocked:", err));
                        }

                        return [...uniqueNew, ...prev];
                    });
                }
            }
            catch (err) {
                console.error("Polling error:", err);
            }
        };

        const interval = setInterval(pollNotis, 2000);
        pollNotis();

        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (typeof id === 'string' && id.startsWith('test-')) return;
        await markNotificationsAsRead([id]);
    };

    const handleClearAll = async () => {
        const allIds = notifications.filter(n => !(typeof n.id === 'string' && n.id.startsWith('test-'))).map(n => n.id);
        setNotifications([]);
        if (allIds.length > 0) {
            await markNotificationsAsRead(allIds);
        }
    };

    const handleAddTestNoti = () => {
        const audio = new Audio(audioFile);
        audio.volume = 0.5;
        audio.play().catch(err => console.error("Audio playback blocked:", err));

        const redBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
        const blueBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAA/sTYr9Y4OLAAAAABJRU5ErkJggg==";

        const testNotification = {
            id: `test-${Date.now()}`,
            app_package: 'com.tester.framer',
            title: 'Gareth Noble',
            message: 'This is a mocked notification to test the UI animations, scrolling, and layout. It looks great!',
            timestamp: Date.now(),
            image_base64: redBase64,
            icon_base64: blueBase64
        };
        setNotifications(prev => [testNotification, ...prev]);
    };

    return (
        <div className="fixed top-0 right-0 w-96 p-4 h-screen flex flex-col gap-3 pointer-events-none">

            {/* The animationKey is applied here! When it increments, everything inside resets! */}
            <div key={animationKey} className="flex flex-col gap-3 h-full overflow-hidden">

                {/* Top Bar */}
                <AnimatePresence>
                    {notifications.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex justify-between items-center pointer-events-auto shrink-0"
                        >
                            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-700 shadow-lg">
                                <Bell size={14} className="text-blue-400" />
                                <span className="text-xs font-semibold text-zinc-200">{notifications.length} New</span>
                            </div>

                            <button
                                onClick={handleClearAll}
                                className="group flex items-center gap-1.5 bg-zinc-900 hover:bg-red-950 px-3 py-1.5 rounded-full border border-zinc-700 hover:border-red-500 shadow-lg transition-all duration-200"
                            >
                                <Trash2 size={14} className="text-zinc-400 group-hover:text-red-400" />
                                <span className="text-xs font-semibold text-zinc-400 group-hover:text-red-400">Clear All</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stack of Cards or Empty State */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4 scrollbar-none [&::-webkit-scrollbar]:hidden pointer-events-auto">
                    <AnimatePresence mode="wait">
                        {notifications.length === 0 ? (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                className="flex flex-col items-center justify-center py-10 px-4 bg-zinc-900 rounded-2xl border border-zinc-700 text-center shadow-lg"
                            >
                                <div className="bg-zinc-800/50 p-3 rounded-full mb-3">
                                    <Inbox size={24} className="text-zinc-500" />
                                </div>
                                <h3 className="text-sm font-medium text-zinc-300">All caught up!</h3>
                                <p className="text-xs text-zinc-500 mt-1">No new notifications right now.</p>
                            </motion.div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {notifications.map((noti) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.8, x: 50 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, x: 50 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        key={noti.id}
                                        className="relative w-full rounded-2xl shadow-xl bg-zinc-900 border border-zinc-700 text-white flex flex-col p-4 overflow-hidden group shrink-0"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3 overflow-hidden pr-8">
                                                {noti.icon_base64 ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${noti.icon_base64}`}
                                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-zinc-700/50 shadow-sm mt-0.5"
                                                        alt="App Icon"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/50 flex-shrink-0 flex items-center justify-center mt-0.5">
                                                        <Bell size={16} className="text-zinc-500" />
                                                    </div>
                                                )}

                                                <div className="flex flex-col items-start overflow-hidden pt-0.5">
                                                    <span className="text-sm font-bold truncate text-zinc-100 max-w-full">{noti.title}</span>
                                                    <span className="bg-blue-600/90 text-blue-50 text-[9px] uppercase tracking-wider font-bold px-1.5 py-[2px] rounded mt-1 flex-shrink-0">
                                                        {(() => {
                                                            const parts = noti.app_package.split('.');
                                                            return parts.length > 1 ? `${parts[1]} ${parts.pop()}` : noti.app_package;
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 flex-shrink-0">
                                                {noti.large_icon_base64 && (
                                                    <img
                                                        src={`data:image/jpeg;base64,${noti.large_icon_base64}`}
                                                        className="w-10 h-10 rounded-full object-cover border border-zinc-700/50 shadow-sm"
                                                        alt="Profile"
                                                    />
                                                )}
                                                <span className="text-[10px] text-zinc-500 pt-1 font-medium">
                                                    {new Date(noti.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-zinc-300 leading-relaxed pr-8 line-clamp-4">
                                            {noti.message}
                                        </p>

                                        {noti.image_base64 && (
                                            <div className="mt-3 relative rounded-lg overflow-hidden border border-zinc-700/50">
                                                <img
                                                    src={`data:image/jpeg;base64,${noti.image_base64}`}
                                                    alt="attachment"
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-zinc-700/50 shadow-sm mt-0.5"
                                                />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleMarkAsRead(noti.id)}
                                            className="absolute bottom-4 right-4 bg-zinc-800 hover:bg-green-600 text-zinc-400 hover:text-white p-2 rounded-full shadow-lg border border-zinc-700/50 hover:border-green-500 transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                                            title="Mark as Read"
                                        >
                                            <Check size={16} strokeWidth={3} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* TESTING BUTTON */}
            <button
                onClick={handleAddTestNoti}
                className="fixed bottom-6 right-6 flex items-center gap-2 pointer-events-auto bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-full shadow-lg border border-blue-400/50 transition-all z-50 group"
            >
                <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                <span className="font-semibold text-sm">Test Noti</span>
            </button>

        </div>
    );
}