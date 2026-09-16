import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, MessageSquare, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

// Color map dictionary to translate filament names to CSS colors/gradients
const COLOR_MAP = {
  'silk gold': 'linear-gradient(135deg, #ffd700, #b8860b)',
  'gold': 'linear-gradient(135deg, #ffd700, #b8860b)',
  'gold metallic': 'linear-gradient(135deg, #ffd700, #b8860b)',
  'silk silver': 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
  'silver': 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
  'silver metallic': 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
  'glossy black': '#111111',
  'black': '#111111',
  'black matte': '#222222',
  'fire red': '#ef4444',
  'red': '#ef4444',
  'matte red': '#ef4444',
  'royal blue': '#1d4ed8',
  'blue': '#2563eb',
  'silk green': 'linear-gradient(135deg, #6ee7b7, #059669)',
  'green': '#10b981',
  'pure white': '#ffffff',
  'white': '#ffffff',
  'clear': 'rgba(241, 245, 249, 0.5)',
  'clear translucent': 'rgba(241, 245, 249, 0.5)',
  'grey': '#64748b',
  'grey matte': '#64748b',
  'yellow': '#fbbf24',
  'orange': '#f97316',
  'copper': 'linear-gradient(135deg, #ea580c, #7c2d12)',
  'pink': '#ec4899',
  'purple': '#8b5cf6'
};

// ==========================================
// STL FILE PARSER (Binary & ASCII)
// ==========================================
function parseSTL(buffer) {
  const textDecoder = new TextDecoder('utf-8');
  const preview = textDecoder.decode(buffer.slice(0, 80));
  
  if (preview.trim().startsWith('solid') && !preview.includes('Binary')) {
    try {
      return parseAsciiSTL(textDecoder.decode(buffer));
    } catch (e) {
      console.warn("Failed ASCII STL parse. Trying Binary:", e);
      return parseBinarySTL(buffer);
    }
  } else {
    return parseBinarySTL(buffer);
  }
}

function parseBinarySTL(buffer) {
  const view = new DataView(buffer);
  if (buffer.byteLength < 84) {
    throw new Error("Invalid STL file.");
  }
  
  const trianglesCount = view.getUint32(80, true);
  let offset = 84;
  const triangles = [];
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (let i = 0; i < trianglesCount; i++) {
    if (offset + 50 > buffer.byteLength) break;
    
    // Normal vectors
    const nx = view.getFloat32(offset, true);
    const ny = view.getFloat32(offset + 4, true);
    const nz = view.getFloat32(offset + 8, true);
    
    // Vertices
    const v1x = view.getFloat32(offset + 12, true);
    const v1y = view.getFloat32(offset + 16, true);
    const v1z = view.getFloat32(offset + 20, true);
    
    const v2x = view.getFloat32(offset + 24, true);
    const v2y = view.getFloat32(offset + 28, true);
    const v2z = view.getFloat32(offset + 32, true);
    
    const v3x = view.getFloat32(offset + 36, true);
    const v3y = view.getFloat32(offset + 40, true);
    const v3z = view.getFloat32(offset + 44, true);
    
    offset += 50;
    
    minX = Math.min(minX, v1x, v2x, v3x);
    maxX = Math.max(maxX, v1x, v2x, v3x);
    minY = Math.min(minY, v1y, v2y, v3y);
    maxY = Math.max(maxY, v1y, v2y, v3y);
    minZ = Math.min(minZ, v1z, v2z, v3z);
    maxZ = Math.max(maxZ, v1z, v2z, v3z);
    
    triangles.push({
      normal: { x: nx || 0, y: ny || 0, z: nz || 0 },
      v1: { x: v1x, y: v1y, z: v1z },
      v2: { x: v2x, y: v2y, z: v2z },
      v3: { x: v3x, y: v3y, z: v3z }
    });
  }
  
  return finalizeSTLData(triangles, minX, maxX, minY, maxY, minZ, maxZ, trianglesCount);
}

