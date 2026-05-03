"use client";
import React, { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    ChevronRight,
    ArrowRight,
    ShieldCheck,
    Truck,
    Home,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { appEvents } from "@/lib/events";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CheckoutContent() {
    const [cart, setCart] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [sourceType, setSourceType] = useState<"Walk-in" | "Home Collection">("Home Collection");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const searchParams = useSearchParams();
    const selectedTestIds = searchParams.get("tests")?.split(",").filter(Boolean) || null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("patientToken");
                const [cartRes, profileRes] = await Promise.all([
                    fetch(getApiUrl("/api/patient/cart"), {
                        headers: { "Authorization": `Bearer ${token}` }
                    }),
                    fetch(getApiUrl("/api/patient/profile"), {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                ]);

                const cartData = await cartRes.json();
                if (cartData.success) setCart(cartData.data);

                const profileData = await profileRes.json();
                if (profileData.success) {
                    const addrs = profileData.data.addresses || [];
                    setAddresses(addrs);
                    const defaultAddr = addrs.find((a: any) => a.isDefault) || addrs[0];
                    if (defaultAddr) setSelectedAddressId(defaultAddr._id);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const slots = ["07:00 - 08:00 AM", "08:00 - 09:00 AM", "09:00 - 10:00 AM", "10:00 - 11:00 AM", "11:00 - 12:00 PM"];

    const bookingItems = selectedTestIds
        ? cart?.items?.filter((i: any) => selectedTestIds.includes(i.test._id))
        : cart?.items;

    const handleBooking = async () => {
        if (!bookingItems?.length) {
            alert("No tests selected for booking");
            return;
        }
        setIsLoading(true);
        try {
            const token = localStorage.getItem("patientToken");
            const testIds = selectedTestIds || cart.items.map((i: any) => i.test._id);
            const body: any = {
                tests: testIds,
                date: selectedDate,
                time: selectedSlot,
                sourceType
            };
            if (sourceType === "Home Collection" && selectedAddressId) {
                body.addressId = selectedAddressId;
            }
            const res = await fetch(getApiUrl("/api/patient/book-test"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const d = await res.json();
            if (d.success) {
                appEvents.emit("cartUpdated");
                window.location.href = "/patient/bookings";
            } else {
                alert(d.message || "Booking failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !cart) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finalize Booking</h1>
                <p className="text-slate-500 font-bold mt-1">Select your preferred slot and collection type.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    {/* Booking Type */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Service Preference</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSourceType("Home Collection")}
                                className={cn(
                                    "p-6 rounded-[1.5rem] border-2 text-left transition-all relative overflow-hidden group",
                                    sourceType === "Home Collection" ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-blue-200"
                                )}
                            >
                                <Truck className={cn("w-6 h-6 mb-4", sourceType === "Home Collection" ? "text-blue-600" : "text-slate-400")} />
                                <h4 className="text-sm font-black text-slate-900">Home Collection</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Free Phlebotomist Visit</p>
                                {sourceType === "Home Collection" && <CheckCircle2 className="absolute top-6 right-6 w-5 h-5 text-blue-600 animate-in zoom-in duration-300" />}
                            </button>
                            <button
                                onClick={() => setSourceType("Walk-in")}
                                className={cn(
                                    "p-6 rounded-[1.5rem] border-2 text-left transition-all relative overflow-hidden group",
                                    sourceType === "Walk-in" ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-blue-200"
                                )}
                            >
                                <Home className={cn("w-6 h-6 mb-4", sourceType === "Walk-in" ? "text-blue-600" : "text-slate-400")} />
                                <h4 className="text-sm font-black text-slate-900">Walk-in to Lab</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Fast Processing</p>
                                {sourceType === "Walk-in" && <CheckCircle2 className="absolute top-6 right-6 w-5 h-5 text-blue-600 animate-in zoom-in duration-300" />}
                            </button>
                        </div>
                    </div>

                    {/* DateTime Selection */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Schedule Slot</h3>

                        <div className="space-y-8">
                            <div>
                                <label className="text-xs font-black text-slate-900 block mb-4">Preferred Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full md:w-64 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-900 block mb-4">Available Time Slots</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={cn(
                                                "px-6 py-4 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between",
                                                selectedSlot === slot
                                                    ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                                                    : "border-slate-100 hover:border-blue-200 text-slate-500"
                                            )}
                                        >
                                            {slot}
                                            {selectedSlot === slot && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address (If Home Collection) */}
                    {sourceType === "Home Collection" && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Collection Address</h3>
                                <Link href="/patient/address" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">+ New Address</Link>
                            </div>

                            {addresses.length > 0 ? (
                                <div className="space-y-4">
                                    {addresses.map((addr: any) => (
                                        <button
                                            key={addr._id}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                            className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${selectedAddressId === addr._id ? "border-blue-600 bg-blue-50/30" : "border-slate-100 hover:border-blue-200"}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl shrink-0 ${selectedAddressId === addr._id ? "bg-white text-blue-600" : "bg-slate-50 text-slate-400"} shadow-sm`}>
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-black text-slate-900">{addr.label}</span>
                                                        {addr.isDefault && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px] font-black uppercase">Default</span>}
                                                        {selectedAddressId === addr._id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-500 leading-relaxed">{addr.fullAddress}, {addr.city}, {addr.state} - {addr.pincode}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-400">No addresses saved yet.</p>
                                    <Link href="/patient/address" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">+ Add Address</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Review Order</h3>

                        <div className="space-y-4 mb-10">
                            {bookingItems?.map((item: any) => (
                                <div key={item.test._id} className="flex justify-between items-start">
                                    <div className="flex-1 mr-4">
                                        <p className="text-xs font-bold text-slate-100 line-clamp-1">{item.test.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{item.test.category}</p>
                                    </div>
                                    <span className="text-sm font-black">₹{item.test.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/10 space-y-4 mb-10">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400">Booking Amount</span>
                                <span className="text-sm font-black">₹{bookingItems?.reduce((acc: any, i: any) => acc + i.test.price, 0)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400">Convenience Fee</span>
                                <span className="text-xs font-black text-emerald-400">FREE</span>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="text-sm font-bold text-white">Total Payable</span>
                                <span className="text-2xl font-black text-blue-400">₹{bookingItems?.reduce((acc: any, i: any) => acc + i.test.price, 0)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleBooking}
                            disabled={!selectedDate || !selectedSlot || (sourceType === "Home Collection" && !selectedAddressId)}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            Confirm & Pay
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-start gap-4">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Safety First</h4>
                            <p className="text-[10px] font-bold text-blue-700 leading-relaxed">Our phlebotomists are fully vaccinated and follow WHO-standard safety protocols.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PatientCheckout() {
    return (
        <React.Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>}>
            <CheckoutContent />
        </React.Suspense>
    );
}
