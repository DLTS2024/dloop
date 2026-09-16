import React from 'react';
import { Sparkles, ArrowRight, CheckCircle, Smartphone, PenTool, Clipboard } from 'lucide-react';

function ShopPage({ products, onCustomize }) {
  return (
    <div className="container">
      {/* 3Ding Style Hero Section */}
      <section style={{ 
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
        gap: '3rem',
        marginBottom: '4.5rem',
        alignItems: 'center',
        padding: '3rem 2rem',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }} className="hero-section-grid">
        
        {/* Left Column: Title and details */}
        <div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.35rem 0.85rem', 
            background: 'rgba(255, 95, 0, 0.08)', 
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255, 95, 0, 0.2)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--primary)',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={12} />
            Instant Custom 3D Printing Service
          </div>

          <h2 style={{ 
            fontSize: '2.75rem', 
            fontWeight: 800, 
            lineHeight: 1.15,
            marginBottom: '1rem',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)'
          }}>
            Customized 3D Designs <br />
            <span style={{ color: 'var(--primary)' }}>Imagine it. Feel it.</span>
          </h2>
          
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '560px'
          }}>
            Welcome to D Loop 3D. We fabricate premium custom nameplates, keychains, and table-top initials. Enter your customizations, select your color, choose pickup or Shiprocket shipping, and finalize your order directly with us on WhatsApp.
          </p>

          <div className="flex" style={{ gap: '1rem' }}>
            <a href="#catalog" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
              Order Customized Products
              <ArrowRight size={16} />
            </a>
            <button 
              onClick={() => {
                const element = document.getElementById('catalog');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="btn btn-secondary" 
              style={{ padding: '0.85rem 1.75rem' }}
            >
              Browse Catalog
            </button>
          </div>
        </div>

        {/* Right Column: Workflow Steps Card resembling 3Ding's layout */}
        <div className="card" style={{ padding: '2rem', background: '#f8fafc', border: '1px solid var(--border-color)', position: 'relative' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 700, color: 'var(--secondary)', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>
            How to Order
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="flex" style={{ gap: '1rem' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                background: '#ffffff', 
                border: '1px solid var(--border-color)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <PenTool size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.15rem' }}>1. Choose & Customize</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pick a Flipname, Keychain, or Nameplate and enter custom texts/colors.</p>
              </div>
            </div>

            <div className="flex" style={{ gap: '1rem' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                background: '#ffffff', 
                border: '1px solid var(--border-color)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Clipboard size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.15rem' }}>2. Automatic Billing Check</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Input address details; website automatically calculates 18% GST and Shiprocket delivery fees.</p>
              </div>
            </div>

            <div className="flex" style={{ gap: '1rem' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                background: '#ffffff', 
                border: '1px solid var(--border-color)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Smartphone size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.15rem' }}>3. Place Order via WhatsApp</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clicking checkout redirects you to WhatsApp with pre-filled details to complete printing.</p>
              </div>
            </div>

          </div>

          <div style={{ 
            marginTop: '1.5rem', 
            padding: '0.75rem', 
            background: '#ffffff', 
            border: '1px dashed var(--border-color)', 
            borderRadius: '8px',
            fontSize: '0.75rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}>
            🔥 Express Delivery inside 2-4 Days via Shiprocket
          </div>
        </div>
      </section>

      {/* Products Catalog Grid */}
      <section id="catalog" style={{ scrollMarginTop: '100px' }}>
        <h3 style={{ 
          fontSize: '1.75rem', 
          fontWeight: 700, 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          Customizable 3D Catalog
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: 400, 
            color: 'var(--text-muted)',
            borderLeft: '1px solid var(--border-color)',
            paddingLeft: '0.75rem'
          }}>
            {products.length} Products
          </span>
        </h3>

        <div className="products-grid-layout" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {products.map((product) => (
            <div key={product.id} className="card flex flex-col justify-between" style={{ height: '100%', padding: '1.25rem' }}>
              <div>
                {/* Product Image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}>
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{
                    display: product.image ? 'none' : 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e2e8f0',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <Sparkles size={28} style={{ opacity: 0.6, color: 'var(--primary)' }} />
                    Preview Image
                  </div>
                </div>

                {/* Info */}
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{product.name}</h4>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.85rem', 
                  lineHeight: 1.5,
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.description}
                </p>
              </div>

              <div className="flex justify-between items-center" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Price starting at</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>₹ {parseFloat(product.price).toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => onCustomize(product)} 
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.15rem', fontSize: '0.85rem' }}
                >
                  Customize Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ShopPage;
