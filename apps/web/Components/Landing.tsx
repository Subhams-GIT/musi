'use client'

import React from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { CircleCheck, Grip, Music, Sun, TicketPlus } from 'lucide-react'
import { AudioLines } from 'lucide-react';

const features = [
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        title: "Collaborative Streaming",
        description: "Create shared music experiences with real-time voting and queue management.",
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-headset-icon lucide-headset"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" /><path d="M21 16v2a4 4 0 0 1-4 4h-5" /></svg>,
        title: "Instant Setup",
        description: "Launch a music stream in seconds with shareable join links for your friends.",
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-vote-icon lucide-vote"><path d="m9 12 2 2 4-4" /><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" /><path d="M22 19H2" /></svg>,
        title: "Smart Voting",
        description: "Democratic music selection with intelligent queue sorting based on votes.",
    },
]

const testimonials = [
  {
    company: "Spotify",
    metric: "2M+ streams",
    description: "created daily",
    logo: "🎵",
  },
  {
    company: "SoundCloud",
    metric: "98% faster",
    description: "playlist creation",
    logo: "☁️",
  },
  {
    company: "Apple Music",
    metric: "300% increase",
    description: "in engagement",
    logo: "🍎",
  },
  {
    company: "YouTube Music",
    metric: "5x more",
    description: "collaborative sessions",
    logo: "📺",
  },
]

export default function landing(): React.JSX.Element {
    return <div className="w-screen h-screen flex flex-col gap-10">
        <header className="w-screen fixed bg-black flex justify-between items-center">
            <div className="flex items-center gap-3  p-3 text-white text-md md:text-lg"><AudioLines />StreamSync</div>
            <div className="flex items-center gap-3 mx-3 text-white text-sm md:text-md">
                <button className="cursor-pointer"><Sun /></button>
                <button className=" cursor-pointer bg-black text-white rounded-md px-2 py-1 border-1 border-grey"> Dashboard</button>
                <button className="bg-white text-black cursor-pointer rounded-md px-2 py-1 border-1 border-transparent"> Get Started</button>
            </div>
        </header>

        <main className="flex flex-col justify-center items-center text-center mt-20 px-5 gap-10 flex-1 relative">
            {/* Dotted background */}
            <div
            className="absolute inset-0 -z-10 pointer-events-none"
            style={{
                backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
                backgroundSize: "24px 24px",
            }}
            />
            <section className="text-4xl md:text-6xl font-bold">
            The complete platform to stream music together.
            </section>
            <section className="text-lg md:text-2xl max-w-2xl">
            Create collaborative music streams where everyone can vote on songs. 
            Build the perfect playlist together with real-time democracy
            </section>
            <section className="flex gap-5">
            <button className="bg-black text-white rounded-md px-4 py-2">Start Streaming</button>
            <button className=" text-black rounded-md px-4 py-2">Join a Stream</button>
            </section>
        </main>

        <section className="grid grid-cols-1 grid-row-4 md:grid-cols-2 md:grid-rows-2 gap-10 ">
            {testimonials.map((testimonial) => (
                <div key={testimonial.company} className="flex flex-col items-center text-center p-5 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl mb-2">{testimonial.logo}</div>
                <div className="text-2xl font-bold">{testimonial.metric}</div>
                <div className="text-gray-600">{testimonial.description}</div>
                <div className="text-sm text-gray-500 mt-2">- {testimonial.company}</div>
                </div>
            ))}

        </section>

        <section className="px-10  text-black py-10 ">
            <section className="flex items-center gap-2 mx-auto"><Grip/> COLLABORATION</section>
            <section >
                <article className="font-bold text-2xl md:text-3xl my-4">Make music streaming collaborative.</article>
                <article className="text-gray-500 md:text-xl max-w-3xl">
                    Tools for your friends and community to share music preferences and create the perfect playlist together through democratic voting.
                </article>
            </section>
            <section>
                {features.map
                ((feature) => (
                    <div key={feature.title} className="flex items-start gap-5 my-5">
                        <div className="text-3xl text-black mt-1">{feature.icon}</div>
                        <div>
                            <div className="font-bold text-xl">{feature.title}</div>
                            <div className="text-gray-500">{feature.description}</div>
                        </div>
                    </div>
                ))}
            </section>

        </section>

        <section className="flex flex-col justify-center items-center text-center gap-9 mb-10">
            <span className="text-2xl font-bold">Ready to start streaming together?</span>
            <span className="text-gray-500 text-xl md:text-2xl">Join thousands of music lovers creating collaborative playlists every day.</span>
            <div className="flex justify-center items-center gap-5 ">
                <button className="flex items-center gap-x-1 bg-black rounded-md text-white py-2 px-4"><CircleCheck/>Create Your First Stream</button>
                <button className="border  rounded-md text-black py-2 px-4">Explore Features</button>
            </div>
        </section>

         <footer className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Music className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">StreamSync</span>
              </div>
              <p className="text-muted-foreground">The collaborative music streaming platform for everyone.</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Product</h3>
              <div className="space-y-2">
                <Link href="/features" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Company</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/support" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Legal</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-muted-foreground">© 2024 StreamSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
}