"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import React, { useRef } from "react";
import { ShieldCheck, Activity, Droplets, FlaskConical, Microscope, Sun, X } from "lucide-react";
import { ScrollNavigationMenu } from "@/components/scroll-navigation-menu";
import { TestimonialsColumn } from "@/components/testimonials-columns-1";
import RuixenBentoCards from "@/components/ui/ruixen-bento-cards";
import Footer from "@/components/footer";
import HeroBanner from "@/components/hero-banner";

const RecentActivityNotification = () => {
  const activities = [
    { name: "Raju", action: "booked a CBC Test", time: "2 mins ago" },
    { name: "Sita", action: "got her reports online", time: "5 mins ago" },
    { name: "Amit", action: "scheduled a Home Collection", time: "12 mins ago" },
    { name: "Priya", action: "booked a Full Body Checkup", time: "1 min ago" },
    { name: "Vikram", action: "consulted a doctor online", time: "8 mins ago" },
  ];

  const [index, setIndex] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 500);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-[9999] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-sm"
        >
          <div className="w-12 h-12 rounded-full bg-[#015971] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {activities[index].name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {activities[index].action}
            </p>
            <span className="text-[10px] text-gray-400 mt-1">{activities[index].time}</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── TESTIMONIALS DATA ──
const testimonials = [
  {
    text: "I got my blood test results within hours! The online report access made it so convenient. Highly recommend this lab for their speed and accuracy.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Briana Patton",
    role: "Verified Patient",
  },
  {
    text: "Booking my tests online was super easy, and the home sample collection service saved me so much time. Reports were accurate and delivered right on time.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Bilal Ahmed",
    role: "Verified Patient",
  },
  {
    text: "The staff was incredibly polite and professional. My reports came with a detailed breakdown that my doctor truly appreciated. Will always use this lab!",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Saman Malik",
    role: "Verified Patient",
  },
  {
    text: "I was nervous about my MRI scan, but the technicians were so reassuring and gentle. The facility was spotless and the results were crystal clear.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Omar Raza",
    role: "Verified Patient",
  },
  {
    text: "Affordable pricing with no compromise on quality. My full body checkup package was thorough and the doctor consultation included was a great bonus!",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Zainab Hussain",
    role: "Verified Patient",
  },
  {
    text: "The phlebotomist was gentle and skilled — I barely felt the blood draw! Reports were available on the app within 4 hours. Absolutely flawless experience.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Aliza Khan",
    role: "Verified Patient",
  },
  {
    text: "I use this lab for all my family's health checkups. The WhatsApp report delivery and friendly reminders for follow-up tests are features I truly love.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Farhan Siddiqui",
    role: "Verified Patient",
  },
  {
    text: "Visited for a thyroid panel and was impressed by how organized everything was. Zero wait time, clean environment, and my results matched my specialist's expectations perfectly.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Sana Sheikh",
    role: "Verified Patient",
  },
  {
    text: "The home collection team arrived right on schedule and were extremely professional. Getting my diabetes test done from home was a game changer for me.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Hassan Ali",
    role: "Verified Patient",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function Home() {
  // Ref for scroll-linked timeline
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      <ScrollNavigationMenu />
      <HeroBanner />

      {/* ── SCROLLING CARDS SECTION ── */}
      {/* ── CLASSIC SERVICES SECTION ── */}
      <section id="services" className="py-10 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A3263] dark:text-white mb-3">
              Our Core Services
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium">
              We offer a wide range of diagnostic services designed to provide accurate and timely insights into your health.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              {
                title: "Sugar Test (Diabetes)",
                desc: "Precise glucose monitoring to track and manage your blood sugar levels accurately.",
                icon: <Activity className="w-6 h-6" />,
              },
              {
                title: "Urine Analysis",
                desc: "Detailed chemical and microscopic examination to detect underlying kidney and urinary issues.",
                icon: <Droplets className="w-6 h-6" />,
              },
              {
                title: "Complete Blood Count",
                desc: "Essential screening to monitor overall health and detect disorders like anemia or infection.",
                icon: <FlaskConical className="w-6 h-6" />,
              },
              {
                title: "Thyroid Profile",
                desc: "Accurate testing of T3, T4, and TSH levels to ensure your metabolic health is optimal.",
                icon: <Sun className="w-6 h-6" />,
              },
              {
                title: "Lipid Profile",
                desc: "Analysis of cholesterol and triglycerides to monitor heart health and cardiovascular risk.",
                icon: <ShieldCheck className="w-6 h-6" />,
              },
              {
                title: "Kidney Function Test",
                desc: "Assessment of urea and creatinine levels to evaluate your renal health and function.",
                icon: <Microscope className="w-6 h-6" />,
              },
              {
                title: "Liver Function Test",
                desc: "Evaluation of enzymes and proteins to monitor liver health and detect potential disorders.",
                icon: <Activity className="w-6 h-6" />,
              },
              {
                title: "Vitamin D & B12",
                desc: "Essential screenings to check for deficiencies that affect bone health and energy levels.",
                icon: <Sun className="w-6 h-6" />,
              },
              {
                title: "Iron Studies",
                desc: "Tests to measure iron levels and detect conditions like anemia or iron overload.",
                icon: <Droplets className="w-6 h-6" />,
              },
              {
                title: "HBA1C Test",
                desc: "Long-term blood sugar monitoring to evaluate diabetes control over the past 3 months.",
                icon: <Activity className="w-6 h-6" />,
              },
              {
                title: "CRP (Inflammation)",
                desc: "Sensitive marker to detect inflammation and potential infection risk in the body.",
                icon: <Activity className="w-6 h-6" />,
              },
              {
                title: "Pregnancy Tests",
                desc: "Reliable screenings for pregnancy detection and early prenatal health monitoring.",
                icon: <Activity className="w-6 h-6" />,
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-zinc-900 border border-transparent hover:border-[#1A3263]/20 hover:bg-white dark:hover:bg-black transition-all hover:shadow-xl hover:shadow-[#1A3263]/5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-[#1A3263] dark:text-blue-400 mb-5 shadow-sm group-hover:bg-[#1A3263] group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1A3263] dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <div id="features">
        <RuixenBentoCards />
      </div>



      {/* ── PROCESS TIMELINE SECTION ── */}
      <section id="process" ref={timelineRef} className="pt-8 pb-12 bg-white dark:bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium">
              A simple and seamless process for your health checkup.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical Line Animation - Now scroll-linked and responsive */}
            <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 h-full w-1 bg-neutral-100 dark:bg-neutral-800" />
            <motion.div
              className="absolute left-6 md:left-1/2 transform -translate-x-1/2 w-1 bg-[#1A3263] origin-top"
              style={{ height: "100%", scaleY }}
            />

            <div className="flex flex-col gap-8 md:gap-16">
              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-0">
                <div className="w-full md:w-[45%] text-left md:text-right pl-16 md:pl-0">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg md:text-2xl font-bold text-[#1A3263] dark:text-white mb-1 md:mb-2">Book Appointment</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
                      Select your required tests from our wide range of packages and book a convenient time slot that fits your schedule.
                    </p>
                  </motion.div>
                </div>

                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1A3263] border-4 border-white dark:border-black flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-xl">
                  1
                </div>

                <div className="w-full md:w-[45%] hidden md:block" />
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-0">
                <div className="w-full md:w-[45%] hidden md:block" />

                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1A3263] border-4 border-white dark:border-black flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-xl">
                  2
                </div>

                <div className="w-full md:w-[45%] text-left pl-16 md:pl-0">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg md:text-2xl font-bold text-[#1A3263] dark:text-white mb-1 md:mb-2">Sample Collection</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
                      Our certified phlebotomist will visit your home or you can visit our nearest center for a quick and painless sample collection.
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-0">
                <div className="w-full md:w-[45%] text-left md:text-right pl-16 md:pl-0">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg md:text-2xl font-bold text-[#1A3263] dark:text-white mb-1 md:mb-2">Get Reports Online</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
                      Receive accurate digital reports via WhatsApp or email within 24 hours. Consult with our experts for a detailed explanation.
                    </p>
                  </motion.div>
                </div>

                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1A3263] border-4 border-white dark:border-black flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-xl">
                  3
                </div>

                <div className="w-full md:w-[45%] hidden md:block" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section id="testimonials" className="bg-background pt-0 pb-20 relative">
        <div className="container z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center max-w-[540px] mx-auto px-4"
          >
            <div className="flex justify-center">
              <div className="border py-1 px-4 rounded-lg">Testimonials</div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mt-5 text-center">
              What our users say
            </h2>
            <p className="text-center mt-5 opacity-75">
              See what our customers have to say about us.
            </p>
          </motion.div>

          <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={15} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
          </div>
        </div>
      </section>
      <Footer />

      <RecentActivityNotification />
    </>
  );
}
