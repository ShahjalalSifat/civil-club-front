import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { getFaqs } from "@/lib/db";

// 1. PII Stripping Helper (Ensures personal data is never sent to external AI APIs)
function stripSensitive(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  const clone = { ...obj };
  const blockedKeys = [
    "phone",
    "phoneNumber",
    "email",
    "emailAddress",
    "bloodGroup",
    "contact",
    "contactNo",
    "facebookUrl",
    "linkedinUrl",
    "address",
    "studentId",
    "password",
    "token",
    "secret",
    "apiKey",
  ];
  blockedKeys.forEach((key) => delete clone[key]);
  return clone;
}

// 2. In-Memory Anti-Abuse Rate Limiter per IP (Protects against bots / DDoS / Spam bans)
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_MAX_REQUESTS = 12; // Max 12 requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window

// Periodic cleanup of stale rate-limit keys to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of requestLog.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      requestLog.delete(ip);
    } else {
      requestLog.set(ip, valid);
    }
  }
}, 300_000); // every 5 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return false;
}

// 3. Sanitizer to prevent prompt injection / massive garbage inputs
function sanitizeUserMessage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let clean = raw.trim();
  // Strip null bytes and control chars
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  if (clean.length === 0 || clean.length > 500) {
    return null;
  }
  return clean;
}

