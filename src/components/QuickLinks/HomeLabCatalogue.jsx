import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TestTube,
  Droplet,
  Activity,
  HeartPulse,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
  Zap,
  Home as HomeIcon,
  Tag,
  Percent,
  FileText,
  BadgeCheck,
  Filter
} from 'lucide-react';
import API_URL from '../../config/api';

const DEFAULT_LAB_TESTS = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC) Panel',
    category: 'Routine Blood Tests',
    desc: 'Comprehensive blood cell evaluation for anemia, infections, platelet health, and immune vitality.',
    parametersCount: 24,
    parametersList: ['Hemoglobin (Hb)', 'Platelet Count', 'Total RBC & WBC', 'DLC Differential Count', 'PCV / Hematocrit', 'MCV, MCH, MCHC'],
    turnaround: '4-6 Hours',
    fasting: 'No Fasting Required',
    currentPrice: 350,
    originalPrice: 700,
    discountPercent: 50,
    popular: true,
    homeCollection: true,
    sampleType: 'Blood Sample'
  },
  {
    id: 'lipid',
    name: 'Lipid Profile (Cholesterol & Cardiac Risk)',
    category: 'Heart & Lipid',
    desc: 'Evaluates cardiovascular risk, good HDL vs bad LDL cholesterol and serum triglycerides.',
    parametersCount: 8,
    parametersList: ['Total Cholesterol', 'HDL Good Cholesterol', 'LDL Bad Cholesterol', 'VLDL Cholesterol', 'Triglycerides', 'Chol/HDL Ratio'],
    turnaround: '8-12 Hours',
    fasting: '10-12 Hours Fasting',
    currentPrice: 599,
    originalPrice: 1200,
    discountPercent: 50,
    popular: true,
    homeCollection: true,
    sampleType: 'Blood Sample'
  },
  {
    id: 'hba1c',
    name: 'HbA1c (3-Month Diabetes Glycated Hemoglobin)',
    category: 'Diabetes & Thyroid',
    desc: 'Gold standard test monitoring average blood sugar control over the past 90 days.',
    parametersCount: 3,
    parametersList: ['Glycated Hemoglobin (HbA1c)', 'Estimated Average Glucose (eAG)', 'Total Blood Sugar Trend'],
    turnaround: '6-8 Hours',
    fasting: 'No Fasting Required',
    currentPrice: 450,
    originalPrice: 900,
    discountPercent: 50,
    popular: true,
    homeCollection: true,
    sampleType: 'Blood Sample'
  },
  {
    id: 'thyroid',
    name: 'Total Thyroid Function Profile (T3, T4, TSH)',
    category: 'Diabetes & Thyroid',
    desc: 'Assesses thyroid gland function, metabolic rate, weight balance, and energy stamina.',
    parametersCount: 3,
    parametersList: ['Total Triiodothyronine (T3)', 'Total Thyroxine (T4)', 'Thyroid Stimulating Hormone (TSH)'],
    turnaround: '12 Hours',
    fasting: 'Morning Sample Preferred',
    currentPrice: 549,
    originalPrice: 1100,
    discountPercent: 50,
    popular: false,
    homeCollection: true,
    sampleType: 'Blood Sample'
  },
  {
    id: 'lft',
    name: 'Liver Function Test (LFT Panel)',
    category: 'Vital Organs',
    desc: 'Comprehensive screening for liver enzymes, bilirubin levels, and hepatic protein synthesis.',
    parametersCount: 11,
    parametersList: ['Bilirubin (Total, Direct, Indirect)', 'SGOT / AST', 'SGPT / ALT', 'Alkaline Phosphatase', 'Total Protein & Albumin', 'A/G Ratio'],
    turnaround: '8 Hours',
    fasting: '8 Hours Fasting',
    currentPrice: 499,
    originalPrice: 1000,
    discountPercent: 50,
    popular: false,
    homeCollection: true,
    sampleType: 'Blood Sample'
  },
  {
    id: 'kft',
    name: 'Kidney Function Test (KFT / Renal Profile)',
    category: 'Vital Organs',
    desc: 'Monitors renal filtration efficiency, blood urea clearance, and serum electrolyte balance.',
    parametersCount: 7,
    parametersList: ['Serum Creatinine', 'Blood Urea Nitrogen (BUN)', 'Uric Acid', 'Calcium', 'Phosphorus', 'BUN/Creatinine Ratio'],
    turnaround: '8 Hours',
    fasting: '8 Hours Fasting',
    currentPrice: 480,
    originalPrice: 950,
    discountPercent: 50,
    popular: false,
    homeCollection: true,
    sampleType: 'Blood Sample'
  },
  {
    id: 'vit_duo',
    name: 'Vitamin D & B12 Vitality Duo Package',
    category: 'Full Body Packages',
    desc: 'Detects bone weakness, chronic fatigue, nerve issues, joint stiffness, and immunity deficiency.',
    parametersCount: 2,
    parametersList: ['25-Hydroxy Vitamin D', 'Vitamin B12 (Cyanocobalamin)'],
    turnaround: '24 Hours',
    fasting: 'No Fasting Required',
    currentPrice: 999,
    originalPrice: 2500,
    discountPercent: 60,
    popular: true,
    homeCollection: true,
    sampleType: 'Blood Sample'
  },
  {
    id: 'full_body',
    name: 'Executive Master Full Body Health Package',
    category: 'Full Body Packages',
    desc: 'Complete 72-parameter diagnostic screen covering Heart, Liver, Kidneys, Diabetes, Blood, and Urine.',
    parametersCount: 72,
    parametersList: ['Complete Hemogram (24)', 'Lipid Cardiac Profile (8)', 'Liver LFT (11)', 'Kidney KFT (7)', 'HbA1c Diabetes Screen', 'Thyroid TSH', 'Urine Routine (20)'],
    turnaround: '24 Hours',
    fasting: '10-12 Hours Overnight Fasting',
    currentPrice: 1499,
    originalPrice: 4999,
    discountPercent: 70,
    popular: true,
    homeCollection: true,
    sampleType: 'Blood & Urine Sample'
  }
];

