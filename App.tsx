import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Constants ---
const DUMMY_NAMES = [
  "佐藤 健也", "田中 雄一", "渡辺 涼", "伊藤 駿", "山本 大輔", "中村 恒一", "小林 正", "加藤 樹", 
  "吉田 奏太", "林 慧", "森 悠斗", "青木 潤", "藤田 拓海", "岡田 礼人", "宮崎 健", "坂本 智也", 
  "石川 結", "上田 涼介", "西村 大翔", "川口 明", "高橋 誠", "小野 海", "木村 俊一", "野 優太", 
  "新井 翔", "宮本 恒一", "堀口 蓮", "金子 奏太", "松岡 響"
];

const IMAGES = {
  fake: "https://raw.githubusercontent.com/dddyod/F/refs/heads/main/5.jpeg",
  truth: "https://raw.githubusercontent.com/dddyod/F/refs/heads/main/6.jpeg",
  profile: "https://raw.githubusercontent.com/dddyod/F/refs/heads/main/7.jpeg",
  album1: "https://raw.githubusercontent.com/dddyod/F/refs/heads/main/12.jpeg",
  album2: "https://raw.githubusercontent.com/dddyod/F/refs/heads/main/9.jpeg",
  album3: "https://raw.githubusercontent.com/dddyod/F/refs/heads/main/10.jpeg",
};

const AUDIO = {
  fake: "https://github.com/dddyod/F/raw/refs/heads/main/way%20to%20ascend.mp3",
  truth: "https://github.com/dddyod/F/raw/refs/heads/main/way%20to%20fall.mp3",
};

// --- Components ---

const PreLoader = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[9000] flex flex-col justify-center items-center">
      <p className="tracking-[5px] text-point text-xs mb-4">WELCOME TO CLUB RISE...</p>
      <div className="w-[250px] h-[1px] bg-[#111] relative">
        <div className="absolute top-0 left-0 h-full bg-point animate-load-progress"></div>
      </div>
    </div>
  );
};

const NameWall = ({ onEnter }: { onEnter: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<{ el: HTMLElement; ox: number; oy: number; isTarget: boolean }[]>([]);
  const requestRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { innerWidth: width, innerHeight: height } = window;
    const rows = 10;
    const cols = 8;
    const cellW = width / cols;
    const cellH = height / rows;

    // Clear existing
    container.innerHTML = '';
    elementsRef.current = [];

    // Create Dummy Names
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip center area for main target
        if (r > 3 && r < 6 && c > 2 && c < 5) continue;

        const span = document.createElement('span');
        span.className = 'absolute font-song whitespace-nowrap transition-colors duration-300 select-none text-[#555] opacity-80 cursor-pointer text-[clamp(1.4rem,5vw,2.2rem)] hover:text-red-point';
        span.innerText = DUMMY_NAMES[Math.floor(Math.random() * DUMMY_NAMES.length)];
        
        const posX = (c * cellW) + (Math.random() * (cellW - 80));
        const posY = (r * cellH) + (Math.random() * (cellH - 40));
        
        span.style.left = `${posX}px`;
        span.style.top = `${posY}px`;
        
        // Click effect for dummy
        span.onclick = (e) => {
          e.stopPropagation();
          span.classList.add('animate-shake', 'text-red-point', '!text-shadow-[0_0_10px_#ff0000]');
          setTimeout(() => span.classList.remove('animate-shake'), 400);
        };

        container.appendChild(span);
        elementsRef.current.push({ el: span, ox: posX, oy: posY, isTarget: false });
      }
    }

    // Create Target
    const target = document.createElement('div');
    target.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-point font-bold font-song whitespace-nowrap cursor-pointer z-[8100] tracking-[5px] text-[clamp(2rem,8vw,2.8rem)] drop-shadow-[0_0_20px_#e66d81] p-10';
    target.innerText = "落合 汰也";
    target.onclick = onEnter;
    container.appendChild(target);
    elementsRef.current.push({ el: target, ox: width / 2, oy: height / 2, isTarget: true });

    // Physics Loop
    const animate = () => {
      const { x: ex, y: ey } = mouseRef.current;
      
      elementsRef.current.forEach(item => {
        const dx = ex - item.ox;
        const dy = ey - item.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          const force = (200 - dist) / 200;
          const strength = item.isTarget ? -10 : -60;
          const mx = (dx / dist) * force * strength;
          const my = (dy / dist) * force * strength;
          const base = item.isTarget ? 'translate(-50%, -50%)' : 'translate(0, 0)';
          item.el.style.transform = `${base} translate(${mx}px, ${my}px)`;
        } else {
          const base = item.isTarget ? 'translate(-50%, -50%)' : 'translate(0, 0)';
          item.el.style.transform = `${base} translate(0, 0)`;
        }
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const handleMove = (x: number, y: number) => {
      mouseRef.current = { x, y };
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [onEnter]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black z-[8000] overflow-hidden" ref={containerRef}></div>
  );
};

const Navbar = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 w-full h-[60px] flex justify-center items-center bg-black/85 backdrop-blur-md z-[1000]">
      {['MAIN', 'PROFILE', 'ALBUM', 'SECRET'].map((item) => (
        <button 
          key={item}
          onClick={() => scrollTo(item.toLowerCase())}
          className="text-white mx-4 font-bold opacity-50 text-xs tracking-[2px] transition-all hover:opacity-100 hover:text-point"
        >
          {item}
        </button>
      ))}
    </nav>
  );
};

