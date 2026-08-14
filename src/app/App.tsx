import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Compass, AlertTriangle, ArrowRight, X, Clock } from 'lucide-react';
import { SearchResult } from '../types';

export default function App() {
  const [query, setQuery] = useState('');
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'discovering' | 'sources_found' | 'refining' | 'building' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load and Save Recent Searches
  useEffect(() => {
    const history = localStorage.getItem('nexus_searches');
    if (history) {
      try {
        setRecentSearches(JSON.parse(history));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Keyboard shortcut Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedSource(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveSearch = (q: string) => {
    const cleaned = q.trim();
    if (!cleaned) return;
    const filtered = recentSearches.filter(s => s.toLowerCase() !== cleaned.toLowerCase());
    const updated = [cleaned, ...filtered].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('nexus_searches', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('nexus_searches');
  };

  const triggerSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    saveSearch(searchQuery);
    setSelectedSource(null);

    // Progressive loading states simulator to reflect standard speculative state progress
    try {
      setStatus('discovering');
      await new Promise(r => setTimeout(r, 400));
      setStatus('sources_found');
      await new Promise(r => setTimeout(r, 450));
      setStatus('refining');
      await new Promise(r => setTimeout(r, 350));
      setStatus('building');

      const res = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) {
        throw new Error('Search request failed');
      }

      const data = (await res.json()) as SearchResult;
      setCurrentResult(data);
      setStatus('done');
    } catch (e: any) {
      setErrorMessage(e.message || 'Retrieval coordination error');
      setStatus('error');
    }
  };

  const handleShortcutClick = (destination: string) => {
    let url = '';
    if (destination === 'ChatGPT') url = 'https://chat.openai.com';
    else if (destination === 'YouTube') url = 'https://youtube.com';
    else if (destination === 'Instagram') url = 'https://instagram.com';
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] font-sans flex flex-col relative selection:bg-[#66fcf1]/30 selection:text-white">
      {/* Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-800/50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setQuery(''); setCurrentResult(null); setStatus('idle'); }}>
          <Compass className="w-6 h-6 text-[#66fcf1]" />
          <span className="font-mono font-semibold tracking-widest text-[#f5f5f7] text-lg">NEXUS</span>
        </div>
        <div className="text-xs font-mono text-[#8a8d91] flex items-center space-x-2">
          <span className="border border-gray-800 px-1.5 py-0.5 rounded">⌘ K</span>
          <span>to search</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col items-center">
        {status === 'idle' && (
          <div className="w-full flex flex-col items-center justify-center my-auto space-y-10 max-w-2xl py-12">
            {/* Editorial Header */}
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-extralight tracking-tight text-[#f5f5f7] sm:text-6xl">
                NEXUS
              </h1>
              <p className="text-lg font-light text-[#8a8d91] tracking-wide">
                Find the part of the web that matters.
              </p>
            </div>

            {/* Universal Search Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); triggerSearch(query); }}
              className="w-full bg-[#1f2833]/70 border border-[#45a29e]/40 hover:border-[#66fcf1]/60 focus-within:border-[#66fcf1] focus-within:ring-1 focus-within:ring-[#66fcf1]/50 rounded-xl px-5 py-4 flex items-center space-x-4 transition-all duration-200 shadow-xl backdrop-blur-md"
            >
              <Search className="w-5 h-5 text-[#8a8d91] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="bg-transparent text-white placeholder-[#8a8d91] focus:outline-none w-full text-lg"
                autoFocus
              />
              <button type="submit" className="text-xs uppercase tracking-wider font-mono px-3 py-1 bg-[#66fcf1]/10 text-[#66fcf1] rounded hover:bg-[#66fcf1]/20 transition-all cursor-pointer">
                Search
              </button>
            </form>

            {/* Quick Destination Shortcuts */}
            <div className="flex flex-wrap gap-3 items-center justify-center">
              <span className="text-xs font-mono text-[#8a8d91] uppercase tracking-wider">Shortcuts:</span>
              {['ChatGPT', 'YouTube', 'Instagram'].map(dest => (
                <button
                  key={dest}
                  onClick={() => handleShortcutClick(dest)}
                  className="px-3 py-1.5 rounded-lg border border-gray-800/80 bg-[#1f2833]/30 text-xs font-mono hover:border-[#66fcf1]/30 hover:text-white transition-all cursor-pointer"
                >
                  {dest}
                </button>
              ))}
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="w-full border-t border-gray-900/80 pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8a8d91] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent explorations
                  </span>
                  <button onClick={clearHistory} className="text-[10px] uppercase tracking-wider font-mono text-[#8a8d91] hover:text-[#e74c3c] transition-all cursor-pointer">
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => triggerSearch(s)}
                      className="px-3 py-1.5 rounded-lg bg-[#1f2833]/40 border border-gray-800/40 hover:border-gray-700/60 text-sm font-light text-left transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Searching / Loading Progressive States */}
        {status !== 'idle' && status !== 'done' && status !== 'error' && (
          <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center space-y-8 py-24 my-auto">
            <Loader2 className="w-10 h-10 text-[#66fcf1] animate-spin" />
            <div className="text-center space-y-2">
              <div className="text-xs font-mono text-[#66fcf1] tracking-[0.2em] uppercase">
                {status === 'discovering' && 'DISCOVERING'}
                {status === 'sources_found' && 'SOURCES FOUND'}
                {status === 'refining' && 'REFINING'}
                {status === 'building' && 'BUILDING RESULT'}
              </div>
              <p className="text-sm font-light text-[#8a8d91]">
                {status === 'discovering' && 'Scanning public interfaces...'}
                {status === 'sources_found' && 'Resolving source domains...'}
                {status === 'refining' && 'Evaluating relevance and removing duplicates...'}
                {status === 'building' && 'Synthesizing knowledge experience...'}
              </p>
            </div>
          </div>
        )}

        {/* Error Boundary Display */}
        {status === 'error' && (
          <div className="w-full max-w-md bg-[#e74c3c]/10 border border-[#e74c3c]/40 rounded-xl p-6 text-center space-y-4 my-auto">
            <AlertTriangle className="w-8 h-8 text-[#e74c3c] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-[#f5f5f7] font-semibold">Search failed</h3>
              <p className="text-sm text-[#8a8d91]">{errorMessage}</p>
            </div>
            <button
              onClick={() => { setStatus('idle'); setCurrentResult(null); }}
              className="px-4 py-2 bg-gray-800 text-sm text-[#f5f5f7] rounded-lg hover:bg-gray-700 transition-all font-mono cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search Results Display */}
        {status === 'done' && currentResult && (
          <div className="w-full space-y-8 animate-fadeIn">
            {/* Inline Search Input */}
            <div className="w-full max-w-2xl">
              <form
                onSubmit={(e) => { e.preventDefault(); triggerSearch(query); }}
                className="w-full bg-[#1f2833]/40 border border-gray-800 hover:border-[#66fcf1]/30 rounded-xl px-4 py-3 flex items-center space-x-3 transition-all"
              >
                <Search className="w-4 h-4 text-[#8a8d91]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent text-white focus:outline-none w-full text-base placeholder-[#8a8d91]"
                />
              </form>
            </div>

            {/* Dynamic Results Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Primary Experience Content Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Adaptive Experience Selection Renderers */}
                {currentResult.experience === 'overview' && (
                  <div className="space-y-6">
                    <div className="border border-gray-800/80 rounded-xl p-6 bg-[#1f2833]/15 space-y-4">
                      <h2 className="text-xl font-light text-white border-b border-gray-800/80 pb-3 uppercase tracking-wider font-mono text-[#66fcf1]">
                        Overview
                      </h2>
                      {currentResult.primaryItems.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <h3 className="text-lg font-normal text-white">{item.title}</h3>
                          <p className="text-sm text-[#c5c6c7] font-light leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentResult.experience === 'comparison' && (
                  <div className="space-y-6">
                    <div className="border border-gray-800/80 rounded-xl p-6 bg-[#1f2833]/15 space-y-6">
                      <h2 className="text-xl font-light text-white border-b border-gray-800/80 pb-3 uppercase tracking-wider font-mono text-[#66fcf1]">
                        Comparison Analysis
                      </h2>
                      {currentResult.primaryItems.map((item, idx) => (
                        <div key={idx} className="space-y-4">
                          <h3 className="text-lg font-normal text-white">{item.title}</h3>
                          <p className="text-sm text-[#c5c6c7] font-light leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                      {/* Structured Matrix Table */}
                      <div className="overflow-x-auto border border-gray-800/60 rounded-lg">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#1f2833]/30 text-xs uppercase tracking-wider font-mono">
                            <tr>
                              <th className="p-3 border-b border-gray-800">Feature</th>
                              <th className="p-3 border-b border-gray-800">React</th>
                              <th className="p-3 border-b border-gray-800">Vue.js</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/40">
                            <tr>
                              <td className="p-3 font-semibold text-white">Syntax</td>
                              <td className="p-3">JSX (JavaScript XML)</td>
                              <td className="p-3">HTML-based templates</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-semibold text-white">Ecosystem</td>
                              <td className="p-3">Highly decoupled, rich libraries</td>
                              <td className="p-3">Opinionated core, comprehensive tools</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-semibold text-white">State Management</td>
                              <td className="p-3">Redux, Zustand, Recoil</td>
                              <td className="p-3">Pinia (official), Vuex</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {currentResult.experience === 'troubleshooting' && (
                  <div className="space-y-6">
                    <div className="border border-[#45a29e]/30 rounded-xl p-6 bg-[#1f2833]/15 space-y-6">
                      <h2 className="text-xl font-light text-white border-b border-gray-800/80 pb-3 uppercase tracking-wider font-mono text-[#66fcf1]">
                        Troubleshooting Diagnosis
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="px-2 py-0.5 rounded bg-[#e74c3c]/10 text-[#e74c3c] text-xs font-mono uppercase tracking-wide shrink-0">Symptom</div>
                          <p className="text-sm text-[#c5c6c7] font-light">Freeze or complete screen hang when placing crosshair or moving mouse over enemy models.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="px-2 py-0.5 rounded bg-[#f1c40f]/10 text-[#f1c40f] text-xs font-mono uppercase tracking-wide shrink-0">Diagnosis</div>
                          <p className="text-sm text-[#c5c6c7] font-light">OpenGL buffering error. Legacy render engine stalls resolving player hitboxes / polygons with modern driver pipelines.</p>
                        </div>
                      </div>

                      {/* Step-by-step diagnostic actions */}
                      <div className="space-y-3 pt-4 border-t border-gray-800/80">
                        <h4 className="text-xs uppercase tracking-wider font-mono text-[#8a8d91]">Recommended Actions</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-[#c5c6c7] font-light">
                          <li>Open Steam console, try setting <code className="px-1 py-0.5 bg-gray-900 rounded font-mono text-[#66fcf1]">m_rawinput 1</code></li>
                          <li>Ensure default player skins are active via setting <code className="px-1 py-0.5 bg-gray-900 rounded font-mono text-[#66fcf1]">cl_minmodels 1</code></li>
                          <li>Verify graphics card overrides are off for vertical sync (VSync)</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unified claims list below major components */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8a8d91]">Key Extracted Claims</h3>
                  <div className="space-y-3">
                    {currentResult.claims.map((claim, idx) => (
                      <div key={idx} className="p-4 border border-gray-800 bg-[#1f2833]/5 rounded-lg flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-[#c5c6c7] leading-relaxed">{claim.text}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#66fcf1]/5 text-[#66fcf1] border border-[#66fcf1]/20 rounded">
                              {claim.claimType}
                            </span>
                            <span className="text-[10px] font-mono text-[#8a8d91]">
                              Confidence: {Math.round(claim.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        {claim.sourceIds && claim.sourceIds.length > 0 && (
                          <button
                            onClick={() => {
                              const s = currentResult.sources.find(src => src.id === claim.sourceIds[0]);
                              if (s) setSelectedSource(s);
                            }}
                            className="text-xs text-[#66fcf1] underline shrink-0 hover:text-white transition cursor-pointer"
                          >
                            Source
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sources / Exploration Column */}
              <div className="space-y-6">
                {/* Sources list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8a8d91]">Evidence Sources</h3>
                  <div className="space-y-3">
                    {currentResult.sources.map((src, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedSource(src)}
                        className="p-4 border border-gray-800 bg-[#1f2833]/10 hover:border-[#66fcf1]/30 rounded-xl cursor-pointer transition-all space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#66fcf1]">
                            {src.provider}
                          </span>
                          <span className="text-xs font-mono text-[#8a8d91]">
                            {src.sourceType}
                          </span>
                        </div>
                        <h4 className="text-sm font-normal text-white group-hover:text-[#66fcf1] transition-all">
                          {src.title}
                        </h4>
                        {src.excerpt && (
                          <p className="text-xs text-[#8a8d91] line-clamp-2 leading-relaxed">
                            {src.excerpt}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Explorations */}
                <div className="space-y-4 border-t border-gray-800/80 pt-6">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8a8d91]">Explore Further</h3>
                  <div className="flex flex-col gap-2">
                    {currentResult.relatedTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => triggerSearch(topic)}
                        className="p-3 border border-gray-800 bg-[#1f2833]/5 rounded-xl hover:border-[#66fcf1]/30 text-left text-sm font-light text-[#c5c6c7] hover:text-white transition flex items-center justify-between cursor-pointer"
                      >
                        <span>{topic}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8a8d91]" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interactive Sliding Evidence Drawer overlay */}
      {selectedSource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedSource(null)}>
          <div
            className="w-full max-w-lg bg-[#1f2833] h-full p-8 shadow-2xl border-l border-gray-800 overflow-y-auto flex flex-col justify-between space-y-6 animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#66fcf1]">
                  Evidence Details
                </span>
                <button onClick={() => setSelectedSource(null)} className="text-[#8a8d91] hover:text-white transition cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-light text-white leading-tight">
                  {selectedSource.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-gray-900 border border-gray-800 rounded">
                    Provider: {selectedSource.provider}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-gray-900 border border-gray-800 rounded">
                    Type: {selectedSource.sourceType}
                  </span>
                </div>
              </div>

              {selectedSource.excerpt && (
                <div className="space-y-2 border-t border-gray-800/80 pt-6">
                  <h4 className="text-xs uppercase tracking-wider font-mono text-[#8a8d91]">Extract Excerpt</h4>
                  <p className="text-sm leading-relaxed text-[#c5c6c7] bg-gray-950/40 p-4 border border-gray-800 rounded-lg">
                    "{selectedSource.excerpt}"
                  </p>
                </div>
              )}

              {/* Dynamic Metadata / Trust Signals */}
              <div className="space-y-3 pt-4 border-t border-gray-800/80">
                <h4 className="text-xs uppercase tracking-wider font-mono text-[#8a8d91]">Trust Signals</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-900/30 rounded border border-gray-800 text-xs">
                    <span className="block text-[#8a8d91]">Authoritative</span>
                    <span className="font-semibold text-[#66fcf1]">{selectedSource.trustSignals?.authoritative ? 'YES' : 'NO'}</span>
                  </div>
                  <div className="p-3 bg-gray-900/30 rounded border border-gray-800 text-xs">
                    <span className="block text-[#8a8d91]">Independent Confirmation</span>
                    <span className="font-semibold text-[#66fcf1]">{selectedSource.trustSignals?.independentConfirmation ? 'YES' : 'NO'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800/80">
              <a
                href={selectedSource.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#66fcf1] text-[#0b0c10] rounded-xl hover:bg-white text-center font-semibold text-sm transition-all block tracking-wide cursor-pointer"
              >
                Go to original web source
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
