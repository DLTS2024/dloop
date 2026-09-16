import React, { useState, useEffect } from 'react';
import ShopPage from './components/ShopPage';
import AdminPage from './components/AdminPage';
import CustomizeModal from './components/CustomizeModal';
import PrintDesignPage from './components/PrintDesignPage';
import { Settings, ShoppingBag, Layers } from 'lucide-react';

const DEFAULT_PRODUCTS = [
  {
    id: '1',
    name: 'Flipname',
    price: 399,
    description: 'Sleek 3D printed flip name displaying two different names depending on the angle you look at it! Perfect gift for couples or offices.',
    type: 'flipname',
    image: 'https://images.unsplash.com/photo-1615840287214-7fe58a8b668f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    colors: ['Silk Gold', 'Silk Silver', 'Glossy Black', 'Fire Red', 'Royal Blue', 'Silk Green', 'Pure White']
  },
  {
    id: '2',
    name: 'Keychain (Single Line Text)',
    price: 149,
    description: 'Custom 3D printed keychain with your name, phone number, or any word of choice. Lightweight, durable, and unique.',
    type: 'single_line',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    colors: ['Silk Gold', 'Silk Silver', 'Glossy Black', 'Fire Red', 'Royal Blue', 'Pure White']
  },
  {
    id: '3',
    name: 'Number Plate Keychain',
    price: 199,
    description: 'Miniature model of a vehicle registration plate with elevated lettering. An excellent gift for car and bike enthusiasts.',
    type: 'single_line',
    image: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    colors: ['White Background (Black Text)', 'Yellow Background (Black Text)', 'Glossy Black (Silver Text)']
  },
  {
    id: '4',
    name: 'Personalized Custom Name & Initial Design',
    price: 299,
    description: 'Elegant dual-layered display combining a large custom initial alphabet and your full name custom engraved in front. Perfect for study tables or shelves.',
    type: 'name_and_initial',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    colors: ['Silk Gold & Black', 'Silk Silver & Dark Blue', 'Red & White', 'Black & Neon Green']
  }
];

const DEFAULT_SETTINGS = {
  whatsappNumber: '919884872483',
  gstRate: 18,
  shippingCost: 100,
  availableColors: ['Silk Gold', 'Silk Silver', 'Glossy Black', 'Fire Red', 'Royal Blue', 'Pure White', 'Silk Green']
};

function App() {
  const [view, setView] = useState('shop'); // 'shop', 'print_design', or 'admin'
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Initialize and load data from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('d_loop_3d_products');
    const savedSettings = localStorage.getItem('d_loop_3d_settings');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(DEFAULT_PRODUCTS);
      localStorage.setItem('d_loop_3d_products', JSON.stringify(DEFAULT_PRODUCTS));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('d_loop_3d_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
  }, []);

  // Update products in state & localStorage
  const handleSaveProducts = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem('d_loop_3d_products', JSON.stringify(updatedProducts));
  };

  // Update settings in state & localStorage
  const handleSaveSettings = (updatedSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('d_loop_3d_settings', JSON.stringify(updatedSettings));
  };

  return (
    <div className="flex flex-col min-h-screen relative" style={{ backgroundColor: 'var(--bg-color)' }}>
      
      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        background: 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 0'
      }}>
        <div className="container flex justify-between items-center">
          
          {/* Logo brand section */}
          <div className="flex items-center" style={{ gap: '0.75rem', cursor: 'pointer' }} onClick={() => setView('shop')}>
            <img 
              src="/dloop3d_logo.png" 
              alt="D Loop 3D Logo" 
              style={{
                height: '48px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            {/* Fallback Text Brand Title if image fails */}
            <div style={{ display: 'none' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>
                D LOOP <span style={{ color: 'var(--primary)' }}>3D</span>
              </h1>
              <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>Imagine it. Feel it.</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          {view !== 'admin' && (
            <nav className="flex items-center" style={{ gap: '2rem' }}>
              <span 
                onClick={() => setView('shop')}
                style={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-heading)',
                  color: view === 'shop' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: view === 'shop' ? '3px solid var(--primary)' : '3px solid transparent',
                  padding: '0.5rem 0',
                  transition: 'all 0.2s'
                }}
              >
                Shop Catalog
              </span>
              <span 
                onClick={() => setView('print_design')}
                style={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-heading)',
                  color: view === 'print_design' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: view === 'print_design' ? '3px solid var(--primary)' : '3px solid transparent',
                  padding: '0.5rem 0',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Layers size={14} />
                Print My Design
              </span>
            </nav>
          )}

          {/* Right Action Button */}
          <div className="flex items-center" style={{ gap: '1rem' }}>
            {view === 'admin' ? (
              <button 
                onClick={() => setView('shop')} 
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                <ShoppingBag size={16} />
                Exit Admin
              </button>
            ) : (
              <button 
                onClick={() => setView('admin')} 
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                title="Admin Control Panel"
              >
                <Settings size={16} />
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2.5rem 0' }}>
        {view === 'shop' && (
          <ShopPage 
            products={products} 
            onCustomize={(product) => setSelectedProduct(product)} 
          />
        )}
        {view === 'print_design' && (
          <PrintDesignPage 
            settings={settings}
          />
        )}
        {view === 'admin' && (
          <AdminPage 
            products={products} 
            settings={settings}
            onSaveProducts={handleSaveProducts} 
            onSaveSettings={handleSaveSettings}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '2.5rem 0', 
        background: '#ffffff',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        <div className="container">
          <div style={{ marginBottom: '1.25rem' }}>
            <img 
              src="/dloop3d_logo.png" 
              alt="D Loop 3D Logo" 
              style={{ height: '36px', objectFit: 'contain', opacity: 0.8 }}
            />
          </div>
          <p>© 2026 D Loop 3D. Imagine it. Feel it. All Rights Reserved.</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Powered by Shiprocket Shipping Redirection.</p>
          <div className="flex justify-center" style={{ gap: '1.5rem', marginTop: '1.25rem' }}>
            <span style={{ cursor: 'pointer', fontWeight: 500, color: view === 'shop' ? 'var(--primary)' : 'inherit' }} onClick={() => setView('shop')} className="hover:text-primary">Shop Catalog</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ cursor: 'pointer', fontWeight: 500, color: view === 'print_design' ? 'var(--primary)' : 'inherit' }} onClick={() => setView('print_design')} className="hover:text-primary">Print My Design</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ cursor: 'pointer', fontWeight: 500 }} onClick={() => setView('admin')} className="hover:text-primary">Store Admin</span>
          </div>
        </div>
      </footer>

      {/* Customization Modal */}
      {selectedProduct && (
        <CustomizeModal 
          product={selectedProduct} 
          settings={settings}
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}

export default App;
