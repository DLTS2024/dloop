/* ==========================================================================
   D LOOP 3D - Interactive JavaScript Engine
   Creality Base Plate FDM 3D Printing Quote Calculator, Slicer & Interactive 3D Viewer
   ========================================================================== */

// --- Application State ---
const state = {
  cart: [],
  unit: 'mm', // 'mm' or 'inch'
  quote: {
    fileName: 'arduinosupport.stl',
    triangleCount: 612,
    volumeCm3: 6.60,
    dimX: 58.00,
    dimY: 73.00,
    dimZ: 8.62,
    material: 'pla',
    layerHeight: 0.20,
    infillPercent: 20,
    color: 'Pitch Black',
    hexColor: '#1A1A1A',
    finish: 'raw',
    quantity: 1,
    unitPrice: 69,
    totalPrice: 69,
    weightGrams: 8.2,
    filamentMeters: 2.7,
    estMinutes: 23,
    estHours: 0.38
  },
  gift: { text: 'D LOOP 3D', photoUrl: '' },
  orderType: 'normal'
};

window.setWizardStep1 = function(material, infillPercent, layerHeight) {
  if (typeof state !== 'undefined' && state.bulkFiles && state.bulkFiles.length > 0) {
    state.bulkFiles.forEach(part => {
      part.material = material;
      part.infillPercent = infillPercent;
      part.layerHeight = layerHeight;
    });
    if (typeof calculateQuote === 'function') calculateQuote();
    if (typeof showToast === 'function') showToast(`Applied: ${material.toUpperCase()}, ${infillPercent}% infill, ${layerHeight}mm layer height!`);
  } else if (typeof state !== 'undefined' && state.quote) {
    state.quote.material = material;
    state.quote.infillPercent = infillPercent;
    state.quote.layerHeight = layerHeight;
    if (typeof showToast === 'function') showToast(`Selected: ${material.toUpperCase()}, ${infillPercent}% infill, ${layerHeight}mm layer height!`);
  }
  const modal = document.getElementById('param-guide-modal-overlay');
  if (modal) modal.classList.remove('open');
};

window.triggerFileUpload = function() {
  const fileInput = document.getElementById('stl-file-input');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
};

// Material rates (Price per gram in ₹ INR + Density g/cm³)
const MATERIAL_RATES = {
  pla: { name: 'PLA (Standard)', ratePerGram: 1.70, density: 1.24 },
  pla_silk: { name: 'Silk Glossy PLA', ratePerGram: 2.10, density: 1.25 },
  abs: { name: 'Tough ABS Pro', ratePerGram: 1.90, density: 1.04 },
  petg: { name: 'PETG Durable', ratePerGram: 1.80, density: 1.27 },
  tpu: { name: 'TPU Flexible 95A', ratePerGram: 3.20, density: 1.21 },
  wood: { name: 'Wood Fill PLA', ratePerGram: 2.50, density: 1.28 }
};

// Creality High-Speed Printer Profiles (Print Speed mm/s & Volumetric Flow Rate mm³/s)
const CREALITY_SPECS = {
  pla: { name: 'Creality High-Speed PLA', printSpeed: 250, flowRate: 18.5, temp: 210, bedTemp: 60 },
  pla_silk: { name: 'Creality Silk PLA', printSpeed: 200, flowRate: 16.0, temp: 215, bedTemp: 60 },
  abs: { name: 'Creality Tough ABS Pro', printSpeed: 220, flowRate: 18.0, temp: 245, bedTemp: 100 },
  petg: { name: 'Creality PETG Pro', printSpeed: 180, flowRate: 15.0, temp: 235, bedTemp: 75 },
  tpu: { name: 'Creality TPU 95A Elastic', printSpeed: 60, flowRate: 8.0, temp: 220, bedTemp: 50 },
  wood: { name: 'Creality Wood Fill', printSpeed: 160, flowRate: 14.0, temp: 210, bedTemp: 60 }
};

// Layer height speed multipliers
const LAYER_HEIGHT_FACTORS = {
  0.12: 1.45, // High detail, slower
  0.20: 1.00, // Standard balance
  0.28: 0.75  // Fast draft
};

// --- Pre-Printed Products Catalog Data (With 1 to 6 Images, SKU, Specs & Warranty) ---
const PREPRINTED_PRODUCTS = [
  {
    id: 'prod-1879347',
    sku: '1879347',
    name: 'Flexi Octopus Magic Green 1 Pcs',
    category: '3D Printed Toys',
    price: 224,
    mrp: 349,
    stock: 15,
    rating: '4.9',
    reviews: 18,
    tag: 'Bestseller',
    tagClass: 'pink',
    desc: 'The Flexi Octopus in Magic Green is a delightful and flexible toy that brings endless fun and amusement. Shaped like a charming octopus, this innovative creation is not only visually appealing but also highly interactive. Crafted with pliable materials, the Flexi Octopus can be twisted, turned, and bent into various shapes, providing a tactile and entertaining experience.',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'Pliable and flexible materials',
      'Magic Green, provides vibrancy and visual appeal',
      'Octopus-shaped flexible print-in-place joints',
      'Stress relief tactile toy'
    ],
    specs: {
      'Material': 'Silk Dual-Color PLA (1.75mm)',
      'Layer Height': '0.16mm High Detail',
      'Infill Density': '20% Gyroid',
      'Dimensions': '110 × 110 × 42 mm',
      'Weight': '42 grams',
      'Print Technology': '100% FDM Print-in-Place',
      'Country of Origin': 'India (D Loop 3D Farm)'
    },
    warranty: '15 Days Replacement Warranty Against Manufacturing Defect. Tested and verified for smooth joint movement before shipment.',
    packageIncludes: '1x Flexi Octopus Magic Green 1 Pcs'
  },
  {
    id: 'prod-1879351',
    sku: '1879351',
    name: 'Flexi Octopus Magic Red 1 Pcs',
    category: '3D Printed Toys',
    price: 235,
    mrp: 360,
    stock: 12,
    rating: '5.0',
    reviews: 24,
    tag: 'Trending',
    tagClass: 'pink',
    desc: 'Vibrant dual-color Magic Red & Blue flexible octopus figurine. Articulated tentacles twist and wiggle smoothly right off the print bed with zero assembly.',
    images: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'Dual-tone Magic Red metallic gloss',
      'Smooth print-in-place ball sockets',
      'Durable drop-safe PLA silk material'
    ],
    specs: {
      'Material': 'Silk Metallic PLA',
      'Layer Height': '0.16mm Precision',
      'Infill Density': '20% Infill',
      'Dimensions': '110 × 110 × 42 mm',
      'Weight': '44 grams',
      'Country of Origin': 'India'
    },
    warranty: '15 Days Replacement Warranty Against Defects.',
    packageIncludes: '1x Flexi Octopus Magic Red 1 Pcs'
  },
  {
    id: 'prod-1879358',
    sku: '1879358',
    name: 'Flexi Octopus Silk Blue 1 Pcs',
    category: '3D Printed Toys',
    price: 224,
    mrp: 340,
    stock: 18,
    rating: '4.8',
    reviews: 14,
    tag: 'Popular',
    tagClass: '',
    desc: 'Deep ocean silk blue articulated flexible octopus. Smooth, tactile stress-relief companion for desks, workstations, and creative gifts.',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'Silk glossy royal blue finish',
      'Ultra smooth joint movement',
      '100% biodegradable PLA filament'
    ],
    specs: {
      'Material': 'Silk Blue PLA (1.75mm)',
      'Layer Height': '0.20mm Standard',
      'Weight': '40 grams',
      'Country of Origin': 'India'
    },
    warranty: '15 Days Replacement Warranty Against Defects.',
    packageIncludes: '1x Flexi Octopus Silk Blue 1 Pcs'
  },
  {
    id: 'prod-1879363',
    sku: '1879363',
    name: 'Flexi Turtle Mobile Stand Silk green 1 Pcs',
    category: 'Mobile & Desk Stands',
    price: 448,
    mrp: 599,
    stock: 8,
    rating: '4.9',
    reviews: 31,
    tag: 'Functional Art',
    tagClass: 'pink',
    desc: 'Dual-purpose articulated turtle companion and sturdy mobile phone stand. Holds all smartphone models in horizontal and vertical orientations securely.',
    images: [
      'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'Universal smartphone stand (Horizontal & Vertical)',
      'Articulated flippers and head',
      'Weighted base for stable anti-tip phone holding'
    ],
    specs: {
      'Material': 'Tough PETG / Silk PLA Blend',
      'Dimensions': '130 × 95 × 55 mm',
      'Weight': '78 grams',
      'Compatibility': 'All Android & iPhone Devices'
    },
    warranty: '15 Days Replacement Warranty Against Sealed Product Defects.',
    packageIncludes: '1x Flexi Turtle Mobile Stand Silk Green'
  },
  {
    id: 'prod-1879372',
    sku: '1879372',
    name: 'Infinity Cube Fidget Toy For Stress Relief Magic Green 1 Pcs',
    category: 'Fidget & Art',
    price: 235,
    mrp: 350,
    stock: 0,
    rating: '4.8',
    reviews: 42,
    tag: 'Out of Stock',
    tagClass: '',
    desc: 'Endless folding infinity cube fidget toy. Folds continuously inside out with tight-tolerance print-in-place hinges for satisfying focus and tactile anxiety relief.',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'Seamless multi-directional hinge action',
      'Pocket-friendly EDC desk toy',
      'Zero assembly required'
    ],
    specs: {
      'Material': 'PLA Tough High-Impact',
      'Dimensions': '40 × 40 × 40 mm (Closed)',
      'Weight': '35 grams',
      'Country of Origin': 'India'
    },
    warranty: '15 Days Replacement Warranty Against Defects.',
    packageIncludes: '1x Infinity Cube Fidget Toy Magic Green'
  },
  {
    id: 'prod-1879377',
    sku: '1879377',
    name: 'Infinity Cube Fidget Toy For Stress Relief Magic Red 1 Pcs',
    category: 'Fidget & Art',
    price: 235,
    mrp: 350,
    stock: 0,
    rating: '4.9',
    reviews: 38,
    tag: 'Out of Stock',
    tagClass: '',
    desc: 'Metallic Silk Red infinity folding cube. Precision 0.16mm layer lines and reinforced interior core for long-lasting fidgeting satisfaction.',
    images: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'Magic Red silk finish with metallic sheen',
      'Continuous flip mechanism',
      'Reinforced hinge durability'
    ],
    specs: {
      'Material': 'PLA Silk Pro',
      'Dimensions': '40 × 40 × 40 mm',
      'Weight': '35 grams'
    },
    warranty: '15 Days Replacement Warranty.',
    packageIncludes: '1x Infinity Cube Fidget Toy Magic Red'
  },
  {
    id: 'prod-1879381',
    sku: '1879381',
    name: 'Marble Flower Vase For Home Decor 1 Pcs',
    category: 'Home Decor',
    price: 660,
    mrp: 990,
    stock: 6,
    rating: '5.0',
    reviews: 19,
    tag: 'Premium Decor',
    tagClass: 'pink',
    desc: 'Geometric fluted spiral modern flower vase 3D printed with marble speckled filament. Waterproof interior coating suitable for dry and fresh floral arrangements.',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'Authentic marble-speckled aesthetic texture',
      'Water-sealed vase interior',
      'Contemporary parametric fluted design'
    ],
    specs: {
      'Material': 'Marble Composite PLA (Waterproofed)',
      'Dimensions': '90 × 90 × 200 mm',
      'Weight': '165 grams',
      'Care': 'Hand wash with cold water'
    },
    warranty: '15 Days Replacement Warranty Against Defects.',
    packageIncludes: '1x Marble Flower Vase 1 Pcs'
  },
  {
    id: 'prod-1879301',
    sku: '1879301',
    name: 'Articulated Crystal Dragon (Dual-Color Silk)',
    category: '3D Printed Toys',
    price: 699,
    mrp: 999,
    stock: 14,
    rating: '4.9',
    reviews: 56,
    tag: 'Bestseller',
    tagClass: 'pink',
    desc: 'Spectacular 45cm long articulated crystal dragon with multi-faceted gem spines. Fully flexible spine, tail, and legs printed print-in-place in mesmerizing silk gradient PLA.',
    images: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      '45cm Length multi-segmented articulated spine',
      'Crystal faceted scales catch light dynamically',
      'High strength joint engineering'
    ],
    specs: {
      'Material': 'Dual-Color Silk Chameleon PLA',
      'Length': '450 mm',
      'Weight': '140 grams',
      'Print Time': '14.5 Hours on Creality K1'
    },
    warranty: '15 Days Replacement Warranty Against Broken Joints.',
    packageIncludes: '1x Articulated Crystal Dragon (45cm)'
  }
];

function getReadyProducts() {
  const stock = loadAdminStock();
  if (stock.ready && Array.isArray(stock.ready) && stock.ready.length > 0) {
    return stock.ready;
  }
  return PREPRINTED_PRODUCTS;
}
window.getReadyProducts = getReadyProducts;

function getReadyProductById(id) {
  const products = getReadyProducts();
  return products.find(p => p.id === id || p.sku === id) || null;
}
window.getReadyProductById = getReadyProductById;

const FILAMENT_PRODUCTS = [
  {
    id: 'fil-pla-std',
    name: 'Numakers High-Speed PLA Filament (1.75mm, 1kg)',
    category: 'pla',
    price: 810,
    rating: '4.9',
    reviews: 142,
    tag: 'Numakers High Speed 500mm/s',
    tagClass: 'badge-primary',
    desc: 'Official Numakers high-speed PLA spool for FDM 3D printers. Low warping, easy printing, excellent layer adhesion & ultra-vibrant colors.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/dragon.png',
    colors: [
      { name: 'Pitch Black', hex: '#121212', stock: 14 },
      { name: 'Ivory White', hex: '#FDFBF7', stock: 8 },
      { name: 'Bone White', hex: '#F4EFEB', stock: 6 },
      { name: 'Pure White', hex: '#FFFFFF', stock: 25 },
      { name: 'Light Beige', hex: '#E8D8C8', stock: 5 },
      { name: 'Dark Gray', hex: '#4A4E51', stock: 11 },
      { name: 'Nuclear Red', hex: '#E63946', stock: 9 },
      { name: 'Fluorescent Orange', hex: '#FF6B35', stock: 4 },
      { name: 'Terracotta Orange', hex: '#C85A32', stock: 3 },
      { name: 'Bahama Yellow', hex: '#F7B801', stock: 7 },
      { name: 'Fluorescent Yellow', hex: '#FFE600', stock: 12 },
      { name: 'Fluorescent Green', hex: '#39FF14', stock: 5 },
      { name: 'Forest Green', hex: '#1B4332', stock: 8 },
      { name: 'Water Blue', hex: '#00B4D8', stock: 10 },
      { name: 'Light Blue', hex: '#90E0EF', stock: 15 },
      { name: 'Royal Blue', hex: '#0077B6', stock: 18 },
      { name: 'Thanos Purple', hex: '#7209B7', stock: 6 },
      { name: 'Chocolate Brown', hex: '#4A2E16', stock: 4 },
      { name: 'Rust Copper', hex: '#B85B35', stock: 3 },
      { name: 'Apricot Skin', hex: '#FFCDB2', stock: 5 },
      { name: 'Magenta', hex: '#D81B60', stock: 7 },
      { name: 'Cool (Lithophane) White', hex: '#EAF2F8', stock: 20 }
    ],
    specs: ['Brand: Numakers', 'Temp: 190-220°C', 'Bed: 50-60°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '60 MPa',
      heatDeflection: '55°C',
      nozzle: 'Standard Brass / Hardened Steel (0.4mm)',
      speed: '50 - 500 mm/s',
      drying: '50°C for 4 hours if exposed to humidity',
      idealFor: 'General prototyping, figurines, organic models, everyday prints'
    }
  },
  {
    id: 'fil-pla-matte',
    name: 'Numakers PLA Matte Filament (1.75mm, 1kg)',
    category: 'pla-matte',
    price: 870,
    rating: '4.8',
    reviews: 89,
    tag: 'Numakers Anti-Glare Finish',
    tagClass: 'badge-accent',
    desc: 'Official Numakers satin-smooth matte surface finish that effectively masks print layer lines. Perfect for architectural models and glare-free prototypes.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/keychains.png',
    colors: [
      { name: 'Matte Black', hex: '#181818', stock: 15 },
      { name: 'Matte White', hex: '#F5F5F5', stock: 12 }
    ],
    specs: ['Brand: Numakers', 'Temp: 200-220°C', 'Bed: 50-60°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '55 MPa',
      heatDeflection: '53°C',
      nozzle: 'Standard Brass (0.4mm)',
      speed: '40 - 300 mm/s',
      drying: '50°C for 4 hours',
      idealFor: 'Architectural models, busts, premium display pieces, low-glare covers'
    }
  },
  {
    id: 'fil-petg-std',
    name: 'Numakers High Toughness PETG Filament (1.75mm, 1kg)',
    category: 'petg',
    price: 810,
    rating: '4.9',
    reviews: 116,
    tag: 'Numakers Water & Chemical Proof',
    tagClass: 'badge-primary',
    desc: 'Official Numakers high strength PETG. Weather resistant, high impact resistance, and virtually odorless with exceptional layer cohesion.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/dragon.png',
    colors: [
      { name: 'Jet Black', hex: '#0F0F11', stock: 10 },
      { name: 'Translucent Clear', hex: 'rgba(225, 240, 255, 0.75)', stock: 16 },
      { name: 'Pure White', hex: '#FFFFFF', stock: 14 },
      { name: 'Nuclear Red', hex: '#D62828', stock: 8 },
      { name: 'Outrageous Orange', hex: '#FF7B00', stock: 5 },
      { name: 'Army Green', hex: '#4B5320', stock: 6 },
      { name: 'Grass Green', hex: '#2A9D8F', stock: 7 },
      { name: 'Light Blue', hex: '#48CAE4', stock: 11 },
      { name: 'Royal Blue', hex: '#023E8A', stock: 13 }
    ],
    specs: ['Brand: Numakers', 'Temp: 230-250°C', 'Bed: 70-80°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '50 MPa',
      heatDeflection: '70°C',
      nozzle: 'Standard Brass / Hardened Steel',
      speed: '40 - 250 mm/s',
      drying: '65°C for 4 hours',
      idealFor: 'Waterproof containers, outdoor fixtures, mechanical brackets, snap-fit joints'
    }
  },
  {
    id: 'fil-petg-cf',
    name: 'Numakers PETG-CF Carbon Fiber Filament (1.75mm, 1kg)',
    category: 'petg-cf',
    price: 1400,
    rating: '5.0',
    reviews: 47,
    tag: 'Numakers 15% Carbon Fiber',
    tagClass: 'badge-warning',
    desc: 'Official Numakers reinforced with 15% high-modulus carbon fibers. Provides extreme structural rigidity, minimal warping, and a dark carbon texture finish.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/filaments.png',
    colors: [
      { name: 'Carbon Fiber Black', hex: '#26282A', stock: 8 }
    ],
    specs: ['Brand: Numakers', 'Temp: 240-260°C', 'Bed: 70-80°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '78 MPa',
      heatDeflection: '80°C',
      nozzle: 'Hardened Steel or Ruby Nozzle (0.4mm+ required)',
      speed: '30 - 200 mm/s',
      drying: '65°C for 5 hours',
      idealFor: 'Drone frames, robotics components, mechanical jigs, high-rigidity parts'
    }
  },
  {
    id: 'fil-asa-std',
    name: 'Numakers Weatherproof ASA Filament (1.75mm, 1kg)',
    category: 'asa',
    price: 930,
    rating: '4.8',
    reviews: 62,
    tag: 'Numakers UV & Weather Resistant',
    tagClass: 'badge-accent',
    desc: 'Official Numakers ultimate outdoor FDM material. Exceptional resistance to UV radiation, harsh sunlight, rain, and heat without color fading.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/keychains.png',
    colors: [
      { name: 'Pitch Black', hex: '#1A1A1C', stock: 9 },
      { name: 'Pure White', hex: '#FAFAFA', stock: 11 },
      { name: 'Light Gray', hex: '#9E9E9E', stock: 5 },
      { name: 'Apple Red', hex: '#E63946', stock: 4 },
      { name: 'Burnt Orange', hex: '#D9572B', stock: 3 },
      { name: 'Lemon Yellow', hex: '#F4D03F', stock: 6 },
      { name: 'Grass Green', hex: '#38B000', stock: 5 },
      { name: 'Royal Blue', hex: '#1D3557', stock: 7 }
    ],
    specs: ['Brand: Numakers', 'Temp: 240-260°C', 'Bed: 90-100°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '45 MPa',
      heatDeflection: '95°C',
      nozzle: 'Standard Brass / Hardened Steel',
      speed: '40 - 150 mm/s',
      drying: '70°C for 4 hours',
      idealFor: 'Automotive exterior parts, garden equipment, sensor housings, solar mounts'
    }
  },
  {
    id: 'fil-pa12-cf',
    name: 'Numakers PA12-CF Nylon Carbon Fiber (1.75mm, 1kg)',
    category: 'pa12-cf',
    price: 4500,
    rating: '5.0',
    reviews: 31,
    tag: 'Numakers Aerospace 150°C',
    tagClass: 'badge-warning',
    desc: 'Official Numakers professional engineering grade Nylon 12 with carbon fibers. Continuous heat resistance up to 150°C, ultra-low moisture absorption, and extreme tensile strength.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/filaments.png',
    colors: [
      { name: 'Industrial Matte Black', hex: '#141416', stock: 4 }
    ],
    specs: ['Brand: Numakers', 'Temp: 270-300°C', 'Bed: 80-100°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '115 MPa',
      heatDeflection: '150°C',
      nozzle: 'Hardened Steel / Carbide Nozzle (0.4mm+)',
      speed: '30 - 120 mm/s',
      drying: '80°C for 8 hours (Dry Box Recommended)',
      idealFor: 'Engine bay components, structural aerospace parts, industrial tooling, heavy duty gears'
    }
  },
  {
    id: 'fil-pa12-std',
    name: 'Numakers PA12 Pure Nylon Filament (1.75mm, 1kg)',
    category: 'pa12',
    price: 3800,
    rating: '4.9',
    reviews: 24,
    tag: 'Numakers Self Lubricating Nylon',
    tagClass: 'badge-primary',
    desc: 'Official Numakers pure polyamide 12 filament offering unmatched tough flexibility, chemical resistance against oils & solvents, and ultra-low friction.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/dragon.png',
    colors: [
      { name: 'Natural Nylon Black', hex: '#1F1F21', stock: 5 }
    ],
    specs: ['Brand: Numakers', 'Temp: 250-270°C', 'Bed: 80-100°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '65 MPa',
      heatDeflection: '110°C',
      nozzle: 'Standard Brass / Hardened Steel',
      speed: '30 - 100 mm/s',
      drying: '75°C for 6 hours',
      idealFor: 'Precision gears, sliding bearings, snap-fit hinges, fuel-resistant tanks'
    }
  },
  {
    id: 'fil-pla-silk',
    name: 'Numakers Silk PLA Ultra Gloss (1.75mm, 1kg)',
    category: 'silk',
    price: 985,
    rating: '4.9',
    reviews: 95,
    tag: 'Numakers Metallic Sheen',
    tagClass: 'badge-pink',
    desc: 'Official Numakers special gloss formulation to yield a silky, mirror-like metallic sheen. Transforms 3D models into eye-catching jewelry, trophies, and vases.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/lithophane.png',
    colors: [
      { name: 'Enchanted Gold', hex: '#FFD700', stock: 12 },
      { name: 'Purple Silk', hex: '#9D4EDD', stock: 8 },
      { name: 'Metallic Copper', hex: '#D4AF37', stock: 6 }
    ],
    specs: ['Brand: Numakers', 'Temp: 200-220°C', 'Bed: 50-60°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '52 MPa',
      heatDeflection: '52°C',
      nozzle: 'Standard Brass (0.4mm)',
      speed: '40 - 250 mm/s',
      drying: '50°C for 4 hours',
      idealFor: 'Cosplay items, vases, trophies, artistic statues, gift products'
    }
  },
  {
    id: 'fil-pla-special',
    name: 'Numakers PLA Special & Dual Color Gradient (1.75mm, 1kg)',
    category: 'special',
    price: 1400,
    rating: '5.0',
    reviews: 53,
    tag: 'Numakers Special & Gradient',
    tagClass: 'badge-warning',
    desc: 'Official Numakers aesthetic formulations. Marble White simulates real granite stone finish, while Blue Shift features smooth color-changing gradient transitions.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/dragon.png',
    colors: [
      { name: 'Marble White', hex: '#E2E2E0', stock: 7 },
      { name: 'Blue Shift Gradient', hex: 'linear-gradient(135deg, #0077B6, #90E0EF)', stock: 4 }
    ],
    specs: ['Brand: Numakers', 'Temp: 200-220°C', 'Bed: 50-60°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '54 MPa',
      heatDeflection: '54°C',
      nozzle: 'Hardened Steel (0.4mm+ for Marble)',
      speed: '40 - 200 mm/s',
      drying: '50°C for 4 hours',
      idealFor: 'Artistic sculptures, display models, decorative lamps, unique gifts'
    }
  },
  {
    id: 'fil-abs-fr',
    name: 'Numakers ABS-FR Flame Retardant V0 (1.75mm, 1kg)',
    category: 'abs-fr',
    price: 1300,
    rating: '4.8',
    reviews: 38,
    tag: 'Numakers UL94-V0 Fire Retardant',
    tagClass: 'badge-accent',
    desc: 'Official Numakers UL94 V-0 flame retardant ABS formulation. Self-extinguishes within 10 seconds of flame exposure. Essential for electrical enclosures & drone safety.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/keychains.png',
    colors: [
      { name: 'Off-White Natural', hex: '#F4F4EE', stock: 6 }
    ],
    specs: ['Brand: Numakers', 'Temp: 240-260°C', 'Bed: 90-110°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '42 MPa',
      heatDeflection: '92°C',
      nozzle: 'Standard Brass / Hardened Steel',
      speed: '40 - 150 mm/s',
      drying: '80°C for 4 hours',
      idealFor: 'Battery cases, electric motor housings, power distribution boxes, drone mounts'
    }
  },
  {
    id: 'fil-abs-std',
    name: 'Numakers Tough ABS Pro Filament (1.75mm, 1kg)',
    category: 'abs',
    price: 810,
    rating: '4.8',
    reviews: 77,
    tag: 'Numakers High Impact 95°C',
    tagClass: 'badge-primary',
    desc: 'Official Numakers structural grade ABS for high-temp environments up to 95°C. High impact resistance, acetone vapor smoothing compatible, and high dimensional rigidity.',
    img: 'assets/filaments.png',
    sampleImg: 'assets/filaments.png',
    colors: [
      { name: 'Pitch Black', hex: '#171719', stock: 18 },
      { name: 'Pure White', hex: '#FAFAFA', stock: 14 }
    ],
    specs: ['Brand: Numakers', 'Temp: 240-260°C', 'Bed: 90-110°C', 'Tolerance: ±0.02mm'],
    techDetails: {
      brand: 'Numakers',
      tensile: '48 MPa',
      heatDeflection: '95°C',
      nozzle: 'Standard Brass / Hardened Steel',
      speed: '40 - 180 mm/s',
      drying: '80°C for 4 hours',
      idealFor: 'Functional prototypes, mechanical enclosures, post-processable parts with acetone vapor smoothing'
    }
  }
];

