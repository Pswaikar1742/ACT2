import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function LandingPage() {
  const [teamName, setTeamName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [appState, setAppState] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const navigate = useNavigate();

  useEffect(() => {
    // Check connection and listen for app state changes
    const checkConnection = async () => {
      try {
        const unsubscribe = onSnapshot(doc(db, 'config', 'appState'), (doc) => {
          if (doc.exists()) {
            setAppState(doc.data());
            setConnectionStatus('connected');
          } else {
            setConnectionStatus('no-data');
          }
        }, (error) => {
          console.warn('Firebase connection issue:', error);
          setConnectionStatus('offline');
        });

        return () => unsubscribe();
      } catch (error) {
        console.warn('Firebase setup issue:', error);
        setConnectionStatus('offline');
      }
    };

    checkConnection();
  }, []);

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !playerName.trim()) {
      alert('Please enter both team name and your name!');
      return;
    }

    setLoading(true);
    
    try {
      if (connectionStatus === 'connected') {
        // Try Firebase authentication and join game
        await signInAnonymously(auth);
        
        // Add team to database
        await addDoc(collection(db, 'teams'), {
          teamName: teamName.trim(),
          playerName: playerName.trim(),
          score: 0,
          joinedAt: new Date(),
          isActive: true
        });
        
        // Store player info locally
        localStorage.setItem('teamName', teamName.trim());
        localStorage.setItem('playerName', playerName.trim());
        localStorage.setItem('connectionMode', 'firebase');
        
        // Navigate to audience view (participant screen)
        navigate('/audience');
        
      } else {
        // Use demo mode
        localStorage.setItem('teamName', teamName.trim());
        localStorage.setItem('playerName', playerName.trim());
        localStorage.setItem('connectionMode', 'demo');
        
        alert('🎮 Joining in Demo Mode!\n\nYour team has been registered for local testing. In a real event, this would sync with the main game system.');
        navigate('/audience');
      }
      
    } catch (error) {
      console.error('Failed to join game:', error);
      
      // Provide helpful error messages
      if (error.code === 'auth/operation-not-allowed') {
        alert('🔧 Game Setup Issue!\n\nThe event organizer needs to enable player authentication. Please contact the event host.');
      } else {
        // Fallback to demo mode
        if (confirm('Connection failed. Would you like to join in demo mode for testing?')) {
          localStorage.setItem('teamName', teamName.trim());
          localStorage.setItem('playerName', playerName.trim());
          localStorage.setItem('connectionMode', 'demo');
          navigate('/audience');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Animated Background Elements - Reduced for Mobile */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-10 left-10 w-2 h-2 bg-cyan animate-ping"></div>
        <div className="absolute top-1/4 right-20 w-1 h-1 bg-neon animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-purple animate-ping delay-1000"></div>
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-hot-pink animate-pulse delay-500"></div>
      </div>

      <div className="max-w-2xl w-full px-2 sm:px-0">
        {/* Main Title with Enhanced Cyber Effect - Mobile Optimized */}
        <div className="text-center mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl sm:text-5xl md:text-7xl font-black text-cyan/20 blur-sm animate-pulse">
              TECH FEUD
            </div>
          </div>
          <h1 className="relative text-3xl sm:text-5xl md:text-7xl font-black holographic mb-3 font-['Orbitron'] tracking-wider">
            TECH FEUD
          </h1>
          <div className="h-1 w-20 sm:w-28 mx-auto bg-gradient-to-r from-cyan via-neon to-purple animate-pulse mb-3 sm:mb-4 shadow-lg shadow-cyan/50"></div>
          <p className="text-base sm:text-lg md:text-xl matrix-text font-mono tracking-[0.15em] sm:tracking-[0.2em] uppercase px-2 mb-2">
            THE ULTIMATE TECH BATTLE
          </p>
          <div className="text-sm sm:text-base text-purple font-mono tracking-wider">
            🚀 Powered by <span className="text-cyan font-bold">BlackBox AI Mavericks Club</span> 🚀
          </div>
          <div className="mt-3 flex justify-center items-center space-x-2">
            <div className="w-2 h-2 bg-cyan rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-neon rounded-full animate-ping animation-delay-100"></div>
            <div className="w-2 h-2 bg-purple rounded-full animate-ping animation-delay-200"></div>
          </div>
        </div>

        {/* Connection Status Display - Mobile Optimized */}
        <div className="quiz-card scan-line mb-4 sm:mb-6 text-center border-2 border-cyan mx-2 sm:mx-0">
          <div className="flex items-center justify-center mb-3">
            <div className={`cyber-spinner w-4 sm:w-5 h-4 sm:h-5 mr-2 ${connectionStatus !== 'connected' ? 'opacity-50' : ''}`}></div>
            <h2 className="text-lg sm:text-xl font-bold matrix-text">GAME STATUS</h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-black/50 rounded-lg border border-cyan/30">
              <span className="font-mono text-cyan text-sm mb-1 sm:mb-0">CONNECTION:</span>
              <span className={`font-bold uppercase tracking-widest text-sm ${
                connectionStatus === 'connected' ? 'text-neon' : 
                connectionStatus === 'checking' ? 'text-yellow-400' : 'text-purple'
              }`}>
                {connectionStatus === 'connected' ? '🟢 LIVE GAME' : 
                 connectionStatus === 'checking' ? '🟡 CHECKING...' : '🟣 DEMO MODE'}
              </span>
            </div>
            
            {appState && connectionStatus === 'connected' && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-black/50 rounded-lg border border-neon/30">
                <span className="font-mono text-cyan text-sm mb-1 sm:mb-0">GAME PHASE:</span>
                <span className="font-bold text-neon uppercase tracking-widest text-sm">
                  {appState.currentPhase || 'WAITING'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Team Registration Form - Mobile Optimized */}
        <div className="quiz-card border-2 border-cyan/50 relative backdrop-blur-sm bg-black/40 mx-2 sm:mx-0">
          <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black px-4 sm:px-6 py-1 sm:py-2 border-2 border-cyan rounded-full shadow-lg shadow-cyan/30">
              <span className="text-cyan font-mono text-xs sm:text-sm tracking-[0.2em] font-bold">🎮 JOIN THE BATTLE 🎮</span>
            </div>
          </div>
          
          <form onSubmit={handleJoinGame} className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
            <div>
              <label className="block text-cyan font-mono text-xs sm:text-sm font-bold mb-2 tracking-[0.15em] uppercase">
                � Team Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/60 border-2 border-cyan/30 rounded-lg 
                           text-white placeholder-cyan/50 font-mono tracking-wider text-base
                           focus:border-neon focus:outline-none focus:ring-4 focus:ring-neon/20
                           transition-all duration-300 group-hover:border-cyan/50
                           shadow-inner"
                  placeholder="Enter your team name..."
                  maxLength={30}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-neon rounded-full animate-pulse shadow-lg shadow-neon/50"></div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-cyan font-mono text-xs sm:text-sm font-bold mb-2 tracking-[0.15em] uppercase">
                🧑‍💻 Your Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-black/60 border-2 border-cyan/30 rounded-lg 
                           text-white placeholder-cyan/50 font-mono tracking-wider text-base
                           focus:border-neon focus:outline-none focus:ring-4 focus:ring-neon/20
                           transition-all duration-300 group-hover:border-cyan/50
                           shadow-inner"
                  placeholder="Enter your name..."
                  maxLength={25}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-purple rounded-full animate-pulse shadow-lg shadow-purple/50"></div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !teamName.trim() || !playerName.trim()}
              className="w-full btn-primary py-4 sm:py-5 px-6 sm:px-8 rounded-lg text-lg sm:text-xl font-black
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                       relative overflow-hidden group min-h-[48px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan via-neon to-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner w-5 h-5 mr-3"></div>
                    <span className="font-mono tracking-[0.1em] text-sm sm:text-base">⚡ JOINING BATTLE...</span>
                  </div>
                ) : (
                  <span className="font-mono tracking-[0.1em] text-sm sm:text-base">
                    🚀 {connectionStatus === 'connected' ? 'JOIN LIVE GAME' : 'JOIN DEMO GAME'}
                  </span>
                )}
              </span>
            </button>
          </form>
          
          {/* Info Panel */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple/10 rounded-lg border border-purple/30">
            <div className="text-center">
              <div className="text-purple font-mono text-xs tracking-wide mb-2">
                ℹ️ BATTLE INFO
              </div>
              <p className="text-purple/80 text-xs leading-relaxed">
                {connectionStatus === 'connected' ? 
                  'You\'re joining a live Tech Feud battle! Answer questions, compete with other teams, and climb the leaderboard.' :
                  'Demo mode active. You can test the game interface and see how Tech Feud works!'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Footer - Mobile Optimized */}
        <div className="text-center mt-6 sm:mt-8 px-2">
          <div className="relative">
            <p className="text-cyan/80 font-mono text-xs sm:text-sm tracking-[0.1em] mb-2 sm:mb-3">
              ⚡ BLACKBOX AI MAVERICKS CLUB PRESENTS ⚡
            </p>
            <p className="text-purple/60 font-mono text-[10px] sm:text-xs tracking-wider mb-3">
              TECH FEUD v2.0 | REAL-TIME BATTLE SYSTEM
            </p>
            <div className="flex justify-center items-center space-x-4 sm:space-x-6">
              <div className="w-6 sm:w-10 h-px bg-gradient-to-r from-transparent via-cyan to-transparent"></div>
              <div className="flex space-x-1 sm:space-x-2">
                <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-neon rounded-full animate-pulse animation-delay-200"></div>
                <div className="w-1.5 h-1.5 bg-purple rounded-full animate-pulse animation-delay-400"></div>
              </div>
              <div className="w-6 sm:w-10 h-px bg-gradient-to-r from-transparent via-cyan to-transparent"></div>
            </div>
            <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-mono text-cyan/50 tracking-wide">
              🔮 Neural networks active... Ready for tech combat 🔮
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