// 4. Comprehensive Offline Civil Engineering & General Knowledge Engine (Instant & 100% Free)
function getComprehensiveFallback(message: string, faqs: any[]): string {
  const lower = message.toLowerCase().trim();

  // Creator / Developer info
  if (
    lower.includes("website") ||
    lower.includes("বানিয়েছে") ||
    lower.includes("বানাইছে") ||
    lower.includes("developer") ||
    lower.includes("who made") ||
    lower.includes("create") ||
    lower.includes("sifat") ||
    lower.includes("সিফাত")
  ) {
    return `এই ওয়েবসাইটটি তৈরি করেছেন **SHAHJALAL AHMED SIFAT**।\n\nযোগাযোগ ও সোশ্যাল প্রোফাইল:\n• Facebook: https://www.facebook.com/sifat8/\n• LinkedIn: https://www.linkedin.com/in/shahjalal-sifat/\n• Instagram: https://www.instagram.com/shahjalal_sifat/\n• Email: mdshahjalalahmedsifat47@gmail.com\n• সব লিংক: https://linktr.ee/mdshahjalalahmedsifat47`;
  }

  // Greetings & Casual
  if (lower.includes("love") || lower.includes("ভালোবাসি") || lower.includes("valobasi")) {
    return "Aww! ❤️ অনেক ধন্যবাদ আপনার সুন্দর ভালোবাসার জন্য! আমি Engr. Kuchu Puchu, আপনাকে এবং সিভিল ইঞ্জিনিয়ারিং পরিবারের সবাইকে অনেক শ্রদ্ধা ও ভালোবাসা জানাই। সিভিল ইঞ্জিনিয়ারিং বা ক্লাব নিয়ে যেকোনো প্রশ্ন করতে পারেন!";
  }
  if (lower.includes("kemon") || lower.includes("কেমন") || lower.includes("how are you") || lower.includes("ki khobor") || lower.includes("ki obostha")) {
    return "আলহামদুলিল্লাহ, আমি খুব ভালো আছি! আপনি কেমন আছেন? HSTU Civil Engineering Club অথবা সিভিল ইঞ্জিনিয়ারিংয়ের যেকোনো টপিক নিয়ে কোনো কিছু জানতে চান?";
  }
  if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey") || lower.includes("হাই") || lower.includes("হ্যালো") || lower.includes("সালাম") || lower.includes("assalamu") || lower.includes("salam")) {
    return "ওয়ালাইকুম আসসালাম / হ্যালো! আমি Engr. Kuchu Puchu, HSTU Civil Engineering Club এর অফিসিয়াল AI অ্যাসিস্ট্যান্ট। কীভাবে আপনাকে সাহায্য করতে পারি?";
  }
  if (lower.includes("thanks") || lower.includes("thank you") || lower.includes("ধন্যবাদ") || lower.includes("dhonnobad")) {
    return "আপনাকে অসংখ্য ধন্যবাদ! যেকোনো প্রয়োজনে আমি সবসময় আপনার পাশে আছি। শুভকামনা!";
  }
  if (lower.includes("ki koro") || lower.includes("কী করো") || lower.includes("what are you doing")) {
    return "আমি সিভিল ইঞ্জিনিয়ারিং বিভাগের শিক্ষার্থী ও ক্লাব সদস্যদের বিভিন্ন প্রশ্ন ও তথ্যের উত্তর দিতে রেডি আছি! আপনি কী বিষয়ে জানতে চান?";
  }
  if (lower.includes("name") || lower.includes("who are you") || lower.includes("কে তুমি") || lower.includes("তোমার নাম") || lower.includes("tumi ke")) {
    return "আমার নাম **Engr. Kuchu Puchu**! আমি HSTU Civil Engineering Club এর অফিসিয়াল এআই সহকারী।";
  }

  // Geotechnical Engineering
  if (
    lower.includes("geo") ||
    lower.includes("geotech") ||
    lower.includes("জিওটেক") ||
    lower.includes("soil") ||
    lower.includes("মাটি") ||
    lower.includes("foundation") ||
    lower.includes("ভিত্তি") ||
    lower.includes("bearing capacity") ||
    lower.includes("spt")
  ) {
    return `**জিওটেকনিক্যাল ইঞ্জিনিয়ারিং (Geotechnical Engineering)** হলো সিভিল ইঞ্জিনিয়ারিংয়ের একটি অত্যন্ত গুরুত্বপূর্ণ শাখা, যা মাটির (Soil) এবং পাথরের (Rock) ভৌত, রাসায়নিক ও মেকানিক্যাল বৈশিষ্ট্য নিয়ে কাজ করে।\n\n**মূল আলোচ্য বিষয়সমূহ:**\n- 🏗️ **Foundation Engineering**: অগভীর ভিত্তি (Shallow Foundation/Footing) এবং গভীর ভিত্তি (Deep Foundation/Pile, Caisson) ডিজাইন।\n- 🧪 **Soil Mechanics**: মাটির ভারবহন ক্ষমতা (Bearing Capacity), কনসলিডেশন (Consolidation), পারমিয়াবিলিটি (Permeability) এবং শিয়ার স্ট্রেন্থ (Shear Strength)।\n- 📊 **Site Investigation & Soil Testing**: SPT (Standard Penetration Test), Direct Shear Test, Triaxial Test, Atterberg Limits।\n- ⛰️ **Slope Stability & Retaining Walls**: মাটির ধস প্রতিরোধ ও রিটেইনিং ওয়াল ডিজাইন।`;
  }

  // Structural Engineering
  if (
    lower.includes("struct") ||
    lower.includes("স্ট্রাকচার") ||
    lower.includes("beam") ||
    lower.includes("column") ||
    lower.includes("কলম") ||
    lower.includes("slab") ||
    lower.includes("ছাদ") ||
    lower.includes("truss") ||
    lower.includes("rcc") ||
    lower.includes("load") ||
    lower.includes("moment")
  ) {
    return `**স্ট্রাকচারাল ইঞ্জিনিয়ারিং (Structural Engineering)** হলো সিভিল ইঞ্জিনিয়ারিংয়ের এমন একটি শাখা যা বিভিন্ন স্থাপনার (বিল্ডিং, ব্রিজ, টাওয়ার ইত্যাদি) স্থায়িত্ব, ভারবহন ক্ষমতা এবং নিরাপত্তা বিশ্লেষণ ও ডিজাইন করে।\n\n**মূল উপাদানসমূহ:**\n- 🏢 **Structural Elements**: বিম (Beam), কলাম (Column), স্ল্যাব (Slab), ট্রাস (Truss), ফুটিং (Footing)।\n- ⚖️ **Load Analysis**: Dead Load, Live Load, Wind Load, Earthquake (Seismic) Load।\n- 📐 **Design Methods**: Working Stress Design (WSD) এবং Ultimate Strength Design (USD)।\n- 💻 **Software**: ETABS, SAP2000, STAAD Pro, SAFE।`;
  }

  // Transportation Engineering
  if (
    lower.includes("transport") ||
    lower.includes("ট্রান্সপোর্ট") ||
    lower.includes("highway") ||
    lower.includes("হাইওয়ে") ||
    lower.includes("road") ||
    lower.includes("রাস্তা") ||
    lower.includes("traffic") ||
    lower.includes("ট্রাফিক") ||
    lower.includes("pavement") ||
    lower.includes("bitumen")
  ) {
    return `**ট্রান্সপোর্টেশন ইঞ্জিনিয়ারিং (Transportation Engineering)** হলো সড়ক, রেলপথ, আকাশপথ এবং নৌপথের নিরাপদ, আরামদায়ক ও দ্রুত চলাচলের জন্য পরিকল্পনা, জ্যামিতিক নকশা এবং নির্মাণের প্রকৌশল শাখা।\n\n**প্রধান ভাগসমূহ:**\n- 🛣️ **Highway Geometric Design**: সুপার-এলিভেশন (Superelevation), সাইট ডিসট্যান্স (SSD, OSD), কার্ভ ডিজাইন।\n- 🚗 **Traffic Engineering**: ট্রাফিক ভলিউম স্টাডি, সিগন্যাল টাইমিং, ইন্টারসেকশন ডিজাইন।\n- 🧱 **Pavement Design**: Flexible Pavement (Bituminous) এবং Rigid Pavement (RCC)।\n- 🚆 **Railway & Airport Engineering**: ট্র্যাক জ্যামিতি, রানওয়ে ও ট্যাক্সিওয়ে ওরিয়েন্টেশন।`;
  }

  // Environmental Engineering
  if (
    lower.includes("environ") ||
    lower.includes("পরিবেশ") ||
    lower.includes("water treatment") ||
    lower.includes("পানি শোধন") ||
    lower.includes("bod") ||
    lower.includes("cod") ||
    lower.includes("waste") ||
    lower.includes("বর্জ্য") ||
    lower.includes("pollution")
  ) {
    return `**এনভায়রনমেন্টাল ইঞ্জিনিয়ারিং (Environmental Engineering)** হলো পরিবেশ রক্ষা, সুপেয় পানির সংস্থান, বর্জ্য ব্যবস্থাপনা এবং দূষণ নিয়ন্ত্রণের বিজ্ঞান ও কৌশল।\n\n**প্রধান ক্ষেত্রসমূহ:**\n- 🚰 **Water Supply Engineering**: উৎস থেকে পানি সংগ্রহ, কোয়াগুলেশন, ফ্লোকুলেশন, ফিল্ট্রেশন ও ক্লোরিনেশনের মাধ্যমে শোধন।\n- ♻️ **Wastewater Treatment**: ETP ও STP ডিজাইন, BOD ও COD হ্রাসকরণ।\n- 🗑️ **Solid Waste Management**: কঠিন বর্জ্য সংগ্রহ, রিসাইক্লিং ও স্যানিটারি ল্যান্ডফিল।\n- 🌿 **Environmental Impact Assessment (EIA)**: মেগা প্রজেক্টের পরিবেশগত প্রভাব মূল্যায়ন।`;
  }

  // Water Resources & Fluid Mechanics
  if (
    lower.includes("water resource") ||
    lower.includes("পানি সম্পদ") ||
    lower.includes("hydrolog") ||
    lower.includes("হাইড্রো") ||
    lower.includes("fluid") ||
    lower.includes("ফ্লুইড") ||
    lower.includes("dam") ||
    lower.includes("বাঁধ") ||
    lower.includes("irrigation") ||
    lower.includes("সেচ") ||
    lower.includes("flood") ||
    lower.includes("বন্যা")
  ) {
    return `**ওয়াটার রিসোর্সেস ইঞ্জিনিয়ারিং (Water Resources Engineering)** হলো নদীশাসন, বন্যা নিয়ন্ত্রণ, সেচ ব্যবস্থা, ড্রেনেজ ও পানিসম্পদের সুষ্ঠু ব্যবহার নিয়ে কাজ করার শাখা।\n\n**মূল অংশসমূহ:**\n- 🌊 **Fluid Mechanics & Hydraulics**: বার্নোলির সমীকরণ, ওপেন চ্যানেল ফ্লো, ম্যানিংস ফর্মুলা।\n- 🌧️ **Hydrology**: বৃষ্টিপাত, রান-অফ (Runoff), হাইড্রোগ্রাফ (Hydrograph) ও গ্রাউন্ডওয়াটার বিশ্লেষণ।\n- 🌾 **Irrigation & Drainage**: ক্যানাল ডিজাইন, ব্যারেজ, ক্রস ড্রেনেজ ওয়ার্কস।\n- 🛡️ **Flood Control & River Training**: ড্যাম, স্লুইস গেট ও রিভার ব্যাংক প্রটেকশন।`;
  }

  // Concrete & Materials
  if (
    lower.includes("concrete") ||
    lower.includes("কংক্রিট") ||
    lower.includes("cement") ||
    lower.includes("সিমেন্ট") ||
    lower.includes("aggregate") ||
    lower.includes("বালি") ||
    lower.includes("খোয়া") ||
    lower.includes("curing") ||
    lower.includes("কিউরিং") ||
    lower.includes("slump") ||
    lower.includes("w/c")
  ) {
    return `**কংক্রিট প্রযুক্তি (Concrete Technology)** সিভিল নির্মাণের প্রধান স্তম্ভ:\n\n**উপাদানসমূহ:**\n1. সিমেন্ট (বাইন্ডিং উপাদান - OPC / PCC)\n2. ফাইন এগ্রিগেট (বালি, FM সাধারণত ২.৫-২.৮)\n3. কোর্স এগ্রিগেট (পাথর/ইটের খোয়া)\n4. পানি (Water-Cement Ratio সাধারণত ০.৪-০.৫)\n5. এডমিক্সচার (Superplasticizer, Retarder ইত্যাদি)।\n\n**গুরুত্বপূর্ণ পরীক্ষা:**\n- **Slump Test**: কাজের উপযোগিতা (Workability) নির্ণয়।\n- **Compressive Strength Test**: ৭ দিন ও ২৮ দিনের সিলিন্ডার/কিউব টেস্ট।\n- **Curing**: হাইড্রেশন প্রক্রিয়া সচল রাখতে ন্যূনতম ১৪-২৮ দিন পানি দিয়ে কিউরিং অপরিহার্য।`;
  }

  // Surveying & Geomatics
  if (
    lower.includes("survey") ||
    lower.includes("সার্ভে") ||
    lower.includes("leveling") ||
    lower.includes("লেভেলিং") ||
    lower.includes("theodolite") ||
    lower.includes("total station") ||
    lower.includes("gps") ||
    lower.includes("gis") ||
    lower.includes("contour")
  ) {
    return `**সার্ভেইং (Surveying & Geomatics)** হলো কোনো ভূমির ত্রিমাত্রিক অবস্থান, উচ্চতা ও ক্ষেত্রফল সঠিকভাবে নির্ণয়ের বিজ্ঞান।\n\n**মূল পদ্ধতি ও যন্ত্রাংশ:**\n- 📐 **Chain & Tape Surveying**: রৈখিক পরিমাপ।\n- 🔭 **Leveling**: Auto Level ও Dumpy Level দিয়ে Benchmark সাপেক্ষে Reduced Level (RL) নির্ণয়।\n- 🌐 **Total Station & GPS**: কোণ ও দূরত্বের ডিজিটাল প্রিসিশন পরিমাপ।\n- 🗺️ **Contouring & GIS**: সমউচ্চতাসম্পন্ন রেখা অঙ্কন ও ভৌগোলিক তথ্য বিশ্লেষণ।`;
  }

  // Estimation & Software
  if (
    lower.includes("estimate") ||
    lower.includes("এস্টিমেট") ||
    lower.includes("boq") ||
    lower.includes("autocad") ||
    lower.includes("etabs") ||
    lower.includes("revit") ||
    lower.includes("software")
  ) {
    return `**এস্টিমেশন ও সিভিল সফটওয়্যার গাইড:**\n\n- 📊 **Estimation & Costing**: মালামালের পরিমাণ (Quantity take-off), সিমেন্ট-বালি-রডের রেশিও, BOQ (Bill of Quantities) ও শিডিউল অফ রেটস (PWD/LGED/RHD)।\n- 💻 **অত্যাবশ্যকীয় সফটওয়্যার:**\n  1. **AutoCAD**: 2D ড্রয়িং ও প্ল্যানিং\n  2. **ETABS / STAAD.Pro**: বহুতল ভবনের স্ট্রাকচারাল এনালাইসিস\n  3. **Revit (BIM)**: 3D মডেলিং ও আর্কিটেকচারাল কোলাবোরেশন\n  4. **SAFE**: ফাউন্ডেশন ও স্ল্যাব ডিজাইন\n  5. **Civil 3D & GIS**: রাস্তা ও সারফেস ডিজাইন।`;
  }

  // General Civil Engineering
  if (
    lower.includes("civil") ||
    lower.includes("সিভিল") ||
    lower.includes("engineering") ||
    lower.includes("ইঞ্জিনিয়ারিং")
  ) {
    return `**সিভিল ইঞ্জিনিয়ারিং (Civil Engineering)** হলো মানব সভ্যতার ভৌত ও প্রাকৃতিক অবকাঠামো পরিকল্পনা, ডিজাইন, নির্মাণ এবং রক্ষণাবেক্ষণের প্রাচীনতম ও অন্যতম প্রধান প্রকৌশলবিদ্যা।

**প্রধান ৫টি শাখা ও ক্ষেত্রসমূহ:**
1. 🏢 **Structural Engineering**: বহুতল ভবন, দীর্ঘ স্প্যান ব্রিজ, ফ্লাইওভার, স্টেডিয়াম ও টাওয়ারের স্থায়িত্ব এবং ভূমিকম্প সহনশীল ডিজাইন।
2. 🌍 **Geotechnical Engineering**: মাটির বৈশিষ্ট্য, গভীর পাইল ভিত্তি (Deep Foundation) এবং রিটেইনিং ওয়াল ডিজাইন।
3. 🛣️ **Transportation Engineering**: আধুনিক এক্সপ্রেসওয়ে, রেলপথ, এয়ারপোর্ট ও ট্রাফিক ম্যানেজমেন্ট।
4. 💧 **Water Resources Engineering**: নদীশাসন, বন্যা নিয়ন্ত্রণ বাঁধ, ক্যানাল ও সেচ প্রকল্প।
5. 🌿 **Environmental Engineering**: সুপেয় পানি শোধন, বর্জ্য ব্যবস্থাপনা ও পরিবেশ দূষণ নিয়ন্ত্রণ।`;
  }

  // Membership & Registration
  if (
    lower.includes("member") ||
    lower.includes("মেম্বার") ||
    lower.includes("ভর্তি") ||
    lower.includes("join") ||
    lower.includes("যুক্ত") ||
    lower.includes("রেজিস্ট্রেশন")
  ) {
    return `**HSTU Civil Engineering Club-এর মেম্বারশিপ নেওয়ার সহজ ধাপসমূহ:**

1. 📝 **আবেদন ফরম পূরণ**: প্রতি সেমিস্টার বা শিক্ষাবর্ষের শুরুতে ক্লাবের অফিসিয়াল ওয়েবসাইট ও ডিপার্টমেন্ট নোটিউট বোর্ডের মাধ্যমে মেম্বারশিপ রিক্রুটমেন্ট ফরম উন্মুক্ত করা হয়।
2. 🎓 **যোগ্যতা**: হাবিপ্রবির সিভিল ইঞ্জিনিয়ারিং বিভাগের ১ম থেকে ৪র্থ বর্ষের যেকোনো নিয়মিত শিক্ষার্থী ক্লাবের সদস্য হতে পারবেন।
3. 💳 **নিবন্ধন ফি জমা**: নির্ধারিত নামমাত্র সদস্য ফি ক্লাবের ট্রেজারার বা মনোনীত প্রতিনিধির কাছে জমা দিয়ে রিসিট সংগ্রহ করতে হবে।
4. 🆔 **মেম্বার আইডি সংগ্রহ**: নিবন্ধন সম্পন্ন হলে অফিসিয়াল মেম্বারশিপ কার্ড প্রদান করা হবে এবং ক্লাবের ওয়ার্কশপ, সেমিনার ও ইভেন্টে অগ্রাধিকার পাওয়া যাবে।`;
  }

  // Club Activities & Works
  if (
    lower.includes("club") ||
    lower.includes("ক্লাব") ||
    lower.includes("কাজ") ||
    lower.includes("activities")
  ) {
    return `**HSTU Civil Engineering Club মূলত শিক্ষার্থীদের পেশাগত ও স্কিল ডেভেলপমেন্টের জন্য কাজ করে:**

- 💻 **সফটওয়্যার ট্রেনিং ও ওয়ার্কশপ**: AutoCAD, ETABS, Revit, STAAD.Pro, SAFE, Civil 3D ইত্যাদির প্র্যাকটিক্যাল হ্যান্ডস-অন সেশন।
- 🏗️ **ইন্ডাস্ট্রিয়াল সাইট ভিজিট**: মেগা প্রজেক্ট (যেমন- ব্রিজ, ফ্লাইওভার, ওয়াটার ট্রিটমেন্ট প্ল্যান্ট ও মেগা কনস্ট্রাকশন সাইট) সরাসরি পরিদর্শন।
- 🏆 **প্রতিযোগিতা আয়োজন**: CAD Design Battle, Bridge Making Competition, Civil Olympiad ও পোস্টার প্রেজেন্টেশন।
- 📚 **একাডেমিক সেমিনার ও নেটওয়ার্কিং**: শীর্ষস্থানীয় ইঞ্জিনিয়ার, গবেষক ও অ্যালামনাইদের সাথে ক্যারিয়ার গাইডলাইন সেশন।
- 🎉 **সাংস্কৃতিক ও স্পোর্টস ইভেন্ট**: ফ্রেশার্স রিসেপশন, বিদায় সংবর্ধনা ও বার্ষিক স্পোর্টস টুর্নামেন্ট।`;
  }

  // Match against database FAQs if any
  const words = message.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  let bestMatch: any = null;
  let highestScore = 0;

  for (const item of faqs) {
    const combined = `${item.question || ""} ${item.answer || ""} ${item.category || ""}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (combined.includes(w)) score++;
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore > 0) {
    return `**${bestMatch.question}**\n\n${bestMatch.answer}\n\n*(তথ্যসূত্র: সিভিল ইঞ্জিনিয়ারিং ক্লাব FAQ)*`;
  }

  return `আমি **Engr. Kuchu Puchu**! তোমার প্রশ্নটি পেয়েছি। সিভিল ইঞ্জিনিয়ারিংয়ের যেকোনো বিষয় (স্ট্রাকচার, জিওটেক, হাইওয়ে, ফ্লুইড, এনভায়রনমেন্ট, এস্টিমেশন) বা ক্লাবের মেম্বারশিপ ও কার্যক্রম সংক্রান্ত যেকোনো প্রশ্ন বিস্তারিত লিখে জানাও, আমি সঠিকভাবে ব্যাখ্যা করে দেব!`;
}

// 5. Safe Promise Timeout Wrapper
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage = "Request timed out"): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ]);
}

export async function POST(req: Request) {
  try {
    // 1. IP extraction & Anti-DDoS Rate Limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "client-local";
    if (isRateLimited(ip)) {
      return Response.json(
        { error: "খুব ঘনঘন অনুরোধ পাঠানো হচ্ছে। অনুগ্রহ করে ৩০ সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন।" },
        { status: 429, headers: { "Retry-After": "30" } }
      );
    }

    // 2. Request body parsing and sanitization
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON format." }, { status: 400 });
    }

    const message = sanitizeUserMessage(body?.message);
    if (!message) {
      return Response.json(
        { error: "বার্তাটি সঠিক নয় অথবা ৫০০ অক্ষরের বেশি। অনুগ্রহ করে সংক্ষিপ্ত করে লিখুন।" },
        { status: 400 }
      );
    }

    // 3. Fetch FAQs safely
    let faqs: any[] = [];
    try {
      faqs = (await withTimeout(getFaqs(), 3000)) || [];
    } catch {
      faqs = [];
    }

    const defaultClubFaqs = [
      {
        question: "HSTU Civil Engineering Club কী?",
        answer: "HSTU Civil Engineering Club হলো হাজী মোহাম্মদ দানেশ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের (HSTU) সিভিল ইঞ্জিনিয়ারিং বিভাগের শিক্ষার্থীদের একটি অন্যতম প্রধান অ্যাকাডেমিক ও কো-কারিকুলার প্ল্যাটফর্ম।",
        category: "About",
      },
      {
        question: "ক্লাবের মেম্বারশিপ কীভাবে নেওয়া যায়?",
        answer: "সেমিস্টার শুরুতে ক্লাবের অফিসিয়াল ওয়েবসাইট বা সোশ্যাল মিডিয়া পেজে মেম্বারশিপ রেজিস্ট্রেশন ফর্ম উন্মুক্ত করা হয়। সিভিল ইঞ্জিনিয়ারিং বিভাগের যেকোনো নিয়মিত শিক্ষার্থী ফর্ম পূরণ করে মেম্বার হতে পারেন।",
        category: "Membership",
      },
      {
        question: "ক্লাবের প্রধান কার্যক্রম কী কী?",
        answer: "ক্লাব নিয়মিত টেকনিক্যাল ওয়ার্কশপ (যেমন AutoCAD, ETABS, GIS), জাতীয় সিভিল ফেস্ট, সেমিনার, ফিল্ড ভিজিট, ক্যারিয়ার গাইডলাইন সেশন এবং বার্ষিক প্রকাশনা আয়োজন করে থাকে।",
        category: "Activities",
      },
      {
        question: "সিভিল ইঞ্জিনিয়ারিং ক্লাবের সাথে কীভাবে যোগাযোগ করব?",
        answer: "ক্লাবের অফিসিয়াল ফেসবুক পেজ (CE Club HSTU), ডিপার্টমেন্টাল অফিস অথবা ওয়েবসাইট কন্টাক্ট ফর্মের মাধ্যমে যেকোনো প্রশ্নের জন্য যোগাযোগ করা যাবে।",
        category: "Contact",
      },
    ];

    const context = {
      faqs: (faqs && faqs.length > 0 ? faqs : defaultClubFaqs).map((f: any) =>
        stripSensitive({
          question: f.question || f.title,
          answer: f.answer || f.description,
          category: f.category,
        })
      ),
    };

    const systemInstruction = `
তোমার নাম Engr. Kuchu Puchu। তুমি HSTU Civil Engineering Club এর অফিসিয়াল স্মার্ট, বিনম্র ও সহায়তাকারী AI অ্যাসিস্ট্যান্ট।

তোমার ব্যক্তিত্ব ও জ্ঞান:
১. তুমি সিভিল ইঞ্জিনিয়ারিংয়ের সকল শাখা (Geotechnical, Structural, Transportation, Environmental, Water Resources, Materials/Concrete, Surveying, Estimation, Software), সাধারণ বিজ্ঞান, গণিত ও শিক্ষামূলক প্রশ্নের অত্যন্ত নির্ভরযোগ্য ও প্রাঞ্জল উত্তর দেবে।
২. ওয়েবসাইট কে বানিয়েছে বা ডেভেলপার কে এই প্রশ্ন এলে সবসময় স্পষ্টভাবে বলবে:
   - নাম: SHAHJALAL AHMED SIFAT
   - Facebook: https://www.facebook.com/sifat8/
   - LinkedIn: https://www.linkedin.com/in/shahjalal-sifat/
   - Instagram: https://www.instagram.com/shahjalal_sifat/
   - Email: mdshahjalalahmedsifat47@gmail.com
   - সকল লিংক: https://linktr.ee/mdshahjalalahmedsifat47
৩. ব্যবহারকারী যে ভাষায় প্রশ্ন করবে (বাংলা, ইংরেজি, বা বাংলিশ যেমন "geo tech ki", "kemon acho"), সেই ভাষায় সহজবোধ্য ও আকর্ষণীয়ভাবে উত্তর দেবে। কোনো ক্ষতিকর, বেআইনি বা পলিসি বহির্ভূত তথ্য দেবে না।

ক্লাবের FAQ ডেটা:
${JSON.stringify(context)}
`;

    const cleanKey = (key?: string) => (key ? key.replace(/^["']|["']$/g, "").trim() : "");

    const rawGroqKey = cleanKey(
      process.env.GROQ_API_KEY ||
      process.env.GROQ_KEY ||
      process.env.GROQ_APIKEY ||
      process.env.NEXT_PUBLIC_GROQ_API_KEY
    );

    const rawOpenRouterKey = cleanKey(
      process.env.OPENROUTER_API_KEY ||
      process.env.OPENROUTER_KEY ||
      process.env.OPEN_ROUTER_API_KEY
    );

    const openRouterKey = rawOpenRouterKey || (rawGroqKey.startsWith("sk-or-") ? rawGroqKey : "");
    const groqKey = rawGroqKey.startsWith("sk-or-") ? "" : rawGroqKey;

    const geminiKey = cleanKey(
      process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY2 ||
      process.env.GEMINI_KEY ||
      process.env.GOOGLE_API_KEY
    );

    let replyText: string | null = null;

    // PROVIDER 1: Google Gemini API (Strictly server-side, Rate & Quota guarded)
    if (geminiKey && !replyText) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const candidateModels = [
          "gemini-2.5-flash",
          "gemini-2.5-flash-lite",
          "gemini-2.0-flash",
        ];

        for (const model of candidateModels) {
          try {
            const apiCall = ai.models.generateContent({
              model: model,
              contents: message,
              config: {
                systemInstruction,
                maxOutputTokens: 800,
                temperature: 0.5,
              },
            });

            // 8-second strict timeout to prevent stalled sockets or socket flooding
            const response = await withTimeout(apiCall, 8000, `Gemini ${model} timeout`);
            if (response && response.text && response.text.trim().length > 0) {
              replyText = response.text.trim();
              break;
            }
          } catch (modelErr: any) {
            // If quota is exhausted or key error, fail softly without looping
            console.warn(`[Safe AI Guard] Gemini ${model} note:`, modelErr?.status || modelErr?.message || "Unavailable");
          }
        }
      } catch (geminiErr: any) {
        console.warn("[Safe AI Guard] Gemini client init note:", geminiErr?.message);
      }
    }

    // PROVIDER 2: Groq (Ultra-fast failover)
    if (groqKey && !replyText) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const groqModels = [
          "llama-3.3-70b-versatile",
          "llama-3.1-8b-instant",
        ];

        for (const model of groqModels) {
          try {
            const completionCall = groq.chat.completions.create({
              model,
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: message },
              ],
              temperature: 0.5,
              max_tokens: 800,
            });

            const completion = await withTimeout(completionCall, 7000, `Groq ${model} timeout`);
            const content = completion.choices?.[0]?.message?.content;
            if (content && content.trim().length > 0) {
              replyText = content.trim();
              break;
            }
          } catch (modelErr: any) {
            console.warn(`[Safe AI Guard] Groq model ${model} note:`, modelErr?.status || modelErr?.message);
          }
        }
      } catch (err: any) {
        console.warn("[Safe AI Guard] Groq init note:", err?.message);
      }
    }

    // PROVIDER 3: OpenRouter fallback
    if (openRouterKey && !replyText) {
      try {
        const orCall = fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ceclubhstu.vercel.app",
            "X-Title": "HSTU Civil Engineering Club AI",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: message },
            ],
            temperature: 0.5,
            max_tokens: 800,
          }),
        });

        const res = await withTimeout(orCall, 7000, "OpenRouter timeout");
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim().length > 0) {
            replyText = content.trim();
          }
        }
      } catch (orErr: any) {
        console.warn("[Safe AI Guard] OpenRouter note:", orErr?.message);
      }
    }

    // PROVIDER 4: Offline Deterministic Academic Knowledge Engine (Never fails, zero API cost/ban risk)
    if (!replyText) {
      replyText = getComprehensiveFallback(message, context.faqs);
    }

    return Response.json({ reply: replyText });
  } catch (err: any) {
    console.error("[Safe AI Guard] Top-level chat API caught error:", err?.message || err);
    return Response.json(
      { reply: "আমি Engr. Kuchu Puchu! এই মুহূর্তে আপনার অনুরোধ প্রসেস করতে কিছুটা সময় লাগছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 200 }
    );
  }
}