// --- Admin Stock Integration ---
// Reads from admin-managed localStorage (dl3d_stock_v1)
// Seeds admin data from FILAMENT_PRODUCTS defaults if empty or incomplete
const ADMIN_STOCK_KEY = 'dl3d_stock_v1';

function loadAdminStock() {
  try {
    const raw = localStorage.getItem(ADMIN_STOCK_KEY);
    if (!raw) return seedAdminStockFromCatalog(true);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.filaments) || parsed.filaments.length < 20) {
      return seedAdminStockFromCatalog(true);
    }
    return parsed;
  } catch (e) {
    return seedAdminStockFromCatalog(true);
  }
}

function saveAdminStock(stockState) {
  try {
    localStorage.setItem(ADMIN_STOCK_KEY, JSON.stringify(stockState));
  } catch(e) {
    console.warn('LocalStorage quota limit reached, optimizing order payloads...', e);
    try {
      const sanitized = JSON.parse(JSON.stringify(stockState));
      if (sanitized.orders) {
        sanitized.orders.forEach(ord => {
          if (ord.items) {
            ord.items.forEach(it => {
              if (it.fileDataUrl && it.fileDataUrl.length > 20000) {
                it.fileDataUrl = null; // strip heavy binary to keep order record intact
              }
            });
          }
        });
      }
      localStorage.setItem(ADMIN_STOCK_KEY, JSON.stringify(sanitized));
    } catch (err) {
      console.error('Failed to save admin stock:', err);
    }
  }
}

// Generate the complete 52-filament catalog stock state with exact spool numbers from catalog
function generateCatalogStockState() {
  const categoryMap = {
    'pla': 'PLA', 'pla-matte': 'PLA Matte', 'petg': 'PETG', 'petg-cf': 'PETG-CF',
    'asa': 'ASA', 'pa12-cf': 'PA12-CF', 'pa12': 'PA12', 'silk': 'Silk PLA',
    'special': 'PLA Special', 'abs-fr': 'ABS-FR', 'abs': 'ABS'
  };

  const adminFilaments = [];
  FILAMENT_PRODUCTS.forEach(product => {
    const catName = categoryMap[product.category] || product.category.toUpperCase();
    (product.colors || []).forEach(color => {
      adminFilaments.push({
        name: color.name,
        category: catName,
        color: color.hex,
        balance: (color.stock !== undefined ? color.stock : 10) * 1000, // exact spool count in grams (1kg = 1000g)
        price: product.price,
        reorder: 500,
        productId: product.id
      });
    });
  });

  return adminFilaments;
}

// Seed or update admin stock from FILAMENT_PRODUCTS catalog
function seedAdminStockFromCatalog(force = false) {
  const existing = localStorage.getItem(ADMIN_STOCK_KEY);
  let currentState = { filaments: [], customs: [], ready: [], orders: [] };

  if (existing) {
    try {
      currentState = JSON.parse(existing) || currentState;
    } catch(e) {}
  }

  const catalogFilaments = generateCatalogStockState();

  if (force || !currentState.filaments || currentState.filaments.length < 20) {
    currentState.filaments = catalogFilaments;
    currentState.customs = currentState.customs || [];
    currentState.ready = currentState.ready || [];
    currentState.orders = currentState.orders || [];
    saveAdminStock(currentState);
    return currentState;
  }

  return currentState;
}

// Get live stock count for a filament product+color from admin data
function getAdminStockForColor(productId, colorName) {
  const stock = loadAdminStock();
  const product = FILAMENT_PRODUCTS.find(p => p.id === productId);
  if (!product) return 0;

  const categoryMap = {
    'pla': 'PLA', 'pla-matte': 'PLA Matte', 'petg': 'PETG', 'petg-cf': 'PETG-CF',
    'asa': 'ASA', 'pa12-cf': 'PA12-CF', 'pa12': 'PA12', 'silk': 'Silk PLA',
    'special': 'PLA Special', 'abs-fr': 'ABS-FR', 'abs': 'ABS'
  };
  const targetCategory = (categoryMap[product.category] || '').toLowerCase();
  const targetColor = (colorName || '').toLowerCase().trim();

  // Find exact match by productId or (category + color name)
  let match = stock.filaments.find(f => f.productId === productId && (f.name || '').toLowerCase().trim() === targetColor);
  
  if (!match) {
    match = stock.filaments.find(f => {
      const catMatch = (f.category || '').toLowerCase().trim() === targetCategory;
      const nameMatch = (f.name || '').toLowerCase().trim() === targetColor;
      return catMatch && nameMatch;
    });
  }

  if (!match) {
    match = stock.filaments.find(f => (f.name || '').toLowerCase().trim() === targetColor);
  }

  if (!match) {
    // Fallback to default catalog stock if not in admin
    const defaultColor = (product.colors || []).find(c => (c.name || '').toLowerCase().trim() === targetColor);
    return defaultColor ? defaultColor.stock : 0;
  }

  const balance = match.balance || 0;
  return Math.floor(balance / 1000); // Return 1kg spool count
}

// Deduct stock from admin data when an order is placed
function deductAdminStock(productId, colorName, qtySpools) {
  const stock = loadAdminStock();
  const product = FILAMENT_PRODUCTS.find(p => p.id === productId);
  if (!product) return false;

  const categoryMap = {
    'pla': 'PLA', 'pla-matte': 'PLA Matte', 'petg': 'PETG', 'petg-cf': 'PETG-CF',
    'asa': 'ASA', 'pa12-cf': 'PA12-CF', 'pa12': 'PA12', 'silk': 'Silk PLA',
    'special': 'PLA Special', 'abs-fr': 'ABS-FR', 'abs': 'ABS'
  };
  const targetCategory = (categoryMap[product.category] || '').toLowerCase();
  const targetColor = (colorName || '').toLowerCase().trim();

  let match = stock.filaments.find(f => f.productId === productId && (f.name || '').toLowerCase().trim() === targetColor);
  if (!match) {
    match = stock.filaments.find(f => {
      const catMatch = (f.category || '').toLowerCase().trim() === targetCategory;
      const nameMatch = (f.name || '').toLowerCase().trim() === targetColor;
      return catMatch && nameMatch;
    });
  }
  if (!match) {
    match = stock.filaments.find(f => (f.name || '').toLowerCase().trim() === targetColor);
  }

  if (!match) return false;
  const deductGrams = qtySpools * 1000;
  if ((match.balance || 0) < deductGrams) return false;
  match.balance = (match.balance || 0) - deductGrams;
  saveAdminStock(stock);
  return true;
}

// Get live price for a filament product/color from admin data
function getAdminPriceForFilament(productId, colorName) {
  const stock = loadAdminStock();
  const product = FILAMENT_PRODUCTS.find(p => p.id === productId);
  const defaultPrice = product ? product.price : 810;

  if (!stock || !Array.isArray(stock.filaments) || stock.filaments.length === 0) {
    return defaultPrice;
  }

  const categoryMap = {
    'pla': 'PLA', 'pla-matte': 'PLA Matte', 'petg': 'PETG', 'petg-cf': 'PETG-CF',
    'asa': 'ASA', 'pa12-cf': 'PA12-CF', 'pa12': 'PA12', 'silk': 'Silk PLA',
    'special': 'PLA Special', 'abs-fr': 'ABS-FR', 'abs': 'ABS'
  };
  const targetCategory = product ? (categoryMap[product.category] || '').toLowerCase() : '';
  const targetColor = (colorName || '').toLowerCase().trim();

  if (targetColor) {
    let match = stock.filaments.find(f => f.productId === productId && (f.name || '').toLowerCase().trim() === targetColor);
    if (!match && targetCategory) {
      match = stock.filaments.find(f => {
        const catMatch = (f.category || '').toLowerCase().trim() === targetCategory;
        const nameMatch = (f.name || '').toLowerCase().trim() === targetColor;
        return catMatch && nameMatch;
      });
    }
    if (!match) {
      match = stock.filaments.find(f => (f.name || '').toLowerCase().trim() === targetColor);
    }
    if (match && Number(match.price) > 0) return Number(match.price);
  }

  // Fallback: match by product category or productId
  let anyMatch = stock.filaments.find(f => f.productId === productId && Number(f.price) > 0);
  if (!anyMatch && targetCategory) {
    anyMatch = stock.filaments.find(f => (f.category || '').toLowerCase().trim() === targetCategory && Number(f.price) > 0);
  }

  return anyMatch && Number(anyMatch.price) > 0 ? Number(anyMatch.price) : defaultPrice;
}



// --- Three.js Creality 3D Viewport Engine ---
let scene, camera, renderer, modelMesh, gridHelper, axesHelper;
let isMouseDown = false, mouseButton = 0, prevMousePos = { x: 0, y: 0 };
let currentLoadedGeometry = null;

function initThreeJSViewer() {
  const container = document.getElementById('viewer-container');
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x23252b); // Dark metallic OrcaSlicer / Creality Print background

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  resetCameraView();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Studio Lighting setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight1.position.set(50, 80, 50);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x94a3b8, 0.5);
  dirLight2.position.set(-50, -30, -50);
  scene.add(dirLight2);

  // Sparkx Textured PEI Build Plate Sheet (Dark Metallic Plate)
  const bedSize = 120;
  const peiGeo = new THREE.PlaneGeometry(bedSize, bedSize);
  const peiMat = new THREE.MeshStandardMaterial({
    color: 0x2d3038,
    roughness: 0.65,
    metalness: 0.35,
    side: THREE.DoubleSide
  });
  const peiPlate = new THREE.Mesh(peiGeo, peiMat);
  peiPlate.rotation.x = -Math.PI / 2;
  peiPlate.position.y = -0.15;
  scene.add(peiPlate);

  // Creality Grid Lines on PEI Bed
  gridHelper = new THREE.GridHelper(bedSize, 24, 0x64748b, 0x475569);
  gridHelper.position.set(0, 0, 0); // Placed at Y = 0 bed plane
  scene.add(gridHelper);

  // Red (X), Green (Y), Blue (Z) Coordinate Axes Lines
  axesHelper = new THREE.AxesHelper(35);
  axesHelper.position.set(0, 0.1, 0);
  scene.add(axesHelper);

  // PEI Outer Frame
  const borderGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(bedSize, bedSize));
  const borderMat = new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 2 });
  const borderFrame = new THREE.LineSegments(borderGeo, borderMat);
  borderFrame.rotation.x = Math.PI / 2;
  borderFrame.position.y = 0;
  scene.add(borderFrame);

  // Default sample model placed flat on Creality bed
  createSampleModel();

  // Mouse Drag / Pan / Zoom Controls
  container.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseButton = e.button; // 0 = left click (rotate), 2 = right click (pan)
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('mouseup', () => isMouseDown = false);

  container.addEventListener('mousemove', (e) => {
    if (!isMouseDown || !modelMesh) return;
    const deltaX = e.clientX - prevMousePos.x;
    const deltaY = e.clientY - prevMousePos.y;

    if (mouseButton === 0) {
      // Left Drag: Rotate model around Y and X axis
      modelMesh.rotation.y += deltaX * 0.01;
      modelMesh.rotation.x += deltaY * 0.01;
    } else if (mouseButton === 2) {
      // Right Drag: Pan camera
      camera.position.x -= deltaX * 0.1;
      camera.position.y += deltaY * 0.1;
    }

    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  // Mouse Scroll Wheel Zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
    camera.position.multiplyScalar(zoomFactor);
  }, { passive: false });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    if (modelMesh && !isMouseDown) {
      modelMesh.rotation.y += 0.003;
    }
    renderer.render(scene, camera);
  }
  animate();

  setTimeout(resizeViewer, 100);
  window.addEventListener('resize', resizeViewer);
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => resizeViewer());
    observer.observe(container);
  }
}

function resetCameraView() {
  if (!camera) return;
  camera.position.set(30, 25, 45);
  camera.lookAt(0, 8, 0);
}

function resizeViewer() {
  const container = document.getElementById('viewer-container');
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, true);
}

function createSampleModel() {
  if (modelMesh) scene.remove(modelMesh);

  // Default sample geometry: Bracket shape lying flat on bed
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(58, 0);
  shape.lineTo(58, 73);
  shape.lineTo(46, 73);
  shape.lineTo(46, 12);
  shape.lineTo(0, 12);
  shape.closePath();

  const extrudeSettings = { depth: 8.62, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.5, bevelThickness: 0.5 };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  
  // Rotate & Translate so it lies FLAT on Creality bed (Y_min = 0)
  geometry.rotateX(-Math.PI / 2);
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  const centerX = (bbox.max.x + bbox.min.x) / 2;
  const centerZ = (bbox.max.z + bbox.min.z) / 2;
  const minY = bbox.min.y;
  geometry.translate(-centerX, -minY, -centerZ);
  geometry.computeVertexNormals();

  currentLoadedGeometry = geometry;

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x383838), // Dark slate grey like user's screenshot
    roughness: 0.4,
    metalness: 0.2,
    side: THREE.DoubleSide
  });

  modelMesh = new THREE.Mesh(geometry, material);
  modelMesh.position.set(0, 0, 0);
  scene.add(modelMesh);

  resetCameraView();
  resizeViewer();

  // Initialize bulkFiles with sample model
  const samplePart = {
    id: 'sample-arduinosupport',
    fileName: 'arduinosupport.stl',
    geometry: geometry,
    dimX: 58.00,
    dimY: 73.00,
    dimZ: 8.62,
    volumeCm3: 6.60,
    triangleCount: 612,
    material: 'pla',
    color: 'Pitch Black',
    hexColor: '#1A1A1A',
    layerHeight: 0.20,
    infillPercent: 20,
    support: 'auto',
    scale: 1.0,
    qty: 1,
    postSanding: false,
    postPrimer: false,
    postPaint: false
  };
  calculateSinglePart(samplePart);
  state.bulkFiles = [samplePart];
  state.activeBulkIndex = 0;
}

// --- Auto-Orient "Lay Flat" Algorithm ---
function layFlatModel() {
  if (!currentLoadedGeometry || !modelMesh) return;

  const geometry = currentLoadedGeometry.clone();
  geometry.computeBoundingBox();
  let bbox = geometry.boundingBox;

  let dimX = bbox.max.x - bbox.min.x;
  let dimY = bbox.max.y - bbox.min.y;
  let dimZ = bbox.max.z - bbox.min.z;

  // If vertical Y dimension is larger than Z, rotate -90° around X axis to lay flat
  if (dimY > dimZ || dimY > dimX) {
    geometry.rotateX(-Math.PI / 2);
  } else if (dimX > dimY && dimX > dimZ) {
    geometry.rotateZ(Math.PI / 2);
  }

  // Translate bottom (Y_min) to rest flat on top of the build plate bed (Y = 0)
  geometry.computeBoundingBox();
  bbox = geometry.boundingBox;
  const centerX = (bbox.max.x + bbox.min.x) / 2;
  const centerZ = (bbox.max.z + bbox.min.z) / 2;
  const minY = bbox.min.y;
  geometry.translate(-centerX, -minY, -centerZ);
  geometry.computeVertexNormals();

  currentLoadedGeometry = geometry;
  renderParsedSTLMesh(geometry);
  
  // Re-calculate dimensions
  state.quote.dimX = Math.round((bbox.max.x - bbox.min.x) * 100) / 100;
  state.quote.dimY = Math.round((bbox.max.z - bbox.min.z) * 100) / 100;
  state.quote.dimZ = Math.round((bbox.max.y - bbox.min.y) * 100) / 100;

  calculateQuote();
  showToast('Re-oriented model flat on Creality build plate bed!');
}

