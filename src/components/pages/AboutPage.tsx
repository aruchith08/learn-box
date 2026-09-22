import React, { useEffect } from 'react';
import { ABDUL_BARI_PROBLEMS } from '../../data/abdulBariData';
import { ExternalLink, Play, Sparkles } from '../common/icons';

interface AboutPageProps {
  onBackToRoadmap: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToRoadmap }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-black bg-white p-3.5 sm:p-4 shadow-[3px_3px_0px_#000000]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToRoadmap}
            className="inline-flex items-center gap-1.5 border-2 border-black bg-[#FF5E1E] px-3.5 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <span>←</span>
            <span>BACK TO DSA ROADMAP</span>
          </button>
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-bold text-black/60 pl-2">
            <span>ARH DSA</span>
            <span>/</span>
            <span className="text-black uppercase">ABOUT</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToRoadmap}
            className="border-2 border-black bg-[#ECECEC] px-3 py-1.5 text-xs font-black uppercase text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <span>VIEW {ABDUL_BARI_PROBLEMS.length} PROBLEMS</span>
          </button>
        </div>
      </div>

      {/* Main About Container */}
      <div className="border-2 border-black bg-white p-5 sm:p-8 shadow-[4px_4px_0px_#000000] text-black">
        {/* Header Hero Banner */}
        <div className="border-b-2 border-black pb-6">
          <div className="inline-flex items-center gap-1.5 border border-black bg-[#FF5E1E] px-2.5 py-1 text-[10px] font-mono font-black uppercase text-black shadow-[2px_2px_0px_#000000] mb-3">
            <Sparkles className="h-3 w-3" />
            <span>ABOUT THE PLATFORM, MENTOR &amp; CREATOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-black leading-tight">
            LEARN DEEPLY. PRACTICE RIGOROUSLY. BUILD CONSISTENCY.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-black/70 font-sans max-w-3xl leading-relaxed">
            Bridging the gap between world-class theoretical computer science education and practical competitive programming mastery.
          </p>
        </div>

        <div className="mt-8 space-y-10">
          {/* ========================================================================= */}
          {/* PART 1: ABOUT THE COURSE */}
          {/* ========================================================================= */}
          <div className="border-2 border-black bg-[#ECECEC] p-5 sm:p-6 shadow-[3px_3px_0px_#000000]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-black pb-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-black text-white font-mono font-black text-sm shadow-[2px_2px_0px_#FF5E1E]">
                  01
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-black/60 uppercase block">
                    THE CURRICULUM
                  </span>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">
                    Abdul Bari&apos;s Algorithms Masterclass &amp; Problem Sets
                  </h2>
                </div>
              </div>
              <a
                href="https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border-2 border-black bg-[#FF0000] px-3 py-1.5 text-xs font-black uppercase text-white shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-colors cursor-pointer w-fit"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Watch YouTube Playlist</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3.5 text-xs sm:text-sm text-black/85 leading-relaxed font-sans">
                <p>
                  <strong>Abdul Bari&apos;s Algorithms Masterclass</strong> is globally revered as the gold-standard educational series for mastering algorithmic thinking, data structures, and computational complexity analysis. Spanning <strong>{ABDUL_BARI_PROBLEMS.length} comprehensive lectures</strong>, the course deconstructs every cornerstone concept needed for university examinations and technical software engineering interviews:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold font-mono">
                  <li className="border border-black/30 bg-white p-2 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#FF5E1E] shrink-0" />
                    <span>Asymptotic Analysis &amp; Notations</span>
                  </li>
                  <li className="border border-black/30 bg-white p-2 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#FF5E1E] shrink-0" />
                    <span>Recurrence Relations &amp; Master Theorem</span>
                  </li>
                  <li className="border border-black/30 bg-white p-2 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#FF5E1E] shrink-0" />
                    <span>Divide &amp; Conquer Strategies</span>
                  </li>
                  <li className="border border-black/30 bg-white p-2 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#FF5E1E] shrink-0" />
                    <span>Greedy Methods (Huffman, MST, Dijkstra)</span>
                  </li>
                  <li className="border border-black/30 bg-white p-2 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#FF5E1E] shrink-0" />
                    <span>Dynamic Programming (Knapsack, Floyd, TSP)</span>
                  </li>
                  <li className="border border-black/30 bg-white p-2 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#FF5E1E] shrink-0" />
                    <span>Backtracking, Branch &amp; Bound, NP-Hard</span>
                  </li>
                </ul>
                <p>
                  <strong>The ARH DSA Enhancement:</strong> While Sir provides unmatched conceptual intuition and mathematical proofs, true mastery requires hands-on execution. This platform curates and maps <strong>over 1,000 real-world practice challenges</strong> across <strong>LeetCode, HackerRank, and CodeChef</strong> directly to each lecture, allowing students to transition from video theory to top-tier coding execution seamlessly.
                </p>
              </div>

              {/* Quick Metrics Cards */}
              <div className="flex flex-col gap-2.5 justify-center">
                <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000000]">
                  <div className="text-2xl font-black font-mono text-[#FF5E1E]">{ABDUL_BARI_PROBLEMS.length}</div>
                  <div className="text-[11px] font-black uppercase text-black">Meticulous Video Lectures</div>
                  <div className="text-[10px] font-mono text-black/60">From foundations to NP-completeness</div>
                </div>
                <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000000]">
                  <div className="text-2xl font-black font-mono text-black">600+</div>
                  <div className="text-[11px] font-black uppercase text-black">Curated LeetCode Problems</div>
                  <div className="text-[10px] font-mono text-black/60">Targeted for FAANG &amp; tech interviews</div>
                </div>
                <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000000]">
                  <div className="text-2xl font-black font-mono text-[#00EA64]">250+</div>
                  <div className="text-[11px] font-black uppercase text-black">HackerRank Challenges</div>
                  <div className="text-[10px] font-mono text-black/60">Foundational coding &amp; unit tests</div>
                </div>
                <div className="border-2 border-black bg-white p-3 shadow-[2px_2px_0px_#000000]">
                  <div className="text-2xl font-black font-mono text-[#5B4638]">140+</div>
                  <div className="text-[11px] font-black uppercase text-black">CodeChef Problems</div>
                  <div className="text-[10px] font-mono text-black/60">Competitive programming drills</div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PART 2: ABOUT PROF. ABDUL BARI */}
          {/* ========================================================================= */}
          <div className="border-2 border-black bg-white p-5 sm:p-6 shadow-[3px_3px_0px_#000000]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-black pb-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#FF5E1E] text-black font-mono font-black text-sm shadow-[2px_2px_0px_#000000]">
                  02
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-black/60 uppercase block">
                    THE MENTOR
                  </span>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">
                    Prof. Abdul Bari — The Legend of CS Education
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="https://www.youtube.com/@abdul_bari"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border-2 border-black bg-white hover:bg-black hover:text-white px-2.5 py-1 text-xs font-bold uppercase transition-colors shadow-[2px_2px_0px_#000000]"
                >
                  <span>YouTube (1.3M+)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://www.udemy.com/user/abdul-bari-1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border-2 border-black bg-[#A435F0] text-white hover:bg-black px-2.5 py-1 text-xs font-bold uppercase transition-colors shadow-[2px_2px_0px_#000000]"
                >
                  <span>Udemy Profile</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Portrait Frame */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="border-2 border-black bg-[#F3F3F3] p-2 shadow-[4px_4px_0px_#000000] w-full max-w-[280px]">
                  <div className="border border-black overflow-hidden bg-black/5">
                    <img
                      src="/abdul-bari.png"
                      alt="Prof. Abdul Bari"
                      className="w-full h-auto object-cover object-top filter grayscale contrast-110"
                    />
                  </div>
                  <div className="mt-2.5 px-1 text-center">
                    <h3 className="text-sm font-black uppercase text-black">Prof. Abdul Bari</h3>
                    <p className="text-[11px] font-mono text-black/70">Master Educator &amp; Technologist</p>
                    <div className="mt-2 border-t border-black/20 pt-1.5 flex justify-center gap-1 text-[9px] font-mono font-bold text-black/80 uppercase">
                      <span>Hyderabad, India</span>
                      <span>•</span>
                      <span>Osmania Univ.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biographical Details */}
              <div className="md:col-span-8 space-y-3.5 text-xs sm:text-sm text-black/85 leading-relaxed font-sans">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="border border-black bg-[#ECECEC] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-black">
                    M.Tech Computer Science
                  </span>
                  <span className="border border-black bg-[#ECECEC] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-black">
                    20+ Years Experience
                  </span>
                  <span className="border border-black bg-[#ECECEC] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-black">
                    Former Asst. Professor
                  </span>
                  <span className="border border-black bg-[#ECECEC] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-black">
                    CEO @ NBH Infotech
                  </span>
                </div>

                <p>
                  <strong>Prof. Abdul Bari</strong> is celebrated globally as one of the most gifted and respected educators in modern computer science. Over a prolific teaching and consulting career spanning more than <strong>20 years</strong>, he has simplified complex algorithmic concepts for millions of aspiring engineers and university students worldwide.
                </p>
                <p>
                  An alumnus of <strong>Osmania University, Hyderabad</strong>, where he earned his <strong>M.Tech in Computer Science</strong>, Prof. Bari served for years as a distinguished assistant professor at the university level. Beyond the classroom, he is the <strong>CEO of NBH Infotech</strong> in Hyderabad, bringing extensive real-world expertise in software architecture, automation, and distributed systems directly into his pedagogical work.
                </p>
                <p>
                  <strong>His Legendary Whiteboard Pedagogy:</strong> What makes Abdul Bari Sir an international icon is his unmatched clarity. Eschewing dry slides, Sir uses animated whiteboard traces, color-coded call stacks, state transition tables, and crisp geometric visual intuition. Intimidating topics—such as dynamic programming memoization, optimal substructure proofs, amortized runtime bounds, and spanning tree cuts—become instantly clear and unforgettable.
                </p>
                <p className="border-l-4 border-[#FF5E1E] pl-3 py-1 bg-[#ECECEC] text-xs font-mono font-semibold text-black">
                  &ldquo;Mastering algorithms is not about memorizing code; it is about building the intuition to see how data flows and how decisions unfold.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PART 3: ABOUT ME (ARH) & PLATFORM VISION */}
          {/* ========================================================================= */}
          <div className="border-2 border-black bg-[#111111] text-white p-5 sm:p-6 shadow-[3px_3px_0px_#000000]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-[#333333] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center border-2 border-white bg-[#FF5E1E] text-black font-mono font-black text-sm shadow-[2px_2px_0px_#FFFFFF]">
                  03
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#888888] uppercase block">
                    THE CREATOR
                  </span>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                    About Me — Built by ARH
                  </h2>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 border border-white/40 bg-black px-3 py-1 text-[11px] font-mono font-bold text-[#FF5E1E] uppercase">
                <span>KEEP SOLVING. KEEP BUILDING.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* ARH Logo Showcase Card */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="border-2 border-white/80 bg-black p-5 shadow-[4px_4px_0px_#FF5E1E] w-full max-w-[280px] text-center flex flex-col items-center">
                  <div className="h-28 w-auto flex items-center justify-center my-2 p-2 bg-[#0A0A0A] border border-white/20">
                    <img
                      src="/arh-logo.png"
                      alt="ARH Official Logo"
                      className="max-h-full max-w-full object-contain brightness-200 contrast-200"
                    />
                  </div>
                  <div className="mt-3 border-t border-white/20 pt-2 w-full">
                    <span className="text-xs font-mono font-black tracking-widest text-white uppercase block">
                      ARH
                    </span>
                    <span className="text-[10px] font-mono text-[#AAAAAA] uppercase">
                      Developer &amp; Platform Architect
                    </span>
                  </div>
                </div>
              </div>

              {/* ARH Story & Platform Philosophy */}
              <div className="md:col-span-8 space-y-3.5 text-xs sm:text-sm text-[#DDDDDD] leading-relaxed font-sans">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="border border-white/30 bg-[#222222] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-white">
                    Developer First
                  </span>
                  <span className="border border-white/30 bg-[#222222] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-white">
                    Neo-Brutalist Design
                  </span>
                  <span className="border border-white/30 bg-[#222222] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-white">
                    Firebase Cloud Sync
                  </span>
                  <span className="border border-white/30 bg-[#222222] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-[#FF5E1E]">
                    100% Free &amp; Open
                  </span>
                </div>

                <p>
                  <strong>Welcome to ARH DSA!</strong> I built this platform because, like hundreds of thousands of engineers, I experienced the life-changing clarity of Prof. Abdul Bari&apos;s lectures. Yet, while learning, I noticed a recurring friction point among students: <em>how to methodically track all lectures, practice matching coding challenges without distraction, and maintain relentless consistency.</em>
                </p>
                <p>
                  <strong>The Vision:</strong> I created this high-performance learning command center to turn every lesson into an actionable, trackable milestone. The platform delivers zero-latency local caching, seamless multi-device <strong>Firebase Cloud Sync</strong>, rapid keyboard navigation, integrated problem notes, and one-click launches for 1,000+ curated problems across LeetCode, HackerRank, and CodeChef.
                </p>
                <p>
                  <strong>The Neo-Brutalist Philosophy:</strong> The raw, high-contrast aesthetic is deliberate. There are no sluggish animations, distracting gradients, or bloated marketing widgets. Just crisp typography, hard shadows, and an environment engineered to keep you focused on what truly matters: <em>solving problems and becoming an exceptional engineer</em>.
                </p>

                <div className="border border-white/20 bg-black/60 p-3 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <p className="text-[11px] font-mono text-white/90 italic">
                    &ldquo;A little progress each day adds up to big results. Stay humble, code daily, and build great things.&rdquo;
                  </p>
                  <span className="text-xs font-mono font-black text-[#FF5E1E] shrink-0">
                    — ARH
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Return Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000000]">
        <div>
          <h3 className="text-sm font-black uppercase text-black">Ready to solve problems?</h3>
          <p className="text-xs font-mono text-black/70">Hop right back into the {ABDUL_BARI_PROBLEMS.length}-problem curriculum.</p>
        </div>
        <button
          onClick={onBackToRoadmap}
          className="inline-flex items-center justify-center gap-1.5 border-2 border-black bg-[#FF5E1E] px-5 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          <span>← RETURN TO DSA ROADMAP</span>
        </button>
      </div>
    </div>
  );
};
