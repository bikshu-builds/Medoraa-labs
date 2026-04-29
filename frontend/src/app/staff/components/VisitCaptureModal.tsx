"use client";
import React, { useRef, useState, useEffect } from "react";
import { Camera, MapPin, X, RefreshCw, CheckCircle2, Loader2, Smartphone, AlertCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface VisitCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
    onSuccess: () => void;
}

export default function VisitCaptureModal({ isOpen, onClose, collectionId, onSuccess }: VisitCaptureModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
            fetchLocation();
        } else {
            stopCamera();
            setCapturedImage(null);
            setError(null);
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user" }, 
                audio: false 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Failed to access camera. Please ensure permissions are granted.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const fetchLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationError(null);
            },
            (err) => {
                console.error("Location error:", err);
                setLocationError("Failed to get location. GPS is mandatory for check-in.");
            },
            { enableHighAccuracy: true }
        );
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.7);
                setCapturedImage(dataUrl);
                stopCamera();
            }
        }
    };

    const handleSubmit = async () => {
        if (!capturedImage || !location) {
            setError("Selfie and GPS location are both required.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem("staffToken");
            const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                screenSize: `${window.screen.width}x${window.screen.height}`
            };

            const res = await fetch(getApiUrl("/api/staff/visit-log"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    collectionId,
                    selfieUrl: capturedImage,
                    location,
                    deviceInfo
                })
            });

            const data = await res.json();
            if (data.success) {
                onSuccess();
                onClose();
            } else {
                setError(data.message || "Failed to log visit. Geofence violation?");
            }
        } catch (err) {
            console.error("Submit visit log error:", err);
            setError("Server connection failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden font-sans border border-white/20">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Proof of Visit</h2>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Operational Accountability</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Camera Section */}
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-900 border-4 border-slate-100 shadow-inner group">
                        {!capturedImage ? (
                            <>
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover mirror"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="w-48 h-64 border-2 border-white/30 rounded-[3rem] border-dashed" />
                                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-4">Center Face in Frame</p>
                                </div>
                                <button 
                                    onClick={capturePhoto}
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 border-blue-600/20"
                                >
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </button>
                            </>
                        ) : (
                            <>
                                <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                                <button 
                                    onClick={() => { setCapturedImage(null); startCamera(); }}
                                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-black/70"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Status Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-2xl border transition-all ${location ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className={`w-4 h-4 ${location ? 'text-emerald-500' : 'text-slate-400'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">GPS Status</span>
                            </div>
                            <p className={`text-xs font-bold ${location ? 'text-emerald-600' : 'text-slate-400 animate-pulse'}`}>
                                {location ? "Location Locked" : "Acquiring..."}
                            </p>
                        </div>
                        <div className={`p-4 rounded-2xl border transition-all ${capturedImage ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Smartphone className={`w-4 h-4 ${capturedImage ? 'text-emerald-500' : 'text-slate-400'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Selfie Status</span>
                            </div>
                            <p className={`text-xs font-bold ${capturedImage ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {capturedImage ? "Verified Photo" : "Pending Capture"}
                            </p>
                        </div>
                    </div>

                    {/* Error Display */}
                    {(error || locationError) && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                            <p className="text-xs font-bold text-rose-600 leading-relaxed">{error || locationError}</p>
                        </div>
                    )}

                    {/* Action */}
                    <button 
                        onClick={handleSubmit}
                        disabled={!capturedImage || !location || isSubmitting}
                        className="w-full bg-slate-900 hover:bg-blue-600 text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 disabled:bg-slate-200"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <><CheckCircle2 className="w-5 h-5" /> Confirm Check-in</>
                        )}
                    </button>
                    
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
                        This action will be timestamped and geofenced for auditing.
                    </p>
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
}
