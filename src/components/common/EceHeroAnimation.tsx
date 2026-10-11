import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Activity, Zap, Play, Pause, Radio } from 'lucide-react';

type AnimationMode = 'silicon' | 'logic' | 'rf';

interface Ripple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
}

export const EceHeroAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<AnimationMode>('silicon');
  const [clockSpeed, setClockSpeed] = useState<number>(100); // 50, 100, 2400 (MHz)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // References for mutable animation state to avoid React re-renders in requestAnimationFrame
  const modeRef = useRef<AnimationMode>(mode);
  const clockSpeedRef = useRef<number>(clockSpeed);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const clickRipplesRef = useRef<Ripple[]>([]);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean; probeVal: number }>({
    x: 0,
    y: 0,
    active: false,
    probeVal: 3.3,
  });

  // Keep animation refs immediately in sync
  modeRef.current = mode;
  clockSpeedRef.current = clockSpeed;
  isPlayingRef.current = isPlaying;

  // Telemetry real-time stats
  const [telemetry, setTelemetry] = useState({
    dieTemp: 41.2,
    vdd: 1.80,
    clkLocked: true,
  });

  // Handle click to create electrical spark ripple
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    clickRipplesRef.current.push({
      x,
      y,
      r: 4,
      maxR: 130,
      alpha: 0.95,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const probeVal = Number((1.8 + Math.sin(x * 0.04 + y * 0.04) * 1.5).toFixed(2));
    mousePosRef.current = {
      x,
      y,
      active: true,
      probeVal: Math.max(0, probeVal),
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current.active = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    // Responsive Canvas Resizing with HiDPI support
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth || window.innerWidth;
      const height = parent.clientHeight || 560;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const currentMode = modeRef.current;
      const currentClock = clockSpeedRef.current;
      const currentPlaying = isPlayingRef.current;
      const mouse = mousePosRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      // Speed multiplier based on clock speed setting
      const speedMultiplier = currentClock === 50 ? 0.6 : currentClock === 100 ? 1.0 : 2.2;

      // ==========================================
      // 1. SUBTLE SILICON WAFER RETICLE & GRID
      // ==========================================
      const gridSize = 48;
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.035)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // PCB alignment fiducial marks on corners
      const drawFiducial = (fx: number, fy: number) => {
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(fx, fy, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(234, 88, 12, 0.3)';
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      };
      drawFiducial(24, 24);
      drawFiducial(width - 24, 24);
      drawFiducial(24, height - 24);
      drawFiducial(width - 24, height - 24);

      // ==========================================
      // 2. MODE-SPECIFIC VISUALIZATION
      // ==========================================
      if (currentMode === 'silicon') {
        // -----------------------------------------------------------
        // A. SILICON MICROCHIP ARCHITECTURE (Die Layout & Interconnects)
        // -----------------------------------------------------------
        const centerX = width * 0.5;
        const centerY = height * 0.44;
        const chipW = Math.min(width * 0.72, 680);
        const chipH = Math.min(height * 0.52, 280);
        const left = centerX - chipW / 2;
        const top = centerY - chipH / 2;

        // Outer Chip Substrate (BGA / QFP package shadow & chamfered border)
        ctx.fillStyle = 'rgba(255, 247, 237, 0.45)';
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(left - 16, top - 16, chipW + 32, chipH + 32, 16);
        ctx.fill();
        ctx.stroke();

        // Pin 1 Index Notch
        ctx.fillStyle = 'rgba(234, 88, 12, 0.35)';
        ctx.beginPath();
        ctx.arc(left - 4, top - 4, 4, 0, Math.PI * 2);
        ctx.fill();

        // Chip Die boundary (Silicon Substrate)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(left, top, chipW, chipH, 12);
        ctx.fill();
        ctx.stroke();

        // Gold Bond Wire Array radiating to outer package pins
        const numPins = Math.floor(chipW / 36);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < numPins; i++) {
          const px = left + 18 + i * 36;
          // Top bond wires
          ctx.beginPath();
          ctx.moveTo(px, top);
          ctx.lineTo(px, top - 16);
          ctx.stroke();
          // Bottom bond wires
          ctx.beginPath();
          ctx.moveTo(px, top + chipH);
          ctx.lineTo(px, top + chipH + 16);
          ctx.stroke();
        }

        // Functional Silicon IP Cores on the Die
        const blocks = [
          { name: 'RV32I RISC-V CORE 0', sub: 'Pipelined ALU & FPU', x: left + 14, y: top + 14, w: chipW * 0.34, h: chipH * 0.44, color: '#ea580c' },
          { name: 'RV32I RISC-V CORE 1', sub: 'Branch Predictor Unit', x: left + 14, y: top + chipH * 0.52, w: chipW * 0.34, h: chipH * 0.42, color: '#f97316' },
          { name: 'SRAM L2 CACHE [1MB]', sub: '64-bit Non-Blocking Crossbar', x: left + chipW * 0.38, y: top + 14, w: chipW * 0.28, h: chipH * 0.88, color: '#f59e0b' },
          { name: 'NEURAL DSP / TinyML', sub: 'Int8 Systolic Array Tensor Core', x: left + chipW * 0.69, y: top + 14, w: chipW * 0.28, h: chipH * 0.44, color: '#0ea5e9' },
          { name: 'PLL & SERDES PHY', sub: '100MHz PLL · PCIe 5.0 PHY', x: left + chipW * 0.69, y: top + chipH * 0.52, w: chipW * 0.28, h: chipH * 0.42, color: '#10b981' },
        ];

        blocks.forEach((blk) => {
          // Block container
          ctx.fillStyle = 'rgba(255, 247, 237, 0.6)';
          ctx.strokeStyle = `${blk.color}35`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(blk.x, blk.y, blk.w, blk.h, 6);
          ctx.fill();
          ctx.stroke();

          // Internal circuit wiring lines inside blocks
          ctx.strokeStyle = `${blk.color}15`;
          const numInternalLines = Math.floor(blk.h / 14);
          for (let li = 1; li < numInternalLines; li++) {
            ctx.beginPath();
            ctx.moveTo(blk.x + 8, blk.y + li * 14);
            ctx.lineTo(blk.x + blk.w - 8, blk.y + li * 14);
            ctx.stroke();
          }

          // Dynamic pulsing activity LED on block
          const pulseAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 3 * speedMultiplier + blk.x));
          ctx.fillStyle = `${blk.color}${Math.floor(pulseAlpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(blk.x + 10, blk.y + 11, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Core Labels
          ctx.font = 'bold 8.5px "Fira Code", monospace';
          ctx.fillStyle = blk.color;
          ctx.fillText(blk.name, blk.x + 18, blk.y + 14);

          ctx.font = '7px "Fira Code", monospace';
          ctx.fillStyle = '#64748b';
          ctx.fillText(blk.sub, blk.x + 18, blk.y + 24);
        });

        // Bus Interconnect Clock & Data Packets moving through Crossbar
        const busLines = [
          // Core 0 to Cache
          { sx: left + chipW * 0.34, sy: top + chipH * 0.24, ex: left + chipW * 0.38, ey: top + chipH * 0.24 },
          // Core 1 to Cache
          { sx: left + chipW * 0.34, sy: top + chipH * 0.72, ex: left + chipW * 0.38, ey: top + chipH * 0.72 },
          // Cache to DSP
          { sx: left + chipW * 0.66, sy: top + chipH * 0.24, ex: left + chipW * 0.69, ey: top + chipH * 0.24 },
          // Cache to PLL
          { sx: left + chipW * 0.66, sy: top + chipH * 0.72, ex: left + chipW * 0.69, ey: top + chipH * 0.72 },
          // Central Backbone
          { sx: left + chipW * 0.52, sy: top + 14, ex: left + chipW * 0.52, ey: top + chipH - 14 },
        ];

        busLines.forEach((bus, bIdx) => {
          ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(bus.sx, bus.sy);
          ctx.lineTo(bus.ex, bus.ey);
          ctx.stroke();

          // Traveling packets
          const packetProg = (t * 1.5 * speedMultiplier + bIdx * 0.25) % 1;
          const px = bus.sx + (bus.ex - bus.sx) * packetProg;
          const py = bus.sy + (bus.ey - bus.sy) * packetProg;

          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (currentMode === 'logic') {
        // -----------------------------------------------------------
        // B. MULTI-CHANNEL LOGIC ANALYZER TIMING DIAGRAM
        // -----------------------------------------------------------
        const channels = [
          { name: 'CH0: CLK_100M', color: '#ea580c', type: 'clk', period: 32 },
          { name: 'CH1: SPI_MOSI [CMD]', color: '#f59e0b', type: 'data', period: 64 },
          { name: 'CH2: SPI_MISO [RSP]', color: '#10b981', type: 'data', period: 48 },
          { name: 'CH3: CS_N [SELECT]', color: '#0ea5e9', type: 'enable', period: 160 },
          { name: 'CH4: IRQ_ALERT', color: '#ef4444', type: 'pulse', period: 120 },
        ];

        const startY = 80;
        const rowHeight = (height - 180) / channels.length;

        channels.forEach((ch, idx) => {
          const cy = startY + idx * rowHeight;
          const amp = Math.min(rowHeight * 0.28, 18);

          // Track Background Lane
          ctx.fillStyle = 'rgba(255, 247, 237, 0.35)';
          ctx.fillRect(100, cy - amp - 8, width - 120, amp * 2 + 16);
          ctx.strokeStyle = 'rgba(234, 88, 12, 0.1)';
          ctx.lineWidth = 1;
          ctx.strokeRect(100, cy - amp - 8, width - 120, amp * 2 + 16);

          // Channel Label
          ctx.font = 'bold 9.5px "Fira Code", monospace';
          ctx.fillStyle = ch.color;
          ctx.fillText(ch.name, 16, cy + 4);

          // Digital waveform path
          ctx.strokeStyle = ch.color;
          ctx.lineWidth = 1.8;
          ctx.beginPath();

          const offset = t * 60 * speedMultiplier;
          let prevHigh = false;

          for (let x = 100; x < width - 20; x += 3) {
            const phase = (x + offset) % ch.period;
            let isHigh = false;

            if (ch.type === 'clk') {
              isHigh = phase < ch.period / 2;
            } else if (ch.type === 'data') {
              isHigh = Math.sin((x + offset) / 22) > 0;
            } else if (ch.type === 'enable') {
              isHigh = phase > 30 && phase < ch.period - 30;
            } else {
              isHigh = phase > ch.period - 16;
            }

            const yPos = isHigh ? cy - amp : cy + amp;

            if (x === 100) {
              ctx.moveTo(x, yPos);
            } else {
              if (prevHigh !== isHigh) {
                ctx.lineTo(x, yPos);
              }
              ctx.lineTo(x, yPos);
            }
            prevHigh = isHigh;
          }
          ctx.stroke();

          // Hex packet decode tags for data channels
          if (ch.type === 'data') {
            const hexWords = ['0x55', '0xA0', '0xFF', '0x1C', '0x42', '0xE1'];
            const cellW = 75;
            for (let bx = 110; bx < width - 100; bx += cellW) {
              const hex = hexWords[Math.floor((bx + offset) / cellW) % hexWords.length];
              ctx.font = '8px "Fira Code", monospace';
              ctx.fillStyle = 'rgba(100, 116, 139, 0.8)';
              ctx.fillText(hex, bx + 24, cy + 3);
            }
          }
        });

      } else {
        // -----------------------------------------------------------
        // C. HIGH-FREQUENCY RF & HARMONIC OSCILLOSCOPE (Carrier Wave)
        // -----------------------------------------------------------
        const waveCenterY = height * 0.46;
        const mainAmp = Math.min(height * 0.22, 90);

        // Reticle Phosphor divisions
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.08)';
        ctx.lineWidth = 1;
        for (let div = -3; div <= 3; div++) {
          const dy = waveCenterY + div * 25;
          ctx.beginPath();
          ctx.moveTo(40, dy);
          ctx.lineTo(width - 40, dy);
          ctx.stroke();
        }

        // Center Ground line
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.22)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(40, waveCenterY);
        ctx.lineTo(width - 40, waveCenterY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 1. Fundamental RF Carrier Wave (Orange)
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = 'rgba(234, 88, 12, 0.4)';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        for (let x = 40; x < width - 40; x += 2) {
          const freq = 0.018 * speedMultiplier;
          const carrier = Math.sin(x * freq - t * 4);
          const modulation = 0.7 + 0.3 * Math.sin(x * 0.005 - t * 1.2);
          const y = waveCenterY + carrier * mainAmp * modulation;

          if (x === 40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 2. 2nd Harmonic Signal (Amber)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.shadowBlur = 4;
        ctx.beginPath();

        for (let x = 40; x < width - 40; x += 2) {
          const carrier = Math.cos(x * 0.036 * speedMultiplier - t * 8);
          const y = waveCenterY + carrier * (mainAmp * 0.45);

          if (x === 40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Waveform Telemetry tags
        ctx.font = 'bold 9px "Fira Code", monospace';
        ctx.fillStyle = '#ea580c';
        ctx.fillText('RF CARRIER: 2.450 GHz ISM · QPSK MODULATION · Vpp: 3.28V', 48, waveCenterY - mainAmp - 12);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText('2ND HARMONIC: 4.900 GHz · THD: -42.8 dBc', 48, waveCenterY + mainAmp + 20);
      }

      // ==========================================
      // 3. INTERACTIVE CLICK ELECTRICAL SPARK RIPPLES (Updated in-place in ref)
      // ==========================================
      const ripples = clickRipplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.r += 3.2;
        rip.alpha *= 0.94;

        if (rip.alpha <= 0.02 || rip.r >= rip.maxR) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(234, 88, 12, ${rip.alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(245, 158, 11, ${rip.alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ==========================================
      // 4. INTERACTIVE MOUSE PROBE RETICLE
      // ==========================================
      if (mouse.active) {
        const mx = mouse.x;
        const my = mouse.y;

        // Oscilloscope Probe Crosshairs
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);

        // Horizontal hairline
        ctx.beginPath();
        ctx.moveTo(mx - 40, my);
        ctx.lineTo(mx + 40, my);
        ctx.stroke();

        // Vertical hairline
        ctx.beginPath();
        ctx.moveTo(mx, my - 40);
        ctx.lineTo(mx, my + 40);
        ctx.stroke();

        ctx.setLineDash([]);

        // Probe target circle
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Probe Tooltip HUD
        const tipX = Math.min(mx + 18, width - 180);
        const tipY = Math.max(my - 28, 20);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tipX, tipY, 155, 42, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 8.5px "Fira Code", monospace';
        ctx.fillStyle = '#ea580c';
        ctx.fillText(`PROBE: ACTIVE NODE`, tipX + 8, tipY + 14);

        ctx.font = '7.5px "Fira Code", monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`VOLT: ${mouse.probeVal}V · ${currentClock}MHz CLK`, tipX + 8, tipY + 26);

        ctx.fillStyle = '#10b981';
        ctx.fillText(`STATE: ${mouse.probeVal > 1.4 ? 'LOGIC HIGH (1)' : 'LOGIC LOW (0)'}`, tipX + 8, tipY + 36);
      }

      if (currentPlaying) {
        t += 0.02;
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animId);
    };
  }, []); // Run once on mount; reads latest state from refs to prevent infinite re-renders

  // Periodic telemetry fluctuation for authentic lab feel
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry({
        dieTemp: Number((40.5 + Math.random() * 2.5).toFixed(1)),
        vdd: Number((1.79 + Math.random() * 0.03).toFixed(2)),
        clkLocked: true,
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasClick}
      className="absolute inset-0 overflow-hidden select-none z-0 cursor-crosshair"
      title="Click anywhere to trigger electrical spark ripple"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-75 sm:opacity-85"
      />

      {/* Floating Control & Telemetry Bar (Interactive ECE Dock) */}
      <div className="absolute top-2 right-2 sm:right-6 flex flex-wrap items-center gap-1.5 sm:gap-2 z-20 pointer-events-auto">
        {/* Mode Selector Buttons */}
        <div className="flex items-center bg-white/90 border border-orange-200/80 rounded-xl p-0.5 shadow-xs backdrop-blur-sm text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setMode('silicon')}
            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              mode === 'silicon'
                ? 'bg-orange-500 text-white font-bold'
                : 'text-slate-600 hover:text-orange-600'
            }`}
            title="Silicon Die & Microarchitecture"
          >
            <Cpu className="w-3 h-3" />
            <span className="hidden sm:inline">Silicon Die</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('logic')}
            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              mode === 'logic'
                ? 'bg-orange-500 text-white font-bold'
                : 'text-slate-600 hover:text-orange-600'
            }`}
            title="Multi-Channel Logic Analyzer"
          >
            <Activity className="w-3 h-3" />
            <span className="hidden sm:inline">Logic Bus</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('rf')}
            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              mode === 'rf'
                ? 'bg-orange-500 text-white font-bold'
                : 'text-slate-600 hover:text-orange-600'
            }`}
            title="High-Frequency RF Carrier"
          >
            <Radio className="w-3 h-3" />
            <span className="hidden sm:inline">RF Wave</span>
          </button>
        </div>

        {/* Clock Speed Toggle */}
        <div className="flex items-center bg-white/90 border border-orange-200/80 rounded-xl p-0.5 shadow-xs backdrop-blur-sm text-[10px] font-mono">
          <button
            type="button"
            onClick={() => {
              const speeds = [50, 100, 2400];
              const next = speeds[(speeds.indexOf(clockSpeed) + 1) % speeds.length];
              setClockSpeed(next);
            }}
            className="px-2 py-1 text-orange-700 hover:text-orange-800 font-bold flex items-center gap-1 cursor-pointer"
            title="Cycle Clock Frequency"
          >
            <Zap className="w-3 h-3 text-orange-500" />
            <span>{clockSpeed >= 1000 ? `${(clockSpeed / 1000).toFixed(1)}GHz` : `${clockSpeed}MHz`}</span>
          </button>
        </div>

        {/* Play/Pause Toggle */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 rounded-xl bg-white/90 border border-orange-200/80 text-orange-600 hover:text-orange-700 shadow-xs backdrop-blur-sm cursor-pointer"
          title={isPlaying ? 'Pause simulation' : 'Resume simulation'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        {/* Microchip PLL Lock Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/90 border border-orange-200/80 text-[10px] font-mono text-slate-700 shadow-xs backdrop-blur-sm">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-semibold">PLL LOCKED</span>
          </span>
          <span className="text-slate-300">·</span>
          <span>DIE: {telemetry.dieTemp}°C</span>
          <span className="text-slate-300">·</span>
          <span>Vdd: {telemetry.vdd}V</span>
        </div>
      </div>
    </div>
  );
};
