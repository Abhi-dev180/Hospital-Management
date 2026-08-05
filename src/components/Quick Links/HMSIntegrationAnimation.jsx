import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  FileText, 
  PhoneCall, 
  Calendar, 
  Clock, 
  ClipboardList, 
  Pill, 
  Sparkles,
  Activity,
  ShieldCheck,
  Zap,
  Database
} from 'lucide-react';

export default function HMSIntegrationAnimation() {
  const [activeFeature, setActiveFeature] = useState(null);

  // 6 satellite hospital care unit nodes positioned circularly around center
  const nodes = [
    { id: 0, label: "Emergency 24/7", icon: PhoneCall, angle: -90, x: 200, y: 70 },
    { id: 1, label: "Pharmacy & Meds", icon: Pill, angle: -30, x: 312.5, y: 135 },
    { id: 2, label: "OPD Appointments", icon: Calendar, angle: 30, x: 312.5, y: 265 },
    { id: 3, label: "Diagnostic Lab", icon: Clock, angle: 90, x: 200, y: 330 },
    { id: 4, label: "Patient Records & EHR", icon: ClipboardList, angle: 150, x: 87.5, y: 265 },
    { id: 5, label: "Radiology E-Reports", icon: FileText, angle: 210, x: 87.5, y: 135 },
  ];

  const features = [
    {
      id: 0,
      title: "Instant OPD & Lab Sync",
      subtitle: "Connect emergency units, outpatient clinics, labs, and ICUs in real time",
      icon: Zap,
      nodeId: 0
    },
    {
      id: 1,
      title: "Complete Patient History Sync",
      subtitle: "Access complete medical history, lab results, and prescriptions at point of care",
      icon: Database,
      nodeId: 4
    },
    {
      id: 2,
      title: "Real-Time Emergency Dispatch",
      subtitle: "Sub-second emergency alerts and bed availability updates across hospital departments",
      icon: Activity,
      nodeId: 3
    },
    {
      id: 3,
      title: "HIPAA-Compliant Patient Privacy",
      subtitle: "Enterprise-grade encryption and secure access for all doctor & patient records",
      icon: ShieldCheck,
      nodeId: 1
    }
  ];

  return (
    <div className="w-full bg-[#fdfbf7] rounded-3xl border border-[#ede8de] p-6 sm:p-10 md:p-12 shadow-sm my-12 overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
        
        {/* Left Side: Deep PMS Integration Text & Features */}
        <div className="w-full lg:w-5/12 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-medical-blue uppercase mb-3 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              <Sparkles className="w-4 h-4 text-medical-blue animate-pulse" />
              SMART HOSPITAL ECOSYSTEM
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Seamless Connection Across All Hospital Care Units
            </h3>
          </div>

          <div className="space-y-5">
            {features.map((item) => {
              const isHovered = activeFeature === item.id;
              const FeatureIcon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  onMouseEnter={() => setActiveFeature(item.id)}
                  onMouseLeave={() => setActiveFeature(null)}
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isHovered
                      ? 'bg-white shadow-md border border-medical-blue/30 text-gray-900'
                      : 'hover:bg-white/60 text-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`mt-1 p-2 rounded-xl transition-colors ${
                      isHovered ? 'bg-medical-blue text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <FeatureIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-bold text-gray-900 text-base">
                        <span className="inline-block w-2 h-2 rounded-full bg-medical-blue"></span>
                        {item.title}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Animated Radial Network Circle Diagram */}
        <div className="w-full lg:w-6/12 flex items-center justify-center relative py-4 sm:py-6">
          <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[420px] md:h-[420px]">
            
            {/* Background SVG Canvas for Concentric Rings & Radial Connecting Lines */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 400 400"
              fill="none"
            >
              {/* Outer faint circle guide line */}
              <circle 
                cx="200" 
                cy="200" 
                r="130" 
                stroke="#e2ded4" 
                strokeWidth="1.5" 
                strokeDasharray="4 4"
                className="opacity-70"
              />

              {/* Inner faint circle guide line */}
              <circle 
                cx="200" 
                cy="200" 
                r="70" 
                stroke="#eee9de" 
                strokeWidth="1" 
              />

              {/* Central pulse wave effect */}
              <motion.circle
                cx="200"
                cy="200"
                r="45"
                stroke="#2563eb"
                strokeWidth="1.5"
                initial={{ opacity: 0.6, scale: 0.8 }}
                animate={{ 
                  scale: [1, 2.5, 1],
                  opacity: [0.6, 0, 0.6]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Radial spoke lines connecting center (200, 200) to each satellite node */}
              {nodes.map((node) => {
                return (
                  <g key={`line-${node.id}`}>
                    {/* Base faint line */}
                    <line
                      x1="200"
                      y1="200"
                      x2={node.x}
                      y2={node.y}
                      stroke="#e5e0d3"
                      strokeWidth="1.5"
                    />

                    {/* Animated Dotted / Pulse Particle: Going Inward to Center then Outward to Satellite */}
                    {/* Signal Particle 1: Inward (Satellite -> Center) */}
                    <motion.circle
                      r="3.5"
                      fill="#2563eb"
                      initial={{ cx: node.x, cy: node.y, opacity: 0 }}
                      animate={{
                        cx: [node.x, 200, node.x],
                        cy: [node.y, 200, node.y],
                        opacity: [0.2, 1, 0.2],
                        scale: [0.8, 1.4, 0.8]
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        delay: node.id * 0.55,
                        ease: "easeInOut"
                      }}
                    />

                    {/* Signal Particle 2: Outward Counter-Pulse (Center -> Satellite) */}
                    <motion.circle
                      r="2.5"
                      fill="#3b82f6"
                      initial={{ cx: 200, cy: 200, opacity: 0 }}
                      animate={{
                        cx: [200, node.x, 200],
                        cy: [200, node.y, 200],
                        opacity: [0.8, 0.1, 0.8],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        delay: node.id * 0.55 + 1.2,
                        ease: "easeInOut"
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Central Main Hospital Hub Circle / Card */}
            <motion.div
              animate={{ 
                scale: [1, 1.04, 1],
                boxShadow: [
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  "0 20px 35px -5px rgba(37, 99, 235, 0.25)",
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 bg-gray-800 text-white rounded-3xl flex flex-col items-center justify-center shadow-xl border border-gray-700 z-20 cursor-pointer group"
            >
              <div className="relative">
                <Sparkles className="w-8 h-8 sm:w-9 sm:h-9 text-blue-400 group-hover:rotate-45 transition-transform duration-500" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wider mt-1 text-sky-300 text-center leading-tight">
                MEDPARK<br/>CARE HUB
              </span>
            </motion.div>

            {/* Satellite Node Icons Positioned on the Circle */}
            {nodes.map((node) => {
              const IconComp = node.icon;
              const isHighlight = activeFeature !== null && features[activeFeature]?.nodeId === node.id;
              
              // Calculate percentage positions for absolute HTML layout inside 400x400 parent container
              const leftPercent = (node.x / 400) * 100;
              const topPercent = (node.y / 400) * 100;

              return (
                <motion.div
                  key={node.id}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                  }}
                  animate={{
                    scale: isHighlight ? 1.25 : 1,
                    y: isHighlight ? -4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all duration-300 z-10 cursor-pointer ${
                    isHighlight
                      ? 'bg-medical-blue text-white border-blue-400 shadow-lg shadow-blue-500/30 ring-2 sm:ring-4 ring-blue-100'
                      : 'bg-white text-gray-700 border-gray-200 shadow-md hover:border-medical-blue hover:text-medical-blue'
                  }`}
                  title={node.label}
                >
                  <IconComp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  
                  {/* Tooltip Label on hover */}
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-gray-600 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-xs border border-gray-100 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {node.label}
                  </span>
                </motion.div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}
