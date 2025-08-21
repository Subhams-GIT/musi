'use client'

import { Play, Users, Vote, Music, TrendingUp } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from "next/link"
import { useState,useEffect } from "react"
import Appbar from './Appbar'
import Redirect from './Redirect'
import { useRouter } from 'next/navigation'

export default function MusicPlatformLanding() {
  
  const [email, setEmail] = useState("")
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const router=useRouter();
  const session = useSession();
  
  useEffect(() => { 
    if(session.data?.user){
      router.replace(`/dashboard`);
    }
  }, [session.data?.user])
  
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="relative z-50 px-4 lg:px-6 h-16 flex items-center  justify-center backdrop-blur-sm bg-black/20 border-b border-white/10 gap-4 ">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">VoteBeats</span>
        </Link>
        <nav className="ml-auto flex gap-6 items-center ">
          <Link href="#features" className="text-md font-medium text-white/80 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-md font-medium text-white/80 hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="#community" className="text-md font-medium text-white/80 hover:text-white transition-colors">
            Community
          </Link>
		<Appbar/>
		<Redirect/>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 overflow-hidden">
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Let the{" "}
              <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
                Community
              </span>{" "}
              Choose the Beat
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              Stream music where every vote matters. Join a platform where the community decides what plays next through real-time voting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                className="lg:bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white px-8 py-3 text-lg font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Listening
              </button>
              <button
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg backdrop-blur-sm transform hover:scale-105 transition-all duration-200"
              >
                <Vote className="w-5 h-5 mr-2" />
                Cast Your Vote
              </button>
            </div>
          </div>
        </div>
        
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Music Democracy in Action
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Experience a new way to discover and enjoy music where every listener has a voice in what plays next.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Vote,
                title: "Real-Time Voting",
                description: "Cast your vote for the next track and watch the queue change in real-time based on community preferences.",
                color: "from-pink-500 to-rose-500"
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Join thousands of music lovers who collectively curate the perfect playlist for everyone to enjoy.",
                color: "from-violet-500 to-purple-500"
              },
              {
                icon: TrendingUp,
                title: "Trending Tracks",
                description: "Discover new music through community trends and see what's gaining momentum in real-time.",
                color: "from-blue-500 to-indigo-500"
              }
            ].map((feature, index) => (
              <div
				key={index}
				className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-200 group"
				onMouseEnter={() => setHoveredFeature(index)}
				onMouseLeave={() => setHoveredFeature(null)}
			  >
				<div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mb-4`}>
				  <feature.icon className="w-8 h-8 text-white" />
				</div>
				<h3 className="text-xl font-semibold text-white mb-2">
				  {feature.title}
				</h3>
				<p className="text-white/70">
				  {feature.description}
				</p>
			  </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Simple steps to join the musical democracy
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Join the Stream",
                  description: "Connect to our live music stream and start listening to community-curated playlists."
                },
                {
                  step: "02", 
                  title: "Vote for Tracks",
                  description: "Browse upcoming songs and vote for your favorites. Your vote helps decide what plays next."
                },
                {
                  step: "03",
                  title: "Shape the Experience",
                  description: "Watch as the community collectively creates the perfect musical journey for everyone."
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-6 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-200">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-white/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="w-full h-96 bg-slate-800/30 rounded-2xl border border-white/10 flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Live Music Democracy</h3>
                  <p className="text-white/70">Real-time voting shapes the playlist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section id="community" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "50K+", label: "Active Listeners" },
              { number: "1M+", label: "Votes Cast" },
              { number: "10K+", label: "Songs Played" },
              { number: "24/7", label: "Live Streaming" }
            ].map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                  {stat.number}
                </div>
                <div className="text-white/70 group-hover:text-white transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Shape the Sound?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of music lovers and start voting for the tracks that move you.
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className=" rounded-xl px-2 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
              />
              <button className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 px-6 py-2 rounded-xl">
                Join Now
              </button>
            </div>
          </div>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10 bg-black/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VoteBeats</span>
            </div>
            <div className="flex space-x-6 text-white/60 text-sm">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60 text-sm">
            © 2024 VoteBeats. All rights reserved. Music democracy at its finest.
          </div>
        </div>
      </footer>
    </div>
  )
}
