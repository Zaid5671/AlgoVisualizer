import React from 'react';
import { useNavigate } from 'react-router-dom';
import spitLogo from '../assets/spit_logo.png';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page-scope font-body-md text-body-md bg-lab-matrix min-h-screen text-on-surface bg-white">


      <header className="sticky top-0 z-50 flex flex-col border-b border-[#efefef] bg-white dark:bg-white">

        <div className="flex justify-between items-center w-full px-6 py-4 bg-white">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-8 h-8 flex items-center justify-center font-bold border border-[#efefef] shadow-sm rounded-lg transition-all overflow-hidden bg-white">
                <img src={spitLogo} alt="SPIT Logo" className="w-full h-full object-contain" />
              </div>
              <span className="tracking-tight text-[#1a1a1a] font-bold text-[1.2rem]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SPIT Algo Visualizer</span>
            </div>

            <nav className="hidden md:flex items-center font-label-md text-label-md">
              <a className="px-3 py-1.5 hover:bg-gray-50 text-black rounded-md transition-all uppercase font-bold text-[0.9rem]" href="#pedagogy">Docs</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">


            <button onClick={() => navigate('/algorithm')} className="px-4 py-1.5 border border-[#efefef] bg-[#fffaf0] text-[#1a1a1a] font-label-md text-label-md uppercase tracking-wider font-bold shadow-sm rounded-lg hover:-translate-y-0.5 transition-transform duration-200 transition-all flex items-center gap-1.5">
              <span className="">EXPLORE ALGORITHMS</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      <section className="px-6 lg:px-12 py-10 lg:py-14 border-b border-[#efefef] flex flex-col lg:flex-row gap-10 items-center justify-between bg-white relative overflow-hidden">

        <div className="absolute -right-6 -bottom-8 pointer-events-none opacity-5 select-none font-mono text-[0.85rem] text-9xl font-black">
          SPECIMEN_01
        </div>

        <div className="flex-1 flex flex-col gap-6 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fafafa] border border-[#efefef] font-sans text-label-sm shadow-sm rounded-lg font-bold">
              <span className="text-[#1a1a1a] font-bold">●</span>
              <span className="tracking-widest">CS ARCHIVAL ENGINE // DSA VISUALIZER</span>
            </div>


          </div>

          <h1 className="font-sans text-3xl sm:text-4xl lg:text-[52px] text-[#1a1a1a] tracking-tight leading-[1.08] font-bold">
            Watch algorithms think. <br className="hidden sm:inline" />
            <span className="bg-[#fffaf0] px-2 border border-[#efefef] inline-block shadow-sm rounded-xl transform -rotate-1 mt-1">
              Frame by frame.
            </span>
          </h1>

          <p className="font-sans text-body-lg text-gray-500 leading-relaxed max-w-xl">Understand algorithms by watching them unfold. Step frame by frame through sorting, pathfinding, graph networks, and backtracking with real-time synchronization between visual structures and line-by-line pseudocode tracing.</p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button onClick={() => navigate('/algorithm')} className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-[#fffaf0] border border-[#efefef] font-sans text-label-lg text-[#1a1a1a] uppercase shadow-sm rounded-xl hover:-translate-y-0.5 transition-transform duration-200 transition-all font-bold">
              <span className="">Explore Specimen Catalog</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-[#efefef] text-left font-sans text-label-sm text-gray-500"><div className="p-2 border border-[#efefef] bg-white shadow-sm rounded-lg"><div className="text-[#1a1a1a] font-bold">✦ 20+ Algorithms</div><div className="text-[11px] text-gray-500 mt-0.5">Across 4 core disciplines</div></div><div className="p-2 border border-[#efefef] bg-white shadow-sm rounded-lg"><div className="text-[#1a1a1a] font-bold">✦ Line-by-Line</div><div className="text-[11px] text-gray-500 mt-0.5">Synchronized code tracer</div></div><div className="p-2 border border-[#efefef] bg-white shadow-sm rounded-lg"><div className="text-[#1a1a1a] font-bold">✦ Step-by-Step</div><div className="text-[11px] text-gray-500 mt-0.5">Discrete frame-by-frame replay</div></div></div>
        </div>

        <div className="w-full lg:w-[460px] flex flex-col gap-3">
          <div className="border border-[#efefef] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-xl flex flex-col gap-3 relative">
            <div className="absolute -top-3 -right-3 bg-[#fffaf0] border border-[#efefef] font-mono text-[0.85rem] text-[11px] px-2 py-0.5 font-bold rotate-3 shadow-sm rounded-lg">
              RUNTIME ENGINE
            </div>
            <div className="flex items-center justify-between border-b border-[#efefef] pb-2">
              <span className="font-mono text-[0.85rem] text-xs font-bold uppercase text-[#1a1a1a]">BENCHMARK // EXECUTION MATRIX</span>
              <span className="text-xs font-sans text-[#1a1a1a] font-bold">SPECIMEN #018</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[0.85rem]">
              <div className="p-2 bg-[#fafafa] border border-[#efefef]">
                <span className="text-gray-500 text-[10px] block">ALGORITHM</span>
                <span className="font-bold text-[#1a1a1a]">QuickSort</span>
              </div>
              <div className="p-2 bg-[#fafafa] border border-[#efefef]">
                <span className="text-gray-500 text-[10px] block">WORST CASE</span>
                <span className="font-bold text-red-500">O(N²)</span>
              </div>
              <div className="p-2 bg-[#fafafa] border border-[#efefef]">
                <span className="text-gray-500 text-[10px] block">AVERAGE CASE</span>
                <span className="font-bold text-[#1a1a1a]">O(N log N)</span>
              </div>
              <div className="p-2 bg-[#fafafa] border border-[#efefef]">
                <span className="text-gray-500 text-[10px] block">AUXILIARY STACK</span>
                <span className="font-bold text-[#1a1a1a]">O(log N)</span>
              </div>
            </div>
            <div className="p-3 bg-[#2d3748] text-white border border-[#efefef] font-mono text-[0.85rem] text-xs">
              <div className="text-[#f2e580] flex items-center justify-between pb-1 border-b border-surface/20">
                <span className="">// State Machine Observer</span>
                <span className="">CYCLE 18/34</span>
              </div>
              <div className="pt-2 text-on-primary-container space-y-0.5">
                <div className=""><span className="text-[#A7F3D0]">curr_partition:</span> arr[0..6]</div>
                <div className=""><span className="text-[#bee9ff]">active_pivot:</span> 42 (index: 6)</div>
                <div className=""><span className="text-[#FECDD3]">condition:</span> arr[3]=27 &lt; 42 <span className="text-[#A7F3D0]">== TRUE</span></div>
                <div className="text-white font-bold">&gt;&gt; INVOKING SWAP: arr[2] ↔ arr[3]</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-label-sm font-sans text-gray-500 pt-1"><span className="">Step-by-step state snapshot ready</span><span className="font-bold text-[#1a1a1a] underline cursor-pointer">20+ Algorithms across 4 Taxonomies →</span></div>
          </div>
        </div>
      </section>

      <section className="p-6 lg:p-12 border-b border-[#efefef] bg-[#fafafa] flex flex-col gap-6" id="sorting">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-sans text-label-sm tracking-wider uppercase font-bold text-[#1a1a1a]">
              <span className="w-3 h-3 bg-[#1a1a1a] inline-block"></span>
              SPECIMEN_STAGE // 01 — WIDESCREEN ACTIVE RUNTIME
            </div>
            <h2 className="font-sans text-headline-lg text-[#1a1a1a] tracking-tight mt-1">Interactive Bubble Sort Studio</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 border border-[#efefef] bg-[#f0fff4] text-[#1a1a1a] font-sans text-label-sm font-bold shadow-sm rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1a1a1a] animate-ping"></span>
              ACTIVE VIRTUAL MACHINE
            </span>
            <button className="px-3 py-1 border border-[#efefef] bg-white font-sans text-label-sm font-bold shadow-sm rounded-lg hover:-translate-y-0.5 transition-transform duration-200">
              RESET ARRAY
            </button>
          </div>
        </div>

        <div className="border border-[#efefef] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl flex flex-col overflow-hidden">

          <div className="px-4 py-2.5 border-b border-[#efefef] bg-white-container flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full border border-[#efefef] bg-[#FECDD3]"></span><span className="w-3.5 h-3.5 rounded-full border border-[#efefef] bg-[#fffaf0]"></span><span className="w-3.5 h-3.5 rounded-full border border-[#efefef] bg-[#A7F3D0]"></span></div><span className="font-mono text-[0.85rem] text-code-sm text-[#1a1a1a] font-bold">specimen://bubblesort_adjacent_swap.ts</span><span className="px-2 py-0.2 bg-[#fffaf0] border border-[#efefef] font-mono text-[0.85rem] text-[11px] font-bold text-[#1a1a1a] uppercase">STABLE</span></div><div className="flex items-center gap-4 font-mono text-[0.85rem] text-xs"><span className="text-gray-500">FPS: <strong className="text-[#1a1a1a]">60.0</strong></span><span className="text-gray-500">PASS: <strong className="text-[#1a1a1a]">1 / N</strong></span><span className="font-bold text-[#1a1a1a] bg-[#fafafa] px-2 py-0.5 border border-[#efefef]">CYCLE 14 / 84</span></div></div>

          <div className="px-4 py-2 border-b border-[#efefef] bg-white-container-high flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2"><button className="w-8 h-8 flex items-center justify-center border border-[#efefef] bg-white shadow-sm rounded-lg hover:-translate-y-0.5 transition-transform duration-200 hover:bg-white-container-high" title="Jump to start"><span className="material-symbols-outlined text-[18px]">first_page</span></button><button className="w-8 h-8 flex items-center justify-center border border-[#efefef] bg-white shadow-sm rounded-lg hover:-translate-y-0.5 transition-transform duration-200 hover:bg-white-container-high" title="Step back"><span className="material-symbols-outlined text-[18px]">skip_previous</span></button><button className="px-3 h-8 flex items-center justify-center gap-1 border border-[#efefef] bg-[#fffaf0] shadow-sm rounded-lg hover:-translate-y-0.5 transition-transform duration-200 font-bold hover:bg-secondary-fixed" title="Pause execution"><span className="material-symbols-outlined text-[18px]">pause</span><span className="font-sans text-label-sm">PAUSE</span></button><button className="w-8 h-8 flex items-center justify-center border border-[#efefef] bg-white shadow-sm rounded-lg hover:-translate-y-0.5 transition-transform duration-200 hover:bg-white-container-high" title="Step forward"><span className="material-symbols-outlined text-[18px]">skip_next</span></button><button className="w-8 h-8 flex items-center justify-center border border-[#efefef] bg-white shadow-sm rounded-lg hover:-translate-y-0.5 transition-transform duration-200 hover:bg-white-container-high" title="Jump to end"><span className="material-symbols-outlined text-[18px]">last_page</span></button></div><div className="flex-1 max-w-md mx-2 flex items-center gap-3"><span className="font-mono text-[0.85rem] text-xs font-bold text-[#1a1a1a]">00</span><div className="w-full bg-white-container border border-[#efefef] h-3 relative cursor-pointer"><div className="bg-[#1a1a1a] h-full w-[38%]"></div><div className="absolute -top-1.5 left-[38%] -ml-1.5 w-4 h-4 bg-[#fffaf0] border border-[#efefef] shadow-sm rounded-lg"></div></div><span className="font-mono text-[0.85rem] text-xs font-bold text-[#1a1a1a]">84</span></div><div className="flex items-center gap-3"><div className="flex items-center gap-1.5 bg-white px-2 py-1 border border-[#efefef] font-sans text-label-sm"><span className="">SPEED:</span><button className="px-1.5 py-0.2 hover:bg-white-container border border-transparent font-bold">0.5x</button><button className="px-1.5 py-0.2 bg-[#fffaf0] border border-[#efefef] font-bold">1x</button><button className="px-1.5 py-0.2 hover:bg-white-container border border-transparent font-bold">2x</button><button className="px-1.5 py-0.2 hover:bg-white-container border border-transparent font-bold">4x</button></div><div className="hidden sm:flex items-center gap-1 bg-white px-2 py-1 border border-[#efefef] font-mono text-[0.85rem] text-xs"><span className="">MODE:</span><span className="font-bold text-[#1a1a1a] bg-[#bee9ff] px-1 border border-[#efefef]">ADJACENT SWAP</span></div></div></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
            <div className="lg:col-span-7 bg-[#F4EFEA] border-b-2 lg:border-b-0 lg:border-r-2 border-[#efefef] flex flex-col justify-between p-6 relative"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efefef]/20 pb-3"><div className="flex items-center gap-2.5 text-label-sm font-sans flex-wrap"><span className="flex items-center gap-1 px-2 py-0.5 border border-[#efefef] bg-[#bee9ff] rounded-full"><span className="w-2.5 h-2.5 rounded-full bg-white border border-[#efefef]"></span><span className="">comparing</span></span><span className="flex items-center gap-1 px-2 py-0.5 border border-[#efefef] bg-[#FECDD3] rounded-full"><span className="w-2.5 h-2.5 rounded-full bg-white border border-[#efefef]"></span><span className="">swapping</span></span><span className="flex items-center gap-1 px-2 py-0.5 border border-[#efefef] bg-[#fffaf0] rounded-full"><span className="w-2.5 h-2.5 rounded-full bg-white border border-[#efefef]"></span><span className="">pass boundary</span></span><span className="flex items-center gap-1 px-2 py-0.5 border border-[#efefef] bg-[#A7F3D0] rounded-full"><span className="w-2.5 h-2.5 rounded-full bg-white border border-[#efefef]"></span><span className="">settled</span></span></div><div className="flex items-center gap-2 font-mono text-[0.85rem] text-xs font-bold bg-white px-2.5 py-1 border border-[#efefef] shadow-sm rounded-lg"><span className="">ARRAY SIZE: 13</span></div></div><div className="my-6 flex items-end justify-between gap-1.5 lg:gap-2 px-1 h-56 relative border-b border-[#efefef]"><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">50</span><div className="w-full h-24 bg-[#fafafa] border border-[#efefef] relative"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[0]</span></div><div className="flex-1 flex flex-col items-center relative"><div className="absolute -top-10 px-1.5 py-0.5 bg-[#FECDD3] border border-[#efefef] font-mono text-[0.85rem] text-[9px] font-bold shadow-sm rounded-lg animate-bounce">arr[1]=94</div><span className="font-mono text-[0.85rem] text-[11px] text-[#1a1a1a] mb-1 font-bold">94</span><div className="w-full h-44 bg-[#FECDD3] border border-[#efefef] shadow-sm rounded-xl relative"><div className="w-full h-full flex items-center justify-center font-bold text-xs opacity-70">⇄</div></div><span className="font-sans text-[9px] mt-1 font-bold text-[#1a1a1a] bg-[#FECDD3] px-1 border border-[#efefef]">[1]</span></div><div className="flex-1 flex flex-col items-center relative"><div className="absolute -top-10 px-1.5 py-0.5 bg-[#bee9ff] border border-[#efefef] font-mono text-[0.85rem] text-[9px] font-bold shadow-sm rounded-lg">arr[2]=74</div><span className="font-mono text-[0.85rem] text-[11px] text-[#1a1a1a] mb-1 font-bold">74</span><div className="w-full h-36 bg-[#bee9ff] border border-[#efefef] shadow-sm rounded-xl relative"><div className="w-full h-full flex items-center justify-center font-bold text-xs opacity-70">⇄</div></div><span className="font-sans text-[9px] mt-1 font-bold text-[#1a1a1a] bg-[#bee9ff] px-1 border border-[#efefef]">[2]</span></div><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">10</span><div className="w-full h-8 bg-[#fafafa] border border-[#efefef]"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[3]</span></div><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">26</span><div className="w-full h-14 bg-[#fafafa] border border-[#efefef]"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[4]</span></div><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">57</span><div className="w-full h-28 bg-[#fafafa] border border-[#efefef]"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[5]</span></div><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">43</span><div className="w-full h-20 bg-[#fafafa] border border-[#efefef]"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[6]</span></div><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">29</span><div className="w-full h-16 bg-[#fafafa] border border-[#efefef]"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[7]</span></div><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">15</span><div className="w-full h-10 bg-[#fafafa] border border-[#efefef]"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[8]</span></div><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">35</span><div className="w-full h-16 bg-[#fafafa] border border-[#efefef]"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[9]</span></div><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">79</span><div className="w-full h-36 bg-[#fafafa] border border-[#efefef]"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[10]</span></div><div className="flex-1 flex flex-col items-center"><span className="font-mono text-[0.85rem] text-[11px] text-gray-500 mb-1 font-bold">74</span><div className="w-full h-32 bg-[#fafafa] border border-[#efefef]"></div><span className="font-sans text-[9px] mt-1 text-gray-500">[11]</span></div><div className="flex-1 flex flex-col items-center relative"><span className="font-mono text-[0.85rem] text-[11px] text-[#1a1a1a] mb-1 font-bold">85</span><div className="w-full h-40 bg-[#A7F3D0] border border-[#efefef] shadow-sm rounded-lg"></div><span className="font-sans text-[9px] mt-1 font-bold text-[#1a1a1a] bg-[#A7F3D0] px-1 border border-[#efefef]">[12]</span></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"><div className="bg-white border border-[#efefef] p-3 flex items-center justify-between shadow-sm rounded-lg"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-[#1a1a1a]">swap_horiz</span><span className="font-sans text-xs">Condition: <code className="font-mono text-[0.85rem] font-bold bg-[#F4EFEA] px-1 border border-[#efefef]">arr[1](94) &gt; arr[2](74)</code></span></div><span className="bg-[#FECDD3] px-2 py-0.5 border border-[#efefef] font-bold text-xs">TRUE → SWAP</span></div><div className="bg-white border border-[#efefef] p-3 flex items-center justify-between shadow-sm rounded-lg"><span className="font-sans text-xs text-gray-500 uppercase">Array Memory State:</span><span className="font-mono text-[0.85rem] text-xs font-bold text-[#1a1a1a]">[50, <strong className="bg-[#FECDD3] px-1">74</strong>, <strong className="bg-[#bee9ff] px-1">94</strong>, 10, 26, 57, 43, 29, 15, 35, 79, 74, <span className="bg-[#A7F3D0] px-1">85</span>]</span></div></div></div>

            <div className="lg:col-span-5 border-t-2 lg:border-t-0 border-[#efefef] bg-[#2d3748] text-white flex flex-col justify-between"><div className=""><div className="px-3 py-2 border-b border-surface/20 bg-black/40 flex items-center justify-between text-on-primary-container text-[11px] font-sans uppercase"><span className="flex items-center gap-1.5 text-secondary-container font-bold"><span className="material-symbols-outlined text-[14px]">code</span>&lt;&gt; BUBBLE SORT</span><span className="text-white font-mono text-[0.85rem] font-bold">STEP 14</span></div><div className="p-4 font-mono text-[0.85rem] text-xs leading-relaxed space-y-1 overflow-x-auto"><div className="text-on-primary-container opacity-60 italic mb-1">Starting Bubble Sort</div><div className="text-on-primary-container"><span className="opacity-40 mr-2">00</span>for (let i = 0; i &lt; N; i++) &#123;</div><div className="text-on-primary-container"><span className="opacity-40 mr-2">01</span>  let swapped = false;</div><div className="text-on-primary-container"><span className="opacity-40 mr-2">02</span>  for (let j = 0; j &lt; N - i - 1; j++) &#123;</div><div className="text-on-primary-container"><span className="opacity-40 mr-2">03</span>    if (arr[j] &gt; arr[j + 1]) &#123;</div><div className="bg-[#fffaf0] text-[#1a1a1a] font-bold px-2 py-1 border border-[#efefef] flex items-center justify-between shadow-sm rounded-lg my-1"><span className=""><span className="text-[#1a1a1a] opacity-60 mr-2">04</span>      swap(arr[j], arr[j + 1]);</span><span className="text-[9px] uppercase font-sans border border-[#efefef] px-1 bg-white">ACTIVE_SWAP</span></div><div className="text-on-primary-container"><span className="opacity-40 mr-2">05</span>      swapped = true;</div><div className="text-on-primary-container"><span className="opacity-40 mr-2">06</span>    &#125;</div><div className="text-on-primary-container"><span className="opacity-40 mr-2">07</span>  &#125;</div><div className="text-on-primary-container opacity-70"><span className="opacity-40 mr-2">08</span>  if (!swapped) break;</div><div className="text-on-primary-container"><span className="opacity-40 mr-2">09</span>&#125;</div></div></div><div className="border-t border-[#efefef] bg-black/60 p-3 font-mono text-[0.85rem] text-xs"><div className="text-on-primary-container text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center justify-between"><span className="">LIVE VARIABLE REGISTERS</span><span className="text-[#A7F3D0]">INVARIANTS VALID</span></div><div className="grid grid-cols-4 gap-2 text-center"><div className="bg-white/10 border border-surface/20 p-1.5"><div className="text-on-primary-container text-[10px]">i (pass)</div><div className="font-bold text-white text-sm">0</div></div><div className="bg-[#fffaf0] text-[#1a1a1a] border border-[#efefef] p-1.5 font-bold"><div className="text-[10px]">j (ptr)</div><div className="text-sm">1</div></div><div className="bg-[#FECDD3] text-[#1a1a1a] border border-[#efefef] p-1.5 font-bold"><div className="text-[10px]">arr[j]</div><div className="text-sm">94</div></div><div className="bg-[#bee9ff] text-[#1a1a1a] border border-[#efefef] p-1.5 font-bold"><div className="text-[10px]">arr[j+1]</div><div className="text-sm">74</div></div></div></div></div></div>

          <div className="p-4 bg-white border-t border-[#efefef] flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap items-center gap-6"><div><div className="font-sans text-[10px] text-gray-500 uppercase">Best Time</div><div className="font-label-md text-label-md text-[#1a1a1a] font-bold">O(n) — Pre-sorted</div></div><div className="h-8 w-[2px] bg-[#1a1a1a]/20 hidden sm:block"></div><div><div className="font-sans text-[10px] text-gray-500 uppercase">Average Time</div><div className="font-label-md text-label-md text-red-500 font-bold">O(n²)</div></div><div className="h-8 w-[2px] bg-[#1a1a1a]/20 hidden sm:block"></div><div><div className="font-sans text-[10px] text-gray-500 uppercase">Worst Time</div><div className="font-label-md text-label-md text-red-500 font-bold">O(n²)</div></div><div className="h-8 w-[2px] bg-[#1a1a1a]/20 hidden sm:block"></div><div><div className="font-sans text-[10px] text-gray-500 uppercase">Space Complexity</div><div className="font-label-md text-label-md text-[#1a1a1a] font-bold">O(1) Auxiliary</div></div><div className="h-8 w-[2px] bg-[#1a1a1a]/20 hidden sm:block"></div><div><div className="font-sans text-[10px] text-gray-500 uppercase">Swaps &amp; Comparisons</div><div className="font-label-md text-label-md text-[#1a1a1a] font-bold">5 Swaps / 14 Cmp</div></div></div><div className="flex items-center gap-2 text-xs font-mono text-[0.85rem] border border-[#efefef] px-3 py-1.5 bg-[#fafafa] shadow-sm rounded-lg"><span className="font-bold text-[#1a1a1a]">CURVE: ↗ O(N²)</span><span className="w-2.5 h-2.5 bg-[#fffaf0] border border-[#efefef]"></span><span className="text-gray-500 text-[11px]">| QUADRATIC DECAY</span></div></div>
        </div>
      </section>

      <section className="p-6 lg:p-12 border-b border-[#efefef] bg-white flex flex-col items-center" id="taxonomy">
        <div className="w-full max-w-[1350px] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="font-sans text-label-sm tracking-widest text-gray-500 uppercase font-bold">[01 // TAXONOMY ARCHIVE]</span>
              <h2 className="font-sans text-headline-lg text-[#1a1a1a] tracking-tight mt-0.5">
                Specimen Catalogues &amp; Laboratories
              </h2>
            </div>
            <div className="flex items-center gap-2"><span className="border border-[#efefef] bg-[#fafafa] px-3 py-1 font-sans text-label-sm font-bold">4 CORE TAXONOMIES</span><span className="border border-[#efefef] bg-[#fffaf0] px-3 py-1 font-sans text-label-sm font-bold">20+ ALGORITHMS</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <div className="border border-[#efefef] bg-white p-5 shadow-sm rounded-xl flex flex-col justify-between gap-4 group hover:translate-x-0.5 hover:-translate-y-0.5 transition-all">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 border border-[#efefef] bg-[#fffaf0] font-sans text-label-sm text-[#1a1a1a] uppercase font-bold">
                    01 / SORTING
                  </span>
                  <span className="font-mono text-[0.85rem] text-xs font-bold text-[#1a1a1a]">O(N log N)</span>
                </div>
                <div>
                  <h3 className="font-sans text-headline-sm text-[#1a1a1a] group-hover:underline">Merge Sort &amp; Divide-and-Conquer</h3>
                  <p className="font-sans text-body-sm text-gray-500 mt-1.5 leading-relaxed">Bubble, Insertion, Selection, Merge, and Quick Sort (Lomuto). Visualized with dynamic reactive bar charts, comparison counters, and partition swaps.</p>
                </div>

                <div className="h-16 border border-[#efefef] bg-[#F4EFEA] p-2 flex items-end justify-between gap-1.5 mt-1">
                  <div className="w-full h-5 bg-[#fffaf0] border border-[#efefef]"></div>
                  <div className="w-full h-9 bg-[#fffaf0] border border-[#efefef]"></div>
                  <div className="w-full h-12 bg-[#f0fff4] border border-[#efefef]"></div>
                  <div className="w-full h-7 bg-[#f0fff4] border border-[#efefef]"></div>
                  <div className="w-full h-14 bg-[#A7F3D0] border border-[#efefef]"></div>
                  <div className="w-full h-10 bg-[#A7F3D0] border border-[#efefef]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-label-sm font-sans pt-3 border-t border-[#efefef]/20">
                <span className="">Comparisons: <strong>142</strong></span>
                <a className="underline font-bold text-[#1a1a1a] hover:text-secondary flex items-center gap-0.5" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=sorting'); }} href="/algorithm?category=sorting">
                  Inspect <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>
            </div>

            <div className="border border-[#efefef] bg-white p-5 shadow-sm rounded-xl flex flex-col justify-between gap-4 group hover:translate-x-0.5 hover:-translate-y-0.5 transition-all" id="pathfinding">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 border border-[#efefef] bg-[#f0fff4] font-sans text-label-sm text-[#1a1a1a] uppercase font-bold">
                    02 / PATHFINDING
                  </span>
                  <span className="font-mono text-[0.85rem] text-xs font-bold text-[#1a1a1a]">A* &amp; Dijkstra</span>
                </div>
                <div>
                  <h3 className="font-sans text-headline-sm text-[#1a1a1a] group-hover:underline">Heuristic Grid Exploration</h3>
                  <p className="font-sans text-body-sm text-gray-500 mt-1.5 leading-relaxed">BFS, DFS, Dijkstra, and A* Search. Visualized via 2D interactive grid with live frontier expansion, obstacle placement, and Manhattan distance propagation.</p>
                </div>

                <div className="h-16 border border-[#efefef] bg-[#F4EFEA] p-1.5 grid grid-cols-6 gap-1 mt-1">
                  <div className="aspect-square bg-[#A7F3D0] border border-[#efefef] flex items-center justify-center font-bold text-[9px]">S</div>
                  <div className="aspect-square bg-[#f0fff4] border border-[#efefef]"></div>
                  <div className="aspect-square bg-[#f0fff4] border border-[#efefef]"></div>
                  <div className="aspect-square bg-[#1a1a1a] border border-[#efefef]"></div>
                  <div className="aspect-square bg-white border border-[#efefef]/30"></div>
                  <div className="aspect-square bg-white border border-[#efefef]/30"></div>
                  <div className="aspect-square bg-white border border-[#efefef]/30"></div>
                  <div className="aspect-square bg-[#1a1a1a] border border-[#efefef]"></div>
                  <div className="aspect-square bg-[#fffaf0] border border-[#efefef]"></div>
                  <div className="aspect-square bg-[#fffaf0] border border-[#efefef]"></div>
                  <div className="aspect-square bg-[#fffaf0] border border-[#efefef]"></div>
                  <div className="aspect-square bg-[#FECDD3] border border-[#efefef] flex items-center justify-center font-bold text-[9px]">T</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-label-sm font-sans pt-3 border-t border-[#efefef]/20">
                <span className="">Shortest Path: <strong>8 Units</strong></span>
                <a className="underline font-bold text-[#1a1a1a] hover:text-secondary flex items-center gap-0.5" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=pathfinding'); }} href="/algorithm?category=pathfinding">
                  Inspect <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>
            </div>

            <div className="border border-[#efefef] bg-white p-5 shadow-sm rounded-xl flex flex-col justify-between gap-4 group hover:translate-x-0.5 hover:-translate-y-0.5 transition-all" id="graphs">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 border border-[#efefef] bg-[#FECDD3] font-sans text-label-sm text-[#1a1a1a] uppercase font-bold">
                    03 / GRAPH NETWORKS
                  </span>
                  <span className="font-mono text-[0.85rem] text-xs font-bold text-[#1a1a1a]">DAG / Cycle 0</span>
                </div>
                <div><h3 className="font-sans text-headline-sm text-[#1a1a1a] group-hover:underline">Traversal, MST &amp; Connectivity</h3><p className="font-sans text-body-sm text-gray-500 mt-1.5 leading-relaxed">BFS, DFS, Dijkstra, Bellman-Ford, Kruskal's, Prim's, and Tarjan's SCC. Visualized via animated node-and-edge graphs with cycle detection.</p></div>

                <div className="h-16 border border-[#efefef] bg-[#F4EFEA] p-2 flex items-center justify-between relative px-3 mt-1">
                  <div className="w-7 h-7 rounded-full border border-[#efefef] bg-[#A7F3D0] flex items-center justify-center font-mono text-[0.85rem] text-xs font-bold">A</div>
                  <div className="h-[2px] flex-1 bg-[#1a1a1a] relative mx-1">
                    <span className="absolute right-0 -top-2 font-bold text-[10px]">▶</span>
                  </div>
                  <div className="w-7 h-7 rounded-full border border-[#efefef] bg-[#fffaf0] flex items-center justify-center font-mono text-[0.85rem] text-xs font-bold">B</div>
                  <div className="h-[2px] flex-1 bg-[#1a1a1a] relative mx-1">
                    <span className="absolute right-0 -top-2 font-bold text-[10px]">▶</span>
                  </div>
                  <div className="w-7 h-7 rounded-full border border-[#efefef] bg-[#f0fff4] flex items-center justify-center font-mono text-[0.85rem] text-xs font-bold">C</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-label-sm font-sans pt-3 border-t border-[#efefef]/20">
                <span className="">In-Degrees: <strong>[0, 1, 1]</strong></span>
                <a className="underline font-bold text-[#1a1a1a] hover:text-secondary flex items-center gap-0.5" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=graph'); }} href="/algorithm?category=graph">
                  Inspect <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>
            </div>

            <div className="border border-[#efefef] bg-white p-5 shadow-sm rounded-xl flex flex-col justify-between gap-4 group hover:translate-x-0.5 hover:-translate-y-0.5 transition-all" id="backtracking">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 border border-[#efefef] bg-[#A7F3D0] font-sans text-label-sm text-[#1a1a1a] uppercase font-bold">
                    04 / BACKTRACKING
                  </span>
                  <span className="font-mono text-[0.85rem] text-xs font-bold text-[#1a1a1a]">O(N!) State</span>
                </div>
                <div>
                  <h3 className="font-sans text-headline-sm text-[#1a1a1a] group-hover:underline">N-Queens &amp; Combinatorial Search</h3>
                  <p className="font-sans text-body-sm text-gray-500 mt-1.5 leading-relaxed">N-Queens, Sudoku Solver, and Graph Coloring. Visualized via chessboards and state-space constraint propagation with instant rollback branches.</p>
                </div>

                <div className="h-16 flex items-center justify-center mt-1">
                  <div className="w-28 border border-[#efefef] grid grid-cols-4 bg-[#F4EFEA]">
                    <div className="aspect-square bg-white border border-[#efefef]/20"></div>
                    <div className="aspect-square bg-[#FECDD3] border border-[#efefef] flex items-center justify-center font-bold text-[10px]">♛</div>
                    <div className="aspect-square bg-white border border-[#efefef]/20"></div>
                    <div className="aspect-square bg-white border border-[#efefef]/20"></div>
                    <div className="aspect-square bg-white border border-[#efefef]/20"></div>
                    <div className="aspect-square bg-white border border-[#efefef]/20"></div>
                    <div className="aspect-square bg-white border border-[#efefef]/20"></div>
                    <div className="aspect-square bg-[#FECDD3] border border-[#efefef] flex items-center justify-center font-bold text-[10px]">♛</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-label-sm font-sans pt-3 border-t border-[#efefef]/20">
                <span className="">Valid Solutions: <strong>2</strong></span>
                <a className="underline font-bold text-[#1a1a1a] hover:text-secondary flex items-center gap-0.5" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=backtracking'); }} href="/algorithm?category=backtracking">
                  Inspect <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="p-6 lg:p-12 border-b border-[#efefef] bg-white-container-high flex flex-col gap-8" id="pedagogy">
        <div className="max-w-3xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#1a1a1a] text-white font-sans text-label-sm uppercase font-bold">
              [02 // PEDAGOGY]
            </span>
            <span className="font-sans text-label-sm text-gray-500 uppercase tracking-wider font-bold">METHODOLOGY ARCHITECTURE</span>
          </div>
          <h2 className="font-sans text-headline-lg text-[#1a1a1a] tracking-tight">
            Engineered for cognitive retention, not passive watching.
          </h2>
          <p className="font-sans text-body-lg text-gray-500">
            Go beyond passive animations. Specimen lets you control every execution step, trace the corresponding pseudocode in real time, and inspect complexity as the algorithm runs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="border border-[#efefef] bg-white p-6 shadow-sm rounded-xl flex flex-col justify-between gap-4"><div className="flex flex-col gap-3"><div className="flex items-center justify-between"><span className="w-8 h-8 rounded-md bg-[#fffaf0] border border-[#efefef] flex items-center justify-center font-bold font-mono text-[0.85rem] text-sm shadow-sm rounded-lg">01</span><span className="font-mono text-[0.85rem] text-xs font-bold text-gray-500">FRAME_STEP</span></div><h3 className="font-sans text-headline-sm text-[#1a1a1a]">Frame-by-Frame State Control</h3><p className="font-sans text-body-sm text-gray-500 leading-relaxed">Pause, play, step forward, and step backward through discrete logical execution frames. Scrub timeline and adjust speed multipliers (0.5x, 1x, 2x, 4x) without watching canned GIFs.</p></div><div className="border border-[#efefef] bg-[#fafafa] p-3 flex flex-col gap-2 font-mono text-[0.85rem] text-xs"><div className="flex items-center justify-between text-gray-500 text-[10px]"><span className="">STATE CONTROLS</span><span className="text-[#1a1a1a] font-bold">SPEED: 0.5x — 4x</span></div><div className="p-2 border border-[#efefef] bg-white flex items-center justify-between font-bold"><span className="text-[#1a1a1a]">⏮ PREV STEP</span><span className="px-2 py-0.5 bg-[#fffaf0] border border-[#efefef] text-[10px]">FRAME 14/84</span><span className="text-[#1a1a1a]">NEXT STEP ⏭</span></div><div className="w-full bg-white-container border border-[#efefef] h-2"><div className="bg-[#fffaf0] h-full w-[45%]"></div></div></div></div><div className="border border-[#efefef] bg-white p-6 shadow-sm rounded-xl flex flex-col justify-between gap-4"><div className="flex flex-col gap-3"><div className="flex items-center justify-between"><span className="w-8 h-8 rounded-md bg-[#f0fff4] border border-[#efefef] flex items-center justify-center font-bold font-mono text-[0.85rem] text-sm shadow-sm rounded-lg">02</span><span className="font-mono text-[0.85rem] text-xs font-bold text-gray-500">CODE_SYNC</span></div><h3 className="font-sans text-headline-sm text-[#1a1a1a]">Synchronized Code Tracer</h3><p className="font-sans text-body-sm text-gray-500 leading-relaxed">Resizable VS Code-style pseudocode sidebar. As elements swap or grid cells inspect, the exact corresponding line of code highlights in real-time with zero lag.</p></div><div className="border border-[#efefef] bg-[#2d3748] p-3 flex flex-col gap-1.5 font-mono text-[0.85rem] text-xs"><div className="text-[#f2e580] text-[10px] uppercase font-bold flex justify-between"><span className="">ACTIVE CODE TRACE</span><span className="">SYNCHRONIZED</span></div><div className="bg-[#fffaf0] text-[#1a1a1a] px-2.5 py-1 border border-[#efefef] font-bold flex justify-between items-center"><span className="">04: swap(arr[j], arr[j + 1]);</span><span className="text-[9px] bg-white px-1 border border-[#efefef]">ACTIVE</span></div><div className="bg-white text-[#1a1a1a] px-2.5 py-1 border border-[#efefef] flex justify-between items-center opacity-85"><span className="">05: swapped = true;</span><span className="text-[9px] bg-white-container-high px-1 border border-[#efefef]">NEXT</span></div></div></div><div className="border border-[#efefef] bg-white p-6 shadow-sm rounded-xl flex flex-col justify-between gap-4"><div className="flex flex-col gap-3"><div className="flex items-center justify-between"><span className="w-8 h-8 rounded-md bg-[#FECDD3] border border-[#efefef] flex items-center justify-center font-bold font-mono text-[0.85rem] text-sm shadow-sm rounded-lg">03</span><span className="font-mono text-[0.85rem] text-xs font-bold text-gray-500">COMPLEXITY</span></div><h3 className="font-sans text-headline-sm text-[#1a1a1a]">Complexity Telemetry &amp; Invariants</h3><p className="font-sans text-body-sm text-gray-500 leading-relaxed">Pinned asymptotic bounds for every algorithm: Best, Average, Worst Case Time Complexity, and Auxiliary Space Complexity with live invariant tracking.</p></div><div className="border border-[#efefef] bg-[#fafafa] p-3 flex flex-col gap-2 font-mono text-[0.85rem] text-xs"><div className="flex items-center justify-between text-gray-500 text-[10px]"><span className="">ASYMPTOTIC TELEMETRY</span><span className="text-red-500 font-bold">WORST: O(N²)</span></div><div className="grid grid-cols-2 gap-1.5 border border-[#efefef] bg-white p-2 text-[10px]"><div><span className="text-gray-500 block">BEST CASE:</span><strong className="text-[#1a1a1a] font-bold">O(N) Pre-sorted</strong></div><div><span className="text-gray-500 block">SPACE COMPL:</span><strong className="text-[#1a1a1a] font-bold">O(1) Auxiliary</strong></div></div><div className="text-[10px] text-gray-500 font-bold text-[#695f02]">✓ Loop invariant checks verified every step</div></div></div></div>
      </section>

      <section className="p-6 lg:p-12 border-b border-[#efefef] bg-white flex flex-col gap-8" id="tutor">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#fffaf0] border border-[#efefef] font-sans text-label-sm font-bold text-[#1a1a1a] shadow-sm rounded-lg">
                AI TUTOR // INTERACTIVE CO-PILOT
              </span>
              <span className="font-mono text-[0.85rem] text-xs font-bold text-gray-500">MODEL: CS-LLM-0.9</span>
            </div>
            <h2 className="font-sans text-headline-lg text-[#1a1a1a] tracking-tight leading-tight">
              An expert DSA coach in your browser terminal.
            </h2>
            <p className="font-sans text-body-lg text-gray-500 leading-relaxed">
              Stuck on why a pointer decrements or why a recursive stack base condition didn't trigger? Ask the embedded Specimen AI tutor. It has instantaneous visibility into the active runtime registers, memory addresses, and loop invariants.
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <div className="flex items-start gap-2.5 p-3 border border-[#efefef] bg-[#fafafa]">
                <span className="material-symbols-outlined text-[#1a1a1a] text-[20px] shrink-0 mt-0.5">verified</span>
                <div>
                  <div className="font-sans text-xs font-bold text-[#1a1a1a] uppercase">Context-Aware Invariant Explanations</div>
                  <div className="font-sans text-xs text-gray-500 mt-0.5">Explains variables in terms of the exact current visualizer frame.</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 border border-[#efefef] bg-[#fafafa]">
                <span className="material-symbols-outlined text-[#1a1a1a] text-[20px] shrink-0 mt-0.5">psychology</span>
                <div>
                  <div className="font-sans text-xs font-bold text-[#1a1a1a] uppercase">Live Algorithm Reasoning</div>
                  <div className="font-sans text-xs text-gray-500 mt-0.5">Breaks down the current operation using the active visualizer state.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 border border-[#efefef] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl flex flex-col overflow-hidden">

            <div className="px-4 py-3 border-b border-[#efefef] bg-white-container flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#10b981] animate-pulse"></span>
                <span className="font-label-md text-label-md text-[#1a1a1a] font-bold">SPECIMEN_AI_TUTOR // RUNTIME_SESSION_042</span>
              </div>
              <div className="flex items-center gap-2">

                <span className="font-mono text-[0.85rem] text-xs text-gray-500">[ONLINE]</span>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-4 bg-white max-h-[460px] overflow-y-auto">

              <div className="self-end max-w-[90%] sm:max-w-[80%] flex flex-col gap-1"><div className="font-sans text-[10px] text-right text-gray-500 uppercase font-bold">CANDIDATE // INQUIRY [QUEUE STEP 07]</div><div className="p-3 bg-[#fafafa] border border-[#efefef] font-sans text-body-sm text-[#1a1a1a] shadow-sm rounded-lg">Why did node 5 get pushed into the queue before node 8, and why isn't node 2 visited again?</div></div>

              <div className="self-start max-w-[95%] sm:max-w-[88%] flex flex-col gap-1"><div className="flex items-center gap-2 font-sans text-[10px] text-[#1a1a1a] uppercase font-bold"><span className="w-5 h-5 bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xs">AI</span><span className="">SPECIMEN AI TUTOR</span><span className="text-gray-500 font-mono text-[0.85rem]">@ Step 7 // Frontier Expansion</span></div><div className="p-3.5 bg-white border border-[#efefef] font-sans text-body-sm text-[#1a1a1a] shadow-sm rounded-lg leading-relaxed space-y-2"><p className="">In BFS, nodes are explored in order of distance from the source. Node 5 is adjacent to node 1 at distance 2, discovered before node 8 (distance 3).</p><p className="">Node 2 has its <code className="font-mono text-[0.85rem] bg-[#F4EFEA] px-1 border border-[#efefef] font-bold">visited[2]</code> flag already set to true when dequeued at step 3, so the cycle prevention guard skips re-enqueuing it.</p><p className="font-bold text-xs text-[#1a1a1a] pt-1 border-t border-[#efefef]/20">Queue invariant: <code className="font-mono text-[0.85rem] bg-[#fafafa] px-1">queue.elements</code> maintains strictly monotonic non-decreasing shortest-path distances from the root.</p></div></div>


            </div>

            <div className="p-3 border-t border-[#efefef] bg-white-container flex items-center gap-3">
              <div className="relative flex-1">
                <input className="w-full bg-white border border-[#efefef] px-3 py-2 font-mono text-[0.85rem] text-xs text-[#1a1a1a] focus:outline-none focus:ring-0 placeholder:text-gray-500/60" placeholder="Ask about queue state, visited set, or frontier..." type="text" value="How does queue order guarantee shortest paths in unweighted graphs?" />
              </div>
              <button className="px-4 py-2 bg-[#1a1a1a] text-white border border-[#efefef] font-sans text-label-sm font-bold uppercase shadow-sm rounded-lg hover:-translate-y-0.5 transition-transform duration-200 hover:bg-[#fafafa] hover:text-[#1a1a1a] transition-all flex items-center gap-1.5">
                <span className="">ASK</span>
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </section>



      <footer className="w-full border-t border-[#efefef] bg-[#fafafa] flex flex-col items-center"><div className="w-full max-w-[1350px] px-6 lg:px-12 py-12 flex flex-col gap-8"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-8"><div className="lg:col-span-2 flex flex-col gap-3 max-w-xs"><div className="flex items-center gap-2"><div className="w-7 h-7 bg-[#1a1a1a] text-white flex items-center justify-center font-bold border border-[#efefef] shadow-sm rounded-lg"><span className="material-symbols-outlined text-[18px]">memory</span></div><span className="text-headline-sm font-sans uppercase text-[#1a1a1a] font-bold">SPECIMEN [0.9v]</span></div><p className="font-sans text-body-sm text-gray-500 leading-relaxed">Interactive algorithm visualizer for foundational computer science learning through step-by-step execution, code tracing, and technical interview preparation.</p><div className="font-mono text-[0.85rem] text-xs text-gray-500 mt-1 space-y-0.5"><div className="">SPECIMEN LAB&nbsp;<br />DSA VISUALIZER ENGINE</div><div className="">CORE: REACT + VITE</div></div></div><div className="flex flex-col gap-2 text-label-sm font-sans"><div className="font-bold text-[#1a1a1a] uppercase tracking-wider text-xs border-b border-[#efefef]/30 pb-1 flex items-center justify-between"><span className="">01. Sorting</span><span className="font-mono text-[0.85rem] text-[10px] text-gray-500">(8)</span></div><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=sorting'); }} href="/algorithm?category=sorting">Bubble Sort</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=sorting'); }} href="/algorithm?category=sorting">Selection Sort</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=sorting'); }} href="/algorithm?category=sorting">Insertion Sort</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=sorting'); }} href="/algorithm?category=sorting">Shell Sort</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=sorting'); }} href="/algorithm?category=sorting">Merge Sort</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=sorting'); }} href="/algorithm?category=sorting">Quick Sort</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=sorting'); }} href="/algorithm?category=sorting">Heap Sort</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=sorting'); }} href="/algorithm?category=sorting">Radix Sort</a></div><div className="flex flex-col gap-2 text-label-sm font-sans"><div className="font-bold text-[#1a1a1a] uppercase tracking-wider text-xs border-b border-[#efefef]/30 pb-1 flex items-center justify-between"><span className="">02. Pathfinding</span><span className="font-mono text-[0.85rem] text-[10px] text-gray-500">(5)</span></div><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=pathfinding'); }} href="/algorithm?category=pathfinding">Breadth-First Search (BFS)</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=pathfinding'); }} href="/algorithm?category=pathfinding">Dijkstra's Algorithm</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=pathfinding'); }} href="/algorithm?category=pathfinding">A* Search</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=pathfinding'); }} href="/algorithm?category=pathfinding">Depth-First Search (DFS)</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=pathfinding'); }} href="/algorithm?category=pathfinding">Greedy Best-First Search</a></div><div className="flex flex-col gap-2 text-label-sm font-sans"><div className="font-bold text-[#1a1a1a] uppercase tracking-wider text-xs border-b border-[#efefef]/30 pb-1 flex items-center justify-between"><span className="">03. Graph Networks</span><span className="font-mono text-[0.85rem] text-[10px] text-gray-500">(7)</span></div><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=graph'); }} href="/algorithm?category=graph">BFS (Graph Network)</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=graph'); }} href="/algorithm?category=graph">DFS (Graph Network)</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=graph'); }} href="/algorithm?category=graph">Kruskal's MST</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=graph'); }} href="/algorithm?category=graph">Prim's MST</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=graph'); }} href="/algorithm?category=graph">Dijkstra's Algorithm</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=graph'); }} href="/algorithm?category=graph">Bellman-Ford Algorithm</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=graph'); }} href="/algorithm?category=graph">Tarjan's SCC</a></div><div className="flex flex-col gap-2 text-label-sm font-sans"><div className="font-bold text-[#1a1a1a] uppercase tracking-wider text-xs border-b border-[#efefef]/30 pb-1 flex items-center justify-between"><span className="">04. Backtracking</span><span className="font-mono text-[0.85rem] text-[10px] text-gray-500">(3)</span></div><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=backtracking'); }} href="/algorithm?category=backtracking">N-Queens Problem</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=backtracking'); }} href="/algorithm?category=backtracking">Sudoku Solver</a><a className="text-gray-500 hover:text-[#1a1a1a] hover:underline" onClick={(e) => { e.preventDefault(); navigate('/algorithm?category=backtracking'); }} href="/algorithm?category=backtracking">Graph m-Coloring</a></div></div><div className="pt-6 border-t border-[#efefef] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[0.85rem] text-xs text-gray-500"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-[#efefef]"></span><span className="text-[#1a1a1a] font-bold">NODE_STATUS: ALL SPECIMEN ENGINES NOMINAL</span><span className="">// 23 ALGORITHMS VERIFIED // 4 PRIMARY DISCIPLINES</span></div><div className="flex items-center gap-4"><span className="">OPEN SOURCE (MIT)</span><span className="">•</span><span className="">SPECIMEN LABS 2026</span></div></div></div></footer>



    </div>
  );
}
