'use client'
import React from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { AppleIcon, CircleCheck, Grip, Music, Sun, AudioLines, Zap, Headphones, ThumbsUp, ChevronRight, Music3Icon, CloudDrizzleIcon } from 'lucide-react'
import { YoutubeIcon } from "../utils/icons"
const PRIMARY_ORANGE = 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition-colors duration-200'
const SECONDARY_BUTTON = 'border border-orange-600 text-orange-600 hover:bg-orange-50 active:bg-orange-100 transition-colors duration-200'

const features = [
    {
        icon: <Headphones className="w-6 h-6"/>, // Changed to lucide icon
        title: "Collaborative Streaming",
        description: "Create shared music experiences with real-time voting and queue management.",
    },
    {
        icon: <Zap className="w-6 h-6"/>, // Changed to lucide icon
        title: "Instant Setup",
        description: "Launch a music stream in seconds with shareable join links for your friends.",
    },
    {
        icon: <ThumbsUp className="w-6 h-6"/>, // Changed to lucide icon
        title: "Smart Voting",
        description: "Democratic music selection with intelligent queue sorting based on votes.",
    },
]

const testimonials = [
  {
    company: "Spotify",
    metric: "2M+ streams",
    description: "created daily",
    logo: <Music3Icon/>,
  },
  {
    company: "SoundCloud",
    metric: "98% faster",
    description: "playlist creation",
    logo: <CloudDrizzleIcon/>,
  },
  {
    company: "Apple Music",
    metric: "300% increase",
    description: "in engagement",
    logo: <AppleIcon className="text-gray-900"/>, // Added text color for visibility on white
  },
  {
    company: "YouTube Music",
    metric: "5x more",
    description: "collaborative sessions",
    logo: <YoutubeIcon />, // Assuming YoutubeIcon supports className
  },
]