// --- Dynamic Instant FDM & Creality Print Calculation (Robu / SNH Cloud Pricing Model) ---
function formatPrintTime(mins) {
  if (!mins || mins <= 0) return '0m';
  const days = Math.floor(mins / (24 * 60));
  const hours = Math.floor((mins % (24 * 60)) / 60);
  const minutes = Math.round(mins % 60);
  
  let res = '';
  if (days > 0) res += `${days}d `;
  if (hours > 0) res += `${hours}h `;
  if (minutes > 0 || res === '') res += `${minutes}m`;
  return res.trim();
}

function calculateSinglePart(part) {
  if (!part.material) part.material = 'pla';
  const matInfo = MATERIAL_RATES[part.material] || MATERIAL_RATES.pla;
  const layerHeight = part.layerHeight || 0.20;
  const infillPercent = part.infillPercent || 20;
  const scale = part.scale || 1.0;

  const effectiveDimX = (part.dimX || 58.0) * scale;
  const effectiveDimY = (part.dimY || 73.0) * scale;
  const effectiveDimZ = (part.dimZ || 8.62) * scale;
  const effectiveVolumeCm3 = (part.volumeCm3 || 6.6) * Math.pow(scale, 3);

  // Exact FDM slicing weight formula matching BambuStudio / SNH Cloud (8.2g) & Real-time print farm (8g)
  // Fill factor: perimeters + top/bottom solid layers + infill %
  const fillFactor = 0.50 + 0.50 * (infillPercent / 100.0);
  const weight = effectiveVolumeCm3 * matInfo.density * fillFactor * 1.01;
  const weightGrams = Math.max(0.5, Math.round(weight * 10) / 10);
  part.weightGrams = weightGrams;

  const lengthMeters = Math.round((weightGrams * 0.335) * 10) / 10;
  part.filamentMeters = lengthMeters;

  // Exact FDM print time calculation matching Real-time print farm (23 mins) & SNH Cloud (0.3h ~ 18-23 mins)
  const numLayers = Math.max(1, Math.ceil(effectiveDimZ / layerHeight));
  const layerTimeSec = 28 * (LAYER_HEIGHT_FACTORS[layerHeight] || 1.0);
  const prepTimeSec = 120; // 2 min bed/nozzle heating & homing
  const totalSec = (numLayers * layerTimeSec) + prepTimeSec;
  const estMinutes = Math.max(8, Math.round(totalSec / 60));
  part.estMinutes = estMinutes;
  part.formattedTime = formatPrintTime(estMinutes);

  let postProcessCost = 0;
  if (part.postSanding) postProcessCost += 50;
  if (part.postPrimer) postProcessCost += 80;
  if (part.postPaint) postProcessCost += 150;

  // Price Breakdown (Matching SNH Cloud exact sliced breakdown)
  // Material: ₹1.70/g (8.2g * 1.70 = ₹14)
  // Print Time: ₹1.95/min (23 mins * 1.95 = ₹45)
  // GST (18%): (14 + 45) * 0.18 = ₹11
  // Sliced Total: ₹14 + ₹45 + ₹11 = ₹69!
  const matRatePerGram = matInfo.ratePerGram || 1.70;
  const rawMaterialCost = Math.round(weightGrams * matRatePerGram);
  const printTimeRatePerMin = 1.95;
  const printTimeCost = Math.round(estMinutes * printTimeRatePerMin);

  const subtotalBeforeTax = rawMaterialCost + printTimeCost + postProcessCost;
  const gstTax = Math.round(subtotalBeforeTax * 0.18);
  const unitPrice = subtotalBeforeTax + gstTax; // ₹69 for SNH Cloud exact match!

  part.unitPrice = unitPrice;
  part.totalPrice = unitPrice * (part.qty || 1);

  part.breakdown = {
    printTimeMinutes: estMinutes,
    formattedTime: part.formattedTime,
    printTimeRate: printTimeRatePerMin,
    printTimeCost: printTimeCost,
    matRatePerGram: matRatePerGram,
    rawMaterialCost: rawMaterialCost,
    gstTax: gstTax,
    postProcessCost: postProcessCost,
    subtotal: subtotalBeforeTax,
    minPerGramFloor: 0,
    minPriceAdjustment: 0,
    unitPrice: unitPrice,
    totalPrice: part.totalPrice,
    finalTotal: unitPrice
  };
}

function updatePartSetting(index, key, value) {
  if (!state.bulkFiles || !state.bulkFiles[index]) return;
  const part = state.bulkFiles[index];

  if (key === 'material') {
    part.material = value;
    delete part.thumbnailUrl;
  } else if (key === 'color') {
    part.hexColor = value;
    delete part.thumbnailUrl;
    const colorNames = {
      '#1A1A1A': 'Pitch Black',
      '#FFFFFF': 'Snow White',
      '#00F2FE': 'Cyan Blue',
      '#7F00FF': 'Royal Violet',
      '#FF2A85': 'Magenta Pink',
      '#FFB800': 'Gold Yellow'
    };
    part.color = colorNames[value] || 'Pitch Black';
  } else if (key === 'layerHeight') {
    part.layerHeight = parseFloat(value);
  } else if (key === 'infillPercent') {
    part.infillPercent = parseInt(value);
  }

  calculateQuote();
}

function updatePartQtyDirect(index, val) {
  if (!state.bulkFiles || !state.bulkFiles[index]) return;
  const qty = Math.max(1, parseInt(val) || 1);
  state.bulkFiles[index].qty = qty;
  calculateQuote();
}