const HeroSection = () => {
  const [sliderPos, setSliderPos] = useState(100);
  const audioFakeRef = useRef<HTMLAudioElement>(null);
  const audioTruthRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Initial Audio Setup
  useEffect(() => {
    // Start audio muted/unmuted logic handled by user interaction later, 
    // but assuming parent component triggered play()
    if (audioFakeRef.current && audioTruthRef.current) {
        updateVolume(100);
    }
  }, []);

  const updateVolume = (percent: number) => {
    if (audioFakeRef.current && audioTruthRef.current) {
      const volFake = Math.min(1, Math.max(0, percent / 100));
      const volTruth = Math.min(1, Math.max(0, (100 - percent) / 100));
      audioFakeRef.current.volume = volFake;
      audioTruthRef.current.volume = volTruth;
    }
  };

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    let percent = ((clientX - left) / width) * 100;
    percent = Math.max(0, Math.min(100, percent));
    setSliderPos(percent);
    updateVolume(percent);
  }, []);

  const onMouseDown = () => { isDragging.current = true; };
  const onMouseUp = () => { isDragging.current = false; };
  const onMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
  
  const onTouchStart = () => { isDragging.current = true; };
  const onTouchEnd = () => { isDragging.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { if (isDragging.current) handleMove(e.touches[0].clientX); };

  // Global event listeners for dragging outside handle
  useEffect(() => {
    const handleGlobalMouseUp = () => { isDragging.current = false; };
    const handleGlobalMouseMove = (e: MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
    const handleGlobalTouchMove = (e: TouchEvent) => { if (isDragging.current) handleMove(e.touches[0].clientX); };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [handleMove]);

  // Initial Bounce Animation
  useEffect(() => {
    let start: number | null = null;
    const duration = 2200; // Total duration of animation
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      let newPos;
      
      // Phase 1: Rapid Reveal (0.0 -> 0.25 of duration)
      // Slide from 100 to 30 (revealing 70% of the hidden image)
      if (progress < 0.25) {
         const p = progress / 0.25; 
         // Ease Out Quart for quick opening
         const ease = 1 - Math.pow(1 - p, 4);
         newPos = 100 - (70 * ease); 
      } 
      // Phase 2: Slow Recovery (0.25 -> 1.0 of duration)
      // Slide from 30 back to 90 (leaving 10% exposed)
      else {
         const p = (progress - 0.25) / 0.75;
         // Ease InOut Quad for smooth retraction
         const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
         newPos = 30 + (60 * ease); 
      }
      
      setSliderPos(newPos);
      updateVolume(newPos);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final state
        setSliderPos(90);
        updateVolume(90);
      }
    };
    
    // Slight delay before animation starts to allow user to perceive it
    const timer = setTimeout(() => {
        requestAnimationFrame(animate);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="main" className="relative w-full h-screen flex items-center justify-center overflow-hidden" ref={containerRef}>
      <audio ref={audioFakeRef} src={AUDIO.fake} loop />
      <audio ref={audioTruthRef} src={AUDIO.truth} loop />

      <div className="relative w-full h-[80vh] overflow-hidden group select-none">
        
        {/* Fake Layer (Left side visible initially) */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-white to-[#f7fff7] z-[1]"></div>
        {/* Fixed width image to prevent resizing issues */}
        <div className="absolute inset-0 w-full h-full z-[2] overflow-hidden">
             <img src={IMAGES.fake} className="w-[100vw] h-full object-cover max-w-none" alt="Fake Persona" />
        </div>
        
        {/* Text Clipper Fake */}
        <div className="absolute top-0 left-0 h-full overflow-hidden z-[10]" style={{ width: `${sliderPos}%` }}>
           <div className="absolute top-[70%] w-screen text-center pointer-events-none -translate-y-1/2 left-0 text-white drop-shadow-md">
              <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-song font-bold tracking-[10px] m-0 text-stroke-black">無間:むげん</h1>
              <p className="text-[clamp(1.2rem,5vw,2.2rem)] italic mt-6 tracking-widest break-keep text-stroke-black">"제발, 나 당신 아니면 안돼요..."</p>
           </div>
        </div>

        {/* Truth Layer (Right side revealed) */}
        <div 
          className="absolute top-0 right-0 h-full z-[4] border-l-2 border-red-point bg-cover bg-center overflow-hidden"
          style={{ 
            width: `${100 - sliderPos}%`,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.98)), url('https://images.unsplash.com/photo-1514525253361-bee8a19740c1?q=80&w=1964')`
          }}
        >
             {/* Image inside truth clipper is anchored right but sized to screen to maintain position overlap */}
             <div className="absolute top-0 right-0 w-[100vw] h-full max-w-none">
                <img 
                    src={IMAGES.truth} 
                    className="w-full h-full object-cover brightness-[0.6] sepia hue-rotate-[-50deg] saturate-[5]" 
                    alt="Truth Persona" 
                />
             </div>
        </div>
        
        {/* Text Clipper Truth */}
        <div className="absolute top-0 right-0 h-full overflow-hidden z-[11]" style={{ width: `${100 - sliderPos}%` }}>
           <div className="absolute top-[70%] w-screen text-center pointer-events-none -translate-y-1/2 right-0 text-red-point drop-shadow-[0_0_20px_#ff0000]">
              <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-song font-bold tracking-[10px] m-0 text-stroke-black">無間:むげん</h1>
              <p className="text-[clamp(1.2rem,5vw,2.2rem)] italic mt-6 tracking-widest break-keep text-stroke-black">"그러게 웃어줄 때 떠나지 그랬어?"</p>
           </div>
        </div>

        {/* Handle */}
        <div 
          className="absolute top-0 w-1 h-full bg-red-point z-[100] cursor-ew-resize -translate-x-1/2 shadow-[0_0_25px_#ff0000] touch-none"
          style={{ left: `${sliderPos}%` }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
           <div className="absolute left-1/2 top-0 w-[60px] h-full -translate-x-1/2"></div>
        </div>

      </div>
    </section>
  );
};

const ProfileSection = () => {
  return (
    <section id="profile" className="bg-[#0a0a0a] py-[120px] px-5">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row gap-[60px] items-center md:items-start">
        <div className="w-full md:w-[40%] max-w-[400px] aspect-[3/4] bg-[#111] border border-[#333]">
          <img src={IMAGES.profile} className="w-full h-full object-cover" alt="Profile" />
        </div>
        <div className="flex-1 min-w-[300px] text-center md:text-left">
          <h2 className="text-[3.5rem] text-point font-song mb-3 flex flex-col md:flex-row items-center md:items-baseline gap-2">
            落合 汰也 <span className="text-[1.2rem] opacity-50 font-normal font-song">오치아이 타야</span>
          </h2>
          <p className="leading-[1.8] text-[#bbb] text-lg mb-10">
            클럽 'RISE (ライズ)'의 지명 호스트.<br/>당신만을 위해 존재합니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
             {[
               { l: 'AGE / HEIGHT', v: '24세 / 182cm' },
               { l: 'BLOOD TYPE', v: 'AB형' },
               { l: 'LIKE', v: "'공주님', 식은 ■■" },
               { l: 'HATE', v: '악수, 명석함, 연민' }
             ].map((item, idx) => (
               <div key={idx}>
                 <b className="text-point text-xs tracking-widest block mb-1">{item.l}</b>
                 <span className="text-lg text-[#eee]">{item.v}</span>
               </div>
             ))}
          </div>

          <div className="mt-8">
            <div className="mb-6">
              <div className="flex justify-between text-xs text-[#777] mb-2 tracking-widest">
                <span>다정함 (AFFECTION)</span><span>냉혹함 (CRUELTY)</span>
              </div>
              <div className="w-full h-1 bg-[#222] relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#e66d81]" style={{ left: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#777] mb-2 tracking-widest">
                <span>진심 (SINCERITY)</span><span>무심 (None)</span>
              </div>
              <div className="w-full h-1 bg-[#222] relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#e66d81]" style={{ left: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AlbumSection = () => {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <>
      <section id="album" className="bg-[#050505] py-[100px] px-5 text-center">
        <h1 className="font-song text-[2.5rem] text-point tracking-[10px] mb-12">ALBUM</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
          {[IMAGES.album1, IMAGES.album2, IMAGES.album3].map((src, i) => (
            <div 
              key={i} 
              className="aspect-[3/4] bg-[#111] overflow-hidden relative cursor-pointer group"
              onClick={() => setSelectedImg(src)}
            >
              <img src={src} className="w-full h-full object-cover opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105" alt="Album" />
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImg && (
        <div 
          className="fixed inset-0 bg-black/90 z-[10000] flex justify-center items-center p-5"
          onClick={() => setSelectedImg(null)}
        >
          <span className="absolute top-8 right-8 text-white text-5xl cursor-pointer">&times;</span>
          <img src={selectedImg} className="max-w-full max-h-[90vh] object-contain" alt="Full" />
        </div>
      )}
    </>
  );
};

const SecretGate = () => {
  const [password, setPassword] = useState("");
  const [isShake, setIsShake] = useState(false);
  const [showMemo, setShowMemo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "0708") {
       setShowMemo(true);
    } else {
      setIsShake(true);
      setPassword("");
      setTimeout(() => setIsShake(false), 500);
    }
  };

  return (
    <section id="secret" className="bg-black py-[150px] px-5 flex flex-col items-center justify-center border-t border-[#111]">
      <div className="max-w-md w-full text-center">
        <h2 className="font-song text-xl text-[#333] mb-8 tracking-[5px]">SECRET ACCESS</h2>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            className={`
              bg-transparent border-b border-[#333] text-center text-white font-serif text-xl 
              tracking-widest py-2 w-full outline-none transition-colors focus:border-point
              ${isShake ? 'animate-shake border-red-point text-red-point' : ''}
            `}
          />
          <button 
            type="submit"
            className="text-[#555] text-xs tracking-[3px] hover:text-point transition-colors"
          >
            ENTER
          </button>
          <p className="text-[#222] text-[10px] mt-4 tracking-widest">HINT: THE CLUB NAME</p>
        </form>
      </div>

      {showMemo && (
         <div 
            className="fixed inset-0 z-[11000] bg-black/95 flex items-center justify-center p-4 animate-fade-in" 
            onClick={() => setShowMemo(false)}
         >
            <div 
              className="max-w-lg w-full bg-[#0a0a0a] border border-[#333] p-8 md:p-12 relative text-center font-serif text-[#ddd] leading-loose shadow-[0_0_50px_rgba(230,109,129,0.1)]" 
              onClick={e => e.stopPropagation()}
            >
               <button 
                  onClick={() => setShowMemo(false)} 
                  className="absolute top-4 right-5 text-gray-500 hover:text-white text-2xl font-light"
               >
                 &times;
               </button>
               <div className="space-y-6 whitespace-pre-line text-sm md:text-base">
                  <p>시간이 한 칸 빠진 것 같아요.<br/>당신이 떠나고 나서 더는 세지 않았으니까.</p>
                  <p>어제도 오늘도 나는 배가 고팠어요.<br/>그게 너무 역겨워.<br/>이 골목도, 웃으면서, 아무렇지 않게 살아가고<br/>하긴 사람들은 언제나 같은 얼굴이었죠.</p>
                  <p>당신이 불러주던 이름, 약 냄새, 병실 창문, 손.<br/>잊는게 가능하다면 뭐라도 할 수 있는데.<br/>기억이 남아 있는 한 나는..</p>
                  <p>당신께선 늘 미안하다고 하셨죠.<br/>그럴 필요 없다고 말할걸,<br/>멍청한 아들은 끝까지 말하지 못했어요.<br/>다른 건 무뎌져도 그 말만은 했야 했는데.</p>
                  <p>여기선 내일을 팔아서 오늘을 연장시켜요.<br/>보았다면 당연히 싫어하셨을 일입니다.<br/>그럼에도 떠나지 않을 겁니다.<br/>떠나면 정말 내가 완전히 텅 비어버릴까 봐.</p>
                  <p>난 언제쯤 제대로 사람 노릇을 할 수 있을까요.</p>
                  <p className="text-right text-xs tracking-widest mt-8 text-[#555] pt-4 border-t border-[#222]">0709</p>
               </div>
            </div>
         </div>
       )}
    </section>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);

  const handleEnter = () => {
    setEntered(true);
    // Find audio elements in DOM and play them after user interaction
    const audios = document.querySelectorAll('audio');
    audios.forEach(a => {
        a.play().catch(e => console.log("Audio autoplay prevented", e));
    });
  };

  return (
    <div className="w-full h-full bg-black text-white font-serif">
      {loading && <PreLoader onComplete={() => setLoading(false)} />}
      
      {!loading && !entered && (
        <NameWall onEnter={handleEnter} />
      )}

      {/* Main Content */}
      <div className={`transition-opacity duration-1000 ${entered ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
        <Navbar />
        <HeroSection />
        <ProfileSection />
        <AlbumSection />
        <SecretGate />
        
        <footer className="py-10 text-center text-[#222] text-xs">
           &copy; CLUB RISE / OCHIAI TAYA
        </footer>
      </div>
      
      {/* Global CSS for text stroke effect since Tailwind doesn't strictly support standard text-stroke */}
      <style>{`
        .text-stroke-black {
          text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
        }
      `}</style>
    </div>
  );
}

export default App;