'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import EagleLogo from './EagleLogo';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                {/* Left: Logo */}
                <Link href="/" className="logo" onClick={closeMenu}>
                    <EagleLogo />
                    <span>POLY<span className="text-primary">HAWK</span></span>
                </Link>

                {/* Mobile Menu Toggle */}
                <button className={`mobile-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle Navigation">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Contextual Navigation */}
                <div className={`nav-links-container ${isMenuOpen ? 'open' : ''}`}>
                    <div className="nav-links">
                        <Link href="/leaderboard" className={`nav-link-v2 ${pathname === '/leaderboard' ? 'active' : ''}`} onClick={closeMenu}>Leaderboard</Link>
                        <Link href="/whale-alerts" className={`nav-link-v2 ${pathname === '/whale-alerts' ? 'active' : ''}`} onClick={closeMenu}>Whale Alerts</Link>
                        <Link href="/wallet-checker" className={`nav-link-v2 ${pathname === '/wallet-checker' ? 'active' : ''}`} onClick={closeMenu}>Whales</Link>
                        <Link href="/news" className={`nav-link-v2 ${pathname === '/news' ? 'active' : ''}`} onClick={closeMenu}>News</Link>
                        <Link href="/learn" className={`nav-link-v2 ${pathname === '/learn' ? 'active' : ''}`} onClick={closeMenu}>Learn</Link>
                        <Link href="/portfolio" className={`nav-link-v2 ${pathname === '/portfolio' ? 'active' : ''}`} onClick={closeMenu}>Portfolio</Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .navbar {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background: rgba(10, 11, 13, 0.9);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--border);
                    height: 72px;
                    display: flex;
                    align-items: center;
                }
                .navbar-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: white;
                }
                .logo span {
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    font-size: 1.25rem;
                    line-height: 1;
                }
                .nav-links {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }
                .nav-link-v2 {
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 700;
                    transition: all 0.2s;
                    padding: 0.5rem 0.5rem;
                    letter-spacing: -0.01em;
                }
                .nav-link-v2:hover, .nav-link-v2.active {
                    color: var(--text-main);
                }
                .nav-link-v2.active {
                    color: var(--primary);
                }
                
                .mobile-toggle {
                    display: none;
                    flex-direction: column;
                    justify-content: space-between;
                    width: 30px;
                    height: 20px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    z-index: 1001;
                }
                .mobile-toggle span {
                    width: 100%;
                    height: 2px;
                    background-color: white;
                    color: white;
                    transition: all 0.3s ease;
                }

                @media (max-width: 768px) {
                    .mobile-toggle {
                        display: flex;
                    }
                    .mobile-toggle.open span:nth-child(1) {
                        transform: translateY(9px) rotate(45deg);
                    }
                    .mobile-toggle.open span:nth-child(2) {
                        opacity: 0;
                    }
                    .mobile-toggle.open span:nth-child(3) {
                        transform: translateY(-9px) rotate(-45deg);
                    }
                    
                    .nav-links-container {
                        position: fixed;
                        top: 0;
                        right: -100%;
                        width: 80%;
                        height: 100vh;
                        background: #0a0b0d;
                        padding: 80px 2rem;
                        transition: right 0.3s ease;
                        box-shadow: -10px 0 30px rgba(0,0,0,0.5);
                    }
                    .nav-links-container.open {
                        right: 0;
                    }
                    .nav-links {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 2rem;
                    }
                    .nav-link-v2 {
                        font-size: 1.25rem;
                        width: 100%;
                        padding: 1rem 0;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                    }
                }
                .text-primary { color: var(--primary); }
            `}</style>
        </nav>
    );
}