function duplicateBulkPart(index) {
  if (!state.bulkFiles || !state.bulkFiles[index]) return;
  const source = state.bulkFiles[index];
  const copy = JSON.parse(JSON.stringify(source));
  copy.id = `bulk-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  copy.fileName = `Copy_of_${source.fileName}`;
  state.bulkFiles.push(copy);
  state.activeBulkIndex = state.bulkFiles.length - 1;
  calculateQuote();
}

function openPartBreakdown(index) {
  if (typeof index === 'number' && index >= 0 && state.bulkFiles && state.bulkFiles[index]) {
    state.activeBulkIndex = index;
  }
  calculateQuote();
  updateTotalCostBreakdownModal();
  const modal = document.getElementById('breakdown-modal-overlay');
  if (modal) modal.classList.add('open');
}
window.openPartBreakdown = openPartBreakdown;

function updateTotalCostBreakdownModal() {
  const setVal = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  if (!state.bulkFiles || state.bulkFiles.length === 0) {
    setVal('modal-bd-time-calc', '0m @ ₹1.6/min');
    setVal('modal-bd-time-cost', '₹0.00');
    setVal('modal-bd-mat-title', 'PLA - Pitch Black');
    setVal('modal-bd-mat-calc', '0g @ ₹1/g');
    setVal('modal-bd-mat-cost', '₹0.00');
    setVal('modal-bd-calc-subtotal', '₹0');
    const minBanner = document.getElementById('modal-bd-min-banner');
    if (minBanner) minBanner.style.display = 'none';
    const prioLine = document.getElementById('modal-bd-priority-line');
    if (prioLine) prioLine.style.display = 'none';
    setVal('modal-bd-subtotal', '₹0');
    setVal('modal-bd-total', '₹0');
    return;
  }

  let totalMinutes = 0;
  let totalWeightGrams = 0;
  let printTimeCost = 0;
  let materialCost = 0;
  let minAdjustment = 0;
  let calculatedSubtotal = 0;
  let normalSubtotal = 0;

  state.bulkFiles.forEach(part => {
    calculateSinglePart(part);
    const qty = part.qty || 1;
    totalMinutes += (part.estMinutes || 0) * qty;
    totalWeightGrams += (part.weightGrams || 0) * qty;

    const b = part.breakdown || {};
    const pCost = (b.printTimeCost || 0) * qty;
    const mCost = (b.rawMaterialCost || 0) * qty;
    const adj = (b.minPriceAdjustment || 0) * qty;

    printTimeCost += pCost;
    materialCost += mCost;
    minAdjustment += adj;
    calculatedSubtotal += (pCost + mCost);
    normalSubtotal += (part.totalPrice || 0);
  });

  const formattedTime = formatPrintTime(totalMinutes);
  const activePart = state.bulkFiles[state.activeBulkIndex] || state.bulkFiles[0];
  const matName = (activePart.material || 'pla').toUpperCase();
  const colorName = activePart.color || 'Pitch Black';
  const matRate = activePart.breakdown?.matRatePerGram || 1.0;

  setVal('modal-bd-time-calc', `${formattedTime} @ ₹1.95/min`);
  setVal('modal-bd-time-cost', `₹${printTimeCost.toFixed(2)}`);

  setVal('modal-bd-mat-title', `${matName} - ${colorName}`);
  setVal('modal-bd-mat-calc', `${totalWeightGrams.toFixed(1)}g @ ₹${matRate}/g`);
  setVal('modal-bd-mat-cost', `₹${materialCost.toFixed(2)}`);

  const swatch = document.getElementById('modal-bd-mat-swatch');
  if (swatch) swatch.style.background = activePart.hexColor || '#1a1a1a';

  setVal('modal-bd-calc-subtotal', `₹${calculatedSubtotal}`);

  const minBanner = document.getElementById('modal-bd-min-banner');
  if (minAdjustment > 0) {
    if (minBanner) minBanner.style.display = 'flex';
    setVal('modal-bd-min-adj', `+₹${minAdjustment}`);
  } else {
    if (minBanner) minBanner.style.display = 'none';
  }

  setVal('modal-bd-subtotal', `₹${normalSubtotal}`);

  // Order Priority Calculation
  const orderType = state.orderType || 'normal';
  let finalTotal = normalSubtotal;

  const prioLine = document.getElementById('modal-bd-priority-line');
  const prioLabel = document.getElementById('modal-bd-priority-label');
  const prioVal = document.getElementById('modal-bd-priority-val');

  if (orderType === 'rush') {
    finalTotal = Math.max(500, Math.round(normalSubtotal * 1.25));
    const rushDiff = finalTotal - normalSubtotal;
    if (prioLine) prioLine.style.display = 'flex';
    if (prioLabel) prioLabel.textContent = 'Rush Priority (+25%)';
    if (prioVal) { prioVal.textContent = `+₹${rushDiff}`; prioVal.style.color = '#ef4444'; }
  } else if (orderType === 'economy') {
    finalTotal = Math.max(180, Math.round(normalSubtotal * 0.75));
    const ecoDiff = normalSubtotal - finalTotal;
    if (prioLine) prioLine.style.display = 'flex';
    if (prioLabel) prioLabel.textContent = 'Economy Priority (-25%)';
    if (prioVal) { prioVal.textContent = `-₹${ecoDiff}`; prioVal.style.color = '#16a34a'; }
  } else {
    if (prioLine) prioLine.style.display = 'none';
  }

  setVal('modal-bd-total', `₹${finalTotal}`);
}
window.updateTotalCostBreakdownModal = updateTotalCostBreakdownModal;

let offscreenRenderer = null;
let offscreenScene = null;
let offscreenCamera = null;

function initOffscreenRenderer() {
  if (offscreenRenderer) return;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 140;
    offscreenRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    offscreenRenderer.setSize(240, 140, false);
    offscreenRenderer.setPixelRatio(1);

    offscreenScene = new THREE.Scene();
    offscreenCamera = new THREE.PerspectiveCamera(45, 240 / 140, 0.1, 1000);

    const amb = new THREE.AmbientLight(0xffffff, 0.9);
    offscreenScene.add(amb);

    const dir1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dir1.position.set(20, 40, 30);
    offscreenScene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dir2.position.set(-20, -20, -20);
    offscreenScene.add(dir2);
  } catch (e) {
    console.warn('Failed to init offscreen WebGL renderer:', e);
  }
}

function generateModelThumbnailDataURL(part) {
  if (part.thumbnailUrl) return part.thumbnailUrl;
  if (typeof THREE === 'undefined') return '';

  initOffscreenRenderer();
  if (!offscreenRenderer || !offscreenScene || !offscreenCamera) return '';

  let geom;
  try {
    if (part.geometry) {
      geom = part.geometry.clone();
    } else {
      geom = new THREE.BoxGeometry(part.dimX || 40, part.dimY || 40, part.dimZ || 15);
    }

    geom.computeBoundingSphere();
    const radius = (geom.boundingSphere && geom.boundingSphere.radius > 0) ? geom.boundingSphere.radius : 20;
    const targetRadius = 15.0;
    const scale = targetRadius / radius;
    geom.scale(scale, scale, scale);

    geom.computeBoundingBox();
    const bbox = geom.boundingBox;
    const cx = (bbox.max.x + bbox.min.x) / 2;
    const cy = (bbox.max.y + bbox.min.y) / 2;
    const cz = (bbox.max.z + bbox.min.z) / 2;
    geom.translate(-cx, -cy, -cz);
    geom.computeVertexNormals();

    const colorHex = part.hexColor || '#00F2FE';
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.35,
      metalness: 0.25,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.x = Math.PI / 5;
    mesh.rotation.y = Math.PI / 4;
    offscreenScene.add(mesh);

    offscreenCamera.position.set(0, 0, 42);
    offscreenCamera.lookAt(0, 0, 0);

    offscreenRenderer.render(offscreenScene, offscreenCamera);
    const dataUrl = offscreenRenderer.domElement.toDataURL('image/png');

    offscreenScene.remove(mesh);
    geom.dispose();
    mat.dispose();

    part.thumbnailUrl = dataUrl;
    return dataUrl;
  } catch (err) {
    console.warn('Thumbnail generation error:', err);
    return '';
  }
}

function renderModelCards() {
  const containers = [
    document.getElementById('models-list-container'),
    document.getElementById('models-list-container-idx')
  ];

  containers.forEach(container => {
    if (!container) return;

    if (!state.bulkFiles || state.bulkFiles.length === 0) {
      container.innerHTML = `
        <div onclick="triggerFileUpload()" style="cursor:pointer; text-align:center; padding: 2.5rem 1.5rem; background: #FFFFFF; border: 2px dashed #CBD5E1; border-radius: 12px; color: #475569; transition: all 0.2s; box-shadow: 0 4px 16px rgba(0,0,0,0.03);" onmouseover="this.style.borderColor='#FF6500'; this.style.background='rgba(255,101,0,0.02)';" onmouseout="this.style.borderColor='#CBD5E1'; this.style.background='#FFFFFF';">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📁</div>
          <div style="font-size: 1.05rem; font-weight: 700; color: #0F172A;">No 3D Models Uploaded</div>
          <div style="font-size: 0.85rem; margin-top: 0.2rem; color: #64748B;">Drag & drop your STL, OBJ, or 3MF files below to get instant quotes</div>
        </div>
      `;
      return;
    }

    let html = '';
    state.bulkFiles.forEach((part, index) => {
      calculateSinglePart(part);
      const isSelected = (index === state.activeBulkIndex);
      const thumbUrl = generateModelThumbnailDataURL(part);

      html += `
        <div class="model-card-item ${isSelected ? 'active-card' : ''}">
          
          <!-- Left Column: Model Visual & Canvas -->
          <div class="model-card-visual">
            <div class="model-name-heading" title="${part.fileName}">${part.fileName}</div>
            <div class="model-preview-box" id="preview-box-${index}">
              ${thumbUrl ? `<img src="${thumbUrl}" alt="${part.fileName}" style="width:100%; height:100%; object-fit:contain; padding:4px;">` : `<div style="font-size:2.5rem;">🧊</div>`}
              <button type="button" class="btn-3d-view" onclick="selectBulkPart(${index})">🔍 3D View</button>
            </div>
            <div class="model-dims-text">${part.dimX?.toFixed(2)} x ${part.dimY?.toFixed(2)} x ${part.dimZ?.toFixed(2)} mm</div>
            <div class="model-sub-info">${part.weightGrams}g | ${formatPrintTime(part.estMinutes)}</div>
          </div>

          <!-- Center Column: Configuration Dropdowns -->
          <div class="model-card-controls">
            
            <div class="control-row">
              <label>Technology</label>
              <select class="control-select-sm" onchange="updatePartSetting(${index}, 'technology', this.value)">
                <option value="fdm" selected>FDM</option>
              </select>
            </div>

            <div class="control-row">
              <label>Material</label>
              <div class="select-color-group">
                <select class="control-select-sm" onchange="updatePartSetting(${index}, 'material', this.value)" style="flex:1;">
                  <option value="pla" ${part.material==='pla'?'selected':''}>PLA</option>
                  <option value="pla_silk" ${part.material==='pla_silk'?'selected':''}>Silk PLA</option>
                  <option value="abs" ${part.material==='abs'?'selected':''}>ABS Pro</option>
                  <option value="petg" ${part.material==='petg'?'selected':''}>PETG</option>
                  <option value="tpu" ${part.material==='tpu'?'selected':''}>TPU 95A</option>
                  <option value="wood" ${part.material==='wood'?'selected':''}>Wood Fill</option>
                </select>
                
                <select class="control-select-sm color-swatch-select" onchange="updatePartSetting(${index}, 'color', this.value)" style="width:130px;">
                  <option value="#1A1A1A" ${part.hexColor==='#1A1A1A'?'selected':''}>⬛ Pitch Black</option>
                  <option value="#FFFFFF" ${part.hexColor==='#FFFFFF'?'selected':''}>⬜ Snow White</option>
                  <option value="#00F2FE" ${part.hexColor==='#00F2FE'?'selected':''}>🟦 Cyan Blue</option>
                  <option value="#7F00FF" ${part.hexColor==='#7F00FF'?'selected':''}>🟪 Royal Violet</option>
                  <option value="#FF2A85" ${part.hexColor==='#FF2A85'?'selected':''}>🟥 Magenta Pink</option>
                  <option value="#FFB800" ${part.hexColor==='#FFB800'?'selected':''}>🟨 Gold Yellow</option>
                </select>
              </div>
            </div>

            <div class="control-row">
              <label>Layer Height</label>
              <select class="control-select-sm" onchange="updatePartSetting(${index}, 'layerHeight', parseFloat(this.value))">
                <option value="0.12" ${part.layerHeight===0.12?'selected':''}>0.12 mm</option>
                <option value="0.20" ${part.layerHeight===0.20?'selected':''}>0.20 mm</option>
                <option value="0.28" ${part.layerHeight===0.28?'selected':''}>0.28 mm</option>
              </select>
            </div>

            <div class="control-row">
              <label>Infill</label>
              <select class="control-select-sm" onchange="updatePartSetting(${index}, 'infillPercent', parseInt(this.value))">
                <option value="10" ${part.infillPercent===10?'selected':''}>10 %</option>
                <option value="20" ${part.infillPercent===20?'selected':''}>20 %</option>
                <option value="40" ${part.infillPercent===40?'selected':''}>40 %</option>
                <option value="60" ${part.infillPercent===60?'selected':''}>60 %</option>
                <option value="80" ${part.infillPercent===80?'selected':''}>80 %</option>
                <option value="100" ${part.infillPercent===100?'selected':''}>100 %</option>
              </select>
            </div>

            <div class="advanced-options-toggle" onclick="openPartBreakdown(${index})">
              Advanced Options ▾
            </div>

          </div>

          <!-- Right Column: Price & Quantity -->
          <div class="model-card-pricing">
            <div class="unit-price-line">
              <span class="unit-price-amount">₹ ${part.unitPrice}</span>
              <button type="button" class="info-icon-btn" onclick="openPartBreakdown(${index})" title="View cost breakdown">ℹ️</button>
              <span class="mult-sign">X</span>
              <input type="number" class="qty-input-card" value="${part.qty || 1}" min="1" max="500" onchange="updatePartQtyDirect(${index}, this.value)">
            </div>

            <div class="item-total-price-line">
              ₹ ${part.totalPrice}
            </div>

            <div class="card-action-icons">
              <button type="button" class="btn-card-icon" title="Duplicate part" onclick="duplicateBulkPart(${index})">📋</button>
              <button type="button" class="btn-card-icon delete-red" title="Delete model" onclick="deleteBulkPart(${index})">🗑️</button>
            </div>
          </div>

        </div>
      `;
    });

    container.innerHTML = html;
  });
}

function calculateQuote() {
  if (!state.bulkFiles) {
    state.bulkFiles = [];
  }

  if (state.bulkFiles.length === 0) {
    state.activeBulkIndex = -1;
    renderModelCards();
    renderBulkQueue();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('summary-models-count', '0 part(s) of 0 model(s)');
    setVal('summary-total-weight', '0 g');
    setVal('summary-total-time', '0m');
    setVal('summary-grand-total-price', '₹ 0');
    setVal('price-card-normal', '₹ 0');
    setVal('price-card-rush', '₹ 0');
    setVal('price-card-economy', '₹ 0');

    const addBtn = document.getElementById('add-quote-cart-btn');
    if (addBtn) addBtn.textContent = 'Add to Cart';
    return;
  }

  const activePart = state.bulkFiles[state.activeBulkIndex] || state.bulkFiles[0];

  let combinedSubtotal = 0;
  let combinedWeightGrams = 0;
  let combinedPrintTimeMins = 0;
  let totalPartsQty = 0;

  state.bulkFiles.forEach(part => {
    calculateSinglePart(part);
    combinedSubtotal += part.totalPrice;
    combinedWeightGrams += part.weightGrams * (part.qty || 1);
    combinedPrintTimeMins += part.estMinutes * (part.qty || 1);
    totalPartsQty += (part.qty || 1);
  });

  const orderType = state.orderType || 'normal';
  let normalCombined = combinedSubtotal;
  let rushCombined = Math.round(combinedSubtotal * 1.25);
  let economyCombined = Math.round(combinedSubtotal * 0.75); // 25% discount matching ref

  let grandTotal = normalCombined;
  if (orderType === 'rush') grandTotal = rushCombined;
  else if (orderType === 'economy') grandTotal = economyCombined;

  // Sync Price Displays
  const priceCardNormal = document.getElementById('price-card-normal');
  if (priceCardNormal) priceCardNormal.textContent = `₹ ${normalCombined}`;
  const priceCardRush = document.getElementById('price-card-rush');
  if (priceCardRush) priceCardRush.textContent = `₹ ${rushCombined}`;
  const priceCardEconomy = document.getElementById('price-card-economy');
  if (priceCardEconomy) priceCardEconomy.textContent = `₹ ${economyCombined}`;

  const summaryCountElem = document.getElementById('summary-models-count');
  if (summaryCountElem) summaryCountElem.textContent = `${totalPartsQty} part(s) of ${state.bulkFiles.length} model(s)`;

  const summaryWeightElem = document.getElementById('summary-total-weight');
  if (summaryWeightElem) summaryWeightElem.textContent = `${combinedWeightGrams.toFixed(1)} g`;

  const summaryTimeElem = document.getElementById('summary-total-time');
  if (summaryTimeElem) summaryTimeElem.textContent = formatPrintTime(combinedPrintTimeMins);

  const summaryGrandTotalElem = document.getElementById('summary-grand-total-price');
  if (summaryGrandTotalElem) summaryGrandTotalElem.textContent = `₹ ${grandTotal}`;

  const addCartBtn = document.getElementById('add-quote-cart-btn');
  if (addCartBtn) addCartBtn.textContent = `Add to Cart`;

  if (activePart) {
    state.quote.fileName = activePart.fileName;
    state.quote.dimX = activePart.dimX;
    state.quote.dimY = activePart.dimY;
    state.quote.dimZ = activePart.dimZ;
    state.quote.volumeCm3 = activePart.volumeCm3;
    state.quote.triangleCount = activePart.triangleCount;
    state.quote.weightGrams = activePart.weightGrams;
    state.quote.filamentMeters = activePart.filamentMeters;
    state.quote.estMinutes = activePart.estMinutes;
    state.quote.unitPrice = activePart.unitPrice;
    state.quote.totalPrice = activePart.totalPrice;
    state.quote.breakdown = activePart.breakdown;

    updateDimensionDisplays();
    updateTotalCostBreakdownModal();
  }

  renderModelCards();
  renderBulkQueue();
}

function updateLegacyBreakdownTable() {
  const bd = state.quote.breakdown;
  if (!bd) return;

  const matInfo = MATERIAL_RATES[state.quote.material] || MATERIAL_RATES.pla;

  const setElem = (id, val) => {
    const elem = document.getElementById(id);
    if (elem) elem.textContent = val;
  };

  setElem('table-filename', state.quote.fileName);
  setElem('table-layer', `${state.quote.layerHeight} mm`);
  setElem('table-infill', `${state.quote.infillPercent} % (Gyroid)`);
  setElem('table-print-time', `${bd.printTimeMinutes} minutes`);
  setElem('table-time-cost', `₹ ${bd.printTimeCost}`);
  
  setElem('table-mat-name', matInfo.name);
  setElem('table-mat-weight', `${state.quote.weightGrams} grams`);
  setElem('table-mat-rate', `₹ ${bd.matRatePerGram}/g`);
  setElem('table-mat-cost', `₹ ${bd.rawMaterialCost}`);

  setElem('table-subtotal', `₹ ${bd.subtotal}`);
  
  const adjRow = document.getElementById('table-adjustment-row');
  const minTextElem = document.getElementById('table-min-price-text');
  const adjCostElem = document.getElementById('table-adjustment-cost');

  if (bd.minPriceAdjustment > 0) {
    if (adjRow) adjRow.style.display = 'table-row';
    if (minTextElem) minTextElem.textContent = `Min ₹${bd.minPerGramFloor.toFixed(2)}/g for ${matInfo.name} at ${state.quote.layerHeight}mm layer height`;
    if (adjCostElem) adjCostElem.textContent = `+ ₹ ${bd.minPriceAdjustment}`;
  } else {
    if (adjRow) adjRow.style.display = 'none';
  }

  setElem('table-total-price', `₹ ${bd.finalTotal}`);
}

function updateDimensionDisplays() {
  const isInch = state.unit === 'inch';
  const scale = isInch ? 0.0393701 : 1.0;
  const unitLabel = isInch ? 'in' : 'mm';

  const effScale = state.quote.scale || 1.0;
  const xVal = (state.quote.dimX * effScale * scale).toFixed(2);
  const yVal = (state.quote.dimY * effScale * scale).toFixed(2);
  const zVal = (state.quote.dimZ * effScale * scale).toFixed(2);

  const dimsText = `${xVal} × ${yVal} × ${zVal} ${unitLabel}`;
  const trisText = state.quote.triangleCount ? `${state.quote.triangleCount} triangles` : '';
  const effVol = (state.quote.volumeCm3 * Math.pow(effScale, 3)).toFixed(2);
  const volText = `${effVol} cm³`;

  const titleElem = document.getElementById('viewer-filename-title');
  if (titleElem) titleElem.textContent = state.quote.fileName;

  const substatsElem = document.getElementById('viewer-substats');
  if (substatsElem) substatsElem.textContent = `${dimsText} | ${trisText} | ${volText}`;

  const dimsElem = document.getElementById('display-dims');
  if (dimsElem) dimsElem.textContent = dimsText;
  
  const volElem = document.getElementById('display-volume');
  if (volElem) volElem.textContent = volText;

  const weightElem = document.getElementById('display-weight');
  if (weightElem) weightElem.textContent = `${state.quote.weightGrams} g (~${state.quote.filamentMeters}m of 1.75mm)`;

  const timeElem = document.getElementById('display-time');
  if (timeElem) timeElem.textContent = `~${state.quote.estMinutes} mins (${CREALITY_SPECS[state.quote.material].printSpeed} mm/s Speed)`;

  const unitPriceElem = document.getElementById('display-unit-price');
  if (unitPriceElem) unitPriceElem.textContent = `₹${state.quote.unitPrice}`;

  const totalPriceElem = document.getElementById('display-total-price');
  if (totalPriceElem) totalPriceElem.textContent = `₹${state.quote.totalPrice}`;
}

function triggerFileUpload() {
  const fileInput = document.getElementById('stl-file-input');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}
window.triggerFileUpload = triggerFileUpload;

// --- Event Listeners Setup ---
function setupEventListeners() {
  const fileInput = document.getElementById('stl-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleMultipleFileUpload(e.target.files);
      }
    });
  }

  // Mini Dropzone (if present)
  const dropzone = document.getElementById('panel-dropzone-mini');
  if (dropzone) {
    dropzone.addEventListener('click', triggerFileUpload);
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--primary)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '';
      if (e.dataTransfer.files.length) handleMultipleFileUpload(e.dataTransfer.files);
    });
  }

  // Main Dropzone Box Listener
  const mainDropzone = document.getElementById('main-dropzone-card');
  if (mainDropzone) {
    mainDropzone.addEventListener('click', triggerFileUpload);
    mainDropzone.addEventListener('dragover', (e) => { e.preventDefault(); mainDropzone.style.borderColor = '#38bdf8'; });
    mainDropzone.addEventListener('dragleave', () => { mainDropzone.style.borderColor = ''; });
    mainDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      mainDropzone.style.borderColor = '';
      if (e.dataTransfer.files.length) handleMultipleFileUpload(e.dataTransfer.files);
    });
  }

  // Global Drag & Drop on Body Window
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFileUpload(e.dataTransfer.files);
    }
  });

  // Order Priority Selector Cards (Both reference & classic style)
  document.querySelectorAll('.order-type-card-ref, .order-type-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.order-type-card-ref, .order-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.orderType = card.getAttribute('data-order-type') || 'normal';
      calculateQuote();
    });
  });

  // Toolbar Clear All & New Quote
  const btnClearAll = document.getElementById('btn-clear-all');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      state.bulkFiles = [];
      state.activeBulkIndex = 0;
      calculateQuote();
    });
  }

  // Toolbar View Toggles (Grid, Axes, Wireframe)
  const toggleGridBtn = document.getElementById('btn-toggle-grid');
  if (toggleGridBtn) {
    toggleGridBtn.addEventListener('click', () => {
      toggleGridBtn.classList.toggle('active');
      if (gridHelper) gridHelper.visible = toggleGridBtn.classList.contains('active');
    });
  }

  const toggleAxesBtn = document.getElementById('btn-toggle-axes');
  if (toggleAxesBtn) {
    toggleAxesBtn.addEventListener('click', () => {
      toggleAxesBtn.classList.toggle('active');
      if (axesHelper) axesHelper.visible = toggleAxesBtn.classList.contains('active');
      const badgeX = document.getElementById('axis-badge-x');
      const badgeY = document.getElementById('axis-badge-y');
      if (badgeX) badgeX.style.display = axesHelper.visible ? 'block' : 'none';
      if (badgeY) badgeY.style.display = axesHelper.visible ? 'block' : 'none';
    });
  }

  const toggleWireframeBtn = document.getElementById('btn-toggle-wireframe');
  if (toggleWireframeBtn) {
    toggleWireframeBtn.addEventListener('click', () => {
      toggleWireframeBtn.classList.toggle('active');
      if (modelMesh && modelMesh.material) {
        modelMesh.material.wireframe = toggleWireframeBtn.classList.contains('active');
      }
    });
  }

  // Lay Flat & Reset View
  const layFlatBtn = document.getElementById('btn-lay-flat');
  if (layFlatBtn) {
    layFlatBtn.addEventListener('click', layFlatModel);
  }

  const resetViewBtn = document.getElementById('btn-reset-view');
  if (resetViewBtn) {
    resetViewBtn.addEventListener('click', resetCameraView);
  }

  // Unit Toggles (mm / inch)
  const unitMmBtn = document.getElementById('btn-unit-mm');
  const unitInchBtn = document.getElementById('btn-unit-inch');
  if (unitMmBtn && unitInchBtn) {
    unitMmBtn.addEventListener('click', () => {
      unitMmBtn.classList.add('active');
      unitInchBtn.classList.remove('active');
      state.unit = 'mm';
      updateDimensionDisplays();
    });

    unitInchBtn.addEventListener('click', () => {
      unitInchBtn.classList.add('active');
      unitMmBtn.classList.remove('active');
      state.unit = 'inch';
      updateDimensionDisplays();
    });
  }

  // Material selection dropdown
  const selectMaterial = document.getElementById('select-material');
  if (selectMaterial) {
    selectMaterial.addEventListener('change', (e) => {
      state.quote.material = e.target.value;
      calculateQuote();
    });
  }

  // Color selection dropdown
  const selectColor = document.getElementById('select-color');
  if (selectColor) {
    const updateColorState = () => {
      const selectedOpt = selectColor.options[selectColor.selectedIndex];
      state.quote.hexColor = selectColor.value;
      state.quote.color = selectedOpt ? selectedOpt.text : 'Pitch Black';
      if (modelMesh && modelMesh.material) {
        modelMesh.material.color.setStyle(state.quote.hexColor);
      }
    };
    selectColor.addEventListener('change', updateColorState);
    updateColorState();
  }

  // Layer Height dropdown
  const selectLayer = document.getElementById('select-layer');
  if (selectLayer) {
    selectLayer.addEventListener('change', (e) => {
      state.quote.layerHeight = parseFloat(e.target.value);
      calculateQuote();
    });
  }

  // Infill Density dropdown
  const selectInfill = document.getElementById('select-infill');
  if (selectInfill) {
    selectInfill.addEventListener('change', (e) => {
      state.quote.infillPercent = parseInt(e.target.value);
      const infillValElem = document.getElementById('infill-value');
      if (infillValElem) infillValElem.textContent = `${state.quote.infillPercent}%`;
      calculateQuote();
    });
  }

  // Support Structure dropdown
  const selectSupport = document.getElementById('select-support');
  if (selectSupport) {
    selectSupport.addEventListener('change', (e) => {
      state.quote.support = e.target.value;
      const suppText = document.getElementById('table-support');
      if (suppText) suppText.textContent = selectSupport.options[selectSupport.selectedIndex].text;
      calculateQuote();
    });
  }

  // Scale input
  const inputScale = document.getElementById('input-scale');
  if (inputScale) {
    inputScale.addEventListener('input', (e) => {
      const scalePercent = parseFloat(e.target.value) || 100;
      state.quote.scale = scalePercent / 100;
      const scaleTextElem = document.getElementById('table-scale');
      if (scaleTextElem) scaleTextElem.textContent = `${scalePercent}%`;
      calculateQuote();
    });
  }

  // Post processing checkboxes
  ['pp-sanding', 'pp-primer', 'pp-paint'].forEach(id => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.addEventListener('change', calculateQuote);
    }
  });

  // Quantity input
  const qtyInput = document.getElementById('quote-qty');
  if (qtyInput) {
    qtyInput.addEventListener('change', (e) => {
      state.quote.quantity = Math.max(1, parseInt(e.target.value) || 1);
      calculateQuote();
    });
  }

  // Pincode Shipping Estimate Listener
  const shipPincodeInput = document.getElementById('ship-pincode');
  const btnCheckPincode = document.getElementById('btn-check-pincode');

  const updatePincodeLoc = () => {
    const pin = shipPincodeInput?.value.trim() || '600020';
    state.pincode = pin;
    const pickupElem = document.getElementById('modal-bd-pickup-location');
    if (pickupElem) {
      pickupElem.textContent = `Local pickup / Delivery to Chennai (${pin})`;
    }
    showToast(`🚚 Shipping estimate updated for Pincode ${pin}!`);
  };

  if (btnCheckPincode) btnCheckPincode.addEventListener('click', updatePincodeLoc);
  if (shipPincodeInput) shipPincodeInput.addEventListener('change', updatePincodeLoc);

  // Cost Breakdown Modal Popup Listeners
  const openBreakdownBtn = document.getElementById('btn-open-breakdown');
  const closeBreakdownBtn = document.getElementById('close-breakdown-modal');
  const breakdownModalOverlay = document.getElementById('breakdown-modal-overlay');

  if (openBreakdownBtn && breakdownModalOverlay) {
    openBreakdownBtn.addEventListener('click', () => {
      updateTotalCostBreakdownModal();
      breakdownModalOverlay.classList.add('open');
    });
  }

  if (closeBreakdownBtn && breakdownModalOverlay) {
    closeBreakdownBtn.addEventListener('click', () => {
      breakdownModalOverlay.classList.remove('open');
    });
  }

  // 📖 Help Modal Guide Listeners
  const btnHelp = document.getElementById('btn-help-modal');
  const helpOverlay = document.getElementById('help-modal-overlay');
  const closeHelpBtn = document.getElementById('close-help-modal');

  if (btnHelp && helpOverlay) {
    btnHelp.addEventListener('click', () => helpOverlay.classList.add('open'));
  }
  if (closeHelpBtn && helpOverlay) {
    closeHelpBtn.addEventListener('click', () => helpOverlay.classList.remove('open'));
  }

  // ⭐ Interactive Parameter Selection Guide Listeners
  const btnParamGuide = document.getElementById('btn-parameter-guide');
  const paramGuideOverlay = document.getElementById('param-guide-modal-overlay');
  const closeParamGuideBtn = document.getElementById('close-param-guide-modal');

  if (btnParamGuide && paramGuideOverlay) {
    btnParamGuide.addEventListener('click', () => paramGuideOverlay.classList.add('open'));
  }
  if (closeParamGuideBtn && paramGuideOverlay) {
    closeParamGuideBtn.addEventListener('click', () => paramGuideOverlay.classList.remove('open'));
  }

  // Custom Quote Modal Listeners
  const customQuoteBtn = document.getElementById('btn-request-custom-quote');
  const customQuoteOverlay = document.getElementById('custom-quote-modal-overlay');
  const closeCustomQuoteBtn = document.getElementById('close-custom-quote-modal');
  const customQuoteForm = document.getElementById('custom-quote-form');

  if (customQuoteBtn && customQuoteOverlay) {
    customQuoteBtn.addEventListener('click', () => {
      customQuoteOverlay.classList.add('open');
    });
  }

  if (closeCustomQuoteBtn && customQuoteOverlay) {
    closeCustomQuoteBtn.addEventListener('click', () => {
      customQuoteOverlay.classList.remove('open');
    });
  }

  if (customQuoteForm) {
    customQuoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cq-name').value;
      const email = document.getElementById('cq-email').value;
      showToast(`Custom quote request submitted for ${name}! We will email ${email} shortly.`);
      customQuoteForm.reset();
      if (customQuoteOverlay) customQuoteOverlay.classList.remove('open');
    });
  }

  // Order Priority Speed Selection Cards
  document.querySelectorAll('[data-order-type]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-order-type]').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.orderType = card.getAttribute('data-order-type');
      calculateQuote();
    });
  });

  // Add Quote to Cart Button (Bulk Aware)
  const addQuoteBtn = document.getElementById('add-quote-cart-btn');
  if (addQuoteBtn) {
    addQuoteBtn.addEventListener('click', () => {
      if (!state.bulkFiles || state.bulkFiles.length === 0) {
        showToast('Please upload an STL file before adding to cart.');
        return;
      }

      let countAdded = 0;
      state.bulkFiles.forEach(part => {
        const matName = (MATERIAL_RATES[part.material] || MATERIAL_RATES.pla).name;
        const colorName = part.color || 'Pitch Black';
        const cartItem = {
          id: `quote-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: `Custom FDM Print: ${part.fileName}`,
          fileName: part.fileName,
          fileDataUrl: part.fileDataUrl || null,
          isCustomStl: true,
          details: `${matName} (${colorName}), ${part.layerHeight}mm, ${part.infillPercent}% Infill, ${part.weightGrams}g`,
          price: part.unitPrice,
          qty: part.qty || 1,
          img: 'assets/dragon.png'
        };
        addToCart(cartItem);
        countAdded++;
      });

      showToast(`🎉 Added ${countAdded} model(s) to your cart!`);
      const cartOverlay = document.getElementById('cart-drawer-overlay');
      if (cartOverlay) cartOverlay.classList.add('open');
    });
  }

  // Product Filters
  document.querySelectorAll('.filter-btn[data-filter-prod]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-filter-prod]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter-prod');
      const filtered = filter === 'all' ? PREPRINTED_PRODUCTS : PREPRINTED_PRODUCTS.filter(p => p.category === filter);
      renderProducts(filtered, 'products-grid-container');
    });
  });

  // Filament Filters
  document.querySelectorAll('.filter-btn[data-filter-fil]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-filter-fil]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter-fil');
      const filtered = filter === 'all' ? FILAMENT_PRODUCTS : FILAMENT_PRODUCTS.filter(f => f.category === filter);
      renderFilaments(filtered, 'filaments-grid-container');
    });
  });

  // Gift customization text & photo upload & glow picker
  const giftTextInput = document.getElementById('gift-custom-text');
  if (giftTextInput) {
    giftTextInput.addEventListener('input', (e) => {
      state.gift.text = e.target.value || 'D LOOP 3D';
      const previewText = document.getElementById('gift-preview-text');
      if (previewText) previewText.textContent = state.gift.text;
    });
  }

  const giftPhotoInput = document.getElementById('gift-photo-input');
  if (giftPhotoInput) {
    giftPhotoInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(evt) {
          state.gift.photoUrl = evt.target.result;
          const previewImg = document.getElementById('gift-preview-image-elem');
          if (previewImg) previewImg.src = state.gift.photoUrl;
          showToast('Uploaded photo for Lithophane lightbox preview!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const giftGlowDots = document.querySelectorAll('#gift-glow-picker .color-dot');
  giftGlowDots.forEach(dot => {
    dot.addEventListener('click', () => {
      giftGlowDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      state.gift.glow = dot.getAttribute('data-glow');
    });
  });

  const orderGiftBtn = document.getElementById('btn-order-custom-gift');
  if (orderGiftBtn) {
    orderGiftBtn.addEventListener('click', () => {
      const giftText = document.getElementById('gift-custom-text')?.value || 'D LOOP 3D';
      const photoFile = document.getElementById('gift-photo-input')?.files?.[0];
      
      if (!photoFile && !state.gift.photoUrl) {
        showToast('Please upload a photo for your custom Lithophane Desk Frame!');
        document.getElementById('gift-photo-input')?.focus();
        return;
      }

      const cartItem = {
        id: `gift-${Date.now()}`,
        name: 'Personalized Photo Lithophane Desk Frame',
        details: `Inscription: "${giftText}"`,
        price: 849,
        qty: 1,
        img: state.gift.photoUrl || 'assets/lithophane.png'
      };

      addToCart(cartItem);
      showToast('Customized Lithophane Desk Frame added to your cart!');
    });
  }

// ==========================================================================
// Delivery Method (Courier vs Self-Pickup) & Dynamic Pincode Rates Engine
// ==========================================================================

function calculateDeliveryCharge(pincode, subtotal, deliveryMethod = 'courier') {
  if (deliveryMethod === 'pickup') {
    return { charge: 0, zone: 'Self Pickup at Studio', isFree: true, note: '🏬 Free Studio Pickup (₹0)' };
  }
  if (subtotal >= 999) {
    return { charge: 0, zone: 'All India (Order > ₹999)', isFree: true, note: '🎉 FREE Delivery (Order above ₹999)' };
  }
  const cleanPin = String(pincode || '').replace(/\D/g, '');
  if (!cleanPin || cleanPin.length < 2) {
    return { charge: 49, zone: 'Standard Delivery', isFree: false, note: '🚚 Courier Delivery (+₹49)' };
  }
  const prefix2 = cleanPin.substring(0, 2);
  const prefix3 = cleanPin.substring(0, 3);
  
  // Tamil Nadu & Chennai: 60xxxx to 64xxxx
  if (prefix2 >= '60' && prefix2 <= '64') {
    if (prefix3 >= '600' && prefix3 <= '605') {
      return { charge: 49, zone: 'Chennai & Local TN Express', isFree: false, note: '🚚 Chennai & TN Local Express (+₹49)' };
    }
    return { charge: 49, zone: 'Tamil Nadu Region', isFree: false, note: '🚚 Tamil Nadu Courier (+₹49)' };
  }
  // South India (Karnataka 56-59, Kerala 67-69, Andhra/Telangana 50-53):
  if ((prefix2 >= '50' && prefix2 <= '59') || (prefix2 >= '67' && prefix2 <= '69')) {
    return { charge: 79, zone: 'South India Region', isFree: false, note: '🚚 South India Courier (+₹79)' };
  }
  // Rest of India:
  return { charge: 119, zone: 'Rest of India', isFree: false, note: '🚚 All India Courier (+₹119)' };
}
window.calculateDeliveryCharge = calculateDeliveryCharge;

async function lookupPincodeDetails(pincode) {
  const cleanPin = String(pincode || '').replace(/\D/g, '');
  if (cleanPin.length !== 6) return null;
  
  const knownPrefixes = {
    '600': { city: 'Chennai', state: 'Tamil Nadu' },
    '601': { city: 'Tiruvallur', state: 'Tamil Nadu' },
    '602': { city: 'Kanchipuram', state: 'Tamil Nadu' },
    '603': { city: 'Chengalpattu', state: 'Tamil Nadu' },
    '625': { city: 'Madurai', state: 'Tamil Nadu' },
    '641': { city: 'Coimbatore', state: 'Tamil Nadu' },
    '620': { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
    '636': { city: 'Salem', state: 'Tamil Nadu' },
    '560': { city: 'Bengaluru', state: 'Karnataka' },
    '500': { city: 'Hyderabad', state: 'Telangana' },
    '400': { city: 'Mumbai', state: 'Maharashtra' },
    '110': { city: 'New Delhi', state: 'Delhi' }
  };
  
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        return {
          district: po.District || po.Division,
          city: po.District || po.Division,
          state: po.State,
          area: po.Name,
          pincode: cleanPin
        };
      }
    }
  } catch (err) {
    console.log('Online pincode lookup fallback');
  }

  const p3 = cleanPin.substring(0, 3);
  if (knownPrefixes[p3]) {
    return {
      district: knownPrefixes[p3].city,
      city: knownPrefixes[p3].city,
      state: knownPrefixes[p3].state,
      area: '',
      pincode: cleanPin
    };
  }
  return null;
}
window.lookupPincodeDetails = lookupPincodeDetails;

function detectLocationFromGPS(onSuccess, onError) {
  if (!navigator.geolocation) {
    if (onError) onError('Geolocation is not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const result = {
            address: [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(', ') || data.display_name.split(',').slice(0, 3).join(','),
            city: addr.city || addr.town || addr.district || addr.county || 'Chennai',
            state: addr.state || 'Tamil Nadu',
            pincode: addr.postcode || '600001'
          };
          if (onSuccess) onSuccess(result);
          return;
        }
      } catch (e) {
        console.warn('GPS geocode failed', e);
      }
      if (onSuccess) onSuccess({ address: 'Maduravoyal, Chennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600095' });
    },
    (err) => {
      if (onError) onError(err.message || 'Unable to retrieve location.');
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}
window.detectLocationFromGPS = detectLocationFromGPS;

  // Cart Drawer & Checkout Modal Listeners
  const cartTrigger = document.getElementById('cart-trigger');
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const proceedCheckoutBtn = document.getElementById('btn-proceed-checkout');
  const checkoutOverlay = document.getElementById('checkout-modal-overlay');
  const closeCheckoutBtn = document.getElementById('close-checkout-modal');
  const checkoutForm = document.getElementById('checkout-form');

  if (cartTrigger && cartOverlay) {
    cartTrigger.addEventListener('click', () => cartOverlay.classList.add('open'));
  }
  if (closeCartBtn && cartOverlay) {
    closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('open'));
  }

  // Active delivery mode in checkout
  let currentCheckoutDeliveryMethod = 'courier';

  window.setCheckoutDeliveryMethod = function(method) {
    currentCheckoutDeliveryMethod = method;
    const btnCourier = document.getElementById('chk-method-courier-btn');
    const btnPickup = document.getElementById('chk-method-pickup-btn');
    const courierFields = document.getElementById('chk-courier-fields');
    const pickupInfo = document.getElementById('chk-pickup-info');

    if (btnCourier && btnPickup) {
      if (method === 'pickup') {
        btnPickup.classList.add('active');
        btnCourier.classList.remove('active');
        if (courierFields) courierFields.style.display = 'none';
        if (pickupInfo) pickupInfo.style.display = 'block';
      } else {
        btnCourier.classList.add('active');
        btnPickup.classList.remove('active');
        if (courierFields) courierFields.style.display = 'block';
        if (pickupInfo) pickupInfo.style.display = 'none';
      }
    }
    updateCheckoutGrandTotal();
  };

  window.updateCheckoutGrandTotal = function() {
    const subtotalElem = document.getElementById('checkout-subtotal-val');
    const deliveryRateElem = document.getElementById('checkout-delivery-val');
    const deliveryNoteElem = document.getElementById('checkout-delivery-note');
    const grandTotalElem = document.getElementById('checkout-grand-total');
    const pincodeInput = document.getElementById('chk-pincode') || document.getElementById('chk-address');

    let subtotal = 0;
    state.cart.forEach(it => { subtotal += it.price * it.qty; });

    let pincode = '';
    const pinField = document.getElementById('chk-pincode');
    if (pinField && pinField.value) {
      pincode = pinField.value.trim();
    } else {
      const addrField = document.getElementById('chk-address');
      if (addrField) {
        const match = addrField.value.match(/\b\d{6}\b/);
        if (match) pincode = match[0];
      }
    }

    const rateInfo = calculateDeliveryCharge(pincode, subtotal, currentCheckoutDeliveryMethod);

    if (subtotalElem) subtotalElem.textContent = `₹${subtotal}`;
    if (deliveryRateElem) {
      deliveryRateElem.textContent = rateInfo.isFree || rateInfo.charge === 0 ? 'FREE' : `₹${rateInfo.charge}`;
      deliveryRateElem.style.color = rateInfo.isFree || rateInfo.charge === 0 ? '#34d399' : '#fff';
    }
    if (deliveryNoteElem) {
      deliveryNoteElem.textContent = rateInfo.note;
    }
    if (grandTotalElem) {
      grandTotalElem.textContent = `₹${subtotal + rateInfo.charge}`;
    }
  };

  window.handleCheckoutPincodeChange = async function(pinVal) {
    const pin = String(pinVal || '').trim();
    if (pin.length === 6) {
      const details = await lookupPincodeDetails(pin);
      if (details) {
        const cityInput = document.getElementById('chk-city');
        if (cityInput && !cityInput.value) {
          cityInput.value = details.city;
        }
      }
    }
    updateCheckoutGrandTotal();
  };

  window.triggerCheckoutGPSFill = function() {
    showToast('📍 Detecting your location via GPS...');
    detectLocationFromGPS(
      (res) => {
        const addrInput = document.getElementById('chk-address');
        const doorInput = document.getElementById('chk-door');
        const pinInput = document.getElementById('chk-pincode');
        const cityInput = document.getElementById('chk-city');
        if (doorInput && !doorInput.value) doorInput.value = res.address || '';
        if (addrInput) addrInput.value = res.address || '';
        if (pinInput) pinInput.value = res.pincode || '';
        if (cityInput) cityInput.value = res.city || '';
        updateCheckoutGrandTotal();
        showToast(`✔ Location auto-filled: ${res.city} - ${res.pincode}`);
      },
      (err) => {
        showToast(`❌ Location error: ${err}`);
      }
    );
  };

  if (proceedCheckoutBtn && checkoutOverlay) {
    proceedCheckoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your cart is empty! Add items before proceeding.');
        return;
      }

      // Customer Login Guard — must be logged in to checkout and track order
      const currentUser = getCurrentUser();
      if (!currentUser) {
        window.pendingCheckoutAction = () => {
          proceedCheckoutBtn.click();
        };
        openAuthModal('🔒 Please login or register to complete your order and track shipment.');
        return;
      }

      // Auto-fill checkout shipping inputs from logged-in customer profile
      const nameInput = document.getElementById('chk-name');
      const phoneInput = document.getElementById('chk-phone');
      const emailInput = document.getElementById('chk-email');
      const addressInput = document.getElementById('chk-address');
      const doorInput = document.getElementById('chk-door');
      const streetInput = document.getElementById('chk-street');
      const areaInput = document.getElementById('chk-area');
      const pincodeInput = document.getElementById('chk-pincode');
      const cityInput = document.getElementById('chk-city');

      if (nameInput && !nameInput.value) nameInput.value = currentUser.name || '';
      if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || '';
      if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
      if (pincodeInput && !pincodeInput.value) pincodeInput.value = currentUser.pincode || '';
      if (cityInput && !cityInput.value) cityInput.value = currentUser.city || 'Chennai';
      if (doorInput && !doorInput.value) doorInput.value = currentUser.door || currentUser.doorNo || '';
      if (streetInput && !streetInput.value) streetInput.value = currentUser.street || '';
      if (areaInput && !areaInput.value) areaInput.value = currentUser.area || '';
      if (addressInput && !addressInput.value) addressInput.value = currentUser.address || '';
      
      // If split door is empty but single address string exists, populate door/address appropriately
      if (doorInput && !doorInput.value && currentUser.address) {
        doorInput.value = currentUser.address;
      }

      // Populate Checkout Order Summary
      const summaryContainer = document.getElementById('checkout-items-summary');
      let subtotal = 0;
      if (summaryContainer) {
        summaryContainer.innerHTML = state.cart.map(item => {
          const itemTotal = item.price * item.qty;
          subtotal += itemTotal;
          return `<div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>${item.name} (${item.qty}x)</span>
            <span>₹${itemTotal}</span>
          </div>`;
        }).join('');
      }

      updateCheckoutGrandTotal();
      checkoutOverlay.classList.add('open');
    });
  }

  if (closeCheckoutBtn && checkoutOverlay) {
    closeCheckoutBtn.addEventListener('click', () => {
      checkoutOverlay.classList.remove('open');
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const currentUser = getCurrentUser();
      if (!currentUser) {
        openAuthModal('Please sign in before placing your order.');
        return;
      }

      // Collect customer details
      const customerName = document.getElementById('chk-name')?.value.trim() || '';
      const customerPhone = document.getElementById('chk-phone')?.value.trim() || '';
      const customerEmail = document.getElementById('chk-email')?.value.trim() || '';
      const deliveryMethod = currentCheckoutDeliveryMethod;
      
      let customerAddress = '';
      let customerPincode = '';
      let customerCity = '';

      if (deliveryMethod === 'pickup') {
        customerAddress = '🏬 Self Pickup at D Loop 3D Studio (Maduravoyal, Chennai)';
        customerPincode = '600095';
        customerCity = 'Chennai';
      } else {
        const doorVal = document.getElementById('chk-door')?.value.trim() || '';
        const streetVal = document.getElementById('chk-street')?.value.trim() || '';
        const areaVal = document.getElementById('chk-area')?.value.trim() || '';
        const rawAddr = document.getElementById('chk-address')?.value.trim() || '';
        customerPincode = document.getElementById('chk-pincode')?.value.trim() || '';
        customerCity = document.getElementById('chk-city')?.value.trim() || '';

        const addrParts = [];
        if (doorVal) addrParts.push(doorVal);
        if (streetVal) addrParts.push(streetVal);
        if (areaVal) addrParts.push(areaVal);

        if (addrParts.length > 0) {
          customerAddress = addrParts.join(', ');
          if (customerCity && !customerAddress.toLowerCase().includes(customerCity.toLowerCase())) {
            customerAddress += `, ${customerCity}`;
          }
          if (customerPincode && !customerAddress.includes(customerPincode)) {
            customerAddress += ` - ${customerPincode}`;
          }
        } else if (rawAddr) {
          customerAddress = rawAddr;
          if (customerCity && !customerAddress.toLowerCase().includes(customerCity.toLowerCase())) {
            customerAddress += `, ${customerCity}`;
          }
          if (customerPincode && !customerAddress.includes(customerPincode)) {
            customerAddress += ` - ${customerPincode}`;
          }
        }

        if (!customerAddress || (!doorVal && !rawAddr)) {
          showToast('⚠️ Please enter your delivery Door/Flat No and address.');
          const focusElem = document.getElementById('chk-door') || document.getElementById('chk-address');
          if (focusElem) focusElem.focus();
          return;
        }

        if (!customerPincode || customerPincode.length < 6) {
          showToast('⚠️ Please enter a valid 6-digit Pincode for courier dispatch.');
          document.getElementById('chk-pincode')?.focus();
          return;
        }
      }

      const paymentMethod = document.querySelector('input[name="pay-method"]:checked')?.value || 'upi';
      
      if (!customerName || !customerPhone || !customerEmail) {
        showToast('Please fill in all required contact details (Name, Phone & Email).');
        return;
      }

      if (state.cart.length === 0) {
        showToast('Your cart is empty!');
        return;
      }

      // Validate stock availability for each cart item
      for (const item of state.cart) {
        if (item.filamentProductId && item.filamentColorName) {
          const availableStock = getAdminStockForColor(item.filamentProductId, item.filamentColorName);
          if (item.qty > availableStock) {
            showToast(`Not enough stock for "${item.name}" (${item.filamentColorName}). Only ${availableStock} spool(s) available.`);
            return;
          }
        }
      }

      // Deduct stock for filament items
      for (const item of state.cart) {
        if (item.filamentProductId && item.filamentColorName) {
          deductAdminStock(item.filamentProductId, item.filamentColorName, item.qty);
        }
      }

      // Generate order ID
      const orderId = `DL3D-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Build order items list (lightweight without heavy base64 to avoid quota limits)
      const orderItems = state.cart.map(item => ({
        name: item.name,
        fileName: item.fileName || (item.name.startsWith('Custom FDM Print: ') ? item.name.replace('Custom FDM Print: ', '') : (item.name.includes('.stl') ? item.name : null)),
        fileDataUrl: item.fileDataUrl && item.fileDataUrl.length < 20000 ? item.fileDataUrl : null,
        photoDataUrl: item.photoDataUrl && item.photoDataUrl.length < 20000 ? item.photoDataUrl : null,
        isCustomStl: Boolean(item.isCustomStl || item.name.includes('.stl') || item.name.startsWith('Custom FDM Print:')),
        isCustomGift: Boolean(item.isCustomGift || item.giftProductId || item.name.startsWith('Custom Gift:')),
        img: item.img || null,
        details: item.details || '',
        price: item.price,
        qty: item.qty,
        total: item.price * item.qty,
        filamentProductId: item.filamentProductId || null,
        filamentColorName: item.filamentColorName || null
      }));

      const itemsSubtotal = orderItems.reduce((sum, it) => sum + it.total, 0);
      const deliveryCalc = calculateDeliveryCharge(customerPincode, itemsSubtotal, deliveryMethod);
      const grandTotal = itemsSubtotal + deliveryCalc.charge;

      const newOrder = {
        orderId: orderId,
        userId: currentUser.id || null,
        customer: customerName,
        phone: customerPhone,
        email: customerEmail,
        deliveryMethod: deliveryMethod,
        deliveryCharge: deliveryCalc.charge,
        pincode: customerPincode,
        city: customerCity || 'Chennai',
        address: customerAddress,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        utr: null,
        items: orderItems,
        subtotal: itemsSubtotal,
        total: grandTotal,
        status: 'new',
        awb: null,
        courier_name: deliveryMethod === 'pickup' ? 'Self Pickup' : null,
        shipment_id: null,
        tracking_url: null,
        createdAt: Date.now()
      };

      // 1. Save order to admin stock localStorage with customer account and Shiprocket tracking hooks
      const adminStock = loadAdminStock();
      adminStock.orders = adminStock.orders || [];
      adminStock.orders.push(newOrder);
      saveAdminStock(adminStock);

      // 2. Save order directly to customer's account records for guaranteed persistence
      currentUser.myOrders = currentUser.myOrders || [];
      currentUser.myOrders.push(newOrder);
      setCurrentUser(currentUser);

      const allUsers = getAllUsers();
      const uIdx = allUsers.findIndex(u => u.id === currentUser.id || (u.email && u.email.toLowerCase() === currentUser.email.toLowerCase()));
      if (uIdx !== -1) {
        allUsers[uIdx].myOrders = allUsers[uIdx].myOrders || [];
        allUsers[uIdx].myOrders.push(newOrder);
        saveAllUsers(allUsers);
      }

      // Clear cart and close modals
      state.cart = [];
      saveCartAndRender();

      if (checkoutOverlay) checkoutOverlay.classList.remove('open');
      if (cartOverlay) cartOverlay.classList.remove('open');
      checkoutForm.reset();

      // Re-render filaments to show updated stock
      if (typeof filterFilaments === 'function') {
        filterFilaments();
      } else if (typeof renderFilaments === 'function' && typeof FILAMENT_PRODUCTS !== 'undefined') {
        renderFilaments(FILAMENT_PRODUCTS, 'filaments-grid-container');
      }

      const isOnlinePay = (paymentMethod === 'upi' || paymentMethod === 'card');
      if (isOnlinePay && typeof Pay0Gateway !== 'undefined') {
        showToast(`⚡ Redirecting to Pay0 UPI Gateway for Order ${orderId}...`);
        Pay0Gateway.initiateCheckout(newOrder);
      } else {
        showToast(`🎉 Order ${orderId} placed successfully! You can track it in My Orders.`);
        setTimeout(() => {
          if (typeof openMyOrdersModal === 'function') {
            openMyOrdersModal();
          }
        }, 1000);
      }
    });
  }

  // Escape Key to close all overlays
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (breakdownModalOverlay) breakdownModalOverlay.classList.remove('open');
      if (customQuoteOverlay) customQuoteOverlay.classList.remove('open');
      if (checkoutOverlay) checkoutOverlay.classList.remove('open');
      if (cartOverlay) cartOverlay.classList.remove('open');
    }
  });
}

// --- Real STL File Upload & Parser Engine ---
function handleFileUpload(file) {
  handleMultipleFileUpload([file]);
}

// Render geometry 100% flat flush on Creality PEI build plate bed in Three.js Scene (Zero Gap)
function renderParsedSTLMesh(geometry) {
  if (typeof scene === 'undefined' || !scene || !geometry) return;
  try {
    if (modelMesh) scene.remove(modelMesh);

    // 1. Compute target scale
    geometry.computeBoundingSphere();
    const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 15.0;
    const targetRadius = 18.0;
    const scale = radius > 0 ? targetRadius / radius : 1.0;

    // 2. Scale raw vertices in memory first
    geometry.scale(scale, scale, scale);

    // 3. Compute exact post-scale bounding box
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;

    const centerX = (bbox.max.x + bbox.min.x) / 2;
    const centerZ = (bbox.max.z + bbox.min.z) / 2;
    const minY = bbox.min.y;

    // 4. Translate so X & Z are centered, and Y_min is EXACTLY 0.000 (Zero-gap bed contact!)
    geometry.translate(-centerX, -minY, -centerZ);
    geometry.computeVertexNormals();

    const isWireframe = document.getElementById('btn-toggle-wireframe')?.classList.contains('active') || false;

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(state.quote.hexColor || 0x383838),
      roughness: 0.4,
      metalness: 0.2,
      wireframe: isWireframe,
      side: THREE.DoubleSide
    });

    modelMesh = new THREE.Mesh(geometry, material);
    modelMesh.position.set(0, 0, 0); // Position is (0,0,0) - bottom Y_min is 0.000 flush on bed plane
    scene.add(modelMesh);

    if (typeof resetCameraView === 'function') resetCameraView();
    if (typeof resizeViewer === 'function') resizeViewer();
  } catch (err) {
    console.warn('Main viewer render warning:', err);
  }
}

// --- Bulk 3D File Upload Engine (Fail-safe) ---
state.bulkFiles = [];
state.activeBulkIndex = 0;

function setWizardStep1(material, infillPercent, layerHeight) {
  if (state.bulkFiles && state.bulkFiles.length > 0) {
    state.bulkFiles.forEach(part => {
      part.material = material;
      part.infillPercent = infillPercent;
      part.layerHeight = layerHeight;
    });
    calculateQuote();
    showToast(`Applied: ${material.toUpperCase()}, ${infillPercent}% infill, ${layerHeight}mm layer height!`);
  } else {
    state.quote.material = material;
    state.quote.infillPercent = infillPercent;
    state.quote.layerHeight = layerHeight;
    showToast(`Selected: ${material.toUpperCase()}, ${infillPercent}% infill, ${layerHeight}mm layer height!`);
  }
  const modal = document.getElementById('param-guide-modal-overlay');
  if (modal) modal.classList.remove('open');
}
window.setWizardStep1 = setWizardStep1;

function handleMultipleFileUpload(files) {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return;

  const filenameElem = document.getElementById('viewer-filename-title');
  if (filenameElem) filenameElem.textContent = `Analyzing ${fileArray.length} file(s)...`;

  // Clear default sample model if present
  if (state.bulkFiles.length === 1 && state.bulkFiles[0].id && state.bulkFiles[0].id.includes('sample')) {
    state.bulkFiles = [];
  }

  let processed = 0;
  const startIndex = state.bulkFiles.length;

  const checkCompletion = () => {
    processed++;
    if (processed >= fileArray.length) {
      state.activeBulkIndex = Math.max(0, startIndex);
      calculateQuote();
      if (state.bulkFiles.length > 0 && state.bulkFiles[state.activeBulkIndex]) {
        selectBulkPart(state.activeBulkIndex);
      }
      showToast(`Successfully uploaded ${fileArray.length} 3D file(s)!`);
    }
  };

  fileArray.forEach(file => {
    const reader = new FileReader();

    reader.onerror = function() {
      console.warn('FileReader error for:', file.name);
      createFallbackPart(file);
      checkCompletion();
    };

    reader.onload = function(e) {
      try {
        const buffer = e.target.result;
        let geometry;

        if (typeof THREE !== 'undefined' && typeof THREE.STLLoader !== 'undefined') {
          try {
            const loader = new THREE.STLLoader();
            geometry = loader.parse(buffer);
          } catch (loaderErr) {
            console.warn('STLLoader parse warning:', loaderErr);
            const parsedData = parseSTL(buffer);
            geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(parsedData.positions, 3));
          }
        } else {
          const parsedData = parseSTL(buffer);
          geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(parsedData.positions, 3));
        }

        if (!geometry || !geometry.attributes.position || geometry.attributes.position.count === 0) {
          throw new Error('Geometry contains no vertices');
        }

        const triangleCount = geometry.attributes.position.count / 3;

        geometry.computeBoundingBox();
        let bbox = geometry.boundingBox;
        let rawX = bbox.max.x - bbox.min.x;
        let rawY = bbox.max.y - bbox.min.y;
        let rawZ = bbox.max.z - bbox.min.z;
        let maxDim = Math.max(rawX, rawY, rawZ);

        let unitScale = 1.0;
        if (maxDim > 0 && maxDim < 1.2) unitScale = 1000.0;
        else if (maxDim >= 1.2 && maxDim < 5.0 && (file.name.toLowerCase().includes('inch') || maxDim < 3.2)) unitScale = 25.4;

        if (unitScale !== 1.0) {
          geometry.scale(unitScale, unitScale, unitScale);
          geometry.computeBoundingBox();
          bbox = geometry.boundingBox;
        }

        let dimX = Math.round((bbox.max.x - bbox.min.x) * 100) / 100;
        let dimY = Math.round((bbox.max.y - bbox.min.y) * 100) / 100;
        let dimZ = Math.round((bbox.max.z - bbox.min.z) * 100) / 100;

        const positions = geometry.attributes.position.array;
        let totalSignedVolume = 0;

        for (let i = 0; i < positions.length; i += 9) {
          const x1 = positions[i],     y1 = positions[i+1], z1 = positions[i+2];
          const x2 = positions[i+3], y2 = positions[i+4], z2 = positions[i+5];
          const x3 = positions[i+6], y3 = positions[i+7], z3 = positions[i+8];

          const v321 = x3 * y2 * z1;
          const v231 = x2 * y3 * z1;
          const v312 = x3 * y1 * z2;
          const v132 = x1 * y3 * z2;
          const v213 = x2 * y1 * z3;
          const v123 = x1 * y2 * z3;

          totalSignedVolume += (-v321 + v231 + v312 - v132 - v213 + v123) / 6.0;
        }

        let rawVolCm3 = Math.abs(totalSignedVolume) / 1000.0;
        if (rawVolCm3 < 0.1) rawVolCm3 = (dimX * dimY * dimZ * 0.35) / 1000.0;
        const volumeCm3 = Math.max(0.5, Math.round(rawVolCm3 * 100) / 100);

        const centerX = (bbox.max.x + bbox.min.x) / 2;
        const centerZ = (bbox.max.z + bbox.min.z) / 2;
        const minY = bbox.min.y;
        geometry.translate(-centerX, -minY, -centerZ);
        geometry.computeVertexNormals();

        // Generate base64 DataURL for direct browser download in Admin Panel
        let fileDataUrl = null;
        try {
          const bytes = new Uint8Array(buffer);
          let binary = '';
          const maxBytes = Math.min(bytes.byteLength, 20000000); // Up to 20MB
          for (let b = 0; b < maxBytes; b++) {
            binary += String.fromCharCode(bytes[b]);
          }
          fileDataUrl = 'data:model/stl;base64,' + btoa(binary);
        } catch(bErr) {
          console.warn('Base64 encoding fallback:', bErr);
        }

        const partObj = {
          id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          fileName: file.name,
          fileDataUrl: fileDataUrl,
          geometry: geometry,
          dimX, dimY, dimZ,
          volumeCm3,
          triangleCount,
          material: state.quote.material || 'pla',
          color: state.quote.color || 'Pitch Black',
          hexColor: state.quote.hexColor || '#1A1A1A',
          layerHeight: state.quote.layerHeight || 0.20,
          infillPercent: state.quote.infillPercent || 20,
          support: state.quote.support || 'auto',
          scale: 1.0,
          qty: 1,
          postSanding: false,
          postPrimer: false,
          postPaint: false
        };

        calculateSinglePart(partObj);
        state.bulkFiles.push(partObj);
      } catch (err) {
        console.error('Error processing bulk file:', file.name, err);
        createFallbackPart(file);
      } finally {
        checkCompletion();
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

function createFallbackPart(file) {
  const geometry = typeof THREE !== 'undefined' ? new THREE.BoxGeometry(50, 50, 20) : null;
  const partObj = {
    id: `bulk-fb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    fileName: (file && file.name) ? file.name : 'uploaded_model.stl',
    geometry: geometry,
    dimX: 50.0, dimY: 50.0, dimZ: 20.0,
    volumeCm3: 15.0,
    triangleCount: 12,
    material: state.quote.material || 'pla',
    color: state.quote.color || 'Pitch Black',
    hexColor: state.quote.hexColor || '#1A1A1A',
    layerHeight: state.quote.layerHeight || 0.20,
    infillPercent: state.quote.infillPercent || 20,
    support: state.quote.support || 'auto',
    scale: 1.0,
    qty: 1,
    postSanding: false,
    postPrimer: false,
    postPaint: false
  };
  calculateSinglePart(partObj);
  state.bulkFiles.push(partObj);
}

function renderBulkQueue() {
  const listArea = document.getElementById('file-list-area');
  const countBadge = document.getElementById('panel-file-count');

  if (countBadge) countBadge.textContent = `${state.bulkFiles.length} file(s)`;

  if (!listArea) return;

  if (state.bulkFiles.length === 0) {
    listArea.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem;color:var(--text-dim);font-size:0.78rem;">
        Upload STL files to see them listed here
      </div>
    `;
    return;
  }

  listArea.innerHTML = state.bulkFiles.map((part, index) => `
    <div class="file-list-item ${index === state.activeBulkIndex ? 'active' : ''}" onclick="selectBulkPart(${index})">
      <div class="file-thumb">📁</div>
      <div class="file-meta">
        <div class="file-meta-name" title="${part.fileName}">${part.fileName}</div>
        <div class="file-meta-sub">${part.dimX}×${part.dimY}×${part.dimZ} mm | ${part.weightGrams}g</div>
      </div>
      <div class="file-qty-controls" onclick="event.stopPropagation();">
        <button type="button" class="btn-qty-mini" onclick="updatePartQty(${index}, -1)">-</button>
        <span class="qty-num">${part.qty || 1}</span>
        <button type="button" class="btn-qty-mini" onclick="updatePartQty(${index}, 1)">+</button>
      </div>
      <div class="file-meta-price">
        <span>₹${part.totalPrice || part.unitPrice || 0}</span>
        ${(part.qty || 1) > 1 ? `<span class="item-qty-sub">₹${part.unitPrice} ea</span>` : ''}
      </div>
      <button type="button" class="file-list-remove" title="Remove file" onclick="event.stopPropagation(); deleteBulkPart(${index});">✕</button>
    </div>
  `).join('');
}

function updatePartQty(index, delta) {
  if (index < 0 || index >= state.bulkFiles.length) return;
  const part = state.bulkFiles[index];
  part.qty = Math.max(1, (part.qty || 1) + delta);
  if (index === state.activeBulkIndex) {
    const qtyInput = document.getElementById('quote-qty');
    if (qtyInput) qtyInput.value = part.qty;
  }
  calculateQuote();
}

function selectBulkPart(index) {
  if (index < 0 || index >= state.bulkFiles.length) return;
  state.activeBulkIndex = index;
  const part = state.bulkFiles[index];

  const selMat = document.getElementById('select-material');
  if (selMat && part.material) selMat.value = part.material;

  const selColor = document.getElementById('select-color');
  if (selColor && part.hexColor) selColor.value = part.hexColor;

  const selLayer = document.getElementById('select-layer');
  if (selLayer && part.layerHeight) selLayer.value = part.layerHeight.toString();

  const selInfill = document.getElementById('select-infill');
  if (selInfill && part.infillPercent) selInfill.value = part.infillPercent.toString();

  const selSupport = document.getElementById('select-support');
  if (selSupport && part.support) selSupport.value = part.support;

  const inputScale = document.getElementById('input-scale');
  if (inputScale && part.scale) inputScale.value = Math.round(part.scale * 100).toString();

  const inputQty = document.getElementById('quote-qty');
  if (inputQty && part.qty) inputQty.value = part.qty.toString();

  const ppSanding = document.getElementById('pp-sanding');
  if (ppSanding) ppSanding.checked = part.postSanding || false;
  const ppPrimer = document.getElementById('pp-primer');
  if (ppPrimer) ppPrimer.checked = part.postPrimer || false;
  const ppPaint = document.getElementById('pp-paint');
  if (ppPaint) ppPaint.checked = part.postPaint || false;

  currentLoadedGeometry = part.geometry;
  if (part.geometry) renderParsedSTLMesh(part.geometry);

  calculateQuote();
}

function deleteBulkPart(index) {
  state.bulkFiles.splice(index, 1);
  if (state.activeBulkIndex >= state.bulkFiles.length) {
    state.activeBulkIndex = Math.max(0, state.bulkFiles.length - 1);
  }
  if (state.bulkFiles.length > 0) {
    selectBulkPart(state.activeBulkIndex);
  } else {
    state.bulkFiles = [];
    calculateQuote();
  }
  showToast('File removed from Parts List.');
}

// Binary & ASCII STL Parser with Exact Volume Calculation
function parseSTL(buffer) {
  const dataView = new DataView(buffer);
  const isBinary = checkIsBinary(buffer, dataView);
  
  if (isBinary) {
    return parseBinarySTL(dataView);
  } else {
    const text = new TextDecoder().decode(buffer);
    return parseAsciiSTL(text);
  }
}

function checkIsBinary(buffer, dataView) {
  if (buffer.byteLength < 84) return false;
  const numTriangles = dataView.getUint32(84, true);
  const expectedSize = 84 + numTriangles * 50;
  if (Math.abs(buffer.byteLength - expectedSize) < 500 && numTriangles > 0) {
    return true;
  }
  const sample = new TextDecoder().decode(buffer.slice(0, Math.min(buffer.byteLength, 500)));
  if (sample.trim().startsWith('solid') && sample.includes('facet')) {
    return false;
  }
  return true;
}

function parseBinarySTL(dataView) {
  const numTriangles = dataView.getUint32(84, true);
  const positions = new Float32Array(numTriangles * 9);
  let totalSignedVolume = 0;

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  let offset = 84;
  for (let i = 0; i < numTriangles; i++) {
    offset += 12;

    const x1 = dataView.getFloat32(offset, true); offset += 4;
    const y1 = dataView.getFloat32(offset, true); offset += 4;
    const z1 = dataView.getFloat32(offset, true); offset += 4;

    const x2 = dataView.getFloat32(offset, true); offset += 4;
    const y2 = dataView.getFloat32(offset, true); offset += 4;
    const z2 = dataView.getFloat32(offset, true); offset += 4;

    const x3 = dataView.getFloat32(offset, true); offset += 4;
    const y3 = dataView.getFloat32(offset, true); offset += 4;
    const z3 = dataView.getFloat32(offset, true); offset += 4;

    offset += 2;

    const idx = i * 9;
    positions[idx]     = x1; positions[idx + 1] = y1; positions[idx + 2] = z1;
    positions[idx + 3] = x2; positions[idx + 4] = y2; positions[idx + 5] = z2;
    positions[idx + 6] = x3; positions[idx + 7] = y3; positions[idx + 8] = z3;

    minX = Math.min(minX, x1, x2, x3); maxX = Math.max(maxX, x1, x2, x3);
    minY = Math.min(minY, y1, y2, y3); maxY = Math.max(maxY, y1, y2, y3);
    minZ = Math.min(minZ, z1, z2, z3); maxZ = Math.max(maxZ, z1, z2, z3);

    const v321 = x3 * y2 * z1;
    const v231 = x2 * y3 * z1;
    const v312 = x3 * y1 * z2;
    const v132 = x1 * y3 * z2;
    const v213 = x2 * y1 * z3;
    const v123 = x1 * y2 * z3;
    
    totalSignedVolume += (-v321 + v231 + v312 - v132 - v213 + v123) / 6.0;
  }

  const rawVolCm3 = Math.abs(totalSignedVolume) / 1000.0;
  const volumeCm3 = Math.max(0.5, Math.round(rawVolCm3 * 100) / 100);

  const dimX = Math.max(0.1, Math.round((maxX - minX) * 100) / 100);
  const dimY = Math.max(0.1, Math.round((maxY - minY) * 100) / 100);
  const dimZ = Math.max(0.1, Math.round((maxZ - minZ) * 100) / 100);

  return { positions, volumeCm3, dimX, dimY, dimZ };
}

function parseAsciiSTL(text) {
  const lines = text.split('\n');
  const vertices = [];
  let totalSignedVolume = 0;

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  let currentTriangle = [];

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('vertex')) {
      const parts = line.split(/\s+/);
      if (parts.length >= 4) {
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        currentTriangle.push(x, y, z);

        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);

        if (currentTriangle.length === 9) {
          vertices.push(...currentTriangle);
          
          const x1 = currentTriangle[0], y1 = currentTriangle[1], z1 = currentTriangle[2];
          const x2 = currentTriangle[3], y2 = currentTriangle[4], z2 = currentTriangle[5];
          const x3 = currentTriangle[6], y3 = currentTriangle[7], z3 = currentTriangle[8];

          const v321 = x3 * y2 * z1;
          const v231 = x2 * y3 * z1;
          const v312 = x3 * y1 * z2;
          const v132 = x1 * y3 * z2;
          const v213 = x2 * y1 * z3;
          const v123 = x1 * y2 * z3;
          
          totalSignedVolume += (-v321 + v231 + v312 - v132 - v213 + v123) / 6.0;
          currentTriangle = [];
        }
      }
    }
  }

  const positions = new Float32Array(vertices);
  const rawVolCm3 = Math.abs(totalSignedVolume) / 1000.0;
  const volumeCm3 = Math.max(0.5, Math.round(rawVolCm3 * 100) / 100);

  const dimX = Math.max(0.1, Math.round((maxX - minX) * 100) / 100);
  const dimY = Math.max(0.1, Math.round((maxY - minY) * 100) / 100);
  const dimZ = Math.max(0.1, Math.round((maxZ - minZ) * 100) / 100);

  return { positions, volumeCm3, dimX, dimY, dimZ };
}

// --- Render Helper Functions ---
function renderProducts(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const prods = items || getReadyProducts();

  container.innerHTML = prods.map(item => {
    const thumbImg = (item.images && item.images.length > 0) ? item.images[0] : (item.img || 'assets/dragon.png');
    const isOut = (item.stock !== undefined && item.stock <= 0);
    const detailUrl = `product-detail.html?id=${encodeURIComponent(item.id || item.sku)}`;

    return `
      <div class="product-card">
        <div class="product-img-wrapper">
          <span class="badge-tag ${item.tagClass || 'badge-primary'}">${item.tag || 'Ready'}</span>
          <a href="${detailUrl}">
            <img src="${thumbImg}" alt="${escapeHTML(item.name)}" style="width:100%; height:200px; object-fit:cover;">
          </a>
        </div>
        <div class="product-body">
          <a href="${detailUrl}" style="text-decoration:none;">
            <h3 class="product-title">${escapeHTML(item.name)}</h3>
          </a>
          <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:4px;">SKU: ${escapeHTML(item.sku || item.id)}</div>
          <p class="product-desc">${escapeHTML(item.desc || '')}</p>
          <div class="product-footer" style="margin-top:auto;">
            <div class="product-price">₹${item.price} <span style="font-size:0.72rem; color:var(--text-dim); font-weight:normal;">(Incl. GST)</span></div>
            <div style="display:flex; gap:6px;">
              <a href="${detailUrl}" class="btn btn-outline btn-sm">Details ↗</a>
              ${isOut ? `
                <button class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed;">Out of Stock</button>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="addReadyProductToCart('${item.id}', 1)">Add to Cart</button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- Initialize App on DOM Loaded ---
document.addEventListener('DOMContentLoaded', () => {
  // Seed admin stock from catalog defaults if first visit
  seedAdminStockFromCatalog();

  initThreeJSViewer();
  setupEventListeners();
  calculateQuote();
  renderProducts(PREPRINTED_PRODUCTS, 'products-grid-container');
  renderFilaments(FILAMENT_PRODUCTS, 'filaments-grid-container');
  setupFilamentStoreListeners();
  loadCartFromStorage();
});

function renderFilaments(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
        <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: #fff;">No Filaments Found</h3>
        <p style="font-size: 0.9rem;">Try adjusting your search keywords or material category filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item) => {
    const firstColor = (item.colors && item.colors.length > 0) ? item.colors[0] : { name: 'Standard', hex: '#121212', stock: 10 };
    const initialColorName = firstColor.name;
    // Get live stock & live price from admin data
    const initialStock = getAdminStockForColor(item.id, firstColor.name) || firstColor.stock;
    const initialPrice = getAdminPriceForFilament(item.id, firstColor.name) || item.price;

    const colorsHTML = (item.colors || []).map((col, cIdx) => {
      const isActive = cIdx === 0 ? 'active' : '';
      const isGradient = col.hex.includes('gradient');
      const bgStyle = isGradient ? `background: ${col.hex};` : `background-color: ${col.hex};`;
      // Get live stock from admin
      const liveStock = getAdminStockForColor(item.id, col.name) || col.stock;
      return `
        <button type="button" 
                class="swatch-dot ${isActive}" 
                style="${bgStyle}" 
                title="${col.name} (${liveStock} in stock)" 
                onclick="selectFilamentColor('${item.id}', ${cIdx}, '${col.name.replace(/'/g, "\\'")}', ${liveStock})">
        </button>
      `;
    }).join('');

    return `
      <div class="product-card filament-card" id="fil-card-${item.id}">
        <div class="product-img-wrapper">
          <span class="badge-tag ${item.tagClass || 'badge-primary'}">${item.tag}</span>
          <img src="${item.img}" alt="${item.name}" class="product-main-img">
          <button type="button" class="view-sample-btn" onclick="openTechSpecsModal('${item.id}')">
            🔍 Sample Print & Specs
          </button>
        </div>
        <div class="product-body">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.3rem;">
            <h3 class="product-title">${item.name}</h3>
            <div class="rating-badge">★ ${item.rating} <span style="font-size: 0.75rem; color: var(--text-dim);">(${item.reviews || 45})</span></div>
          </div>
          
          <p class="product-desc">${item.desc}</p>

          <!-- Color Swatch Selection -->
          <div class="swatch-container">
            <div class="swatch-header">
              <span class="swatch-label">Color: <strong class="selected-color-name" id="color-name-${item.id}">${initialColorName}</strong></span>
              <span class="stock-badge in-stock" id="color-stock-${item.id}">● ${initialStock} Spools in stock</span>
            </div>
            <div class="swatch-dots-row">
              ${colorsHTML}
            </div>
          </div>

          <div class="product-specs">
            ${item.specs.map(s => `<span class="spec-chip">${s}</span>`).join('')}
          </div>

          <div class="product-footer" style="margin-top: 1rem; flex-wrap: wrap; gap: 0.8rem; align-items: center;">
            <div>
              <div class="product-price" id="price-val-${item.id}">₹${initialPrice} <span style="font-size:0.75rem; color:var(--text-dim); font-weight:normal;">/ 1kg Spool</span></div>
              <div style="font-size: 0.72rem; color: var(--success);">✔ 1.75mm ±0.02mm Sealed</div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
              <div class="qty-counter">
                <button type="button" class="qty-btn" onclick="changeFilamentQty('${item.id}', -1)">-</button>
                <span class="qty-val" id="qty-val-${item.id}">1</span>
                <button type="button" class="qty-btn" onclick="changeFilamentQty('${item.id}', 1)">+</button>
              </div>

              <button class="btn btn-primary btn-sm" onclick="addFilamentToCart('${item.id}')">
                Buy Spool
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Selected state per filament card
const filamentSelections = {};

function selectFilamentColor(itemId, colorIndex, colorName, stock) {
  if (!filamentSelections[itemId]) {
    filamentSelections[itemId] = { color: colorName, qty: 1 };
  } else {
    filamentSelections[itemId].color = colorName;
  }

  // Always fetch real-time live stock & price from admin data
  const liveStock = getAdminStockForColor(itemId, colorName);
  const livePrice = getAdminPriceForFilament(itemId, colorName) || 810;

  const nameElem = document.getElementById(`color-name-${itemId}`);
  const stockElem = document.getElementById(`color-stock-${itemId}`);
  const priceElem = document.getElementById(`price-val-${itemId}`);
  const card = document.getElementById(`fil-card-${itemId}`);

  if (nameElem) nameElem.textContent = colorName;
  if (priceElem) {
    priceElem.innerHTML = `₹${livePrice} <span style="font-size:0.75rem; color:var(--text-dim); font-weight:normal;">/ 1kg Spool</span>`;
  }

  if (stockElem) {
    if (liveStock <= 0) {
      stockElem.className = 'stock-badge out-of-stock';
      stockElem.style.background = '#3b1d1d';
      stockElem.style.color = '#ef4444';
      stockElem.textContent = '❌ Out of stock';
    } else if (liveStock <= 5) {
      stockElem.className = 'stock-badge low-stock';
      stockElem.style.background = '';
      stockElem.style.color = '';
      stockElem.textContent = `⚡ Only ${liveStock} left in stock!`;
    } else {
      stockElem.className = 'stock-badge in-stock';
      stockElem.style.background = '';
      stockElem.style.color = '';
      stockElem.textContent = `● ${liveStock} Spools in stock`;
    }
  }

  if (card) {
    const dots = card.querySelectorAll('.swatch-dot');
    dots.forEach((dot, idx) => {
      if (idx === colorIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
}

// Live multi-tab synchronization when Admin modifies stock or price in another tab
window.addEventListener('storage', (e) => {
  if (e.key === 'dl3d_stock_v1') {
    if (typeof filterFilaments === 'function') {
      filterFilaments();
    }
  }
});

function changeFilamentQty(itemId, delta) {
  if (!filamentSelections[itemId]) {
    filamentSelections[itemId] = { color: '', qty: 1 };
  }
  let currentQty = filamentSelections[itemId].qty || 1;
  currentQty += delta;
  if (currentQty < 1) currentQty = 1;
  if (currentQty > 20) currentQty = 20;

  filamentSelections[itemId].qty = currentQty;

  const qtyElem = document.getElementById(`qty-val-${itemId}`);
  if (qtyElem) qtyElem.textContent = currentQty;
}

function addFilamentToCart(itemId) {
  const item = FILAMENT_PRODUCTS.find(x => x.id === itemId);
  if (!item) return;

  const selectedColor = (filamentSelections[itemId] && filamentSelections[itemId].color) 
    ? filamentSelections[itemId].color 
    : (item.colors && item.colors.length > 0 ? item.colors[0].name : 'Pitch Black');
  
  const selectedQty = (filamentSelections[itemId] && filamentSelections[itemId].qty) 
    ? filamentSelections[itemId].qty 
    : 1;

  // Check live admin stock before adding to cart
  const availableStock = getAdminStockForColor(itemId, selectedColor);
  if (selectedQty > availableStock) {
    showToast(`Not enough stock! Only ${availableStock} spool(s) of "${selectedColor}" available.`);
    return;
  }

  // Get live price from admin data
  const livePrice = getAdminPriceForFilament(itemId, selectedColor) || item.price;

  const cartItem = {
    id: `${item.id}-${Date.now()}`,
    name: `${item.name}`,
    details: `1.75mm Spool (${selectedColor})`,
    price: livePrice,
    qty: selectedQty,
    img: item.img,
    // Track which filament product and color for stock deduction at checkout
    filamentProductId: item.id,
    filamentColorName: selectedColor
  };

  addToCart(cartItem);
  showToast(`Added ${selectedQty}x "${item.name} (${selectedColor})" at ₹${livePrice}/spool to cart!`);
}

function addReadyProductToCart(productId, qty = 1) {
  const prod = getReadyProductById(productId);
  if (!prod) return;
  if (prod.stock !== undefined && prod.stock <= 0) {
    showToast(`Sorry, "${prod.name}" is currently Out of Stock!`);
    return;
  }
  const imgUrl = (prod.images && prod.images.length > 0) ? prod.images[0] : (prod.img || 'assets/dragon.png');
  const cartItem = {
    id: `ready-${prod.id}-${Date.now()}`,
    productId: prod.id,
    name: prod.name,
    sku: prod.sku || '',
    details: `Category: ${prod.category} | SKU: ${prod.sku || 'N/A'}`,
    price: prod.price,
    qty: Number(qty) || 1,
    img: imgUrl
  };
  addToCart(cartItem);
  showToast(`🛒 Added ${qty}x "${prod.name}" to cart!`);
  const cartOverlay = document.getElementById('cart-drawer-overlay');
  if (cartOverlay) cartOverlay.classList.add('open');
}
window.addReadyProductToCart = addReadyProductToCart;

function addStoreItemToCart(id, type) {
  if (type === 'product') {
    addReadyProductToCart(id, 1);
  }
}
window.addStoreItemToCart = addStoreItemToCart;

function openTechSpecsModal(itemId) {
  const item = FILAMENT_PRODUCTS.find(x => x.id === itemId);
  if (!item) return;

  let modal = document.getElementById('tech-specs-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'tech-specs-modal-overlay';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const td = item.techDetails || {};
  const selectedColor = (filamentSelections[itemId] && filamentSelections[itemId].color) 
    ? filamentSelections[itemId].color 
    : (item.colors && item.colors.length > 0 ? item.colors[0].name : 'Default');

  // Live admin price in specs modal
  const livePrice = getAdminPriceForFilament(itemId, selectedColor) || item.price;

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 680px;">
      <div class="modal-header">
        <h3>🔬 Technical Specs & Sample Print</h3>
        <button class="modal-close-btn" onclick="closeTechSpecsModal()">✕</button>
      </div>
      <div class="modal-body" style="max-height: 80vh; overflow-y: auto;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.2rem;" class="specs-modal-grid">
          <div>
            <div class="sample-img-card" style="position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-glow); background: rgba(0,0,0,0.5);">
              <img src="${item.sampleImg || item.img}" alt="Sample Print" style="width: 100%; height: 220px; object-fit: cover; display: block;">
              <div style="position: absolute; bottom: 8px; left: 8px; right: 8px; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); padding: 6px 10px; border-radius: 6px; font-size: 0.78rem; color: var(--primary);">
                📷 Real FDM Sample Print (${selectedColor})
              </div>
            </div>
          </div>
          <div>
            <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.4rem;">${item.name}</h4>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary); margin-bottom: 0.8rem;">₹${livePrice} <span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal;">/ 1kg spool</span></div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">${item.desc}</p>
            <div style="font-size: 0.82rem; color: var(--text-main); font-weight: 600;">
              ✔ Tolerance: ±0.02mm | 100% Vacuum Sealed with Desiccant
            </div>
          </div>
        </div>

        <h4 style="font-size: 0.95rem; color: var(--primary); margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.5px;">Material Technical Parameters</h4>
        <table class="tech-spec-table">
          <tr><th>Recommended Printing Temp:</th><td>${item.specs[0] || '190-220°C'}</td></tr>
          <tr><th>Recommended Heated Bed Temp:</th><td>${item.specs[1] || '50-60°C'}</td></tr>
          <tr><th>Tensile Yield Strength:</th><td>${td.tensile || '55 MPa'}</td></tr>
          <tr><th>Heat Deflection Temp (HDT):</th><td>${td.heatDeflection || '55°C'}</td></tr>
          <tr><th>Nozzle Type Compatibility:</th><td>${td.nozzle || 'Standard Brass 0.4mm'}</td></tr>
          <tr><th>Max Printing Speed:</th><td>${td.speed || 'Up to 500 mm/s'}</td></tr>
          <tr><th>Filament Drying Guideline:</th><td>${td.drying || '50°C for 4 hours'}</td></tr>
          <tr><th>Recommended Applications:</th><td>${td.idealFor || 'Prototyping & end-use models'}</td></tr>
        </table>

        <div style="margin-top: 1.2rem; display: flex; justify-content: flex-end; gap: 0.8rem;">
          <button class="btn btn-secondary" onclick="closeTechSpecsModal()">Close</button>
          <button class="btn btn-primary" onclick="addFilamentToCart('${item.id}'); closeTechSpecsModal();">
            🛒 Buy ${item.name}
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeTechSpecsModal() {
  const modal = document.getElementById('tech-specs-modal-overlay');
  if (modal) modal.classList.remove('open');
}

function filterFilaments() {
  const searchInput = document.getElementById('filament-search-input');
  const sortSelect = document.getElementById('filament-sort-select');
  const activeTab = document.querySelector('.filter-btn.active[data-filter-fil]');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const category = activeTab ? activeTab.getAttribute('data-filter-fil') : 'all';
  const sortBy = sortSelect ? sortSelect.value : 'featured';

  let filtered = FILAMENT_PRODUCTS.filter(item => {
    const matchesCat = (category === 'all') || (item.category === category);
    const matchesQuery = !query || 
      item.name.toLowerCase().includes(query) || 
      item.desc.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.colors && item.colors.some(c => c.name.toLowerCase().includes(query)));
    return matchesCat && matchesQuery;
  });

  if (sortBy === 'price-low') {
    filtered.sort((a, b) => (getAdminPriceForFilament(a.id) || a.price) - (getAdminPriceForFilament(b.id) || b.price));
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => (getAdminPriceForFilament(b.id) || b.price) - (getAdminPriceForFilament(a.id) || a.price));
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderFilaments(filtered, 'filaments-grid-container');
}

function setupFilamentStoreListeners() {
  const filterBtns = document.querySelectorAll('.filter-btn[data-filter-fil]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      filterFilaments();
    });
  });

  const searchInput = document.getElementById('filament-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', filterFilaments);
  }

  const sortSelect = document.getElementById('filament-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', filterFilaments);
  }
}

// --- Cart Operations ---
function addStoreItemToCart(id, type) {
  const source = type === 'product' ? PREPRINTED_PRODUCTS : FILAMENT_PRODUCTS;
  const item = source.find(x => x.id === id);
  if (!item) return;

  const cartItem = {
    id: `${item.id}-${Date.now()}`,
    name: item.name,
    details: type === 'product' ? 'FDM Pre-printed' : '1.75mm Spool',
    price: item.price,
    qty: 1,
    img: item.img
  };

  addToCart(cartItem);
  showToast(`Added "${item.name}" to cart!`);
}

function addToCart(item) {
  state.cart.push(item);
  saveCartAndRender();
  document.getElementById('cart-drawer-overlay').classList.add('open');
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  saveCartAndRender();
}

function saveCartAndRender() {
  localStorage.setItem('dloop3d_cart', JSON.stringify(state.cart));
  renderCart();
}

function loadCartFromStorage() {
  const saved = localStorage.getItem('dloop3d_cart');
  if (saved) {
    try {
      state.cart = JSON.parse(saved).map(item => {
        if (item && item.details) {
          item.details = item.details.replace('(null)', '(Pitch Black)');
        }
        return item;
      });
    } catch(e) { state.cart = []; }
  }
  renderCart();
}

function updateCartItemQty(index, change) {
  if (state.cart && state.cart[index]) {
    const newQty = (state.cart[index].qty || 1) + change;
    if (newQty <= 0) {
      removeFromCart(index);
    } else {
      state.cart[index].qty = newQty;
      saveCartAndRender();
    }
  }
}
window.updateCartItemQty = updateCartItemQty;

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-count');
  const totalElem = document.getElementById('cart-total-price');

  if (countBadge) {
    const totalCount = state.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    countBadge.textContent = totalCount;
  }

  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: #64748B;">
        <div style="font-size: 3rem; margin-bottom: 0.8rem;">🛒</div>
        <h4 style="font-weight: 700; color: #0F172A; margin-bottom: 0.4rem; font-size: 1.05rem;">Your Cart is Empty</h4>
        <p style="font-size: 0.82rem; color: #64748B; line-height: 1.5; max-width: 240px; margin: 0 auto 1.2rem;">Explore our filaments, 3D gifts, or upload your 3D model (STL).</p>
        <a href="filaments.html" class="btn btn-outline btn-sm" style="font-size: 0.8rem;" onclick="document.getElementById('cart-drawer-overlay').classList.remove('open')">Browse Filaments</a>
      </div>
    `;
    if (totalElem) totalElem.textContent = '₹0';
    return;
  }

  let grandTotal = 0;
  container.innerHTML = state.cart.map((item, index) => {
    const itemTotal = item.price * (item.qty || 1);
    grandTotal += itemTotal;
    const cleanDetails = (item.details || '').replace('(null)', '(Pitch Black)');
    const imgSrc = item.img || 'assets/lithophane.png';

    return `
      <div class="cart-item">
        <img src="${imgSrc}" class="cart-item-img" alt="${escapeHTML(item.name)}" onerror="this.src='assets/lithophane.png'">
        <div class="cart-item-details">
          <div class="cart-item-title" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</div>
          ${cleanDetails ? `<div class="cart-item-sub" title="${escapeHTML(cleanDetails)}">${escapeHTML(cleanDetails)}</div>` : ''}
          <div class="cart-item-price-row">
            <div class="cart-item-price">₹${itemTotal.toLocaleString()}</div>
            <div class="cart-qty-ctrls">
              <button type="button" class="cart-qty-btn" onclick="updateCartItemQty(${index}, -1)" title="Decrease quantity">−</button>
              <span class="cart-qty-val">${item.qty || 1}</span>
              <button type="button" class="cart-qty-btn" onclick="updateCartItemQty(${index}, 1)" title="Increase quantity">+</button>
            </div>
          </div>
        </div>
        <button type="button" class="cart-item-remove" title="Remove item" onclick="removeFromCart(${index})">✕</button>
      </div>
    `;
  }).join('');

  if (totalElem) totalElem.textContent = `₹${grandTotal.toLocaleString()}`;
}

// Toast helper
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================================================
// Customer Authentication & Shiprocket Order Tracking System
// ==========================================================================

function escapeHTML(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}
window.escapeHTML = escapeHTML;

const AUTH_USERS_KEY = 'dl3d_users';
const AUTH_SESSION_KEY = 'dl3d_current_user';

function getAllUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
  } catch(e) {
    return [];
  }
}

function saveAllUsers(users) {
  try {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  } catch(e) {}
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) {
    return null;
  }
}

function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
    updateUserNavUI();
  } catch(e) {}
}

function loginUser(email, password) {
  const users = getAllUsers();
  const found = users.find(u => (u.email || '').toLowerCase().trim() === email.toLowerCase().trim() && u.password === password);
  if (!found) {
    return { success: false, message: 'Invalid email or password.' };
  }
  setCurrentUser(found);
  return { success: true, user: found };
}

function signupUser(userData) {
  const users = getAllUsers();
  const exists = users.some(u => (u.email || '').toLowerCase().trim() === userData.email.toLowerCase().trim());
  if (exists) {
    return { success: false, message: 'An account with this email address already exists.' };
  }
  const newUser = {
    id: `usr-${Date.now()}`,
    name: userData.name.trim(),
    email: userData.email.toLowerCase().trim(),
    phone: userData.phone.trim(),
    password: userData.password,
    address: (userData.address || '').trim(),
    city: (userData.city || '').trim(),
    pincode: (userData.pincode || '').trim(),
    createdAt: Date.now()
  };
  users.push(newUser);
  saveAllUsers(users);
  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

function logoutUser() {
  setCurrentUser(null);
  showToast('You have been signed out.');
  const dropdown = document.getElementById('nav-user-dropdown');
  if (dropdown) dropdown.classList.remove('open');
  updateUserNavUI();
}

// Update the Navbar Account button across all pages
function updateUserNavUI() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  let userWrapper = document.getElementById('nav-user-wrapper');
  if (!userWrapper) {
    userWrapper = document.createElement('div');
    userWrapper.id = 'nav-user-wrapper';
    userWrapper.className = 'nav-user-wrapper';
    // Insert before cart-trigger
    const cartTrigger = document.getElementById('cart-trigger');
    if (cartTrigger) {
      navActions.insertBefore(userWrapper, cartTrigger);
    } else {
      navActions.appendChild(userWrapper);
    }
  }

  const currentUser = getCurrentUser();
  if (currentUser) {
    const firstName = currentUser.name.split(' ')[0] || 'Customer';
    userWrapper.innerHTML = `
      <button type="button" class="nav-user-btn" id="nav-user-toggle">
        <span>👤</span> <span>Hi, ${escapeHTML(firstName)}</span> <span style="font-size:0.65rem">▼</span>
      </button>
      <div class="nav-user-dropdown" id="nav-user-dropdown">
        <div class="dropdown-user-header">
          <div class="dropdown-user-name">${escapeHTML(currentUser.name)}</div>
          <div class="dropdown-user-email">${escapeHTML(currentUser.email)}</div>
        </div>
        <a href="account.html#orders" class="dropdown-item">
          <span>📦</span> <span>My Orders & Tracking</span>
        </a>
        <a href="account.html#cart" class="dropdown-item">
          <span>🛒</span> <span>My Carts</span>
        </a>
        <a href="account.html#addresses" class="dropdown-item">
          <span>📍</span> <span>My Addresses</span>
        </a>
        <a href="account.html#profile" class="dropdown-item">
          <span>👤</span> <span>My Profile</span>
        </a>
        <button type="button" class="dropdown-item danger" onclick="logoutUser()">
          <span>🚪</span> <span>Sign Out</span>
        </button>
      </div>
    `;

    document.getElementById('nav-user-toggle')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('nav-user-dropdown')?.classList.toggle('open');
    });
  } else {
    userWrapper.innerHTML = `
      <a href="account.html" class="nav-user-btn" style="text-decoration:none;">
        <span>👤</span> <span>Login / Sign Up</span>
      </a>
    `;
  }
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#nav-user-wrapper')) {
    document.getElementById('nav-user-dropdown')?.classList.remove('open');
  }
});

// Modal Manager: Auth Modal
function openAuthModal(noticeMessage = '') {
  let modal = document.getElementById('auth-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'auth-modal-overlay';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="auth-card">
      <div class="auth-header">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:1.15rem; color:#fff; font-weight:800;" id="auth-modal-title">Welcome to D Loop 3D</h3>
          <button class="modal-close-btn" onclick="closeAuthModal()">✕</button>
        </div>
        ${noticeMessage ? `<div style="background:rgba(0,242,254,0.1); border:1px solid rgba(0,242,254,0.3); color:var(--primary); padding:8px 12px; border-radius:6px; font-size:0.8rem; margin-top:10px;">${escapeHTML(noticeMessage)}</div>` : ''}
        
        <div class="auth-tabs">
          <button class="auth-tab active" id="tab-login-btn" onclick="switchAuthTab('login')">Sign In</button>
          <button class="auth-tab" id="tab-signup-btn" onclick="switchAuthTab('signup')">Create Account</button>
        </div>
      </div>

      <div class="auth-body">
        <!-- Sign In Form -->
        <form id="auth-login-form" class="auth-form" onsubmit="handleLoginFormSubmit(event)">
          <div>
            <label class="auth-field-label">Email Address *</label>
            <input type="email" id="login-email" class="auth-input" placeholder="name@example.com" required>
          </div>
          <div>
            <label class="auth-field-label">Password *</label>
            <input type="password" id="login-password" class="auth-input" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; padding:0.85rem; font-weight:700; margin-top:0.4rem;">
            Sign In & Continue
          </button>
        </form>

        <!-- Sign Up Form -->
        <form id="auth-signup-form" class="auth-form" style="display:none;" onsubmit="handleSignupFormSubmit(event)">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem;">
            <div>
              <label class="auth-field-label">Full Name *</label>
              <input type="text" id="signup-name" class="auth-input" placeholder="John Doe" required>
            </div>
            <div>
              <label class="auth-field-label">Phone Number *</label>
              <input type="tel" id="signup-phone" class="auth-input" placeholder="+91 98765 43210" required>
            </div>
          </div>

          <div>
            <label class="auth-field-label">Email Address *</label>
            <input type="email" id="signup-email" class="auth-input" placeholder="john@example.com" required>
          </div>

          <div>
            <label class="auth-field-label">Create Password *</label>
            <input type="password" id="signup-password" class="auth-input" placeholder="At least 6 characters" minlength="6" required>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label class="auth-field-label" style="margin:0;">Delivery Shipping Address *</label>
              <button type="button" class="btn btn-outline btn-sm" onclick="triggerAuthGPSFill()" style="font-size:0.72rem; padding:2px 8px;">
                📍 GPS Auto-Fill
              </button>
            </div>
            <textarea id="signup-address" class="auth-input" rows="2" placeholder="House/Flat No, Street, Landmark" required style="resize:none;"></textarea>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem;">
            <div>
              <label class="auth-field-label">City *</label>
              <input type="text" id="signup-city" class="auth-input" placeholder="Chennai" required>
            </div>
            <div>
              <label class="auth-field-label">Pincode *</label>
              <input type="text" id="signup-pincode" class="auth-input" placeholder="600001" required maxlength="6" oninput="handleAuthPincodeInput(this.value)">
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%; padding:0.85rem; font-weight:700; margin-top:0.4rem;">
            Create Account & Continue
          </button>
        </form>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

window.handleAuthPincodeInput = async function(val) {
  const pin = String(val || '').trim();
  if (pin.length === 6) {
    const details = await lookupPincodeDetails(pin);
    if (details) {
      const cityInput = document.getElementById('signup-city') || document.getElementById('p-signup-city');
      const addrInput = document.getElementById('signup-address') || document.getElementById('p-signup-address');
      if (cityInput && !cityInput.value) cityInput.value = details.city;
      if (addrInput && !addrInput.value && details.area) addrInput.value = `${details.area}, ${details.district}`;
    }
  }
};

window.triggerAuthGPSFill = function() {
  showToast('📍 Detecting GPS location...');
  detectLocationFromGPS(
    (res) => {
      const addrInput = document.getElementById('signup-address') || document.getElementById('p-signup-address');
      const cityInput = document.getElementById('signup-city') || document.getElementById('p-signup-city');
      const pinInput = document.getElementById('signup-pincode') || document.getElementById('p-signup-pincode');
      if (addrInput) addrInput.value = res.address;
      if (cityInput) cityInput.value = res.city;
      if (pinInput) pinInput.value = res.pincode;
      showToast(`✔ Auto-filled: ${res.city} - ${res.pincode}`);
    },
    (err) => {
      showToast(`Location error: ${err}`);
    }
  );
};

function closeAuthModal() {
  const modal = document.getElementById('auth-modal-overlay');
  if (modal) modal.classList.remove('open');
}

function switchAuthTab(tab) {
  const loginBtn = document.getElementById('tab-login-btn');
  const signupBtn = document.getElementById('tab-signup-btn');
  const loginForm = document.getElementById('auth-login-form');
  const signupForm = document.getElementById('auth-signup-form');

  if (tab === 'login') {
    loginBtn?.classList.add('active');
    signupBtn?.classList.remove('active');
    if (loginForm) loginForm.style.display = 'flex';
    if (signupForm) signupForm.style.display = 'none';
  } else {
    loginBtn?.classList.remove('active');
    signupBtn?.classList.add('active');
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'flex';
  }
}

function handleLoginFormSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;

  const result = loginUser(email, pass);
  if (!result.success) {
    showToast(`❌ ${result.message}`);
    return;
  }

  showToast(`👋 Welcome back, ${result.user.name}!`);
  closeAuthModal();

  // Resume checkout if user was trying to place an order
  if (window.pendingCheckoutAction) {
    const action = window.pendingCheckoutAction;
    window.pendingCheckoutAction = null;
    action();
  }
}

function handleSignupFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name')?.value.trim() || '';
  const phone = document.getElementById('signup-phone')?.value.trim() || '';
  const email = document.getElementById('signup-email')?.value.trim() || '';
  const password = document.getElementById('signup-password')?.value || '';
  const address = document.getElementById('signup-address')?.value.trim() || '';
  const city = document.getElementById('signup-city')?.value.trim() || 'Chennai';
  const pincode = document.getElementById('signup-pincode')?.value.trim() || '';

  const data = { name, phone, email, password, address, city, pincode };

  const result = signupUser(data);
  if (!result.success) {
    showToast(`❌ ${result.message}`);
    return;
  }

  showToast(`🎉 Account created! Welcome, ${result.user.name}.`);
  closeAuthModal();

  if (window.pendingCheckoutAction) {
    const action = window.pendingCheckoutAction;
    window.pendingCheckoutAction = null;
    action();
  }
}

// Modal Manager: My Orders & Shiprocket Live Tracking
function openMyOrdersModal() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    openAuthModal('Please sign in to view your orders and live shipment tracking.');
    return;
  }

  let modal = document.getElementById('orders-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'orders-modal-overlay';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const adminStock = loadAdminStock();
  const allOrders = [...(adminStock.orders || [])];
  if (currentUser.myOrders && Array.isArray(currentUser.myOrders)) {
    currentUser.myOrders.forEach(co => {
      if (!allOrders.some(o => o.orderId === co.orderId)) {
        allOrders.push(co);
      }
    });
  }
  
  const userEmail = (currentUser.email || '').toLowerCase().trim();
  const userPhone = (currentUser.phone || '').replace(/\D/g, '');

  // Match orders by customer email, userId, phone or name
  const myOrders = allOrders.filter(o => {
    const oEmail = (o.email || '').toLowerCase().trim();
    const oPhone = (o.phone || '').replace(/\D/g, '');
    const emailMatch = Boolean(oEmail && userEmail && oEmail === userEmail);
    const phoneMatch = Boolean(oPhone && userPhone && (oPhone === userPhone || oPhone.endsWith(userPhone) || userPhone.endsWith(oPhone)));
    const userMatch = Boolean(o.userId && currentUser.id && o.userId === currentUser.id);
    const nameMatch = Boolean(o.customer && currentUser.name && o.customer.toLowerCase().trim() === currentUser.name.toLowerCase().trim());
    return emailMatch || userMatch || phoneMatch || nameMatch;
  });

  let ordersListHtml = '';
  if (myOrders.length === 0) {
    ordersListHtml = `
      <div style="text-align:center; padding:3.5rem 1rem; color:var(--text-muted);">
        <div style="font-size:3rem; margin-bottom:0.8rem;">📦</div>
        <h4 style="color:#fff; font-size:1.1rem; margin-bottom:0.4rem;">No Orders Placed Yet</h4>
        <p style="font-size:0.85rem; color:var(--text-dim); margin-bottom:1.2rem;">Your 3D prints, custom lithophanes, and filament spools will appear here with live tracking.</p>
        <a href="filaments.html" class="btn btn-primary btn-sm" onclick="closeMyOrdersModal()">Shop Filaments</a>
      </div>
    `;
  } else {
    // Show newest first
    const reversed = [...myOrders].reverse();
    ordersListHtml = reversed.map((order, idx) => {
      const statusMap = {
        'new': { text: 'Order Placed', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)', step: 1 },
        'processing': { text: 'In Production / Packed', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', step: 2 },
        'shipped': { text: 'Dispatched (In-Transit)', color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', step: 3 },
        'delivered': { text: 'Delivered', color: '#34d399', bg: 'rgba(16,185,129,0.15)', step: 4 }
      };

      const statusInfo = statusMap[order.status] || statusMap['new'];
      const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : 'Recent';

      // Items breakdown
      let itemsListHtml = '';
      if (order.items && Array.isArray(order.items)) {
        itemsListHtml = order.items.map(it => `
          <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:0.85rem; color:var(--text-main);">
            <span><strong>${escapeHTML(it.name)}</strong> ${it.details ? `<span style="color:var(--text-dim)">(${escapeHTML(it.details)})</span>` : ''} × ${it.qty}</span>
            <span style="font-weight:700; color:var(--primary);">₹${it.total || it.price * it.qty}</span>
          </div>
        `).join('');
      }

      // Shiprocket tracking block
      const hasAWB = order.awb || order.tracking_url;
      const awbNumber = order.awb || 'Generating...';
      const courierName = order.courier_name || 'Shiprocket Express';
      const trackingUrl = order.tracking_url || (order.awb ? `https://shiprocket.co/tracking/${order.awb}` : null);

      return `
        <div class="customer-order-card">
          <div class="order-card-top">
            <div>
              <div class="order-code">🔖 ${escapeHTML(order.orderId || 'Order #' + (myOrders.length - idx))}</div>
              <div class="order-date-text">Placed on ${dateStr}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="status-badge" style="background:${statusInfo.bg}; color:${statusInfo.color};">
                ● ${statusInfo.text}
              </span>
            </div>
          </div>

          <!-- Items Breakdown -->
          <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); padding:10px 14px; border-radius:8px; margin-bottom:12px;">
            ${itemsListHtml}
            <div style="display:flex; justify-content:space-between; border-top:1px dashed rgba(255,255,255,0.1); margin-top:8px; padding-top:8px; font-weight:800; font-size:0.95rem;">
              <span>Total Paid:</span>
              <span style="color:var(--primary);">₹${(order.total || 0).toLocaleString()}</span>
            </div>
          </div>

          <!-- Shiprocket Tracking Timeline Box -->
          <div class="shiprocket-box">
            <div class="shiprocket-header">
              <div class="shiprocket-brand">
                <span class="shiprocket-brand-icon">SR</span>
                <span>Shiprocket Logistics Tracking</span>
                ${hasAWB ? `<span class="awb-badge">AWB: ${escapeHTML(awbNumber)}</span>` : ''}
              </div>
              <div>
                ${courierName ? `<span style="font-size:0.75rem; color:var(--text-muted); margin-right:8px;">Courier: <strong>${escapeHTML(courierName)}</strong></span>` : ''}
                ${trackingUrl ? `
                  <a href="${trackingUrl}" target="_blank" class="btn btn-primary btn-sm" style="padding:4px 10px; font-size:0.75rem;">
                    🚚 Live Track ↗
                  </a>
                ` : ''}
              </div>
            </div>

            <!-- Visual 4-Step Timeline -->
            <div class="tracking-timeline">
              <div class="timeline-checkpoint ${statusInfo.step >= 1 ? 'active' : ''}">
                <div class="timeline-dot">1</div>
                <span class="timeline-label">Order Placed</span>
              </div>
              <div class="timeline-checkpoint ${statusInfo.step >= 2 ? 'active' : ''}">
                <div class="timeline-dot">2</div>
                <span class="timeline-label">3D Print / Packed</span>
              </div>
              <div class="timeline-checkpoint ${statusInfo.step >= 3 ? 'active' : ''}">
                <div class="timeline-dot">3</div>
                <span class="timeline-label">Dispatched (In-Transit)</span>
              </div>
              <div class="timeline-checkpoint ${statusInfo.step >= 4 ? 'active' : ''}">
                <div class="timeline-dot">4</div>
                <span class="timeline-label">Delivered</span>
              </div>
            </div>

            ${!hasAWB ? `
              <div style="font-size:0.75rem; color:var(--text-dim); margin-top:8px; text-align:center;">
                ⏳ Your items are currently being processed at D Loop 3D print farm. Shiprocket AWB tracking ID will be active upon packaging.
              </div>
            ` : ''}
          </div>

          <div style="font-size:0.75rem; color:var(--text-dim); margin-top:6px;">
            📍 Shipping to: ${escapeHTML(order.address || currentUser.address || '')}
          </div>
        </div>
      `;
    }).join('');
  }

  modal.innerHTML = `
    <div class="modal-card orders-modal-card">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <h3>📦 My Orders & Live Shiprocket Tracking</h3>
          <span style="background:rgba(0,242,254,0.1); color:var(--primary); padding:2px 8px; border-radius:999px; font-size:0.75rem; font-weight:700;">
            ${myOrders.length} Order${myOrders.length === 1 ? '' : 's'}
          </span>
        </div>
        <button class="modal-close-btn" onclick="closeMyOrdersModal()">✕</button>
      </div>

      <div class="modal-body" style="max-height:75vh; overflow-y:auto;">
        ${ordersListHtml}
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeMyOrdersModal() {
  const modal = document.getElementById('orders-modal-overlay');
  if (modal) modal.classList.remove('open');
}

// ==========================================================================
// 3D STL Model Downloader for Admin Farm Printing
// ==========================================================================
function downloadStlModel(orderId, fileName, customDataUrl) {
  let dataUrl = customDataUrl;
  let name = fileName || 'model.stl';

  if (!dataUrl && orderId) {
    const stock = loadAdminStock();
    const order = (stock.orders || []).find(o => o.orderId === orderId);
    if (order && order.items) {
      const match = order.items.find(it => 
        (it.fileName && it.fileName === fileName) || 
        (it.name && it.name.includes(fileName)) || 
        it.fileDataUrl
      );
      if (match && match.fileDataUrl) {
        dataUrl = match.fileDataUrl;
      }
    }
  }

  if (!dataUrl) {
    // Generate valid downloadable STL template for orders prior to base64 caching
    const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const stlAscii = `solid ${safeName}
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 25 0 0
      vertex 0 25 0
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 25 0 0
      vertex 25 25 0
      vertex 0 25 0
    endloop
  endfacet