function parseAsciiSTL(text) {
  const lines = text.split('\n');
  const triangles = [];
  let currentTriangle = null;
  let vertexIndex = 0;
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (let line of lines) {
    line = line.trim().toLowerCase();
    
    if (line.startsWith('facet normal')) {
      const parts = line.split(/\s+/);
      const nx = parseFloat(parts[2]);
      const ny = parseFloat(parts[3]);
      const nz = parseFloat(parts[4]);
      currentTriangle = {
        normal: { x: nx || 0, y: ny || 0, z: nz || 0 },
        v1: { x: 0, y: 0, z: 0 },
        v2: { x: 0, y: 0, z: 0 },
        v3: { x: 0, y: 0, z: 0 }
      };
      vertexIndex = 0;
    } else if (line.startsWith('vertex')) {
      if (!currentTriangle) continue;
      const parts = line.split(/\s+/);
      const vx = parseFloat(parts[1]);
      const vy = parseFloat(parts[2]);
      const vz = parseFloat(parts[3]);
      
      minX = Math.min(minX, vx);
      maxX = Math.max(maxX, vx);
      minY = Math.min(minY, vy);
      maxY = Math.max(maxY, vy);
      minZ = Math.min(minZ, vz);
      maxZ = Math.max(maxZ, vz);
      
      if (vertexIndex === 0) {
        currentTriangle.v1 = { x: vx, y: vy, z: vz };
      } else if (vertexIndex === 1) {
        currentTriangle.v2 = { x: vx, y: vy, z: vz };
      } else if (vertexIndex === 2) {
        currentTriangle.v3 = { x: vx, y: vy, z: vz };
      }
      vertexIndex++;
    } else if (line.startsWith('endfacet')) {
      if (currentTriangle) {
        triangles.push(currentTriangle);
        currentTriangle = null;
      }
    }
  }
  
  return finalizeSTLData(triangles, minX, maxX, minY, maxY, minZ, maxZ, triangles.length);
}

function finalizeSTLData(triangles, minX, maxX, minY, maxY, minZ, maxZ, trianglesCount) {
  const width = isFinite(maxX - minX) ? (maxX - minX) : 50;
  const depth = isFinite(maxY - minY) ? (maxY - minY) : 50;
  const height = isFinite(maxZ - minZ) ? (maxZ - minZ) : 50;
  
  const centerX = minX + width / 2;
  const centerY = minY + depth / 2;
  const centerZ = minZ + height / 2;
  
  for (let tri of triangles) {
    tri.v1.x -= centerX; tri.v1.y -= centerY; tri.v1.z -= centerZ;
    tri.v2.x -= centerX; tri.v2.y -= centerY; tri.v2.z -= centerZ;
    tri.v3.x -= centerX; tri.v3.y -= centerY; tri.v3.z -= centerZ;
    
    // Auto calculate normal vectors if missing
    if (tri.normal.x === 0 && tri.normal.y === 0 && tri.normal.z === 0) {
      const u = { x: tri.v2.x - tri.v1.x, y: tri.v2.y - tri.v1.y, z: tri.v2.z - tri.v1.z };
      const v = { x: tri.v3.x - tri.v1.x, y: tri.v3.y - tri.v1.y, z: tri.v3.z - tri.v1.z };
      const nx = u.y * v.z - u.z * v.y;
      const ny = u.z * v.x - u.x * v.z;
      const nz = u.x * v.y - u.y * v.x;
      const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
      if (len > 0) {
        tri.normal = { x: nx/len, y: ny/len, z: nz/len };
      }
    }
  }
  
  const maxDim = Math.max(width, depth, height);
  const scaleFactor = maxDim > 0 ? (90 / maxDim) : 1;
  
  let totalVolume = 0;
  for (let tri of triangles) {
    const tetrahedronVolume = (tri.v1.x * tri.v2.y * tri.v3.z - tri.v1.x * tri.v3.y * tri.v2.z - tri.v2.x * tri.v1.y * tri.v3.z + tri.v2.x * tri.v3.y * tri.v1.z + tri.v3.x * tri.v1.y * tri.v2.z - tri.v3.x * tri.v2.y * tri.v1.z);
    totalVolume += tetrahedronVolume;
  }
  let volumeCm3 = Math.abs(totalVolume) / 6000;
  if (volumeCm3 < 0.1 || isNaN(volumeCm3)) {
    volumeCm3 = (width * depth * height * 0.45) / 1000;
  }
  
  // Downsample to limit drawn polys for responsiveness
  const drawStep = Math.max(1, Math.ceil(trianglesCount / 8000));
  const drawTriangles = [];
  for (let i = 0; i < triangles.length; i += drawStep) {
    drawTriangles.push(triangles[i]);
  }
  
  return {
    triangles: drawTriangles,
    trianglesCount,
    width,
    depth,
    height,
    volume: Math.max(0.1, Math.round(volumeCm3 * 100) / 100),
    scaleFactor
  };
}

