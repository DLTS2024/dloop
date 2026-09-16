import React, { useState } from 'react';
import { X, ShoppingCart, MessageSquare, Truck, MapPin } from 'lucide-react';

// Map color names to CSS backgrounds/gradients for swatches
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

function CustomizeModal({ product, settings, onClose }) {
  const colorsList = settings.availableColors && settings.availableColors.length > 0
    ? settings.availableColors
    : ['Silk Gold', 'Silk Silver', 'Glossy Black', 'Fire Red', 'Royal Blue', 'Pure White'];

  // Customization Form States
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorsList[0]);
  const [baseColor, setBaseColor] = useState(colorsList[0]);
  const [textColor, setTextColor] = useState(colorsList[1] || colorsList[0]);
  const [customText, setCustomText] = useState('');
  const [initialText, setInitialText] = useState('');
  
  // Checkout & Shipping States
  const [deliveryMethod, setDeliveryMethod] = useState('shipping'); // 'shipping' or 'pickup'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  
  // Validation State
  const [errors, setErrors] = useState({});

  // Cost Calculations
  const basePrice = parseFloat(product.price);
  const gstRate = parseFloat(settings.gstRate || 18);
  const gstAmount = basePrice * (gstRate / 100);
  const shippingCost = deliveryMethod === 'shipping' ? parseFloat(settings.shippingCost || 100) : 0;
  const totalAmount = basePrice + gstAmount + shippingCost;

  // Determine if product needs 2 colors (Base and Text color)
  // Keychains (single_line) and Name/Initial designs (name_and_initial) are dual-colored
  const isDualColor = product.type === 'single_line' || product.type === 'name_and_initial';

  // Validate inputs
  const validateForm = () => {
    const newErrors = {};

    // Customization checks
    if (product.type === 'flipname') {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!secondName.trim()) newErrors.secondName = 'Second name is required';
    } else if (product.type === 'single_line') {
      if (!customText.trim()) newErrors.customText = 'Custom text is required';
    } else if (product.type === 'name_and_initial') {
      if (!initialText.trim()) newErrors.initialText = 'Initial letter is required';
      if (initialText.trim().length > 2) newErrors.initialText = 'Initial should be 1-2 letters';
      if (!customText.trim()) newErrors.customText = 'Name text is required';
    } else {
      // Fallback
      if (!customText.trim()) newErrors.customText = 'Custom details are required';
    }

    // Customer / Delivery checks
    if (!customerName.trim()) newErrors.customerName = 'Your name is required';
    if (!customerPhone.trim()) newErrors.customerPhone = 'Contact number is required';
    
    if (deliveryMethod === 'shipping') {
      if (!address.trim()) newErrors.address = 'Delivery address is required';
      if (!city.trim()) newErrors.city = 'City is required';
      if (!stateName.trim()) newErrors.stateName = 'State is required';
      if (!pincode.trim()) newErrors.pincode = 'Pincode is required';
      else if (!/^\d{6}$/.test(pincode.trim())) newErrors.pincode = 'Invalid pincode (6 digits required)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Place Order Action
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Build WhatsApp message
    let customizationDetails = '';
    if (product.type === 'flipname') {
      customizationDetails = `• First Name: ${firstName.toUpperCase()}
• Second Name: ${secondName.toUpperCase()}
• Selected Color: ${selectedColor}`;
    } else if (product.type === 'single_line') {
      customizationDetails = `• Custom Text: ${customText}
• Base Color: ${baseColor}
• Text Color: ${textColor}`;
    } else if (product.type === 'name_and_initial') {
      customizationDetails = `• Initial Design: ${initialText.toUpperCase()}
• Custom Name: ${customText}
• Base Color: ${baseColor}
• Name/Text Color: ${textColor}`;
    } else {
      customizationDetails = `• Text / Details: ${customText}
• Selected Color: ${selectedColor}`;
    }

    const deliveryText = deliveryMethod === 'shipping' 
      ? `• Method: Shiprocket Shipping (₹ ${shippingCost.toFixed(2)})
• Address: ${address}, ${city}, ${stateName} - ${pincode}`
      : `• Method: Self-Pickup (Free)`;

    const rawMessage = `*📦 NEW CUSTOM ORDER - D LOOP 3D*
----------------------------------------
*Product:* ${product.name}
*Base Price:* ₹ ${basePrice.toFixed(2)}

*Customization Details:*
${customizationDetails}

*Customer Details:*
• Name: ${customerName}
• Phone: ${customerPhone}
${deliveryText}

*Billing Summary:*
• Base Price: ₹ ${basePrice.toFixed(2)}
• GST (${gstRate}%): ₹ ${gstAmount.toFixed(2)}
• Shipping Cost: ₹ ${shippingCost.toFixed(2)}
• *Total Payable:* *₹ ${totalAmount.toFixed(2)}*
----------------------------------------
Please confirm my order and share details for payment!`;

    let phone = '919884872483';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = '91' + phone;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(rawMessage)}`;
    window.location.assign(whatsappUrl);
  };

  // Color Swatch Renderer helper
  const renderColorSwatches = (currentColor, onSelect, label) => {
    return (
      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
          {label}
        </label>
        <div className="flex" style={{ gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          {colorsList.map((colorName) => {
            const key = colorName.toLowerCase();
            const cssValue = COLOR_MAP[key] || key;
            const isSelected = currentColor === colorName;

            return (
              <button
                key={colorName}
                type="button"
                onClick={() => onSelect(colorName)}
                title={colorName}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: cssValue,
                  border: isSelected ? '3px solid var(--primary)' : '1px solid #cbd5e1',
                  boxShadow: isSelected ? '0 0 8px rgba(255, 95, 0, 0.4)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Border visibility dot if color is white */}
                {key.includes('white') && !isSelected && (
                  <span style={{ width: '4px', height: '4px', background: '#cbd5e1', borderRadius: '50%' }}></span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Selected: <strong style={{ color: 'var(--primary)' }}>{currentColor}</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Customize & Order</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{product.name}</p>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handlePlaceOrder} className="modal-body" style={{ paddingBottom: '2rem' }}>
          
          {/* Section 1: Customization Details */}
          <div style={{ marginBottom: '2.0rem' }}>
            <h4 style={{ 
              fontSize: '0.9rem', 
              color: 'var(--primary)', 
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              borderBottom: '1px solid rgba(255, 95, 0, 0.15)',
              paddingBottom: '0.25rem'
            }}>
              1. Customization Choices
            </h4>

            {product.type === 'flipname' && (
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input 
                    type="text" 
                    id="firstName"
                    className="form-control" 
                    placeholder="E.g., ARUN"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    maxLength={15}
                  />
                  {errors.firstName && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="secondName">Second Name</label>
                  <input 
                    type="text" 
                    id="secondName"
                    className="form-control" 
                    placeholder="E.g., ANJU"
                    value={secondName}
                    onChange={(e) => setSecondName(e.target.value)}
                    maxLength={15}
                  />
                  {errors.secondName && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.secondName}</span>}
                </div>
              </div>
            )}

            {product.type === 'single_line' && (
              <div className="form-group">
                <label htmlFor="customText">Custom Text (Single Line)</label>
                <input 
                  type="text" 
                  id="customText"
                  className="form-control" 
                  placeholder="Enter custom text for engraving..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  maxLength={30}
                />
                {errors.customText && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.customText}</span>}
              </div>
            )}

            {product.type === 'name_and_initial' && (
              <div className="grid" style={{ gridTemplateColumns: '120px 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="initialText">Initial</label>
                  <input 
                    type="text" 
                    id="initialText"
                    className="form-control" 
                    placeholder="A"
                    value={initialText}
                    onChange={(e) => setInitialText(e.target.value)}
                    maxLength={2}
                    style={{ textAlign: 'center', textTransform: 'uppercase' }}
                  />
                  {errors.initialText && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.initialText}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="customTextName">Engraved Name</label>
                  <input 
                    type="text" 
                    id="customTextName"
                    className="form-control" 
                    placeholder="E.g., Amit Kumar"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    maxLength={25}
                  />
                  {errors.customText && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.customText}</span>}
                </div>
              </div>
            )}

            {product.type !== 'flipname' && product.type !== 'single_line' && product.type !== 'name_and_initial' && (
              <div className="form-group">
                <label htmlFor="genericText">Custom Instructions / Details</label>
                <textarea 
                  id="genericText"
                  className="form-control" 
                  placeholder="Enter details..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={2}
                />
                {errors.customText && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.customText}</span>}
              </div>
            )}

            {/* Filament Color Swatches - Dynamic based on product type */}
            {isDualColor ? (
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderColorSwatches(baseColor, setBaseColor, "Base Filament Color")}
                {renderColorSwatches(textColor, setTextColor, "Text / Name Color")}
              </div>
            ) : (
              renderColorSwatches(selectedColor, setSelectedColor, "Filament Color")
            )}
          </div>

          {/* Section 2: Shipping Option */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ 
              fontSize: '0.9rem', 
              color: 'var(--primary)', 
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 700,
              borderBottom: '1px solid rgba(255, 95, 0, 0.15)',
              paddingBottom: '0.25rem'
            }}>
              2. Delivery Method
            </h4>

            <div className="flex" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              <div 
                className={`card flex items-center`} 
                style={{ 
                  flex: 1, 
                  cursor: 'pointer',
                  padding: '1rem',
                  border: deliveryMethod === 'shipping' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: deliveryMethod === 'shipping' ? 'rgba(255, 95, 0, 0.06)' : 'var(--bg-card)'
                }}
                onClick={() => setDeliveryMethod('shipping')}
              >
                <Truck size={20} style={{ color: deliveryMethod === 'shipping' ? 'var(--primary)' : 'var(--text-muted)', marginRight: '0.75rem' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Shiprocket Delivery</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Charges: ₹ {parseFloat(settings.shippingCost || 100).toFixed(2)}</div>
                </div>
              </div>

              <div 
                className={`card flex items-center`} 
                style={{ 
                  flex: 1, 
                  cursor: 'pointer',
                  padding: '1rem',
                  border: deliveryMethod === 'pickup' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: deliveryMethod === 'pickup' ? 'rgba(255, 95, 0, 0.06)' : 'var(--bg-card)'
                }}
                onClick={() => setDeliveryMethod('pickup')}
              >
                <MapPin size={20} style={{ color: deliveryMethod === 'pickup' ? 'var(--primary)' : 'var(--text-muted)', marginRight: '0.75rem' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Self Pickup</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Location: Free (₹ 0.00)</div>
                </div>
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="customerName">Your Name</label>
                <input 
                  type="text" 
                  id="customerName"
                  className="form-control" 
                  placeholder="E.g., Arun Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                {errors.customerName && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.customerName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="customerPhone">WhatsApp Number</label>
                <input 
                  type="tel" 
                  id="customerPhone"
                  className="form-control" 
                  placeholder="E.g., 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                {errors.customerPhone && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.customerPhone}</span>}
              </div>
            </div>

            {/* Address fields */}
            {deliveryMethod === 'shipping' && (
              <div style={{ marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label htmlFor="deliveryAddress">Delivery Address</label>
                  <textarea 
                    id="deliveryAddress"
                    className="form-control" 
                    placeholder="House/Flat No, Street, Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                  />
                  {errors.address && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.address}</span>}
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label htmlFor="deliveryCity">City</label>
                    <input 
                      type="text" 
                      id="deliveryCity"
                      className="form-control" 
                      placeholder="Chennai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    {errors.city && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="deliveryState">State</label>
                    <input 
                      type="text" 
                      id="deliveryState"
                      className="form-control" 
                      placeholder="Tamil Nadu"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                    {errors.stateName && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.stateName}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="deliveryPincode">Pincode</label>
                    <input 
                      type="text" 
                      id="deliveryPincode"
                      className="form-control" 
                      placeholder="600017"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      maxLength={6}
                    />
                    {errors.pincode && <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{errors.pincode}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing breakdown */}
          <div style={{ 
            background: 'rgba(255, 95, 0, 0.02)', 
            padding: '1.25rem', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 95, 0, 0.15)',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600 }}>
              Price Summary
            </h4>
            <div className="flex justify-between" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Base Price</span>
              <span>₹ {basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>GST ({gstRate}%)</span>
              <span>₹ {gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '0.9rem', marginBottom: '0.75rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping Fee ({deliveryMethod === 'shipping' ? 'Shiprocket' : 'Self Pickup'})</span>
              <span>{shippingCost > 0 ? `₹ ${shippingCost.toFixed(2)}` : 'FREE'}</span>
            </div>
            <div className="flex justify-between items-center" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--text-primary)' }}>Total Amount</span>
              <span style={{ color: 'var(--primary)' }}>₹ {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Action button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', gap: '0.75rem' }}
          >
            <MessageSquare size={20} color="#fff" />
            Place Order via WhatsApp
          </button>
        </form>

      </div>
    </div>
  );
}

export default CustomizeModal;
