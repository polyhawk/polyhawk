'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import EagleLogo from './EagleLogo';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
    };

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
                        <Link href="/markets" className={`nav-link-v2 ${pathname === '/markets' ? 'active' : ''}`} onClick={closeMenu}>Events</Link>
                        <Link href="/leaderboard" className={`nav-link-v2 ${pathname === '/leaderboard' ? 'active' : ''}`} onClick={closeMenu}>Leaderboard</Link>
                        <Link href="/whale-alerts" className={`nav-link-v2 ${pathname === '/whale-alerts' ? 'active' : ''}`} onClick={closeMenu}>Whale Alerts</Link>
                        <Link href="/wallet-checker" className={`nav-link-v2 ${pathname === '/wallet-checker' ? 'active' : ''}`} onClick={closeMenu}>Whales</Link>
                        <Link href="/news" className={`nav-link-v2 ${pathname === '/news' ? 'active' : ''}`} onClick={closeMenu}>News</Link>
                        <Link href="/learn" className={`nav-link-v2 ${pathname === '/learn' ? 'active' : ''}`} onClick={closeMenu}>Learn</Link>
                        <Link href="/portfolio" className={`nav-link-v2 ${pathname === '/portfolio' ? 'active' : ''}`} onClick={closeMenu}>Portfolio</Link>

                        {user ? (
                            <div className="user-menu">
                                <span className="user-email">{user.email?.split('@')[0]}</span>
                                <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
                            </div>
                        ) : (
                            <Link href="/login" className="login-btn" onClick={closeMenu}>Log In</Link>
                        )}
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
                
                .user-menu {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-left: 1rem;
                    padding-left: 1.5rem;
                    border-left: 1px solid var(--border);
                }
                
                .user-email {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-main);
                }
                
                .sign-out-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    border-radius: 6px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .sign-out-btn:hover {
                    color: #ef4444;
                    border-color: #ef4444;
                }
                
                .login-btn {
                    padding: 0.5rem 1.25rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    text-decoration: none;
                    transition: all 0.2s;
                    margin-left: 1rem;
                }
                
                .login-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
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
                    
                    .user-menu {
                        margin-left: 0;
                        padding-left: 0;
                        border-left: none;
                        width: 100%;
                        justify-content: space-between;
                    }
                    
                    .login-btn {
                        margin-left: 0;
                        width: 100%;
                        text-align: center;
                        padding: 1rem;
                    }
                }
                .text-primary { color: var(--primary); }
            `}</style>
        </nav>
    );
}
