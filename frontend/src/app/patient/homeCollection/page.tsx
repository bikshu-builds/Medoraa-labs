"use client";
import React from "react";
import { 
    Truck, 
    ShieldCheck, 
    MapPin, 
    Clock, 
    ArrowRight, 
    CheckCircle2,
    Activity,
    Info
} from "lucide-react";
import Link from "next/link";

export default function PatientHomeCollection() {
    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="bg-blue-600 rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">Laboratory at Your <br />Doorstep.</h1>
                    <p className="text-blue-100 text-lg font-medium mb-10 leading-relaxed">Book a professional phlebotomist for sample collection at your home or office. Safe, hygienic, and convenient.</p>
                    <Link href="/patient/tests" className="inline-flex items-center gap-4 px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 active:scale-95 transition-all">
                        Schedule Collection Now <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={ShieldCheck} 
                    title="Certified Staff" 
                    desc="All our phlebotomists are highly trained and background verified."
                    color="blue"
                />
                <FeatureCard 
                    icon={Clock} 
                    title="Flexible Slots" 
                    desc="Choose early morning or late evening slots as per your routine."
                    color="amber"
                />
                <FeatureCard 
                    icon={Activity} 
                    title="Real-time Tracking" 
                    desc="Track your assigned staff location on the day of collection."
                    color="emerald"
                />
            </div>

            <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">How it works?</h2>
                            <p className="text-slate-500 font-bold mt-2">Simple 3-step process to get your tests done at home.</p>
                        </div>
                        
                        <div className="space-y-10">
                            {[
                                { step: "01", title: "Book Online", desc: "Select tests, choose 'Home Collection' at checkout and pick a slot." },
                                { step: "02", title: "Sample Collection", desc: "Our staff visits your location, follows safety protocols and collects samples." },
                                { step: "03", title: "Digital Reports", desc: "Get notified as soon as your verified results are ready for download." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6">
                                    <span className="text-4xl font-black text-blue-100 italic">{item.step}</span>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900">{item.title}</h4>
                                        <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-1/3 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-600 rounded-xl text-white">
                                <Info className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Important</h3>
                        </div>
                        <ul className="space-y-4">
                            {[
                                "Ensure 10-12 hours fasting if required.",
                                "Keep your ID proof ready.",
                                "Digital signature required after collection.",
                                "Samples transported in cold chain kits."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 items-start text-xs font-bold text-slate-500 leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50",
        amber: "text-amber-500 bg-amber-50",
        emerald: "text-emerald-600 bg-emerald-50"
    };

    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 ${colors[color]}`}>
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">{desc}</p>
        </div>
    );
}
