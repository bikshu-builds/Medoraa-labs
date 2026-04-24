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
    MessageSquare
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

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Internal Repository</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Private administrative notes, observations, and procedural memos.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20">
                    <Plus className="w-4 h-4" />
                    New Memo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <div key={note._id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                                    <StickyNote className="w-5 h-5" />
                                </div>
                                <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{note.title}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3 mb-6">{note.content}</p>
                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User className="w-3 h-3" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600">{note.adminName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-bold">No internal notes found</h3>
                        <p className="text-slate-400 text-sm mt-1 font-medium">Create your first private memo to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesPage;