const CATEGORIES = [
  'All Tests',
  'Routine Blood Tests',
  'Diabetes & Thyroid',
  'Heart & Lipid',
  'Vital Organs',
  'Full Body Packages'
];

export default function HomeLabCatalogue() {
  const [tests, setTests] = useState(DEFAULT_LAB_TESTS);
  const [selectedCategory, setSelectedCategory] = useState('All Tests');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/services`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge dynamic lab tests from backend with default catalogue
          const dynamicTests = data
            .filter((s) => s.category?.toLowerCase().includes('blood') || s.category?.toLowerCase().includes('lab') || s.category?.toLowerCase().includes('test'))
            .map((s) => {
              const currentPrice = Number(s.price || 500);
              const originalPrice = Math.round(currentPrice * 2);
              return {
                id: s.id,
                name: s.name,
                category: s.category || 'Routine Blood Tests',
                desc: s.description || 'NABL certified laboratory test with precision digital reporting.',
                parametersCount: s.parametersCount || 10,
                parametersList: s.parametersList || ['Target Biomarkers', 'Clinical Evaluation', 'Reference Range Report'],
                turnaround: s.turnaroundTime || '8 Hours',
                fasting: s.fastingRequired ? (s.fastingDetails || '8-10 Hours Fasting') : 'No Fasting Required',
                currentPrice,
                originalPrice,
                discountPercent: 50,
                popular: false,
                homeCollection: true,
                sampleType: s.sampleType || 'Blood Sample'
              };
            });

          if (dynamicTests.length > 0) {
            // Combine ensuring no duplicates by name
            const names = new Set(DEFAULT_LAB_TESTS.map((t) => t.name.toLowerCase()));
            const uniqueDynamic = dynamicTests.filter((d) => !names.has(d.name.toLowerCase()));
            setTests([...DEFAULT_LAB_TESTS, ...uniqueDynamic]);
          }
        }
      } catch (err) {
        console.warn('Using default diagnostic lab tests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredTests = tests.filter((t) => {
    const matchesCat = selectedCategory === 'All Tests' || t.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      (t.parametersList && t.parametersList.some((p) => p.toLowerCase().includes(q))) ||
      t.category.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const handleBookTest = (test) => {
    navigate(`/appointment?service=lab&test=${encodeURIComponent(test.name)}&amount=${test.currentPrice}`);
  };

  return (
    <section id="lab-tests" className="scroll-mt-20 py-20 bg-white border-t border-slate-200/80 text-slate-800 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-medical-blue text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <TestTube className="w-3.5 h-3.5" /> Certified NABL Diagnostic Labs
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-medical-dark">
              Diagnostic Lab Test Catalogue &amp; Packages
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
              Book accurate blood tests &amp; comprehensive health checkups at exclusive discounted rates with complimentary home sample collection.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-84">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests (e.g. CBC, Lipid, HbA1c, Thyroid)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 transition shadow-inner"
            />
          </div>
        </div>

        {/* Value Props Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-medical-blue flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-medical-dark">NABL Certified</h4>
              <p className="text-[11px] text-slate-500">100% Quality Assured</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <HomeIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-medical-dark">Free Home Pickup</h4>
              <p className="text-[11px] text-slate-500">Trained Phlebotomists</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-medical-dark">Fast Digital Reports</h4>
              <p className="text-[11px] text-slate-500">Within 6 to 24 Hours</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-medical-dark">Up to 70% Off</h4>
              <p className="text-[11px] text-slate-500">Direct Lab Discounts</p>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-medical-blue text-white shadow-md shadow-medical-blue/20 scale-102'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredTests.map((test) => {
              const savings = test.originalPrice - test.currentPrice;

              return (
                <motion.div
                  key={test.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col justify-between hover:border-medical-blue/40 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  {/* Popular Badge */}
                  {test.popular && (
                    <div className="absolute top-0 right-0">
                      <span className="bg-gradient-to-l from-amber-500 to-orange-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Most Popular
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Discount & Category Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {test.discountPercent}% OFF
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium truncate">
                        {test.category}
                      </span>
                    </div>

                    {/* Test Title */}
                    <h3 className="font-bold text-lg text-medical-dark group-hover:text-medical-blue transition-colors leading-snug mb-2">
                      {test.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {test.desc}
                    </p>

                    {/* Parameters Included Box */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 mb-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-medical-blue flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-medical-blue" /> {test.parametersCount} Parameters Included
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {test.parametersList.join(' • ')}
                      </p>
                    </div>

                    {/* Meta info: Fasting & Turnaround */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-5">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Digital Report in <strong>{test.turnaround}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-medical-blue shrink-0" />
                        <span className="truncate">{test.fasting}</span>
                      </div>
                      {test.homeCollection && (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <HomeIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>Home Sample Pickup Included</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[11px] text-slate-500 block font-medium">Discounted Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-medical-dark">₹{test.currentPrice}</span>
                          <span className="text-sm text-slate-400 line-through">₹{test.originalPrice}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Save ₹{savings}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookTest(test)}
                      className="w-full py-2.5 bg-medical-dark hover:bg-medical-blue text-white font-bold text-xs rounded-xl shadow-md shadow-medical-dark/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer transform active:scale-95"
                    >
                      Book Test Now <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200/90">
            <TestTube className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800">No lab tests match &ldquo;{searchQuery}&rdquo;</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for CBC, Lipid, Liver, or select another category above.</p>
          </div>
        )}
      </div>
    </section>
  );
}
