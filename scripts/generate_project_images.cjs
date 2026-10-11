const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/projects');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const projects = [
  { id: 1, code: 'ECE-01', title: 'Smart DC Power Supply', sub: 'Protection & Current Limit', cat: 'PCB & POWER', color: '#0ea5e9', bg: '#0b162c' },
  { id: 2, code: 'ECE-02', title: 'Dual Bench Power Supply', sub: '0-30V 0-5A Regulated Rail', cat: 'PCB & POWER', color: '#0284c7', bg: '#09152b' },
  { id: 3, code: 'ECE-03', title: '100W Audio Amplifier', sub: 'MOSFET Class-AB Hi-Fi', cat: 'PCB & AUDIO', color: '#8b5cf6', bg: '#170f2c' },
  { id: 4, code: 'ECE-04', title: 'Wireless Power Transfer', sub: 'Qi Inductive 15W Coil', cat: 'PCB & RF', color: '#06b6d4', bg: '#091b29' },
  { id: 5, code: 'ECE-05', title: '300W Sine Wave Inverter', sub: 'SPWM H-Bridge Driver', cat: 'PCB & POWER', color: '#f59e0b', bg: '#231806' },
  { id: 6, code: 'ECE-06', title: 'Solar MPPT Controller', sub: 'Synchronous Buck Telemetry', cat: 'SOLAR ENERGY', color: '#10b981', bg: '#0a2318' },
  { id: 7, code: 'ECE-07', title: 'Li-Ion BMS Module', sub: 'Cell Balancing & Protection', cat: 'BATTERY TECH', color: '#14b8a6', bg: '#09211e' },
  { id: 8, code: 'ECE-08', title: 'BLDC Motor Controller', sub: '3-Phase FOC Gate Driver', cat: 'MOTOR CONTROL', color: '#ec4899', bg: '#250d1d' },
  { id: 9, code: 'ECE-09', title: 'DDS Function Generator', sub: 'AD9833 12.5MHz Waveform', cat: 'TEST INSTRUMENT', color: '#6366f1', bg: '#10132e' },
  { id: 10, code: 'ECE-10', title: 'Auto Phase Selector', sub: 'Overvoltage Cutoff Switch', cat: 'POWER PROTECTION', color: '#f97316', bg: '#261208' },
  { id: 11, code: 'ECE-11', title: 'IoT Smart Energy Meter', sub: 'Cloud MQTT Telemetry', cat: 'IoT & EMBEDDED', color: '#38bdf8', bg: '#0a1d30' },
  { id: 12, code: 'ECE-12', title: 'IoT Health Monitor', sub: 'ECG SpO2 Pulse Gateway', cat: 'BIOMEDICAL IoT', color: '#f43f5e', bg: '#270c14' },
  { id: 13, code: 'ECE-13', title: 'LoRaWAN Weather Node', sub: '10km Long-Range Sensor', cat: 'IoT & WIRELESS', color: '#10b981', bg: '#0a261a' },
  { id: 14, code: 'ECE-14', title: 'Smart Agriculture Drip', sub: 'Precision Soil Moisture', cat: 'AGRITECH IoT', color: '#84cc16', bg: '#162409' },
  { id: 15, code: 'ECE-15', title: 'Industrial Fault Monitor', sub: 'Vibration Edge TinyML', cat: 'INDUSTRY 4.0', color: '#eab308', bg: '#241c08' },
  { id: 16, code: 'ECE-16', title: 'ESP32 Home Automation', sub: '8-Ch Solid State Relay', cat: 'SMART HOME', color: '#06b6d4', bg: '#081d26' },
  { id: 17, code: 'ECE-17', title: 'Air Quality Station', sub: 'Laser PM2.5 NDIR CO2', cat: 'ENVIRONMENTAL', color: '#22c55e', bg: '#0c2617' },
  { id: 18, code: 'ECE-18', title: 'RFID Smart Attendance', sub: 'Biometric Access Control', cat: 'SECURITY IoT', color: '#a855f7', bg: '#1c0d2b' },
  { id: 19, code: 'ECE-19', title: 'Water Quality Analyzer', sub: 'pH Turbidity TDS Temp', cat: 'CLEAN WATER IoT', color: '#0ea5e9', bg: '#091c2d' },
  { id: 20, code: 'ECE-20', title: 'Density Traffic Light', sub: 'IR Grid Queue Analyzer', cat: 'SMART CITY', color: '#ef4444', bg: '#270e0e' },
  { id: 21, code: 'ECE-21', title: 'SLAM Obstacle Robot', sub: '2D LiDAR Autonomous Path', cat: 'ROBOTICS', color: '#3b82f6', bg: '#0b1931' },
  { id: 22, code: 'ECE-22', title: 'PID Line Follower Robot', sub: 'High-Speed 8-Ch IR Bar', cat: 'ROBOTICS', color: '#e11d48', bg: '#260a12' },
  { id: 23, code: 'ECE-23', title: '4-DOF Robotic Arm', sub: 'Gesture Sensor Glove', cat: 'ROBOTICS', color: '#d946ef', bg: '#240b2a' },
  { id: 24, code: 'ECE-24', title: 'Quadcopter Controller', sub: 'STM32 IMU Fusion Board', cat: 'AVIONICS', color: '#06b6d4', bg: '#071d28' },
  { id: 25, code: 'ECE-25', title: 'Self-Balancing Robot', sub: 'Kalman Filter MPU6050', cat: 'ROBOTICS', color: '#10b981', bg: '#092518' },
  { id: 26, code: 'ECE-26', title: 'Fire Fighting Robot', sub: 'Flame Tracker Water Pump', cat: 'SAFETY ROBOT', color: '#f97316', bg: '#291207' },
  { id: 27, code: 'ECE-27', title: 'Voice Multi-Terrain Robot', sub: 'Bluetooth HC-05 Motor 4WD', cat: 'TELEOPERATION', color: '#8b5cf6', bg: '#160d2b' },
  { id: 28, code: 'ECE-28', title: 'Dual-Axis Solar Tracker', sub: 'LDR Stepper Mechanism', cat: 'SOLAR ROBOTICS', color: '#eab308', bg: '#251e09' },
  { id: 29, code: 'ECE-29', title: 'Wi-Fi Spy Tank Robot', sub: 'ESP32-CAM Night Vision', cat: 'DEFENSE ROBOTICS', color: '#64748b', bg: '#111724' },
  { id: 30, code: 'ECE-30', title: 'Smart Wheelchair System', sub: 'Eye Blink & Head Motion', cat: 'ASSISTIVE TECH', color: '#0284c7', bg: '#091c30' },
  { id: 31, code: 'ECE-31', title: 'RISC-V 32-bit CPU FPGA', sub: 'RV32I Pipelined Core', cat: 'VLSI & FPGA', color: '#8b5cf6', bg: '#150c2c' },
  { id: 32, code: 'ECE-32', title: '64-Point FFT Accelerator', sub: 'Radix-2 DSP Architecture', cat: 'VLSI & DSP', color: '#6366f1', bg: '#0e122f' },
  { id: 33, code: 'ECE-33', title: 'AES-128 Crypto Engine', sub: 'Hardware Pipelined Verilog', cat: 'VLSI SECURITY', color: '#10b981', bg: '#0a2419' },
  { id: 34, code: 'ECE-34', title: 'Comm Controller Core', sub: 'UART SPI I2C IP Package', cat: 'DIGITAL IP', color: '#38bdf8', bg: '#091e33' },
  { id: 35, code: 'ECE-35', title: 'FIR/IIR Filter on FPGA', sub: 'Reconfigurable MAC Engine', cat: 'FPGA DSP', color: '#ec4899', bg: '#280c20' },
  { id: 36, code: 'ECE-36', title: 'Traffic Controller FSM', sub: 'Multi-Phase Verilog RTL', cat: 'VERILOG FSM', color: '#f59e0b', bg: '#261808' },
  { id: 37, code: 'ECE-37', title: 'Vending Machine FSM', sub: 'Coin & Inventory RTL', cat: 'VERILOG FSM', color: '#14b8a6', bg: '#082320' },
  { id: 38, code: 'ECE-38', title: 'Diagnostic 3-Lead ECG', sub: 'AD620 RLD QRS Detector', cat: 'BIOMEDICAL ECE', color: '#ef4444', bg: '#290c0c' },
  { id: 39, code: 'ECE-39', title: 'EMG Prosthetic Hand', sub: 'Myo Muscle Potential Board', cat: 'BIONICS & ECE', color: '#d946ef', bg: '#250a2c' },
  { id: 40, code: 'ECE-40', title: 'Smart Helmet Safety', sub: 'Alcohol Lock & Fall SMS', cat: 'AUTOMOTIVE ECE', color: '#f97316', bg: '#281108' },
  { id: 41, code: 'ECE-41', title: 'Auto Railway Crossing', sub: 'Infrared Train Detection', cat: 'SAFETY SYSTEMS', color: '#eab308', bg: '#251d08' },
  { id: 42, code: 'ECE-42', title: 'Ultrasonic Radar System', sub: 'Processing GUI 180-Deg', cat: 'RADAR & SONAR', color: '#06b6d4', bg: '#071f2c' },
];

