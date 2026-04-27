"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent, Variants } from "framer-motion"
import { Menu, X, Home, User, Settings, Mail, Info, Activity } from "lucide-react"
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

const defaultMenuItems: MenuItem[] = [
  {
    id: 2,
    title: "Tests",
    url: "/#tests",
    icon: <Settings className="w-5 h-5" />
  },
  {
    id: 3,
    title: "Services",
    url: "/#services",
    icon: <Activity className="w-5 h-5" />
  },
  {
    id: 4,
    title: "Process",
    url: "/#process",
    icon: <Info className="w-5 h-5" />
  },
  {
    id: 5,
    title: "Reviews",
    url: "/#testimonials",
    icon: <User className="w-5 h-5" />
  },
  {
    id: 6,
    title: "About",
    url: "/about",
    icon: <Mail className="w-5 h-5" />
  }
]

export const ScrollNavigationMenu: React.FC<ScrollNavbarProps> = ({
  menuItems = defaultMenuItems,
  className = ""
}) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 100)
  })

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Variant 5 for the popup menu
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
        staggerDirection: -1
      }
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
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    closed: {
      y: 20,
      opacity: 0,
      scale: 0.8
    },
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  }

  const hamburgerVariants: Variants = {
    normal: { rotate: 0, scale: 1 },
    scrolled: { rotate: 360, scale: 1.1 }
  }

  return (
    <>
      {/* Full Navbar - visible when not scrolled */}
      <motion.nav
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: isScrolled ? -100 : 0,
          opacity: isScrolled ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-6 left-0 right-0 z-50 bg-transparent ${className}`}
      >
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="text-2xl font-bold text-foreground">
                Medoraa Labs
              </Link>
            </motion.div>

            {/* Desktop Menu & Auth Buttons */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-baseline space-x-4">
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
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                    {hoveredItem === item.id && (
                      <motion.div
                        layoutId="navbar-hover"
                        className="absolute inset-0 bg-muted rounded-md -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-3 border-l border-border pl-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/signin"
                    className="text-sm font-bold text-[#1A3263] hover:text-[#2A4273] transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/patient/register"
                    className="bg-[#1A3263] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#1A3263]/20 hover:bg-[#2A4273] transition-all"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                onClick={toggleMenu}
                className="p-2 rounded-md text-foreground hover:text-primary focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Floating Hamburger - visible when scrolled */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isScrolled ? 1 : 0,
          opacity: isScrolled ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-6 right-6 z-50"
      >
        <motion.button
          onClick={toggleMenu}
          className="w-14 h-14 bg-[#1A3263] text-white rounded-full shadow-lg flex items-center justify-center"
          variants={hamburgerVariants}
          animate={isScrolled ? "scrolled" : "normal"}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Floating Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={toggleMenu}
            />

            {/* Menu Container */}
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="relative bg-background border border-border rounded-3xl p-8 shadow-2xl min-w-[320px]">
                {/* Close Button */}
                <motion.button
                  onClick={toggleMenu}
                  className="absolute top-4 right-4 p-2 text-foreground hover:text-primary rounded-full hover:bg-muted"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Menu Items */}
                <div className="space-y-3 mt-8">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={item.url}
                        onClick={toggleMenu}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                      >
                        <div className="text-[#1A3263]">{item.icon}</div>
                        <span className="text-base font-semibold text-foreground group-hover:text-[#1A3263]">
                          {item.title}
                        </span>
                      </Link>
                    </motion.div>
                  ))}

                  {/* Auth Buttons for Mobile */}
                  <motion.div variants={itemVariants} className="pt-4 space-y-3">
                    <Link
                      href="/signin"
                      onClick={toggleMenu}
                      className="flex items-center justify-center w-full p-3 rounded-xl border-2 border-[#1A3263] text-[#1A3263] font-bold hover:bg-[#F1F5F9] transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/patient/register"
                      onClick={toggleMenu}
                      className="flex items-center justify-center w-full p-3 rounded-xl bg-[#1A3263] text-white font-bold shadow-lg shadow-[#1A3263]/20 transition-all"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </div>

                {/* Decorative Elements */}
                <motion.div
                  className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute -bottom-2 -right-2 w-3 h-3 bg-secondary rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

