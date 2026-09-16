import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, LogOut, Lock, Settings as SettingsIcon, Package, ListPlus } from 'lucide-react';

function AdminPage({ products, settings, onSaveProducts, onSaveSettings }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Tab control: 'products' or 'settings'
  const [activeTab, setActiveTab] = useState('products');

  // Edit / Add Product State
  const [editingProduct, setEditingProduct] = useState(null); // null means no edit, or contains a product object
  const [isAdding, setIsAdding] = useState(false);

  // Form states for Product Add/Edit
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState('single_line');
  const [formImage, setFormImage] = useState('');
  const [formColors, setFormColors] = useState(''); // Comma separated

  // Form states for Store Settings
  const [settingsWA, setSettingsWA] = useState(settings.whatsappNumber || '');
  const [settingsGST, setSettingsGST] = useState(settings.gstRate || 18);
  const [settingsShipping, setSettingsShipping] = useState(settings.shippingCost || 100);
  const [settingsColors, setSettingsColors] = useState(settings.availableColors ? settings.availableColors.join(', ') : '');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Handle Passcode verification
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === 'admin123') {
      setIsAuthenticated(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Incorrect passcode. Try "admin123"');
    }
  };

  // Open Edit form
  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setIsAdding(false);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormDescription(product.description || '');
    setFormType(product.type || 'single_line');
    setFormImage(product.image || '');
    setFormColors(product.colors ? product.colors.join(', ') : '');
  };

  // Open Add form
  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormDescription('');
    setFormType('single_line');
    setFormImage('');
    setFormColors('Silk Gold, Silk Silver, Glossy Black, Fire Red, Royal Blue, Pure White');
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    const colorsArray = formColors
      ? formColors.split(',').map(c => c.trim()).filter(c => c.length > 0)
      : [];

    if (isAdding) {
      const newProduct = {
        id: Date.now().toString(),
        name: formName,
        price: parseFloat(formPrice),
        description: formDescription,
        type: formType,
        image: formImage,
        colors: colorsArray
      };
      onSaveProducts([...products, newProduct]);
      setIsAdding(false);
    } else if (editingProduct) {
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: formName,
            price: parseFloat(formPrice),
            description: formDescription,
            type: formType,
            image: formImage,
            colors: colorsArray
          };
        }
        return p;
      });
      onSaveProducts(updated);
      setEditingProduct(null);
    }
  };

  // Delete product
  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      onSaveProducts(updated);
    }
  };

  // Save settings
  const handleSaveSettingsSubmit = (e) => {
    e.preventDefault();
    const colorsArray = settingsColors
      ? settingsColors.split(',').map(c => c.trim()).filter(c => c.length > 0)
      : [];
    onSaveSettings({
      whatsappNumber: settingsWA,
      gstRate: parseFloat(settingsGST),
      shippingCost: parseFloat(settingsShipping),
      availableColors: colorsArray
    });
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '50vh' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              padding: '0.75rem', 
              background: 'rgba(255, 95, 0, 0.1)', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1rem',
              color: 'var(--primary)'
            }}>
              <Lock size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Admin Access</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enter passcode to configure products</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="adminPasscode">Passcode</label>
              <input 
                type="password" 
                id="adminPasscode"
                className="form-control" 
                placeholder="Hint: admin123"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.2em' }}
              />
              {passcodeError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  {passcodeError}
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '0.5rem' }}>
              Verify Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Admin Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Dashboard</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage store items and checkout parameters</p>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="flex" style={{ gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
        <button 
          onClick={() => { setActiveTab('products'); setIsAdding(false); setEditingProduct(null); }} 
          className="btn"
          style={{ 
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'products' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'products' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            padding: '0.75rem 1.5rem',
            gap: '0.5rem'
          }}
        >
          <Package size={16} />
          Manage Products
        </button>
        <button 
          onClick={() => { setActiveTab('settings'); setIsAdding(false); setEditingProduct(null); }} 
          className="btn"
          style={{ 
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'settings' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
            borderRadius: 0,
            padding: '0.75rem 1.5rem',
            gap: '0.5rem'
          }}
        >
          <SettingsIcon size={16} />
          Store Settings
        </button>
      </div>

      {/* Tab Content: PRODUCTS */}
      {activeTab === 'products' && (
        <div>
          {/* Default List View & Add New trigger */}
          {!isAdding && !editingProduct ? (
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Current Catalog</h3>
                <button onClick={handleStartAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                  <Plus size={16} />
                  Add New Product
                </button>
              </div>

              {/* Products Table/List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No products found in catalog. Click "Add New Product" to populate one!
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="card flex justify-between items-center" style={{ padding: '1rem 1.5rem', gap: '1rem' }}>
                      <div className="flex items-center" style={{ gap: '1rem', flex: 1 }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                          <img 
                            src={product.image || 'https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?w=100&auto=format&fit=crop&q=40'} 
                            alt={product.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{product.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                            <span>Type: <strong style={{ color: 'var(--primary)' }}>{product.type}</strong></span>
                            <span>Base: <strong style={{ color: 'var(--success)' }}>₹ {parseFloat(product.price).toFixed(2)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex" style={{ gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleStartEdit(product)} 
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem', borderRadius: '8px' }}
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)} 
                          className="btn btn-danger"
                          style={{ padding: '0.5rem', borderRadius: '8px' }}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Product Add/Edit Form */
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                {isAdding ? 'Add New 3D Product' : `Edit Product: ${editingProduct.name}`}
              </h3>

              <form onSubmit={handleSaveProduct}>
                <div className="form-group">
                  <label htmlFor="prodName">Product Name</label>
                  <input 
                    type="text" 
                    id="prodName"
                    className="form-control" 
                    required 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="prodPrice">Base Price (₹)</label>
                    <input 
                      type="number" 
                      id="prodPrice"
                      className="form-control" 
                      required 
                      min="0"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prodType">Customization Type</label>
                    <select 
                      id="prodType"
                      className="form-control"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <option value="flipname">Flipname (2 names + color)</option>
                      <option value="single_line">Single Line Text (1 text box)</option>
                      <option value="name_and_initial">Name & Initial (2 boxes: name + initial)</option>
                      <option value="other">Standard Product (Generic notes)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="prodImg">Product Image URL</label>
                  <input 
                    type="url" 
                    id="prodImg"
                    className="form-control" 
                    placeholder="https://example.com/image.jpg"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prodColors">Filament Colors (Comma separated)</label>
                  <input 
                    type="text" 
                    id="prodColors"
                    className="form-control" 
                    placeholder="Silk Gold, Silk Silver, Glossy Black"
                    value={formColors}
                    onChange={(e) => setFormColors(e.target.value)}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Separate choices with commas. Leave blank if color customization is not applicable.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="prodDesc">Product Description</label>
                  <textarea 
                    id="prodDesc"
                    className="form-control" 
                    rows={3} 
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end" style={{ gap: '1rem', marginTop: '2rem' }}>
                  <button 
                    type="button" 
                    onClick={() => { setIsAdding(false); setEditingProduct(null); }} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} color="#000" />
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Checkout & Taxes Configuration</h3>
          
          <form onSubmit={handleSaveSettingsSubmit}>
            <div className="form-group">
              <label htmlFor="settWA">Store WhatsApp Number</label>
              <input 
                type="text" 
                id="settWA"
                className="form-control" 
                required 
                placeholder="E.g., 919876543210"
                value={settingsWA}
                onChange={(e) => setSettingsWA(e.target.value)}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Include country code (e.g., 91 for India) without '+' or spaces. Redirection will open this contact chat.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="settColors">Available Filament Colors (Global Stock)</label>
              <textarea 
                id="settColors"
                className="form-control" 
                rows={2}
                required 
                placeholder="E.g., Silk Gold, Silk Silver, Glossy Black, Fire Red, Royal Blue"
                value={settingsColors}
                onChange={(e) => setSettingsColors(e.target.value)}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Comma-separated list of filament colors currently in stock. This list automatically populates color selections (swatches) for all products.
              </small>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="settGST">GST Rate (%)</label>
                <input 
                  type="number" 
                  id="settGST"
                  className="form-control" 
                  required 
                  min="0"
                  max="100"
                  value={settingsGST}
                  onChange={(e) => setSettingsGST(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="settShip">Shiprocket Cost (₹)</label>
                <input 
                  type="number" 
                  id="settShip"
                  className="form-control" 
                  required 
                  min="0"
                  value={settingsShipping}
                  onChange={(e) => setSettingsShipping(e.target.value)}
                />
              </div>
            </div>

            {settingsSavedMsg && (
              <div style={{ 
                color: 'var(--success)', 
                fontSize: '0.9rem', 
                marginBottom: '1rem', 
                textAlign: 'center', 
                background: 'rgba(16, 185, 129, 0.1)', 
                padding: '0.5rem', 
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                Settings saved successfully!
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              <Save size={16} color="#000" />
              Save Configuration
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