console.log(`Generating ${projects.length} project card images...`);

projects.forEach((p) => {
  const targetPath = path.join(outputDir, `ece${p.id}.jpg`);
  
  // Build ImageMagick command for crisp, sleek hardware card
  const cmd = `convert -size 800x500 xc:"${p.bg}" \
    -fill "#ffffff" -stroke none -strokewidth 0 \
    -fill "#1e293b" -draw "roundrectangle 24,24 776,476 16,16" \
    -fill "${p.bg}" -draw "roundrectangle 28,28 772,472 14,14" \
    -fill "${p.color}" -draw "roundrectangle 45,45 220,82 8,8" \
    -fill "#ffffff" -pointsize 18 -weight Bold -annotate +60+71 "${p.cat}" \
    -fill "${p.color}" -pointsize 26 -weight Bold -annotate +550+72 "${p.code}" \
    -stroke "${p.color}" -strokewidth 2 -draw "line 45,105 755,105" \
    -stroke none \
    -fill "#f8fafc" -pointsize 32 -weight Bold -annotate +45+170 "${p.title}" \
    -fill "#94a3b8" -pointsize 20 -annotate +45+215 "${p.sub}" \
    -fill "#334155" -draw "roundrectangle 45,260 755,420 12,12" \
    -stroke "${p.color}" -strokewidth 1 -draw "line 65,310 180,310 line 180,310 240,360 line 240,360 400,360" \
    -stroke none \
    -fill "${p.color}" -draw "circle 65,310 65,314 circle 400,360 400,364" \
    -fill "#38bdf8" -pointsize 15 -annotate +65+295 "CIRCUIT TRACE // PCB VERIFIED" \
    -fill "#ffffff" -pointsize 16 -weight Bold -annotate +450+300 "HARDWARE KIT / LAB VERIFIED" \
    -fill "#94a3b8" -pointsize 14 -annotate +450+330 "[x] Complete Schematics & Gerber" \
    -fill "#94a3b8" -pointsize 14 -annotate +450+355 "[x] Firmware Source Code & BOM" \
    -fill "#94a3b8" -pointsize 14 -annotate +450+380 "[x] Physical Components & Documentation" \
    -fill "#cbd5e1" -pointsize 14 -annotate +45+452 "INDIAN ECE & VLSI ENGINEERING PORTAL // KIT ECE-${p.id}" \
    "${targetPath}"`;

  try {
    execSync(cmd);
  } catch (err) {
    console.error(`Failed to generate ece${p.id}.jpg:`, err.message);
  }
});

console.log('Successfully generated all project card images in public/projects!');
