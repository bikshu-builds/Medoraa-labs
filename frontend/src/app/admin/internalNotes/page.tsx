"use client";
import React, { useState, useEffect } from "react";
import { 
    StickyNote, 
    Plus, 
    User, 
    Clock, 
    MoreVertical, 
    Hash,
    Search,
    MessageSquare,
    X
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Note {
    _id: string;
    title: string;
    content: string;
    relatedModule: string;
    adminName: string;
    createdAt: string;
}

const NotesPage = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [relatedModule, setRelatedModule] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/notes"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setNotes(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSaving(true);
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(getApiUrl("/api/admin/notes"), {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, content, relatedModule })
            });
            const data = await res.json();
            if (data.success) {
                setTitle("");
                setContent("");
                setRelatedModule("");
                setIsCreateOpen(false);
                fetchNotes();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Internal Repository</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Private administrative notes, observations, and procedural memos.</p>
                </div>
                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                >
                    <Plus className="w-4 h-4" />
                    New Memo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <div key={note._id} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100/60">
                                    <StickyNote className="w-4.5 h-4.5" />
                                </div>
                                {note.relatedModule && (
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200/40 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                        {note.relatedModule}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-1">{note.title}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3 mb-4">{note.content}</p>
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-5.5 h-5.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User className="w-2.5 h-2.5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">{note.adminName || 'Admin'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100/60">
                            <MessageSquare className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-bold">No internal notes found</h3>
                        <p className="text-slate-400 text-sm mt-1 font-medium">Create your first private memo to get started.</p>
                    </div>
                )}
            </div>

            {/* Modal for creating a memo */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-200/60 w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-6 select-none">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-black tracking-tight text-slate-900">Create Private Memo</h2>
                                <p className="text-xs font-medium text-slate-400 mt-0.5">Note administrative instructions or reminders.</p>
                            </div>
                            <button 
                                onClick={() => setIsCreateOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100/60 hover:border-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">Memo Title</label>
                                <input 
                                    type="text" 
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter memo title..."
                                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-medium text-slate-700"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">Related Module (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={relatedModule}
                                        onChange={(e) => setRelatedModule(e.target.value)}
                                        placeholder="e.g. Finance, Reports, Billings"
                                        className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-medium text-slate-700"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">Content / Message</label>
                                <textarea 
                                    required
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Type instructions or details for this memo..."
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 transition-all text-xs font-medium text-slate-700 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200/60"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/10"
                                >
                                    {isSaving ? "Creating Memo..." : "Add Memo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesPage;
