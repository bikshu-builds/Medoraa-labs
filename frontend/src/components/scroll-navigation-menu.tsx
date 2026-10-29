"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useMotionValueEvent, Variants } from "framer-motion"
import { Menu, X, User, Settings, Mail, Info, Activity } from "lucide-react"
import Link from "next/link"

interface MenuItem {
  id: number
  title: string
  url: string
  icon: React.ReactNode
}

interface ScrollNavbarProps {
  menuItems?: MenuItem[]
  className?: string
}

const BRAND = "#015971"

const defaultMenuItems: MenuItem[] = [
  {
    id: 2,
    title: "Tests",
    url: "/#tests",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "Services",
    url: "/#services",
    icon: <Activity className="w-5 h-5" />,
  },
  {
    id: 4,
    title: "Process",
    url: "/#process",
    icon: <Info className="w-5 h-5" />,
  },
  {
    id: 5,
    title: "Reviews",
    url: "/#testimonials",
    icon: <User className="w-5 h-5" />,
  },
  {
    id: 6,
    title: "About",
    url: "/about",
    icon: <Mail className="w-5 h-5" />,
  },
]

export const ScrollNavigationMenu: React.FC<ScrollNavbarProps> = ({
  menuItems = defaultMenuItems,
  className = "",
}) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Leave the banner before collapsing to logo-only
    setIsScrolled(latest > 120)
  })

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    closed: { y: 20, opacity: 0, scale: 0.8 },
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
  }

  return (
    <>
      {/* Sticky brand: logo + name on banner → logo only when scrolled */}
      <motion.div
        className="fixed top-3 left-3 z-[60] sm:top-4 sm:left-5 lg:left-8"
        layout
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <motion.div
            layout
            className="relative shrink-0 overflow-hidden rounded-xl shadow-md ring-1 ring-black/5"
            initial={false}
            animate={{
              width: isScrolled ? 44 : 56,
              height: isScrolled ? 44 : 56,
            }}
            style={{ width: 56, height: 56 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <Image
              src="/logo.jpeg"
              alt="Medoraa Labs"
              fill
              sizes="56px"
              className="object-cover"
              priority
            />
          </motion.div>

          <AnimatePresence initial={false}>
            {!isScrolled && (
              <motion.div
                key="brand-text"
                initial={{ opacity: 0, x: -8, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: -8, width: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col overflow-hidden leading-tight whitespace-nowrap"
              >
                <span
                  className="text-base font-bold tracking-tight sm:text-lg"
                  style={{ color: BRAND }}
                >
                  Medoraa Labs
                </span>
                <span className="text-[10px] font-medium text-[#5A7A82] sm:text-[11px]">
                  Precision Diagnostics, Healthier Tomorrows.
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>

      {/* Top nav — menu on the right while on banner */}
      <motion.nav
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: isScrolled ? -100 : 0,
          opacity: isScrolled ? 0 : 1,
          pointerEvents: isScrolled ? "none" : "auto",
        }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className={`fixed top-3 right-0 left-0 z-50 bg-transparent sm:top-4 ${className}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-end">
            <div className="hidden items-center space-x-5 rounded-full border border-[#015971]/10 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-md md:flex">
              <div className="flex items-baseline space-x-1">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center px-3 py-2 text-sm font-medium text-[#015971] transition-colors hover:text-[#014759]"
                    >
                      <span>{item.title}</span>
                    </Link>
                    {hoveredItem === item.id && (
                      <motion.div
                        layoutId="navbar-hover"
                        className="absolute inset-0 -z-10 rounded-md bg-[#015971]/8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center border-l border-[#015971]/15 pl-3">
                <Link
                  href="/signin"
                  className="rounded-full border border-[#015971] px-3.5 py-1 text-sm font-bold text-[#015971] transition-colors hover:bg-[#015971] hover:text-white"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <motion.button
                onClick={toggleMenu}
                className="rounded-full border border-[#015971]/15 bg-white/90 p-2.5 text-[#015971] shadow-sm focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Floating menu button when scrolled */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isScrolled ? 1 : 0,
          opacity: isScrolled ? 1 : 0,
          pointerEvents: isScrolled ? "auto" : "none",
        }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="fixed top-3 right-3 z-50 sm:top-4 sm:right-6"
      >
        <motion.button
          onClick={toggleMenu}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#015971] text-white shadow-lg sm:h-12 sm:w-12"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={toggleMenu}
            />

            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative min-w-[320px] rounded-3xl border border-border bg-background p-8 shadow-2xl">
                <motion.button
                  onClick={toggleMenu}
                  className="absolute top-4 right-4 rounded-full p-2 text-foreground hover:bg-muted hover:text-primary"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </motion.button>

                <div className="mt-8 space-y-3">
                  {menuItems.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={item.url}
                        onClick={toggleMenu}
                        className="group flex items-center space-x-4 rounded-xl p-3 transition-colors hover:bg-muted"
                      >
                        <div className="text-[#015971]">{item.icon}</div>
                        <span className="text-base font-semibold text-foreground group-hover:text-[#015971]">
                          {item.title}
                        </span>
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div variants={itemVariants} className="space-y-3 pt-4">
                    <Link
                      href="/signin"
                      onClick={toggleMenu}
                      className="flex w-full items-center justify-center rounded-xl border-2 border-[#015971] p-3 font-bold text-[#015971] transition-colors hover:bg-[#F1F5F9]"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
