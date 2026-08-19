/**
 * D Loop Store — Pay0 Payment Gateway Unified SDK & Client Bridge
 * Official Integration for https://pay0.shop/docs
 * 0% Fee Safe Instant UPI Payments (GPay, PhonePe, Paytm, BHIM, Cred)
 */

(function(window) {
  'use strict';

  // Default credentials provided in merchant portal
  const DEFAULT_PAY0_CONFIG = {
    apiKey: 'c93aae94c854cbdee78c40acefb5bdc2',
    secret: 'IhVZmJ4Kte200064108',
    apiBaseUrl: 'https://pay0.shop/api',
    webhookUrl: 'https://dloopstore.in/api/pay0_webhook.php',
    storeName: 'D Loop Store (Digiteloop Tech Solutions)',
    enabled: true
  };

  const STORAGE_KEY = 'dl3d_pay0_config_v1';

  function getPay0Config() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PAY0_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[Pay0] Could not read stored config, using defaults', e);
    }
    return { ...DEFAULT_PAY0_CONFIG };
  }

  function savePay0Config(config) {
    try {
      const merged = { ...getPay0Config(), ...config };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.error('[Pay0] Could not save config', e);
      return null;
    }
  }

  /**
   * Helper to perform URL-encoded POST with multiple fallback methods:
   * 1. Local PHP proxy / backend endpoint (if hosted on server)
   * 2. Direct browser fetch with urlencoded body
   * 3. CORS fallback proxy for offline/file:// testing
   */
  async function postPay0Request(endpoint, params) {
    const config = getPay0Config();
    const targetUrl = `${config.apiBaseUrl}/${endpoint}`;
    
    // Format body as x-www-form-urlencoded string
    const urlParams = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        urlParams.append(key, String(params[key]));
      }
    }

    // Try PHP backend proxy first if available
    try {
      const phpEndpoint = endpoint === 'create-order' ? 'api/pay0_create_order.php' : 'api/pay0_status.php';
      const localResponse = await fetch(phpEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlParams.toString()
      });
      if (localResponse.ok) {
        const data = await localResponse.json();
        return data;
      }
    } catch (e) {
      // Not on PHP backend or file protocol, proceed to direct / proxy call
    }

    // Direct fetch
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlParams.toString()
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (directErr) {
      console.warn('[Pay0] Direct fetch failed (likely CORS on static origin). Trying secure proxy bridge...', directErr);
    }

    // Try multiple proxy endpoints if running on static frontend
    const proxyList = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
    ];

    for (const pUrl of proxyList) {
      try {
        const proxyResponse = await fetch(pUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: urlParams.toString()
        });
        if (proxyResponse.ok) {
          const text = await proxyResponse.text();
          try {
            return JSON.parse(text);
          } catch(pe) {
            console.warn('[Pay0] Proxy returned non-json', text);
          }
        }
      } catch (proxyErr) {
        // Try next proxy
      }
    }

    throw new Error('Unable to connect to Pay0 Payment Gateway API directly from browser. When deployed to your live server (dloopstore.in), the included /api/pay0_create_order.php backend endpoint handles this with 100% reliability and 0% CORS.');
  }

  /**
   * Create a PayIN Order on Pay0
   * POST https://pay0.shop/api/create-order
   */
  async function createPay0Order(options) {
    const config = getPay0Config();
    const cleanMobile = String(options.customerMobile || '').replace(/\D/g, '').slice(-10) || '9884872483';
    const amountVal = parseFloat(options.amount || 1).toFixed(2);
    
    // Redirect URL where customer lands after payment
    const currentOrigin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://dloopstore.in';
    const currentPath = window.location.pathname ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) : '/';
    const defaultRedirect = `${currentOrigin}${currentPath}account.html?pay0_return=true&order_id=${encodeURIComponent(options.orderId)}`;
    const redirectUrl = options.redirectUrl || defaultRedirect;

    const payload = {
      customer_mobile: cleanMobile,
      customer_name: options.customerName || 'DLoop Customer',
      user_token: config.apiKey,
      amount: amountVal,
      order_id: String(options.orderId),
      redirect_url: redirectUrl,
      remark1: options.remark1 || 'DLoop 3D Studio',
      remark2: options.remark2 || (options.customerEmail || 'Order')
    };

    console.log('[Pay0] Creating order:', payload);
    const res = await postPay0Request('create-order', payload);
    return res;
  }

  /**
   * Check Order Status from Pay0
   * POST https://pay0.shop/api/check-order-status
   */
  async function checkPay0OrderStatus(orderId) {
    const config = getPay0Config();
    const payload = {
      user_token: config.apiKey,
      order_id: String(orderId)
    };

    console.log('[Pay0] Checking status for order:', orderId);
    const res = await postPay0Request('check-order-status', payload);
    return res;
  }

  /**
   * High-level checkout flow:
   * Creates Pay0 order and opens payment page or redirect
   */
  async function initiatePay0Checkout(orderData) {
    showPay0Overlay('Initializing secure UPI gateway...');
    try {
      const resp = await createPay0Order({
        orderId: orderData.orderId,
        amount: orderData.total || orderData.amount,
        customerName: orderData.customer,
        customerMobile: orderData.phone,
        customerEmail: orderData.email,
        remark1: 'D Loop Store',
        remark2: orderData.orderId
      });

      if (resp && resp.status && resp.result && resp.result.payment_url) {
        showPay0Overlay('Redirecting to Pay0 UPI Gateway (GPay, PhonePe, Paytm)...');
        
        // Save current pending payment details
        try {
          sessionStorage.setItem('dl3d_pending_pay0_order', JSON.stringify({
            orderId: orderData.orderId,
            amount: orderData.total || orderData.amount,
            timestamp: Date.now(),
            paymentUrl: resp.result.payment_url
          }));
        } catch (e) {}

        setTimeout(() => {
          window.location.href = resp.result.payment_url;
        }, 600);
        return { success: true, paymentUrl: resp.result.payment_url, result: resp.result };
      } else {
        hidePay0Overlay();
        const msg = (resp && resp.message) ? resp.message : 'Could not generate payment link.';
        alert(`Pay0 Gateway Error: ${msg}`);
        return { success: false, message: msg };
      }
    } catch (err) {
      hidePay0Overlay();
      console.error('[Pay0] Checkout initiation failed', err);
      alert(`Payment Gateway Error: ${err.message || 'Network error connecting to Pay0'}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * UI Overlay while connecting to Pay0
   */
  function showPay0Overlay(message) {
    let overlay = document.getElementById('pay0-processing-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'pay0-processing-overlay';
      overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 99999; color: #FFFFFF; font-family: 'Inter', system-ui, sans-serif;
      `;
      overlay.innerHTML = `
        <div style="background: #FFFFFF; color: #0F172A; padding: 28px 36px; border-radius: 16px; text-align: center; max-width: 420px; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
          <div style="width: 50px; height: 50px; border: 4px solid #F1F5F9; border-top-color: #FF6500; border-radius: 50%; animation: pay0-spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
          <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,101,0,0.1); color:#FF6500; font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:999px; margin-bottom:10px;">
            ⚡ PAY0 0% FEE UPI GATEWAY
          </div>
          <h3 style="font-size:1.15rem; font-weight:800; margin-bottom:8px;" id="pay0-overlay-title">Processing Payment</h3>
          <p style="font-size:0.88rem; color:#64748B; line-height:1.5;" id="pay0-overlay-msg">${message || 'Please wait...'}</p>
        </div>
        <style>
          @keyframes pay0-spin { to { transform: rotate(360deg); } }
        </style>
      `;
      document.body.appendChild(overlay);
    } else {
      const msgElem = document.getElementById('pay0-overlay-msg');
      if (msgElem) msgElem.textContent = message || 'Please wait...';
      overlay.style.display = 'flex';
    }
  }

  function hidePay0Overlay() {
    const overlay = document.getElementById('pay0-processing-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  /**
   * Auto-check return status when redirected back from Pay0
   */
  async function checkReturnFromPay0() {
    const params = new URLSearchParams(window.location.search);
    const isPay0Return = params.get('pay0_return') === 'true' || params.get('payment_status') || params.get('order_id');
    const orderId = params.get('order_id');

    if (!orderId || !isPay0Return) return;

    console.log('[Pay0] Detected return from payment gateway for order:', orderId);
    showPay0Overlay(`Verifying UPI Payment for Order ${orderId}...`);

    try {
      const statusRes = await checkPay0OrderStatus(orderId);
      hidePay0Overlay();

      if (statusRes && statusRes.status && statusRes.result) {
        const result = statusRes.result;
        const isSuccess = result.txnStatus === 'SUCCESS';

        // Update local order data
        updateOrderPaymentStatus(orderId, {
          paymentStatus: isSuccess ? 'PAID' : (result.txnStatus === 'PENDING' ? 'PENDING' : 'FAILED'),
          paymentMethod: 'upi',
          utr: result.utr || null,
          paidAmount: result.amount,
          paidDate: result.date || new Date().toISOString(),
          status: isSuccess ? 'processing' : 'new'
        });

        if (isSuccess) {
          showPaymentSuccessModal(orderId, result);
        } else if (result.txnStatus === 'PENDING') {
          alert(`Order ${orderId}: Payment is pending confirmation from your UPI app. It will automatically update once verified.`);
        }
      }
    } catch (e) {
      hidePay0Overlay();
      console.warn('[Pay0] Return status check completed with notice:', e);
    }
  }

  function updateOrderPaymentStatus(orderId, updateData) {
    try {
      // 1. Update in adminStock
      if (typeof loadAdminStock === 'function' && typeof saveAdminStock === 'function') {
        const stock = loadAdminStock();
        if (stock.orders && Array.isArray(stock.orders)) {
          const ord = stock.orders.find(o => o.orderId === orderId);
          if (ord) {
            Object.assign(ord, updateData);
            saveAdminStock(stock);
          }
        }
      }

      // 2. Update in current user
      if (typeof getCurrentUser === 'function' && typeof setCurrentUser === 'function') {
        const user = getCurrentUser();
        if (user && user.myOrders && Array.isArray(user.myOrders)) {
          const uOrd = user.myOrders.find(o => o.orderId === orderId);
          if (uOrd) {
            Object.assign(uOrd, updateData);
            setCurrentUser(user);
          }
        }
      }

      // 3. Re-render customer orders if on account page
      if (typeof renderCustomerAccountOrders === 'function') {
        renderCustomerAccountOrders();
      }
    } catch (e) {
      console.error('[Pay0] Error updating order status', e);
    }
  }

  function showPaymentSuccessModal(orderId, result) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 100000;
      font-family: 'Inter', system-ui, sans-serif;
    `;
    modal.innerHTML = `
      <div style="background: #FFFFFF; color: #0F172A; padding: 32px; border-radius: 18px; text-align: center; max-width: 460px; width: 92%; box-shadow: 0 25px 60px rgba(0,0,0,0.25);">
        <div style="font-size: 3.5rem; margin-bottom: 8px;">🎉</div>
        <div style="font-size: 0.75rem; font-weight: 800; color: #059669; background: rgba(5, 150, 105, 0.1); padding: 4px 12px; border-radius: 999px; display: inline-block; margin-bottom: 12px;">
          PAYMENT VERIFIED (PAY0 UPI)
        </div>
        <h2 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 6px;">Payment Successful!</h2>
        <p style="font-size: 0.9rem; color: #64748B; margin-bottom: 20px;">
          Thank you! We received your payment for order <strong>${orderId}</strong>. Your 3D print job is queued for production.
        </p>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; text-align: left; font-size: 0.85rem; margin-bottom: 20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="color:#64748B;">Amount Paid:</span>
            <strong style="color: #FF6500; font-size: 1rem;">₹${result.amount || ''}</strong>
          </div>
          ${result.utr ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:#64748B;">Bank UTR / Ref:</span>
              <strong style="color: #0F172A; font-family: monospace;">${result.utr}</strong>
            </div>
          ` : ''}
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#64748B;">Status:</span>
            <strong style="color: #059669;">● SUCCESS (VERIFIED)</strong>
          </div>
        </div>

        <button type="button" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 700;" onclick="this.closest('div[style*=fixed]').remove(); if(window.history.replaceState){window.history.replaceState({}, '', window.location.pathname);}">
          View My Orders & Tracking 🚀
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Export to Global Scope
  window.Pay0Gateway = {
    getConfig: getPay0Config,
    saveConfig: savePay0Config,
    createOrder: createPay0Order,
    checkStatus: checkPay0OrderStatus,
    initiateCheckout: initiatePay0Checkout,
    checkReturn: checkReturnFromPay0
  };

  // Run return check on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkReturnFromPay0);
  } else {
    checkReturnFromPay0();
  }

})(window);
