// src/components/Login/CustomLogin.tsx
"use client"
export const dynamic = 'force-static';

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function CustomLoginTailwind() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const redirectPath = searchParams.get("redirect") || "/admin"

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)

    // Words for rotating text
    const words = ["restaurants", "snackbars", "shops", "cafés"]
    const [wordIndex, setWordIndex] = useState(0)
    const [fadeOut, setFadeOut] = useState(false)

    // Rotate text every 2s: fade out, switch word, fade in
    useEffect(() => {
        const timer = setInterval(() => {
            setFadeOut(true)
            setTimeout(() => {
                setWordIndex((prev) => (prev + 1) % words.length)
                setFadeOut(false)
            }, 500)
        }, 2000)
        return () => clearInterval(timer)
    }, [words.length])

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        try {
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data?.message || "Login failed")
            }

            // Let's say the API returns JSON with { tenantId: 'abc123', ... }
            const data = await res.json()

            // 1) Manually set the cookie in the browser
            document.cookie = `payload-tenant=${data.tenantId}; Path=/;`

            // 2) Now redirect or refresh so Next SSR sees it
            window.location.href = '/admin'  // OR router.refresh() if using useRouter

            router.push(redirectPath)
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        }
    }

    return (
        <div className="min-h-screen bg-[#f2f2f2cb] flex items-center justify-center p-8">
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left column: "Revolutionizing X" */}
                <div className="flex flex-col justify-center items-center md:items-start text-[#1f2a37]">
                    <div className="text-5xl md:text-6xl font-extrabold text-center md:text-left">
                        <span>Revolutionizing </span>

                        {/* 
              The pill container: 
              - Dark background = bg-[#1f2a37] 
              - Light text = text-[#f2f2f2] 
              - Rounded corners = rounded-xl 
            */}

                    </div>
                </div>

                {/* Right column: Login Form */}
                <div className="bg-[#f2f2f2] text-[#1f2a37] p-10 rounded-xl shadow-2xl max-w-xl w-full mx-auto border-4 border-[#39454f]">
                    {/* Logo + heading */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center text-3xl font-bold">
                            Stagepass
                        </div>
                    </div>

                    {error && (
                        <p className="bg-[#1f2a37] text-white p-3 mb-4 text-center rounded-md shadow-sm">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleLogin} className="flex flex-col space-y-6">
                        <div suppressHydrationWarning>
                            <label className="block mb-2 font-medium text-lg">
                                Email <span className="text-[#1f2a37]">*</span>
                            </label>
                            <input
                                type="email"
                                autoComplete="off"
                                required
                                placeholder="john.doe@example.com"
                                className="w-full bg-[#f2f2f2] border border-[#39454f] p-3 
                           focus:outline-none focus:border-[#1f2a37] 
                           rounded-xl shadow-sm text-base text-[#1f2a37] font-bold"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div suppressHydrationWarning>
                            <label className="block mb-2 font-medium text-lg">
                                Password <span className="text-[#1f2a37]">*</span>
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                autoComplete="off"
                                className="w-full bg-[#f2f2f2] border border-[#39454f] p-3 
                           focus:outline-none focus:border-[#1f2a37] 
                           rounded-xl shadow-sm text-base text-[#1f2a37] font-bold"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Link href="/admin/forgot" className="text-sm text-[#1f2a37] hover:text-[#000000] ">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="bg-[#1f2a37] hover:bg-[#000000] text-white font-semibold
                         py-3 px-6 rounded-xl shadow-sm transition-colors text-base"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