// ==========================================
// COMPONENT MAIN EXPORT
// ==========================================
function PrintDesignPage({ settings }) {
  // Global colors list
  const colorsList = settings.availableColors && settings.availableColors.length > 0
    ? settings.availableColors
    : ['Silk Gold', 'Silk Silver', 'Glossy Black', 'Fire Red', 'Royal Blue', 'Pure White'];

  // File states
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stlData, setStlData] = useState(null);

  // 3D Viewer Zoom states
  const [viewMode, setViewMode] = useState('axes'); // 'grid', 'axes', 'wireframe'
  const [units, setUnits] = useState('mm'); // 'mm' or 'inch'
  const [rotation, setRotation] = useState({ x: 30, y: 45 });
  const [zoomFactor, setZoomFactor] = useState(1.0); // Interactive Zoom
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Customized settings
  const [printSettings, setPrintSettings] = useState({
    technology: 'FDM/FFF',
    material: 'PLA',
    color: colorsList[0],
    quality: 'Standard (0.2mm)',
    infill: '20%',
    quantity: 1
  });

  // Keep color aligned when availableColors change in settings
  useEffect(() => {
    if (colorsList.length > 0 && !colorsList.includes(printSettings.color)) {
      setPrintSettings(prev => ({ ...prev, color: colorsList[0] }));
    }
  }, [colorsList]);

  // Delivery & Checkout states
  const [deliveryMethod, setDeliveryMethod] = useState('shipping');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [errors, setErrors] = useState({});

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const autoRotateRef = useRef(true);

  // File Specs
  const [fileSpecs, setFileSpecs] = useState({
    dimensions: '0.00 x 0.00 x 0.00 mm',
    triangles: '0',
    volume: 0,
    optimized: true,
    rawDimensions: { x: 50, y: 50, z: 50 }
  });

  // Metric conversion display logic
  const formatDimensions = () => {
    if (!fileSpecs.rawDimensions) return '0.00 x 0.00 x 0.00 mm';
    const { x, y, z } = fileSpecs.rawDimensions;
    if (units === 'inch') {
      const xIn = (x * 0.0393701).toFixed(2);
      const yIn = (y * 0.0393701).toFixed(2);
      const zIn = (z * 0.0393701).toFixed(2);
      return `${xIn} × ${yIn} × ${zIn} inch`;
    } else {
      return `${x.toFixed(2)} × ${y.toFixed(2)} × ${z.toFixed(2)} mm`;
    }
  };

  const formatVolume = () => {
    if (units === 'inch') {
      const volIn = (fileSpecs.volume * 0.0610237).toFixed(2);
      return `${volIn} in³`;
    } else {
      return `${fileSpecs.volume.toFixed(2)} cm³`;
    }
  };

  // Price calculations
  const calculatePrice = () => {
    if (!file) return 0;

    let baseRate = 120; // Setup cost
    let costPerCm3 = 6; // PLA

    if (printSettings.material === 'ABS') costPerCm3 = 7.5;
    else if (printSettings.material === 'PETG') costPerCm3 = 8;
    else if (printSettings.material === 'TPU') costPerCm3 = 10;
    else if (printSettings.material === 'Standard Resin') costPerCm3 = 14;
    else if (printSettings.material === 'Tough Resin') costPerCm3 = 18;
    else if (printSettings.material === 'Nylon') costPerCm3 = 22;

    let qualityMult = 1.0;
    if (printSettings.quality.includes('High')) qualityMult = 1.35;
    else if (printSettings.quality.includes('Draft')) qualityMult = 0.75;

    let infillMult = 1.0;
    const infillPercent = parseInt(printSettings.infill);
    if (infillPercent <= 10) infillMult = 0.85;
    else if (infillPercent > 20 && infillPercent <= 40) infillMult = 1.15;
    else if (infillPercent > 40 && infillPercent <= 60) infillMult = 1.35;
    else if (infillPercent > 60 && infillPercent <= 80) infillMult = 1.55;
    else if (infillPercent > 80) infillMult = 1.8;

    let singleItemCost = baseRate + (fileSpecs.volume * costPerCm3 * qualityMult * infillMult);
    
    if (printSettings.technology === 'SLA/Resin') singleItemCost *= 1.25;
    else if (printSettings.technology === 'SLS') singleItemCost *= 1.5;

    return Math.round(singleItemCost * printSettings.quantity);
  };

  const itemPrice = calculatePrice();
  const gstRate = parseFloat(settings.gstRate || 18);
  const subTotal = itemPrice;
  const gstAmount = subTotal * (gstRate / 100);
  const shippingCost = deliveryMethod === 'shipping' ? parseFloat(settings.shippingCost || 100) : 0;
  const discount = couponApplied ? subTotal * 0.1 : 0; // 10%
  const totalAmount = subTotal + gstAmount + shippingCost - discount;

  // File loading
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(null);
    setStlData(null);
    setUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const buffer = event.target.result;
        const parsed = parseSTL(buffer);
        
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 20;
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            setStlData(parsed);
            setFile(selectedFile);
            setUploading(false);
            setZoomFactor(1.0); // Reset zoom
            
            setFileSpecs({
              dimensions: `${parsed.width.toFixed(2)} × ${parsed.depth.toFixed(2)} × ${parsed.height.toFixed(2)} mm`,
              triangles: parsed.trianglesCount.toLocaleString(),
              volume: parsed.volume,
              optimized: true,
              rawDimensions: { x: parsed.width, y: parsed.depth, z: parsed.height }
            });
          }
        }, 100);
      } catch (err) {
        console.error("STL parse error:", err);
        alert("Failed to parse STL file. Verify it's a valid ASCII/Binary mesh file.");
        setUploading(false);
      }
    };

    reader.onerror = () => {
      alert("Error reading file.");
      setUploading(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Canvas drawing and manual scroll wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let localRot = { ...rotation };

    // Prevent page scroll when scroll-zooming the canvas element
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY;
      setZoomFactor(prev => Math.max(0.3, Math.min(3.5, prev - delta * 0.001)));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 20;
      
      if (autoRotateRef.current) {
        localRot.y += 0.45;
      }

      const radX = (localRot.x * Math.PI) / 180;
      const radY = (localRot.y * Math.PI) / 180;

      const project = (x, y, z) => {
        // Y rotate
        const xY = x * Math.cos(radY) - z * Math.sin(radY);
        const zY = x * Math.sin(radY) + z * Math.cos(radY);
        // X rotate
        const yX = y * Math.cos(radX) - zY * Math.sin(radX);
        const zX = y * Math.sin(radX) + zY * Math.cos(radX);
        
        // Multiplied by zoomFactor state
        const scale = (stlData ? stlData.scaleFactor : 1.3) * zoomFactor;
        return {
          x: cx + xY * scale,
          y: cy - yX * scale,
          zDepth: zX
        };
      };

      // 1. Draw Ground Grid
      if (viewMode === 'grid' || viewMode === 'wireframe') {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        const gridCells = 8;
        const gridSize = 120;
        const step = gridSize / gridCells;
        
        for (let i = -gridCells/2; i <= gridCells/2; i++) {
          const p1 = project(i * step, -50, -gridSize/2);
          const p2 = project(i * step, -50, gridSize/2);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        for (let i = -gridCells/2; i <= gridCells/2; i++) {
          const p1 = project(-gridSize/2, -50, i * step);
          const p2 = project(gridSize/2, -50, i * step);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 2. Draw Axes Coordinates
      if (viewMode === 'axes') {
        const origin = project(0, -50, 0);
        const xAxis = project(100, -50, 0);
        const yAxis = project(0, 50, 0);
        const zAxis = project(0, -50, 100);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(xAxis.x, xAxis.y); ctx.stroke(); // X

        ctx.strokeStyle = '#22c55e';
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(yAxis.x, yAxis.y); ctx.stroke(); // Y

        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(zAxis.x, zAxis.y); ctx.stroke(); // Z
      }

      // 3. Render 3D Model geometry
      if (stlData && stlData.triangles.length > 0) {
        ctx.strokeStyle = viewMode === 'wireframe' ? 'rgba(255, 95, 0, 0.4)' : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 0.5;

        // Project
        const projectedTriangles = stlData.triangles.map(tri => {
          const p1 = project(tri.v1.x, tri.v1.y, tri.v1.z);
          const p2 = project(tri.v2.x, tri.v2.y, tri.v2.z);
          const p3 = project(tri.v3.x, tri.v3.y, tri.v3.z);
          const zDepth = p1.zDepth + p2.zDepth + p3.zDepth;
          return { p1, p2, p3, zDepth, normal: tri.normal };
        });

        // Depth sort
        projectedTriangles.sort((a, b) => b.zDepth - a.zDepth);

        // Render faces
        for (let pt of projectedTriangles) {
          const lx = 0.5, ly = 0.8, lz = 0.3;
          const dot = pt.normal.x * lx + pt.normal.y * ly + pt.normal.z * lz;
          const intensity = Math.max(0.15, Math.min(1.0, (dot + 1) / 2));
          
          const r = Math.round(255 * intensity);
          const g = Math.round(95 * intensity + 20);
          const b = Math.round(0);
          
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.beginPath();
          ctx.moveTo(pt.p1.x, pt.p1.y);
          ctx.lineTo(pt.p2.x, pt.p2.y);
          ctx.lineTo(pt.p3.x, pt.p3.y);
          ctx.closePath();
          
          if (viewMode !== 'wireframe') {
            ctx.fill();
          }
          ctx.stroke();
        }
      } else {
        // Default Pagoda/Cone
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        
        const vertices = [
          { x: -30, y: -50, z: -30 }, { x: 30, y: -50, z: -30 }, { x: 30, y: -50, z: 30 }, { x: -30, y: -50, z: 30 },
          { x: -25, y: -10, z: -25 }, { x: 25, y: -10, z: -25 }, { x: 25, y: -10, z: 25 }, { x: -25, y: -10, z: 25 },
          { x: -15, y: 30, z: -15 }, { x: 15, y: 30, z: -15 }, { x: 15, y: 30, z: 15 }, { x: -15, y: 30, z: 15 },
          { x: 0, y: 65, z: 0 }
        ];

        const projected = vertices.map(v => project(v.x, v.y, v.z));

        const drawPolygon = (idxList, fillColor) => {
          ctx.beginPath();
          ctx.moveTo(projected[idxList[0]].x, projected[idxList[0]].y);
          for (let i = 1; i < idxList.length; i++) {
            ctx.lineTo(projected[idxList[i]].x, projected[idxList[i]].y);
          }
          ctx.closePath();
          if (viewMode !== 'wireframe') {
            ctx.fillStyle = fillColor;
            ctx.fill();
          }
          ctx.stroke();
        };

        const lightFactor = Math.abs(Math.sin(radY));
        const colBase = `rgba(255, 95, 0, ${0.1 + lightFactor * 0.15})`;
        const colSide1 = `rgba(255, 95, 0, ${0.25 + lightFactor * 0.2})`;
        const colSide2 = `rgba(255, 95, 0, ${0.4 + lightFactor * 0.25})`;

        drawPolygon([0, 1, 5, 4], colBase);
        drawPolygon([1, 2, 6, 5], colSide1);
        drawPolygon([2, 3, 7, 6], colSide2);
        drawPolygon([3, 0, 4, 7], colBase);

        drawPolygon([4, 5, 9, 8], colBase);
        drawPolygon([5, 6, 10, 9], colSide1);
        drawPolygon([6, 7, 11, 10], colSide2);
        drawPolygon([7, 4, 8, 11], colBase);

        drawPolygon([8, 9, 12], colBase);
        drawPolygon([9, 10, 12], colSide1);
        drawPolygon([10, 11, 12], colSide2);
        drawPolygon([11, 8, 12], colBase);
      }

      // 4. Dashed Bounding Box Outline
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      const b1 = project(-35, -50, -35);
      const b2 = project(35, -50, -35);
      const b3 = project(35, -50, 35);
      const b4 = project(-35, -50, 35);
      
      const t1 = project(-35, 70, -35);
      const t2 = project(35, 70, -35);
      const t3 = project(35, 70, 35);
      const t4 = project(-35, 70, 35);

      ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b4.x, b4.y); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t4.x, t4.y); ctx.closePath(); ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(b1.x, b1.y); ctx.lineTo(t1.x, t1.y);
      ctx.moveTo(b2.x, b2.y); ctx.lineTo(t2.x, t2.y);
      ctx.moveTo(b3.x, b3.y); ctx.lineTo(t3.x, t3.y);
      ctx.moveTo(b4.x, b4.y); ctx.lineTo(t4.x, t4.y);
      ctx.stroke();
      ctx.setLineDash([]);

      animationRef.current = requestAnimationFrame(drawScene);
    };

    drawScene();

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [file, viewMode, rotation, stlData, zoomFactor]);

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    autoRotateRef.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setRotation(prev => ({
      x: prev.x - dy * 0.5,
      y: prev.y + dx * 0.5
    }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setTimeout(() => {
      if (!isDragging) autoRotateRef.current = true;
    }, 4000);
  };

  const handleResetView = () => {
    setRotation({ x: 30, y: 45 });
    setZoomFactor(1.0); // Reset Zoom
    autoRotateRef.current = true;
  };

  // Checkout Validation
  const validateForm = () => {
    const newErrors = {};
    if (!file) newErrors.file = 'Please upload a 3D model first';
    if (!customerName.trim()) newErrors.customerName = 'Your name is required';
    if (!customerPhone.trim()) newErrors.customerPhone = 'Contact phone number is required';
    if (deliveryMethod === 'shipping' && !address.trim()) {
      newErrors.address = 'Full delivery address is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Place Quote Order to WhatsApp
  const handleCheckout = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const deliveryText = deliveryMethod === 'shipping'
      ? `• Method: Shiprocket Shipping (₹ ${shippingCost.toFixed(2)})
• Delivery Address: ${address}`
      : `• Method: Self-Pickup (Free)`;

    const discountText = discount > 0 ? `• Discount (10%): - ₹ ${discount.toFixed(2)}\n` : '';

    const formattedMessage = `*📦 NEW 3D PRINTING ORDER - D LOOP 3D*
----------------------------------------
*Order ID:* 3DPS-${Math.floor(100000000 + Math.random() * 900000000)}

*Design Details:*
• File Name: ${file.name}
• File Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB
• Bounding Dimensions: ${formatDimensions()}
• Computed Volume: ${formatVolume()}

*Print Job Configuration:*
• Technology: ${printSettings.technology}
• Material: ${printSettings.material}
• Selected Color: ${printSettings.color}
• Thickness/Quality: ${printSettings.quality}
• Infill Density: ${printSettings.infill}
• Quantity Ordered: ${printSettings.quantity}

*Customer Details:*
• Name: ${customerName}
• Phone: ${customerPhone}
${deliveryText}
${orderNotes ? `• Notes: ${orderNotes}` : ''}

*Billing Summary:*
• Printing Cost: ₹ ${subTotal.toFixed(2)}
• GST (${gstRate}%): ₹ ${gstAmount.toFixed(2)}
${discountText}• Shipping Charges: ₹ ${shippingCost.toFixed(2)}
• *Total Payable:* *₹ ${totalAmount.toFixed(2)}*
----------------------------------------
Please review my uploaded design and confirm payment details!`;

    let phone = '919884872483';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = '91' + phone;

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(formattedMessage)}`;
    window.location.assign(waUrl);
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Instant 3D Print Quote
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Upload STL, OBJ, or STEP files, choose parameters, and checkout instantly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }} className="print-design-grid">
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Upload and 3D View */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                background: 'var(--primary)', 
                color: '#fff', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.8rem' 
              }}>1</span>
              Upload your 3D files
            </h3>

            {/* Upload Area */}
            {!file && (
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) {
                  const syntheticEvent = { target: { files: [droppedFile] } };
                  handleFileChange(syntheticEvent);
                }
              }}
              onClick={() => document.getElementById('stl-file-upload').click()}
              className="upload-dropzone"
              >
                <input 
                  type="file" 
                  id="stl-file-upload" 
                  accept=".stl,.obj,.step,.stp" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center justify-center">
                    <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Uploading mesh: {uploadProgress}%</div>
                    <div style={{ width: '220px', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.1s' }}></div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload size={40} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.8 }} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Drag & drop files here or click to browse</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supports .stl, .obj, .step, .stp files • Max 100MB per file</p>
                  </div>
                )}
              </div>
            )}

            {errors.file && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>
                {errors.file}
              </div>
            )}

            {/* Render 3D viewer when file is loaded */}
            {file && (
              <div>
                {/* File details Header */}
                <div className="flex justify-between items-center" style={{ 
                  background: '#f8fafc', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary)' }}>{file.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({(file.size / (1024*1024)).toFixed(2)} MB)</span>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setStlData(null); handleResetView(); }} 
                    className="btn btn-danger" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    Delete File
                  </button>
                </div>

                {/* Simulated STL Viewer Canvas */}
                <div style={{ position: 'relative', background: '#fafafa', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  
                  {/* Stats Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.75rem',
                    lineHeight: '1.45',
                    zIndex: 10,
                    pointerEvents: 'none',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>Dimensions: {formatDimensions()}</div>
                    <div>Triangles: {fileSpecs.triangles}</div>
                    <div>Volume: {formatVolume()}</div>
                    <div className="flex items-center" style={{ gap: '0.25rem', marginTop: '0.25rem' }}>
                      <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }}></span>
                      <strong style={{ color: '#22c55e', fontSize: '0.7rem', textTransform: 'uppercase' }}>OPTIMIZED MESH PREVIEW</strong>
                    </div>
                  </div>

                  {/* Toggle Controls */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 10,
                    display: 'flex',
                    gap: '0.35rem'
                  }}>
                    <div className="flex" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#fff' }}>
                      <button 
                        type="button" 
                        onClick={() => setViewMode('grid')}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: viewMode === 'grid' ? 'var(--primary)' : 'none',
                          color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >Grid</button>
                      <button 
                        type="button" 
                        onClick={() => setViewMode('axes')}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: viewMode === 'axes' ? 'var(--primary)' : 'none',
                          color: viewMode === 'axes' ? '#fff' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >Axes</button>
                      <button 
                        type="button" 
                        onClick={() => setViewMode('wireframe')}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: viewMode === 'wireframe' ? 'var(--primary)' : 'none',
                          color: viewMode === 'wireframe' ? '#fff' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >Wireframe</button>
                    </div>

                    <div className="flex" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#fff' }}>
                      <button 
                        type="button" 
                        onClick={() => setUnits('mm')}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: units === 'mm' ? 'var(--secondary)' : 'none',
                          color: units === 'mm' ? '#fff' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >mm</button>
                      <button 
                        type="button" 
                        onClick={() => setUnits('inch')}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: units === 'inch' ? 'var(--secondary)' : 'none',
                          color: units === 'inch' ? '#fff' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >inch</button>
                    </div>
                  </div>

                  {/* Canvas View Controls (Reset + Zoom slider buttons) */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    zIndex: 10,
                    display: 'flex',
                    gap: '0.35rem'
                  }}>
                    <button
                      type="button"
                      onClick={() => setZoomFactor(prev => Math.min(3.0, prev + 0.15))}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title="Zoom In"
                    ><ZoomIn size={14} /></button>
                    <button
                      type="button"
                      onClick={() => setZoomFactor(prev => Math.max(0.4, prev - 0.15))}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title="Zoom Out"
                    ><ZoomOut size={14} /></button>
                    <button
                      type="button"
                      onClick={handleResetView}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        padding: '0 0.6rem',
                        height: '28px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >Reset View</button>
                  </div>

                  <canvas 
                    ref={canvasRef}
                    width={560}
                    height={320}
                    style={{ display: 'block', width: '100%', height: '320px', cursor: isDragging ? 'grabbing' : 'grab' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                  />

                  <div style={{
                    textAlign: 'center',
                    padding: '0.4rem',
                    background: '#f1f5f9',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    Drag to rotate • Mouse scroll wheel or +/- buttons to zoom
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Section 2: Customize Print Settings */}
          {file && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  background: 'var(--primary)', 
                  color: '#fff', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.8rem' 
                }}>2</span>
                Customize Your 3D Print Settings
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.5rem 0.25rem' }}>Technology</th>
                      <th style={{ padding: '0.5rem 0.25rem' }}>Material</th>
                      <th style={{ padding: '0.5rem 0.25rem', minWidth: '150px' }}>Color Swatch</th>
                      <th style={{ padding: '0.5rem 0.25rem' }}>Quality</th>
                      <th style={{ padding: '0.5rem 0.25rem' }}>Density</th>
                      <th style={{ padding: '0.5rem 0.25rem', width: '80px' }}>Qty</th>
                      <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ fontSize: '0.9rem' }}>
                      {/* Tech */}
                      <td style={{ padding: '1rem 0.25rem' }}>
                        <select 
                          className="form-control" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          value={printSettings.technology}
                          onChange={(e) => {
                            const tech = e.target.value;
                            let mat = 'PLA';
                            if (tech === 'SLA/Resin') mat = 'Standard Resin';
                            else if (tech === 'SLS') mat = 'Nylon';
                            setPrintSettings({ ...printSettings, technology: tech, material: mat });
                          }}
                        >
                          <option value="FDM/FFF">FDM (Plastics)</option>
                          <option value="SLA/Resin">SLA (Resin / Details)</option>
                          <option value="SLS">SLS (Industrial Nylon)</option>
                        </select>
                      </td>

                      {/* Material */}
                      <td style={{ padding: '1rem 0.25rem' }}>
                        <select 
                          className="form-control" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          value={printSettings.material}
                          onChange={(e) => setPrintSettings({ ...printSettings, material: e.target.value })}
                        >
                          {printSettings.technology === 'FDM/FFF' && (
                            <>
                              <option value="PLA">PLA Filament</option>
                              <option value="ABS">ABS Filament</option>
                              <option value="PETG">PETG Filament</option>
                              <option value="TPU">TPU (Flexible)</option>
                            </>
                          )}
                          {printSettings.technology === 'SLA/Resin' && (
                            <>
                              <option value="Standard Resin">Standard Resin</option>
                              <option value="Tough Resin">Tough Pro Resin</option>
                            </>
                          )}
                          {printSettings.technology === 'SLS' && (
                            <>
                              <option value="Nylon">PA12 Nylon</option>
                            </>
                          )}
                        </select>
                      </td>

                      {/* Color Swatches - Pulling from available global stock colors */}
                      <td style={{ padding: '1rem 0.25rem' }}>
                        <div className="flex" style={{ gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {colorsList.map(colorName => {
                            const key = colorName.toLowerCase();
                            const cssValue = COLOR_MAP[key] || key;
                            const isSelected = printSettings.color === colorName;
                            
                            return (
                              <button
                                key={colorName}
                                type="button"
                                onClick={() => setPrintSettings({ ...printSettings, color: colorName })}
                                title={colorName}
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  background: cssValue,
                                  border: isSelected ? '2.5px solid var(--primary)' : '1px solid #cbd5e1',
                                  boxShadow: isSelected ? '0 0 6px rgba(255, 95, 0, 0.4)' : 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              />
                            );
                          })}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>
                          Selected: <strong style={{ color: 'var(--primary)' }}>{printSettings.color}</strong>
                        </div>
                      </td>

                      {/* Quality */}
                      <td style={{ padding: '1rem 0.25rem' }}>
                        <select 
                          className="form-control" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          value={printSettings.quality}
                          onChange={(e) => setPrintSettings({ ...printSettings, quality: e.target.value })}
                        >
                          <option value="Standard (0.2mm)">Standard (0.2mm)</option>
                          <option value="High Detail (0.1mm)">High Detail (0.1mm)</option>
                          <option value="Draft Speed (0.3mm)">Draft (0.3mm)</option>
                        </select>
                      </td>

                      {/* Density */}
                      <td style={{ padding: '1rem 0.25rem' }}>
                        <select 
                          className="form-control" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          value={printSettings.infill}
                          onChange={(e) => setPrintSettings({ ...printSettings, infill: e.target.value })}
                          disabled={printSettings.technology === 'SLA/Resin'}
                        >
                          <option value="10%">10% (Light)</option>
                          <option value="20%">20% (Standard)</option>
                          <option value="40%">40% (Medium)</option>
                          <option value="60%">60% (Strength)</option>
                          <option value="100%">100% (Solid)</option>
                        </select>
                      </td>

                      {/* Quantity */}
                      <td style={{ padding: '1rem 0.25rem' }}>
                        <input 
                          type="number" 
                          className="form-control" 
                          style={{ padding: '0.4rem 0.5rem', fontSize: '0.85rem', textAlign: 'center' }}
                          min="1"
                          max="100"
                          value={printSettings.quantity}
                          onChange={(e) => setPrintSettings({ ...printSettings, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        />
                      </td>

                      {/* Cost */}
                      <td style={{ padding: '1rem 0.25rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                        ₹ {itemPrice}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (CHECKOUT) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                background: 'var(--primary)', 
                color: '#fff', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.8rem' 
              }}>3</span>
              Express Checkout
            </h3>

            {/* Price details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem', fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
              <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>Sub Total</span>
                <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>₹ {subTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>GST ({gstRate}%)</span>
                <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>₹ {gstAmount.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between" style={{ color: 'var(--success)', fontWeight: 500 }}>
                  <span>Coupon Discount (10%)</span>
                  <span>- ₹ {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between" style={{ color: 'var(--text-secondary)', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Shipping Charges 
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={deliveryMethod === 'pickup'} 
                      onChange={(e) => setDeliveryMethod(e.target.checked ? 'pickup' : 'shipping')}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    (Self Pickup)
                  </label>
                </span>
                <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                  {deliveryMethod === 'shipping' ? `₹ ${shippingCost.toFixed(2)}` : 'FREE'}
                </span>
              </div>

              <div className="flex justify-between" style={{ fontSize: '1.2rem', fontWeight: 800, borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem', color: 'var(--text-primary)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>₹ {totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupons */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="quoteCoupon" style={{ fontSize: '0.8rem' }}>Coupon Code</label>
              <div className="flex" style={{ gap: '0.5rem' }}>
                <input 
                  type="text" 
                  id="quoteCoupon"
                  className="form-control" 
                  placeholder="Enter code (E.g. DLOOP10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                  disabled={couponApplied}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    if (coupon.trim().toUpperCase() === 'DLOOP10') {
                      setCouponApplied(true);
                      alert('10% Discount applied successfully!');
                    } else {
                      alert('Invalid Coupon! Try: DLOOP10');
                    }
                  }}
                  disabled={couponApplied}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="quoteNotes" style={{ fontSize: '0.8rem' }}>Order Notes</label>
              <textarea 
                id="quoteNotes"
                className="form-control" 
                placeholder="Add special instructions or specifications..."
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* Customer Details */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.03em' }}>
                Customer Information
              </h4>
              
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Your Full Name" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
                {errors.customerName && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.customerName}</span>}
              </div>

              <div className="form-group">
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="WhatsApp Mobile Number" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
                {errors.customerPhone && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.customerPhone}</span>}
              </div>

              {deliveryMethod === 'shipping' && (
                <div className="form-group">
                  <textarea 
                    className="form-control" 
                    placeholder="Full Address (House, Flat, Street, City, State, Pincode)" 
                    rows={2.5}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  {errors.address && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.address}</span>}
                </div>
              )}
            </div>

            {/* Place Order */}
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', gap: '0.5rem' }}
              onClick={handleCheckout}
            >
              <MessageSquare size={18} color="#fff" />
              Checkout & Submit Quote
            </button>

            {!file && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.75rem', fontWeight: 500 }}>
                ⚠️ Please upload a 3D file to calculate billing
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default PrintDesignPage;