export default function Landing(): React.JSX.Element { // Changed function name to PascalCase
    return <div className="w-full max-w-7xl min-h-screen flex flex-col gap-10 bg-white text-gray-900">
        <header className="w-screen fixed bg-white shadow-md flex justify-between items-center z-50">
            {/* Logo/Name: Orange accent */}
            <div className="flex items-center gap-3 p-3 text-orange-600 text-lg md:text-xl font-bold"><AudioLines className="w-6 h-6"/>StreamSync</div>
            
            <div className="flex items-center gap-3 mx-3 text-sm md:text-md">
                {/* Theme Toggle (Sun Icon) - Micro-interaction: Scale on hover */}
                <button className="cursor-pointer text-gray-600 hover:text-orange-600 transform hover:scale-110 transition-transform duration-150"><Sun /></button>
                
                {/* Dashboard Button - Micro-interaction: Primary background on hover */}
                <button 
                    className="cursor-pointer bg-white text-orange-600 rounded-md px-3 py-1 border border-gray-300 hover:bg-orange-50 transition-colors duration-200" 
                    onClick={()=>signIn()}
                > 
                    Dashboard
                </button>
                
                {/* Get Started Button - Micro-interaction: Standard orange button with hover effects */}
                <button className={`${PRIMARY_ORANGE} text-white cursor-pointer rounded-md px-3 py-1 shadow-lg`}> 
                    Get Started
                </button>
            </div>
        </header>

        <main className=" w-screen max-w-7xl flex flex-col justify-center items-center text-center mt-20 px-5 gap-10 flex-1 relative pt-10">
            {/* Dotted background - Lighter grey */}
            <div
            className="absolute inset-0 -z-10 pointer-events-none opacity-50"
            style={{
                backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)", // Lighter grey
                backgroundSize: "24px 24px",
            }}
            />
            {/* Hero Title: Orange highlight */}
            <section className="text-4xl md:text-6xl font-extrabold max-w-4xl leading-tight">
            The complete platform to stream music <span className="text-orange-600">together.</span>
            </section>
            
            {/* Hero Subtext */}
            <section className="text-lg md:text-2xl max-w-3xl text-gray-600">
            Create collaborative music streams where everyone can vote on songs. 
            Build the perfect playlist together with real-time democracy.
            </section>
            
            {/* Hero Buttons */}
            <section className="flex gap-4">
                {/* Primary Button - Micro-interaction: Scale up slightly and shadow change on hover */}
                <button className={`${PRIMARY_ORANGE} text-white rounded-lg px-6 py-3 text-lg font-semibold shadow-xl transform hover:scale-[1.02] transition-all duration-200`}>
                    Start Streaming
                </button>
                {/* Secondary Button - Micro-interaction: Fade background on hover */}
                <button className={`${SECONDARY_BUTTON} rounded-lg px-6 py-3 text-lg font-semibold`}>
                    Join a Stream
                </button>
            </section>
        </main>

        {/* Testimonials/Metrics Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-5 lg:px-20 mb-10">
            {testimonials.map((testimonial) => (
                // Micro-interaction: Card lift and shadow on hover
                <div key={testimonial.company} className="flex flex-col items-center text-center p-6 bg-white border border-gray-200 rounded-xl shadow-lg 
                    hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="text-4xl mb-3 group-hover:text-orange-600 transition-colors duration-300">{testimonial.logo}</div>
                    <div className="text-3xl font-extrabold text-orange-600">{testimonial.metric}</div>
                    <div className="text-gray-500 mt-1">{testimonial.description}</div>
                    <div className="text-sm text-gray-500 mt-2 font-medium">via {testimonial.company}</div>
                </div>
            ))}
        </section>

        {/* Features Section */}
        <section className="px-5 lg:px-20 text-gray-900 py-10 bg-gray-50">
            {/* Header: Orange accent */}
            <section className="flex items-center gap-2 text-orange-600 font-semibold mb-3"><Grip className="w-5 h-5"/> COLLABORATION</section>
            
            <section >
                {/* Title */}
                <article className="font-bold text-3xl md:text-4xl my-4">Make music streaming truly collaborative.</article>
                {/* Subtext */}
                <article className="text-gray-600 md:text-xl max-w-3xl mb-12">
                    Tools for your friends and community to share music preferences and create the perfect playlist together through democratic voting.
                </article>
            </section>
            
            {/* Feature List */}
            <section className="grid md:grid-cols-3 gap-8">
                {features.map
                ((feature) => (
                    // Micro-interaction: Border color change on hover
                    <div key={feature.title} className="flex flex-col p-6 bg-white border-l-4 border-gray-200 hover:border-orange-600 transition-colors duration-300 rounded-lg shadow-sm">
                        {/* Icon: Orange circle background */}
                        <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mb-4">
                            {feature.icon}
                        </div>
                        <div>
                            <div className="font-bold text-xl mb-2">{feature.title}</div>
                            <div className="text-gray-600">{feature.description}</div>
                        </div>
                    </div>
                ))}
            </section>
        </section>

        {/* CTA Section */}
        <section className="flex flex-col justify-center items-center text-center gap-6 mb-20 px-5">
            <span className="text-3xl md:text-4xl font-extrabold text-gray-900">Ready to start streaming together?</span>
            <span className="text-gray-600 text-xl md:text-2xl max-w-3xl">Join thousands of music lovers creating collaborative playlists every day.</span>
            
            <div className="flex justify-center items-center gap-4 mt-4">
                {/* Primary Button - Micro-interaction: Scale and glow on hover */}
                <button className={`flex items-center gap-x-2 ${PRIMARY_ORANGE} rounded-full text-white py-3 px-6 text-lg font-semibold shadow-xl 
                    transform hover:scale-105 transition-all duration-300 ease-in-out`}>
                    <CircleCheck className="w-5 h-5"/>Create Your First Stream
                </button>
                {/* Secondary Button - Micro-interaction: Text color change and slight background */}
                <button className={`flex items-center gap-x-1 ${SECONDARY_BUTTON} rounded-full py-3 px-6 text-lg font-semibold`}>
                    Explore Features <ChevronRight className="w-4 h-4 mt-0.5"/>
                </button>
            </div>
        </section>

         {/* Footer Section */}
         <footer className="border-t border-gray-200 bg-gray-50 text-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Branding */}
                    <div className="space-y-4 col-span-2 md:col-span-2">
                        <div className="flex items-center gap-2">
                            {/* Logo: Orange background */}
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900">StreamSync</span>
                        </div>
                        <p className="text-gray-500">The collaborative music streaming platform for everyone.</p>
                    </div>

                    {/* Navigation Columns */}
                    {/* Micro-interaction: Underline on hover for links */}
                    {["Product", "Company", "Legal"].map((category) => (
                        <div key={category} className="space-y-4">
                            <h3 className="font-semibold text-gray-900">{category}</h3>
                            <div className="space-y-2">
                                {category === "Product" && (
                                    <>
                                        <Link href="/features" className="group block text-gray-600 hover:text-orange-600 transition-colors">Features <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-orange-600"></span></Link>
                                        <Link href="/pricing" className="group block text-gray-600 hover:text-orange-600 transition-colors">Pricing <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-orange-600"></span></Link>
                                        <Link href="/dashboard" className="group block text-gray-600 hover:text-orange-600 transition-colors">Dashboard <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-orange-600"></span></Link>
                                    </>
                                )}
                                {category === "Company" && (
                                    <>
                                        <Link href="/about" className="group block text-gray-600 hover:text-orange-600 transition-colors">About <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-orange-600"></span></Link>
                                        <Link href="/contact" className="group block text-gray-600 hover:text-orange-600 transition-colors">Contact <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-orange-600"></span></Link>
                                        <Link href="/support" className="group block text-gray-600 hover:text-orange-600 transition-colors">Support <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-orange-600"></span></Link>
                                    </>
                                )}
                                {category === "Legal" && (
                                    <>
                                        <Link href="/privacy" className="group block text-gray-600 hover:text-orange-600 transition-colors">Privacy <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-orange-600"></span></Link>
                                        <Link href="/terms" className="group block text-gray-600 hover:text-orange-600 transition-colors">Terms <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-orange-600"></span></Link>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 mt-12 pt-8 text-center">
                    <p className="text-gray-500">© 2024 StreamSync. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
}