endsolid ${safeName}`;
    dataUrl = 'data:model/stl;charset=utf-8,' + encodeURIComponent(stlAscii);
  }

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name.endsWith('.stl') ? name : `${name}.stl`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 250);
  if (typeof showToast === 'function') {
    showToast(`📥 Downloading STL Model: ${a.download}`);
  }
}
window.downloadStlModel = downloadStlModel;

// Auto-initialize User UI on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  updateUserNavUI();
});


// =============================================================================
// DELIVERY CHARGE CALCULATOR (Pincode-Based Rate Engine)
// =============================================================================
// Rate Card:
//   Self Pickup        → ₹0 (Free)
//   Subtotal >= ₹999   → ₹0 (Free shipping)
//   Chennai (60xxxx)   → ₹49
//   Tamil Nadu (61-64) → ₹49
//   South India (50-59, 67-69) → ₹79
//   Rest of India       → ₹119
// =============================================================================

function calculateDeliveryCharge(pincode, subtotal, deliveryMethod) {
  // Self Pickup is always free
  if (deliveryMethod === 'pickup') {
    return { charge: 0, isFree: true, note: 'Self Pickup (Free)' };
  }

  // Free shipping for orders above ₹999
  if (subtotal >= 999) {
    return { charge: 0, isFree: true, note: 'Free (Order ≥ ₹999)' };
  }

  // No valid pincode entered yet
  const pin = String(pincode || '').trim();
  if (pin.length < 6) {
    return { charge: 0, isFree: false, note: 'Enter Pincode for rate' };
  }

  const prefix2 = parseInt(pin.substring(0, 2), 10);
  const prefix3 = parseInt(pin.substring(0, 3), 10);

  // Chennai metro (600xxx – 603xxx)
  if (prefix3 >= 600 && prefix3 <= 603) {
    return { charge: 49, isFree: false, note: 'Chennai Metro (₹49)' };
  }

  // Tamil Nadu (604xxx – 643xxx)
  if (prefix2 >= 60 && prefix2 <= 64) {
    return { charge: 49, isFree: false, note: 'Tamil Nadu (₹49)' };
  }

  // South India: AP/Telangana (50-53), Karnataka (56-59), Kerala (67-69)
  if ((prefix2 >= 50 && prefix2 <= 53) ||
      (prefix2 >= 56 && prefix2 <= 59) ||
      (prefix2 >= 67 && prefix2 <= 69)) {
    return { charge: 79, isFree: false, note: 'South India (₹79)' };
  }

  // Rest of India
  return { charge: 119, isFree: false, note: 'Pan-India (₹119)' };
}
window.calculateDeliveryCharge = calculateDeliveryCharge;


// =============================================================================
// PINCODE AUTO-LOOKUP (India Post API + Offline Fallback)
// =============================================================================

async function lookupPincodeDetails(pincode) {
  const pin = String(pincode || '').trim();
  if (pin.length !== 6) return null;

  // Try India Post API first
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length) {
      const po = data[0].PostOffice[0];
      return {
        city: po.Block || po.District || po.Region || '',
        district: po.District || '',
        state: po.State || '',
        area: po.Name || '',
        country: po.Country || 'India'
      };
    }
  } catch (e) {
    console.warn('[PincodeLookup] India Post API failed, using offline fallback:', e);
  }

  // Offline fallback for common Tamil Nadu / South Indian pincodes
  const offlineDB = {
    '600001': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', area: 'GPO, George Town' },
    '600028': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar' },
    '600040': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', area: 'T. Nagar' },
    '600095': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', area: 'Maduravoyal' },
    '600017': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', area: 'Adyar' },
    '600020': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', area: 'Nungambakkam' },
    '600086': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', area: 'Velachery' },
    '600100': { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', area: 'Porur' },
    '560001': { city: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', area: 'GPO' },
    '500001': { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', area: 'GPO' },
    '695001': { city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', area: 'GPO' },
    '641001': { city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', area: 'Town Hall' },
    '625001': { city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', area: 'GPO' },
    '620001': { city: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', area: 'GPO' },
    '110001': { city: 'New Delhi', district: 'Central Delhi', state: 'Delhi', area: 'GPO' },
    '400001': { city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', area: 'GPO' },
    '700001': { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', area: 'GPO' },
  };

  if (offlineDB[pin]) {
    return offlineDB[pin];
  }

  // Derive state from pincode prefix range
  const p2 = parseInt(pin.substring(0, 2), 10);
  if (p2 >= 60 && p2 <= 64) return { city: '', district: '', state: 'Tamil Nadu', area: '' };
  if (p2 >= 56 && p2 <= 59) return { city: '', district: '', state: 'Karnataka', area: '' };
  if (p2 >= 50 && p2 <= 53) return { city: '', district: '', state: 'Andhra Pradesh / Telangana', area: '' };
  if (p2 >= 67 && p2 <= 69) return { city: '', district: '', state: 'Kerala', area: '' };

  return null;
}
window.lookupPincodeDetails = lookupPincodeDetails;


// =============================================================================
// GPS AUTO-DETECTION (Browser Geolocation + OpenStreetMap Reverse Geocoding)
// =============================================================================

function detectLocationFromGPS(onSuccess, onError) {
  if (!navigator.geolocation) {
    if (onError) onError('Geolocation is not supported by your browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`, {
          headers: { 'User-Agent': 'DLoop3D-WebApp/1.0' }
        });
        const data = await res.json();

        if (data && data.address) {
          const addr = data.address;
          const result = {
            address: [addr.road, addr.neighbourhood, addr.suburb, addr.city_district].filter(Boolean).join(', ') || data.display_name || '',
            city: addr.city || addr.town || addr.village || addr.county || '',
            state: addr.state || '',
            pincode: addr.postcode || '',
            country: addr.country || 'India',
            lat: lat,
            lon: lon
          };
          if (onSuccess) onSuccess(result);
        } else {
          if (onError) onError('Could not resolve your GPS coordinates to an address.');
        }
      } catch (err) {
        console.error('[GPS] Reverse geocode failed:', err);
        if (onError) onError('Network error during address lookup. Please try again.');
      }
    },
    (err) => {
      const messages = {
        1: 'Location permission denied. Please allow GPS access in your browser settings.',
        2: 'GPS position unavailable. Please check your device location settings.',
        3: 'Location request timed out. Please try again.'
      };
      if (onError) onError(messages[err.code] || 'Unknown GPS error.');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}
window.detectLocationFromGPS = detectLocationFromGPS;

// =============================================================================
// MOBILE NAVIGATION DRAWER & APP-WIDE UI LOGIC
// =============================================================================

function toggleMobileNavDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (overlay) {
    overlay.classList.toggle('open');
    document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
  }
}
window.toggleMobileNavDrawer = toggleMobileNavDrawer;

function closeMobileNavDrawer() {
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}
window.closeMobileNavDrawer = closeMobileNavDrawer;

document.addEventListener('DOMContentLoaded', () => {
  // Mobile drawer trigger
  const mobBtn = document.getElementById('mobile-menu-btn');
  if (mobBtn) {
    mobBtn.addEventListener('click', toggleMobileNavDrawer);
  }
  const closeBtn = document.getElementById('close-mobile-drawer-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileNavDrawer);
  }
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMobileNavDrawer();
    });
  }
});

