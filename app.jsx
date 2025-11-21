import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from 'https://esm.sh/v135/@supabase/supabase-js@2.43.4/dist/module/index.js';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:5001';

const DELIVERY_ZONES = [
    'KE Main Entrance',
    'Woods',
    'Main Block entrance',
    'Canteen',
    'Steag entrance',
    'Bus Bay'
];

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is missing from .env file in the frontend directory.");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// --- STYLES (Restored "Classy" Purple Theme) ---
const colors = {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    primary: '#5E548E', // Sophisticated purple
    primaryDark: '#453C67',
    text: '#212529',
    textSecondary: '#6C757D',
    textMuted: '#ADB5BD',
    accent: '#9F86C0',
    error: '#E63946',
    success: '#2A9D8F',
    border: '#DEE2E6',
    star: '#FCA311',
};

const styles = {
    // General
    appContainer: { backgroundColor: colors.background, color: colors.text, minHeight: '100vh', fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column' },
    mainContent: { flexGrow: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' },
    // Header
    header: { backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 20, padding: '16px 0' },
    headerInner: { width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: '1.75rem', fontWeight: '600', color: colors.primary, cursor: 'pointer', transition: 'opacity 0.2s' },
    headerIcons: { display: 'flex', alignItems: 'center', gap: '20px' },
    iconButton: { position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' },
    cartBadge: { position: 'absolute', top: 0, right: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold', color: '#FFF', backgroundColor: colors.error, borderRadius: '9999px', transform: 'translate(50%, -50%)' },
    // Home Page
    homePage: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' },
    homeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', width: '100%', maxWidth: '1024px', marginTop: '48px' },
    optionCard: { backgroundColor: colors.surface, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', padding: '40px', cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease', border: `1px solid ${colors.border}` },
    // Auth Page
    authPageContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: colors.background, padding: '24px' },
    authFormWrapper: { width: '100%', maxWidth: '420px', padding: '20px' },
    // Forms & Buttons
    formContainer: { backgroundColor: colors.surface, padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)', display: 'flex', flexDirection: 'column', gap: '24px' },
    formInputContainer: { display: 'flex', flexDirection: 'column' },
    formLabel: { marginBottom: '8px', fontWeight: '500', color: colors.textSecondary },
    formInput: { backgroundColor: colors.background, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '12px 16px', color: colors.text, outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s, box-shadow 0.2s' },
    button: { backgroundColor: colors.primary, color: 'white', fontWeight: '600', padding: '14px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s, transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    buttonDisabled: { backgroundColor: colors.textMuted, cursor: 'not-allowed' },
    backButton: { display: 'inline-block', backgroundColor: 'transparent', color: colors.primary, padding: '8px 16px', marginBottom: '24px', fontWeight: '500', borderRadius: '8px' },
    // Product Grid & Cards
    filtersContainer: { backgroundColor: colors.surface, padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', border: `1px solid ${colors.border}` },
    productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' },
    productCard: { backgroundColor: colors.surface, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `1px solid ${colors.border}`, transition: 'transform 0.3s ease, box-shadow 0.3s ease', overflow: 'hidden', cursor: 'pointer' },
    productCardImage: { width: '100%', height: '200px', objectFit: 'cover', backgroundColor: '#E9ECEF' },
    // Cart & Profile
    cartItem: { padding: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' },
    soldProductCard: { backgroundColor: colors.surface, padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', border: `1px solid ${colors.border}` },
    footer: { backgroundColor: 'transparent', marginTop: '64px', padding: '24px' },
    // Modal
    modalBackdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    modalContent: { backgroundColor: colors.surface, padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '90%', maxWidth: '500px' },
    // Banner
    bannerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '800px', margin: '0 auto 48px auto', textAlign: 'center' },
    bannerLogo: { width: '100%', maxWidth: '600px', height: 'auto', objectFit: 'contain', borderRadius: '12px' },
    bannerText: { color: colors.primary, fontWeight: '700', fontSize: '2.5rem', marginTop: '24px', letterSpacing: '2px' }
};

// --- Main App Component ---
export default function App() {
    const [session, setSession] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setIsAdmin(session?.user?.email === ADMIN_EMAIL);
            setLoading(false);
        };
        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsAdmin(session?.user?.email === ADMIN_EMAIL);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return <div style={{...styles.appContainer, ...styles.authPageContainer}}><LoadingSpinner /></div>;
    
    return session ? <MarketplaceApp user={session.user} isAdmin={isAdmin} /> : <AuthPage />;
}


// --- Auth Page ---
function AuthPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMagicLinkLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage(''); setError('');
        if (!email.endsWith('@rajagiri.edu.in')) { setError('Please use a valid @rajagiri.edu.in email address.'); setLoading(false); return; }
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/magiclink`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'An error occurred.');
            setMessage('Success! Please check your email for the magic login link.');
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div style={styles.authPageContainer}>
            <Banner />
            <div style={styles.authFormWrapper}>
                <p style={{textAlign: 'center', color: colors.textSecondary, marginBottom: '32px'}}>Enter your college email to log in or sign up.</p>
                <form onSubmit={handleMagicLinkLogin} style={styles.formContainer}>
                    <FormInput label="College Email Address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@rajagiri.edu.in" required />
                    {message && <p style={{color: colors.success, textAlign: 'center'}}>{message}</p>}
                    {error && <p style={{color: colors.error, textAlign: 'center'}}>{error}</p>}
                    <SubmitButton isSubmitting={loading} text="Send Login Link" />
                </form>
            </div>
        </div>
    );
}

// --- Updated Banner Component (Logo + Text Below) ---
function Banner() {
    const logoUrl = "rsetmarket.png"; 

    return (
        <div style={styles.bannerContainer}>
            <img src={logoUrl} alt="RSET Marketspace Logo" style={{ width: "350px", height: "auto" }}  />
            <h2>Your one-step platform  to buy,sell or rent items with ease </h2>
            <h2>Select an option below to get started</h2> 
        </div>
    );
}


// --- Main Marketplace Application ---
function MarketplaceApp({ user, isAdmin }) {
    const [page, setPage] = useState('home');
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [boughtProducts, setBoughtProducts] = useState([]);
    const [sellerItems, setSellerItems] = useState([]);
    const [sellerRentals, setSellerRentals] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);

    const userId = user.id;

    const fetchAllData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [productsRes, rentalsRes, boughtRes, sellerItemsRes, sellerRentalsRes] = await Promise.all([ 
                fetch(`${API_BASE_URL}/api/products`), 
                fetch(`${API_BASE_URL}/api/rentals`),
                fetch(`${API_BASE_URL}/api/sold-products/${userId}`), 
                fetch(`${API_BASE_URL}/api/seller-items/${userId}`),
                fetch(`${API_BASE_URL}/api/seller-rentals/${userId}`)
            ]); 
            setProducts(await productsRes.json()); 
            setRentals(await rentalsRes.json());
            setBoughtProducts(await boughtRes.json()); 
            setSellerItems(await sellerItemsRes.json());
            setSellerRentals(await sellerRentalsRes.json());
        } catch (e) { 
            console.error("Failed to fetch data", e); 
        } finally { 
            setLoadingData(false);
        }
    }, [userId]);

    useEffect(() => { 
        fetchAllData(); 
    }, [fetchAllData]);

    const addToCart = (p, type) => { setCart(c => c.find(i => i._id === p._id) ? c : [...c, { ...p, type, ...(type === 'rental' && { rentalDays: 1 }), selectedZone: '' }]); };
    const updateCartItem = (id, updates) => { setCart(c => c.map(i => i._id === id ? { ...i, ...updates } : i)); };
    const removeFromCart = (id) => { setCart(c => c.filter(i => i._id !== id)); };

    const handleCheckout = async () => {
        if (cart.length === 0 || !userId) return;
        if (cart.some(item => !item.selectedZone)) { alert("Please select a pickup zone for all items."); return; }
        const toBuy = cart.filter(i => i.type === 'sale'); 
        const toRent = cart.filter(i => i.type === 'rental'); 
        try { 
            const [buyRes, rentRes] = await Promise.all([ 
                toBuy.length > 0 ? fetch(`${API_BASE_URL}/api/purchase`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cart: toBuy, userId })}) : Promise.resolve({ ok: true }), 
                toRent.length > 0 ? fetch(`${API_BASE_URL}/api/rent-items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cart: toRent, userId })}) : Promise.resolve({ ok: true }) 
            ]); 
            if (!buyRes.ok || !rentRes.ok) throw new Error('Checkout failed.'); 
            setCart([]); alert("Checkout successful!"); setPage('home'); fetchAllData(); 
        } catch (e) { console.error(e); alert(`Error: ${e.message}`); } 
    };
    
    const handleLogout = async () => { await supabase.auth.signOut(); };
    
    const openReviewModal = (item) => { setSelectedItem(item); setShowReviewModal(true); };
    const openAllReviewsModal = (item) => { setSelectedItem(item); setShowAllReviewsModal(true); };
    const closeModals = () => { setShowReviewModal(false); setShowAllReviewsModal(false); if(page !== 'rent' && page !== 'buy') setSelectedItem(null);};
    const handleReviewSubmit = () => { closeModals(); fetchAllData(); };

    const renderPage = () => {
        const props = { userId, setPage, setSelectedItem, isAdmin };
        if (selectedItem && page !== 'cart' && page !== 'profile' && page !== 'sell') {
            return <ProductDetailPage 
                selectedItem={selectedItem}
                onBack={() => setSelectedItem(null)}
                addToCart={addToCart}
                onWriteReview={() => openReviewModal(selectedItem)}
                onViewReviews={() => openAllReviewsModal(selectedItem)}
                onProductSelect={(product, type) => setSelectedItem({ product, type })}
            />
        }
        switch (page) {
            case 'sell': return <SellPage {...props} onProductAdded={fetchAllData} />;
            case 'buy': return <BuyPage {...props} products={products} loading={loadingData} onProductSelect={(product) => setSelectedItem({ product, type: 'sale' })} />;
            case 'rent': return <RentPage {...props} rentals={rentals} loading={loadingData} onProductSelect={(product) => setSelectedItem({ product, type: 'rental' })} />;
            case 'cart': return <CartPage {...props} cart={cart} removeFromCart={removeFromCart} updateCartItem={updateCartItem} handleCheckout={handleCheckout} />;
            case 'profile': return <ProfilePage {...props} boughtProducts={boughtProducts} sellerItems={sellerItems} sellerRentals={sellerRentals} loading={loadingData} onUpdate={fetchAllData} />;
            case 'admin': return <AdminPage {...props} onUpdate={fetchAllData} />;
            default: return <HomePage navigate={(p) => { setPage(p); setSelectedItem(null); }} />;
        }
    };

    return ( 
        <div style={styles.appContainer}> 
            <Header userEmail={user.email} onLogout={handleLogout} setPage={(p) => { setPage(p); setSelectedItem(null); }} cartCount={cart.length} isAdmin={isAdmin} /> 
            <main style={styles.mainContent}>{renderPage()}</main> 
            <Footer />
            {showReviewModal && selectedItem && <ReviewModal rental={selectedItem.product} userId={userId} onClose={closeModals} onReviewSubmit={handleReviewSubmit} />}
            {showAllReviewsModal && selectedItem && <AllReviewsModal reviews={selectedItem.product.reviews} onClose={closeModals} />}
        </div> 
    );
}

// --- Helper & UI Components ---
const useHover = () => { const [isHovered, setIsHovered] = useState(false); const p = { onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false) }; return [isHovered, p]; };
function Header({ userEmail, onLogout, setPage, cartCount, isAdmin }) { const [tH, tP] = useHover(); const [cH, cP] = useHover(); const [pH, pP] = useHover(); const tS = { ...styles.headerTitle, opacity: tH ? 0.8 : 1 }; const iBS = (h) => ({ ...styles.iconButton, backgroundColor: h ? colors.background : 'transparent' }); return ( <header style={styles.header}> <div style={styles.headerInner}> <h1 onClick={() => setPage('home')} style={tS} {...tP}>Rajagiri Marketplace</h1> <div style={styles.headerIcons}> {isAdmin && <button onClick={() => setPage('admin')} style={{...styles.button, padding: '8px 16px', backgroundColor: colors.error, color: 'white'}}>Admin Panel</button>} <div onClick={() => setPage('cart')} style={iBS(cH)} {...cP}> <svg xmlns="http://www.w3.org/2000/svg" style={{height: '24px', width: '24px', color: colors.primary}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>} </div> <div onClick={() => setPage('profile')} style={iBS(pH)} {...pP}> <svg xmlns="http://www.w3.org/2000/svg" style={{height: '24px', width: '24px', color: colors.primary}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> </div> <div style={{textAlign: 'right'}}> <p style={{fontSize: '0.875rem', color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px'}}>{userEmail}</p> <button onClick={onLogout} style={{color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'}}>Logout</button> </div> </div> </div> </header> ); }
function HomePage({ navigate }) { return ( <div style={styles.homePage}> <Banner /> <div style={styles.homeGrid}> <OptionCard title="Buy" description="Browse and purchase items." icon="🛒" onClick={() => navigate('buy')} /> <OptionCard title="Sell" description="List your own items for sale." icon="🏷️" onClick={() => navigate('sell')} /> <OptionCard title="Rent" description="Find or list items for rent." icon="🏠" onClick={() => navigate('rent')} /> </div> </div> ); }
function OptionCard({ title, description, icon, onClick }) { const [isHovered, hoverProps] = useHover(); const cardStyle = { ...styles.optionCard, transform: isHovered ? 'translateY(-8px)' : 'none', boxShadow: isHovered ? `0 12px 28px rgba(0,0,0,0.1)` : '0 4px 12px rgba(0,0,0,0.05)' }; return ( <div onClick={onClick} style={cardStyle} {...hoverProps}> <div style={{fontSize: '3rem', marginBottom: '16px'}}>{icon}</div> <h3 style={{fontSize: '1.5rem', fontWeight: '600', color: colors.primary, marginBottom: '8px'}}>{title}</h3> <p style={{color: colors.textSecondary}}>{description}</p> </div> ); }
function SellPage({ userId, setPage, onProductAdded }) { const [isSubmitting, setIsSubmitting] = useState(false); const [message, setMessage] = useState({ type: '', text: '' }); const [sellType, setSellType] = useState('buy'); const [selectedZones, setSelectedZones] = useState([]); const handleZoneChange = (zone) => { const newZones = selectedZones.includes(zone) ? selectedZones.filter(z => z !== zone) : [...selectedZones, zone]; setSelectedZones(newZones); }; const handleSubmit = async (e) => { e.preventDefault(); if (selectedZones.length < 3) { setMessage({ type: 'error', text: 'Please select at least 3 delivery zones.' }); return; } const formData = new FormData(e.target); formData.append('deliveryZones', JSON.stringify(selectedZones)); if (!formData.get('name')) { setMessage({ type: 'error', text: 'Please fill in all required fields.' }); return; } setIsSubmitting(true); setMessage({ type: '', text: '' }); const endpoint = sellType === 'buy' ? '/api/products' : '/api/rentals'; formData.append(sellType === 'buy' ? 'sellerId' : 'ownerId', userId); try { const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', body: formData }); if (!response.ok) { throw new Error( (await response.json()).message || 'Failed to list item.' ); } setMessage({ type: 'success', text: 'Item submitted for approval!' }); e.target.reset(); setSelectedZones([]); onProductAdded(); } catch (error) { console.error(error); setMessage({ type: 'error', text: error.message }); } finally { setIsSubmitting(false); } }; return ( <div style={{maxWidth: '768px', margin: '0 auto'}}> <BackButton onClick={() => setPage('home')} /> <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center', color: colors.text}}>List an Item</h2> <div style={{display: 'flex', justifyContent: 'center', marginBottom: '32px', gap: '16px'}}> <button onClick={() => setSellType('buy')} style={{...styles.button, backgroundColor: sellType === 'buy' ? colors.primary: 'transparent', border: `1px solid ${colors.primary}`, color: sellType === 'buy' ? 'white': colors.primary, flex: 1}}>For Sale</button> <button onClick={() => setSellType('rent')} style={{...styles.button, backgroundColor: sellType === 'rent' ? colors.primary: 'transparent', border: `1px solid ${colors.primary}`, color: sellType === 'rent' ? 'white': colors.primary, flex: 1}}>For Rent</button> </div> <form onSubmit={handleSubmit} style={styles.formContainer}> <FormInput label="Item Name" name="name" required /> <FormInput label="Category" name="category" placeholder="e.g., Electronics, Books" required /> <FormInput label="Item Image" name="image" type="file" accept="image/*" /> {sellType === 'buy' ? ( <> <FormInput label="Price (₹)" name="price" type="number" placeholder="e.g., 999" step="1" required /> </> ) : ( <FormInput label="Rental Price per Day (₹)" name="rentalPricePerDay" type="number" placeholder="e.g., 150" step="1" required /> )} <FormInput label="Contact Details" name="contactDetails" placeholder="e.g., Phone number or social handle" /> <div style={styles.formInputContainer}> <label style={styles.formLabel}>Delivery Zones (Select at least 3)</label> <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}> {DELIVERY_ZONES.map(zone => ( <label key={zone} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}> <input type="checkbox" checked={selectedZones.includes(zone)} onChange={() => handleZoneChange(zone)} style={{width: '18px', height: '18px'}} /> {zone} </label> ))} </div> </div> <div style={styles.formInputContainer}> <label htmlFor="description" style={styles.formLabel}>Description</label> <textarea id="description" name="description" rows="4" style={styles.formInput} placeholder="Provide details..."></textarea> </div> {message.text && <div style={{padding: '12px', borderRadius: '8px', textAlign: 'center', color: message.type === 'success' ? colors.success : colors.error }}>{message.text}</div>} <SubmitButton isSubmitting={isSubmitting} text="Submit for Approval"/> </form> </div> ); }
function FormInput({ label, name, type = "text", ...props }) { const [isFocused, setIsFocused] = useState(false); const inputStyle = { ...styles.formInput, borderColor: isFocused ? colors.primary : colors.border, boxShadow: isFocused ? `0 0 0 3px ${colors.accent}40` : 'none' }; return ( <div style={styles.formInputContainer}> <label htmlFor={name} style={styles.formLabel}>{label}</label> <input id={name} name={name} type={type} style={inputStyle} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} {...props} /> </div> ); }
function BuyPage({ setPage, onProductSelect, products, loading }) { const [searchTerm, setSearchTerm] = useState(''); const [selectedCategory, setSelectedCategory] = useState('All'); const [sortOrder, setSortOrder] = useState('newest'); const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category).filter(Boolean))], [products]); const filteredAndSortedProducts = useMemo(() => products.filter(p => (selectedCategory === 'All' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => { switch (sortOrder) { case 'price-asc': return a.price - b.price; case 'price-desc': return b.price - a.price; default: return new Date(b.createdAt) - new Date(a.createdAt); } }), [products, searchTerm, selectedCategory, sortOrder]); const recommendedProducts = useMemo(() => [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3), [products]); if (loading) return <div style={{display: 'flex', justifyContent: 'center', paddingTop: '40px'}}><LoadingSpinner /></div>; return ( <div> <BackButton onClick={() => setPage('home')} /> <div style={{...styles.filtersContainer}}> <input type="text" placeholder="🔍 Search for a product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{...styles.formInput, gridColumn: '1 / -1'}} /> <div style={styles.formInputContainer}> <label style={styles.formLabel}>Category</label> <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.formInput}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select> </div> <div style={styles.formInputContainer}> <label style={styles.formLabel}>Sort by</label> <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={styles.formInput}><option value="newest">Newest First</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select> </div> </div> {recommendedProducts.length > 0 && searchTerm === '' && selectedCategory === 'All' && ( <div style={{marginBottom: '64px'}}> <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', color: colors.text}}>Recommendations</h2> <div style={styles.productGrid}>{recommendedProducts.map(p => <ProductCard key={p._id} product={p} onProductSelect={onProductSelect} />)}</div> </div> )} <div> <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', color: colors.text}}>All Products</h2> {filteredAndSortedProducts.length === 0 ? <div style={{textAlign: 'center', padding: '48px', backgroundColor: colors.surface, borderRadius: '12px'}}><p style={{color: colors.textSecondary, fontSize: '1.1rem'}}>No products found.</p></div> : <div style={styles.productGrid}>{filteredAndSortedProducts.map(p => <ProductCard key={p._id} product={p} onProductSelect={onProductSelect} />)}</div>} </div> </div> ); }
function ProductCard({ product, onProductSelect }) { const [isHovered, hoverProps] = useHover(); const imageUrl = product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : `https://placehold.co/600x400/E9ECEF/6C757D?text=${encodeURIComponent(product.name)}`; return ( <div onClick={() => onProductSelect(product)} style={{...styles.productCard, transform: isHovered ? 'translateY(-8px)' : 'none', boxShadow: isHovered ? `0 12px 28px rgba(0,0,0,0.1)` : '0 4px 12px rgba(0,0,0,0.05)'}} {...hoverProps}> <div style={{position: 'relative'}}> <img src={imageUrl} alt={product.name} style={styles.productCardImage} onError={(e) => { e.target.src = `https://placehold.co/600x400/E9ECEF/6C757D?text=${encodeURIComponent(product.name)}`; }} /> </div> <div style={{padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1}}> <div style={{flexGrow: 1}}> <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}> <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: colors.text}}>{product.name}</h3> <span style={{backgroundColor: colors.background, color: colors.primary, fontSize: '0.8rem', fontWeight: '600', padding: '6px 12px', borderRadius: '9999px', whiteSpace: 'nowrap'}}>{product.category}</span> </div> <p style={{color: colors.textSecondary, marginTop: '8px', marginBottom: '16px', height: '72px', overflow: 'hidden'}}>{product.description || 'No description.'}</p> </div> <div style={{marginTop: 'auto', borderTop: `1px solid ${colors.border}`, paddingTop: '16px'}}> {product.contactDetails && ( <p style={{fontWeight: '500', color: colors.primary, padding: '8px 0', textAlign: 'center', marginBottom: '16px', backgroundColor: colors.background, borderRadius: '8px'}}>Contact: {product.contactDetails}</p> )} <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}> <p style={{fontSize: '1.25rem', fontWeight: 'bold'}}>₹{parseFloat(product.price).toFixed(0)}</p> </div> </div> </div> </div> ); }
function CartPage({ cart, removeFromCart, updateCartItem, handleCheckout, setPage }) { const [isProcessing, setIsProcessing] = useState(false); const totalPrice = useMemo(() => cart.reduce((t, i) => t + (i.type === 'rental' ? (i.rentalPricePerDay * (i.rentalDays || 1)) : i.price), 0), [cart]); const onCheckout = async () => { setIsProcessing(true); await handleCheckout(); setIsProcessing(false); }; if (cart.length === 0) return ( <div style={{textAlign: 'center'}}> <BackButton onClick={() => setPage('buy')} text="Back to Shop" /> <div style={{backgroundColor: colors.surface, padding: '48px', borderRadius: '12px'}}> <h2 style={{fontSize: '1.875rem', fontWeight: 'bold', color: colors.text, marginBottom: '16px'}}>Your Cart is Empty</h2> <p style={{color: colors.textSecondary}}>Add items to see them here.</p> </div> </div> ); return ( <div style={{maxWidth: '1024px', margin: '0 auto'}}> <BackButton onClick={() => setPage('buy')} text="Back to Shop" /> <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', color: colors.text}}>Shopping Cart</h2> <div style={{backgroundColor: colors.surface, borderRadius: '12px', border: `1px solid ${colors.border}`}}> <div> {cart.map(item => ( <div key={item._id} style={{...styles.cartItem, borderBottom: `1px solid ${colors.border}`}}> <div style={{display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px'}}> <img src={item.imageUrl ? `${API_BASE_URL}${item.imageUrl}`: `https://placehold.co/100x100/E9ECEF/6C757D?text=Img`} alt={item.name} style={{width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover'}}/> <div> <h3 style={{fontWeight: '600', fontSize: '1.1rem'}}>{item.name}</h3> <p style={{color: colors.textSecondary, fontSize: '0.875rem'}}>{item.type === 'rental' ? 'Rental Item' : 'For Sale'}</p> </div> </div> <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}> {item.type === 'rental' && ( <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}> <label>Days:</label> <input type="number" value={item.rentalDays || 1} onChange={(e) => updateCartItem(item._id, { rentalDays: e.target.value })} min="1" style={{...styles.formInput, padding: '4px 8px', width: '70px'}} /> </div> )} <div style={styles.formInputContainer}> <label style={{...styles.formLabel, fontSize: '0.8rem'}}>Pickup Zone</label> <select value={item.selectedZone} onChange={(e) => updateCartItem(item._id, { selectedZone: e.target.value })} style={{...styles.formInput, padding: '4px 8px', width: '180px'}}> <option value="">Select a zone</option> {item.deliveryZones.map(zone => <option key={zone} value={zone}>{zone}</option>)} </select> </div> </div> <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}> <p style={{fontWeight: '600', fontSize: '1.1rem', width: '120px', textAlign: 'right'}}> ₹{item.type === 'rental' ? (item.rentalPricePerDay * (item.rentalDays || 1)).toFixed(0) : item.price.toFixed(0)} {item.type === 'rental' && <span style={{fontSize: '0.8rem', color: colors.textSecondary, display: 'block'}}>₹{item.rentalPricePerDay.toFixed(0)}/day</span>} </p> <button onClick={() => removeFromCart(item._id)} style={{color: colors.error, fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}>Remove</button> </div> </div> ))} </div> <div style={{padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px'}}> <div> <span style={{fontSize: '1.1rem', color: colors.textSecondary}}>Total:</span> <span style={{fontSize: '1.75rem', fontWeight: 'bold', marginLeft: '8px'}}>₹{totalPrice.toFixed(0)}</span> </div> <SubmitButton isSubmitting={isProcessing} text="Checkout Now" onClick={onCheckout} style={{minWidth: '150px'}} /> </div> </div> </div> ); }
function ProfilePage({ setPage, boughtProducts, sellerItems, sellerRentals, loading, onUpdate, userId }) { if (loading) return <div style={{display: 'flex', justifyContent: 'center', paddingTop: '40px'}}><LoadingSpinner /></div>; return ( <div style={{maxWidth: '1024px', margin: '0 auto'}}> <BackButton onClick={() => setPage('home')} text="Back to Marketplace" /> <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px', color: colors.text}}>Your Profile</h2> <div style={{marginBottom: '64px'}}> <h3 style={{fontSize: '1.75rem', fontWeight: '600', color: colors.text, marginBottom: '24px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '12px'}}>Your Listed Sale Items</h3> {sellerItems.length === 0 ? ( <div style={{backgroundColor: colors.surface, padding: '48px', borderRadius: '12px', textAlign: 'center'}}> <p style={{color: colors.textSecondary}}>You haven't listed any items for sale yet.</p> </div> ) : ( <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}> {sellerItems.map(item => <SellerItemCard key={item._id || item.createdAt} item={item} onUpdate={onUpdate} userId={userId} />)} </div> )} </div> <div style={{marginBottom: '64px'}}> <h3 style={{fontSize: '1.75rem', fontWeight: '600', color: colors.text, marginBottom: '24px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '12px'}}>Your Listed Rental Items</h3> {sellerRentals.length === 0 ? ( <div style={{backgroundColor: colors.surface, padding: '48px', borderRadius: '12px', textAlign: 'center'}}> <p style={{color: colors.textSecondary}}>You haven't listed any items for rent yet.</p> </div> ) : ( <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}> {sellerRentals.map(item => <SellerRentalCard key={item._id} item={item} onUpdate={onUpdate} userId={userId} />)} </div> )} </div> <div> <h3 style={{fontSize: '1.75rem', fontWeight: '600', color: colors.text, marginBottom: '24px', borderBottom: `2px solid ${colors.border}`, paddingBottom: '12px'}}>Your Purchase History</h3> {boughtProducts.length === 0 ? ( <div style={{backgroundColor: colors.surface, padding: '48px', borderRadius: '12px', textAlign: 'center'}}> <p style={{color: colors.textSecondary}}>You haven't bought any items yet.</p> </div> ) : ( <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}> {boughtProducts.map(p => <SoldProductCard key={p._id} product={p} />)} </div> )} </div> </div> ); }
function SellerItemCard({ item, onUpdate, userId }) { const [isUpdating, setIsUpdating] = useState(false); const imageUrl = item.imageUrl ? `${API_BASE_URL}${item.imageUrl}` : `https://placehold.co/150x150/E9ECEF/1A1A1A?text=Img`; const handleMakeAvailable = async () => { setIsUpdating(true); try { const res = await fetch(`${API_BASE_URL}/api/products/${item._id}/make-available`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }), }); if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to update item.'); } onUpdate(); } catch (error) { console.error(error); alert(`Failed to update item: ${error.message}`); } finally { setIsUpdating(false); } }; return ( <div style={styles.soldProductCard}> <img src={imageUrl} alt={item.name} style={{width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover'}} /> <div style={{flexGrow: 1, textAlign: 'left'}}> <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: colors.text}}>{item.name}</h3> <p style={{color: colors.textSecondary}}>{item.category}</p> <p style={{fontSize: '0.875rem', color: colors.textMuted, marginTop: '8px'}}>Listed on: {new Date(item.createdAt).toLocaleDateString()}</p> {item.status === 'Sold' && ( <p style={{fontSize: '0.8rem', fontFamily: 'monospace', color: colors.success, marginTop: '4px'}}> Buyer: {item.buyerName || item.buyerId.substring(0,10)}... Zone: {item.selectedZone} </p> )} </div> <div style={{textAlign: 'right'}}> <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>₹{parseFloat(item.price).toFixed(0)}</p> <span style={{ backgroundColor: item.isSold ? 'rgba(230, 57, 70, 0.1)' : (item.status === 'Pending Approval' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(42, 157, 143, 0.1)'), color: item.isSold ? colors.error : (item.status === 'Pending Approval' ? '#B45309' : colors.success), fontSize: '0.8rem', fontWeight: '600', padding: '6px 12px', borderRadius: '9999px' }}> {item.status} </span> {item.isSold && <SubmitButton isSubmitting={isUpdating} onClick={handleMakeAvailable} text="Make Available" style={{marginTop: '8px'}} />} </div> </div> ); }
function SellerRentalCard({ item, onUpdate, userId }) { const [isUpdating, setIsUpdating] = useState(false); const imageUrl = item.imageUrl ? `${API_BASE_URL}${item.imageUrl}` : `https://placehold.co/150x150/E9ECEF/1A1A1A?text=Img`; const handleMakeAvailable = async () => { setIsUpdating(true); try { const res = await fetch(`${API_BASE_URL}/api/rentals/${item._id}/make-available`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }), }); if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to update item.'); } onUpdate(); } catch (error) { console.error(error); alert(`Failed to update item: ${error.message}`); } finally { setIsUpdating(false); } }; return ( <div style={styles.soldProductCard}> <img src={imageUrl} alt={item.name} style={{width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover'}} /> <div style={{flexGrow: 1, textAlign: 'left'}}> <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: colors.text}}>{item.name}</h3> <p style={{color: colors.textSecondary}}>{item.category}</p> <p style={{fontSize: '0.875rem', color: colors.textMuted, marginTop: '8px'}}>Listed on: {new Date(item.createdAt).toLocaleDateString()}</p> </div> <div style={{textAlign: 'right'}}> <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>₹{parseFloat(item.rentalPricePerDay).toFixed(0)}/day</p> <span style={{ backgroundColor: item.isRented ? 'rgba(230, 57, 70, 0.1)' : (item.status === 'Pending Approval' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(42, 157, 143, 0.1)'), color: item.isRented ? colors.error : (item.status === 'Pending Approval' ? '#B45309' : colors.success), fontSize: '0.8rem', fontWeight: '600', padding: '6px 12px', borderRadius: '9999px' }}> {item.isRented ? 'Rented Out' : 'Available'} </span> {item.isRented && <SubmitButton isSubmitting={isUpdating} onClick={handleMakeAvailable} text="Make Available" style={{marginTop: '8px'}} />} </div> </div> ); }
function SoldProductCard({ product }) { const imageUrl = product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : `https://placehold.co/150x150/E9ECEF/1A1A1A?text=Img`; const soldDate = product.soldAt ? new Date(product.soldAt).toLocaleDateString() : 'N/A'; return ( <div style={styles.soldProductCard}> <img src={imageUrl} alt={product.name} style={{width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover'}} /> <div style={{flexGrow: 1, textAlign: 'left'}}> <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: colors.text}}>{product.name}</h3> <p style={{color: colors.textSecondary}}>{product.category}</p> <p style={{fontSize: '0.875rem', color: colors.textMuted, marginTop: '8px'}}>Purchased on: {soldDate}</p> </div> <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>₹{parseFloat(product.price).toFixed(0)}</p> </div> ); }
function RentPage({ setPage, onProductSelect, rentals, loading }) { const [searchTerm, setSearchTerm] = useState(''); const [selectedCategory, setSelectedCategory] = useState('All'); const [sortOrder, setSortOrder] = useState('newest'); const categories = useMemo(() => ['All', ...new Set(rentals.map(p => p.category).filter(Boolean))], [rentals]); const filteredAndSortedRentals = useMemo(() => rentals.filter(p => (selectedCategory === 'All' || p.category === selectedCategory) && p.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => { switch (sortOrder) { case 'price-asc': return a.rentalPricePerDay - b.rentalPricePerDay; case 'price-desc': return b.rentalPricePerDay - a.rentalPricePerDay; default: return new Date(b.createdAt) - new Date(a.createdAt); } }), [rentals, searchTerm, selectedCategory, sortOrder]); const topRated = useMemo(() => [...rentals].map(r => ({ ...r, avg: r.reviews.length ? r.reviews.reduce((a, c) => a + c.rating, 0) / r.reviews.length : 0 })).filter(r => r.reviews.length > 0).sort((a, b) => b.avg - a.avg).slice(0, 3), [rentals]); if (loading) return <div style={{display: 'flex', justifyContent: 'center', paddingTop: '40px'}}><LoadingSpinner /></div>; return ( <div> <BackButton onClick={() => setPage('home')} /> <div style={{...styles.filtersContainer, border: `1px solid ${colors.border}`}}> <input type="text" placeholder="🔍 Search for a rental..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{...styles.formInput, gridColumn: '1 / -1'}} /> <div style={styles.formInputContainer}> <label style={styles.formLabel}>Category</label> <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.formInput}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select> </div> <div style={styles.formInputContainer}> <label style={styles.formLabel}>Sort by</label> <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={styles.formInput}><option value="newest">Newest First</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select> </div> </div> {topRated.length > 0 && searchTerm === '' && selectedCategory === 'All' && ( <div style={{marginBottom: '64px'}}> <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', color: colors.text}}>Top Rated Items</h2> <div style={styles.productGrid}>{topRated.map(r => <RentalCard key={r._id} rental={r} onProductSelect={onProductSelect} />)}</div> </div> )} <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', color: colors.text}}>All Items for Rent</h2> {filteredAndSortedRentals.length === 0 ? <div style={{textAlign: 'center', padding: '48px', backgroundColor: colors.surface, borderRadius: '12px'}}><p style={{color: colors.textSecondary, fontSize: '1.1rem'}}>No items available for rent.</p></div> : <div style={styles.productGrid}>{filteredAndSortedRentals.map(r => <RentalCard key={r._id} rental={r} onProductSelect={onProductSelect} />)}</div>} </div> ); }
function RentalCard({ rental, onProductSelect }) { const [isHovered, hoverProps] = useHover(); const imageUrl = rental.imageUrl ? `${API_BASE_URL}${rental.imageUrl}` : `https://placehold.co/600x400/E9ECEF/1A1A1A?text=${encodeURIComponent(rental.name)}`; const avgRating = useMemo(() => rental.reviews.length ? (rental.reviews.reduce((a, r) => a + r.rating, 0) / rental.reviews.length).toFixed(1) : 0, [rental.reviews]); return ( <div onClick={() => onProductSelect(rental)} style={{ ...styles.productCard, transform: isHovered ? 'translateY(-8px)' : 'none', boxShadow: isHovered ? `0 12px 28px rgba(0,0,0,0.1)` : '0 4px 12px rgba(0,0,0,0.05)' }} {...hoverProps}> <div style={{position: 'relative'}}> <img src={imageUrl} alt={rental.name} style={styles.productCardImage} /> </div> <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}> <div> <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}> <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: colors.text }}>{rental.name}</h3> <span style={{ backgroundColor: colors.background, color: colors.primary, fontSize: '0.8rem', fontWeight: '600', padding: '6px 12px', borderRadius: '9999px' }}>{rental.category}</span> </div> <p style={{ color: colors.textSecondary, marginTop: '8px', marginBottom: '16px', height: '48px', overflow: 'hidden' }}>{rental.description || 'No description.'}</p> <div style={{backgroundColor: colors.background, padding: '12px', borderRadius: '8px', margin: '16px 0'}}> <h4 style={{color: colors.primary, fontWeight: '600', marginBottom: '8px'}}>AI Review Summary</h4> <p style={{color: colors.textSecondary, fontSize: '0.875rem', fontStyle: 'italic'}}>{rental.reviewSummary}</p> </div> </div> <div style={{marginTop: 'auto', borderTop: `1px solid ${colors.border}`, paddingTop: '16px'}}> {rental.contactDetails && ( <p style={{fontWeight: '500', color: colors.primary, padding: '8px 0', textAlign: 'center', marginBottom: '16px', backgroundColor: colors.background, borderRadius: '8px'}}>Contact: {rental.contactDetails}</p> )} <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{parseFloat(rental.rentalPricePerDay).toFixed(0)} / day</p> <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.textSecondary }}> <span style={{color: colors.star}}>★</span> <span>{avgRating} ({rental.reviews.length})</span> </div> </div> </div> </div> </div> ); }
function ProductDetailPage({ selectedItem, onBack, addToCart, onWriteReview, onViewReviews, onProductSelect }) {
    const { product, type } = selectedItem;
    const isRental = type === 'rental';
    const imageUrl = product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : `https://placehold.co/600x400/E9ECEF/1A1A1A?text=${encodeURIComponent(product.name)}`;
    const avgRating = useMemo(() => isRental && product.reviews && product.reviews.length ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1) : 0, [product, isRental]);
    
    const [similarItems, setSimilarItems] = useState([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

    useEffect(() => {
        const fetchSimilar = async () => {
            if (!product._id) return;
            setLoadingSimilar(true);
            try {
                const endpoint = isRental ? `/api/rentals/${product._id}/similar` : `/api/products/${product._id}/similar`;
                const res = await fetch(`${API_BASE_URL}${endpoint}`);
                const data = await res.json();
                setSimilarItems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching similar items:", error);
                setSimilarItems([]);
            } finally {
                setLoadingSimilar(false);
            }
        };
        fetchSimilar();
    }, [product._id, isRental]);

    return ( 
        <div> 
            <BackButton onClick={onBack} text="Back to Listings" /> 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', backgroundColor: colors.surface, padding: '40px', borderRadius: '16px', border: `1px solid ${colors.border}` }}> 
                <div style={{ flex: 1, textAlign: 'center' }}> 
                    <img src={imageUrl} alt={product.name} style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', objectFit: 'cover', margin: '0 auto' }} /> 
                </div> 
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}> 
                    <span style={{ backgroundColor: colors.background, color: colors.primary, fontSize: '0.9rem', fontWeight: '600', padding: '6px 12px', borderRadius: '9999px', alignSelf: 'flex-start', marginBottom: '16px' }}>{product.category}</span> 
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: colors.text }}>{product.name}</h2> 
                    <p style={{ color: colors.textSecondary, marginBottom: '16px', lineHeight: '1.6' }}>{product.description || 'No detailed description available.'}</p> 
                    <div style={{backgroundColor: colors.background, padding: '12px', borderRadius: '8px', margin: '16px 0'}}> 
                        <h4 style={{color: colors.primary, fontWeight: '600', marginBottom: '8px'}}>Available Delivery Zones</h4> 
                        <p style={{color: colors.textSecondary, fontSize: '0.9rem'}}>{product.deliveryZones.join(', ')}</p> 
                    </div> 
                    {isRental && ( <> 
                        <div style={{backgroundColor: colors.background, padding: '16px', borderRadius: '8px', margin: '16px 0'}}> 
                            <h4 style={{color: colors.primary, fontWeight: '600', marginBottom: '8px'}}>AI Review Summary</h4> 
                            <p style={{color: colors.textSecondary, fontSize: '0.875rem', fontStyle: 'italic'}}>{product.reviewSummary}</p> 
                        </div> 
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0' }}> 
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: colors.textSecondary }} onClick={() => onViewReviews(selectedItem)} > 
                                <span style={{color: colors.star}}>★</span> <span>{avgRating} ({product.reviews.length} Reviews)</span> 
                            </div> 
                            <button onClick={() => onWriteReview(selectedItem)} style={{...styles.button, padding: '8px 12px', fontSize: '0.9rem', backgroundColor: 'transparent', color: colors.primary, border: `1px solid ${colors.primary}`}}>Write a Review</button> 
                        </div> 
                    </> )} 
                    <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '24px', marginTop: 'auto' }}> 
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}> 
                            <p style={{ fontSize: '2.25rem', fontWeight: 'bold' }}> ₹{parseFloat(isRental ? product.rentalPricePerDay : product.price).toFixed(0)} {isRental && <span style={{fontSize: '1rem', fontWeight: '500', color: colors.textSecondary}}>/day</span>} </p> 
                        </div> 
                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}> 
                            <button onClick={() => { addToCart(product, type); alert(`${product.name} added to cart!`); }} style={{...styles.button, width: '100%'}}>Add to Cart</button> 
                            {product.contactDetails && ( <div style={{...styles.button, width: '100%', backgroundColor: colors.surface, color: colors.primary, border: `1px solid ${colors.border}`, cursor: 'default' }}> Contact: {product.contactDetails} </div> )} 
                        </div> 
                    </div> 
                </div> 
            </div>
            <div style={{marginTop: '64px'}}>
                <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', color: colors.text}}>You Might Also Like</h2>
                {loadingSimilar ? <LoadingSpinner /> : (
                    similarItems.length > 0 ? (
                        <div style={styles.productGrid}>
                            {similarItems.map(item => isRental 
                                ? <RentalCard key={item._id} rental={item} onProductSelect={() => onProductSelect(item, 'rental')} />
                                : <ProductCard key={item._id} product={item} onProductSelect={() => onProductSelect(item, 'sale')} />
                            )}
                        </div>
                    ) : <p style={{color: colors.textSecondary}}>No similar items found.</p>
                )}
            </div>
        </div> 
    ); 
}
function ReviewModal({ rental, userId, onClose, onReviewSubmit }) { const [rating, setRating] = useState(5); const [comment, setComment] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false); const [message, setMessage] = useState(''); const handleSubmit = async (e) => { e.preventDefault(); if (!comment) { setMessage('Please write a comment.'); return; } setIsSubmitting(true); setMessage(''); try { const res = await fetch(`${API_BASE_URL}/api/rentals/${rental._id}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, rating, comment }), }); if (!res.ok) throw new Error('Failed to submit review.'); onReviewSubmit(); } catch (e) { console.error(e); setMessage('Error submitting review.'); } finally { setIsSubmitting(false); } }; return ( <div style={styles.modalBackdrop} onClick={onClose}> <div style={{...styles.modalContent}} onClick={e => e.stopPropagation()}> <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.text, marginBottom: '24px' }}>Write a Review for {rental.name}</h2> <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}> <div> <label style={styles.formLabel}>Rating</label> <StarRating rating={rating} setRating={setRating} /> </div> <div> <label style={styles.formLabel}>Comment</label> <textarea value={comment} onChange={e => setComment(e.target.value)} rows="5" style={styles.formInput} required></textarea> </div> {message && <p style={{color: colors.error}}>{message}</p>} <div style={{display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px'}}> <button type="button" onClick={onClose} style={{...styles.button, backgroundColor: colors.surface, color: colors.text, border: `1px solid ${colors.border}`}}>Cancel</button> <SubmitButton isSubmitting={isSubmitting} text="Submit Review" /> </div> </form> </div> </div> ); }
function AllReviewsModal({ reviews, onClose }) { return ( <div style={styles.modalBackdrop} onClick={onClose}> <div style={{...styles.modalContent, maxHeight: '80vh', overflowY: 'auto'}} onClick={e => e.stopPropagation()}> <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.text, marginBottom: '24px' }}>All Reviews</h2> {reviews.length === 0 ? ( <p style={{color: colors.textSecondary}}>There are no reviews for this item yet.</p> ) : ( <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}> {reviews.map((r, i) => ( <div key={i} style={{backgroundColor: colors.background, padding: '16px', borderRadius: '8px'}}> <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}> <p style={{fontSize: '0.8rem', fontFamily: 'monospace', color: colors.textMuted}}>User: {r.userId.substring(0, 8)}...</p> <div>{[...Array(5)].map((s, i) => <span key={i} style={{color: i < r.rating ? colors.star : colors.textMuted}}>★</span>)}</div> </div> <p>{r.comment}</p> </div> ))} </div>)} <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '24px'}}> <button onClick={onClose} style={{...styles.button}}>Close</button> </div> </div> </div> ); }
function StarRating({ rating, setRating }) { const [hover, setHover] = useState(0); return ( <div> {[...Array(5)].map((s, i) => { const val = i + 1; return ( <button type="button" key={i} style={{background: 'none', border: 'none', cursor: 'pointer', color: val <= (hover || rating) ? colors.star : colors.textMuted, fontSize: '2.5rem', padding: '0 4px', transition: 'color 0.2s'}} onClick={() => setRating(val)} onMouseEnter={() => setHover(val)} onMouseLeave={() => setHover(0)}>★</button> ); })} </div> ); }
function Footer() { return ( <footer style={styles.footer}> <div style={{textAlign: 'center', color: colors.textMuted, fontSize: '0.875rem'}}> <p>&copy; {new Date().getFullYear()} Rajagiri Marketspace. All rights reserved.</p> </div> </footer> ); }
function LoadingSpinner({ small }) { const s = { animation: 'spin 1s linear infinite', borderRadius: '50%', borderTop: `3px solid ${colors.primary}`, borderRight: `3px solid ${colors.primary}`, borderBottom: `3px solid ${colors.primary}`, borderLeft: '3px solid transparent', width: small ? '24px' : '48px', height: small ? '24px' : '48px' }; return <div style={s}></div>; }
function BackButton({ onClick, text = "Back" }) { const [h, p] = useHover(); const s = { ...styles.button, ...styles.backButton, backgroundColor: h ? colors.background : 'transparent' }; return ( <button onClick={onClick} style={s} {...p}>&larr; {text}</button> ); }
function SubmitButton({ isSubmitting, text, ...props }) { const [h, p] = useHover(); const s = { ...styles.button, ...(isSubmitting ? styles.buttonDisabled : {}), transform: h && !isSubmitting ? 'translateY(-2px)' : 'none', boxShadow: h && !isSubmitting ? `0 4px 12px rgba(94, 84, 142, 0.3)`: 'none' }; return ( <button type="submit" disabled={isSubmitting} style={s} {...p} {...props}> {isSubmitting ? <LoadingSpinner small /> : text} </button> ); }
function AdminPage({ setPage, isAdmin, onUpdate }) { const [pendingItems, setPendingItems] = useState({ products: [], rentals: [] }); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const fetchPendingItems = useCallback(async () => { setLoading(true); setError(''); try { const { data: { session } } = await supabase.auth.getSession(); if (!session) throw new Error("Not authenticated"); const response = await fetch(`${API_BASE_URL}/api/admin/pending`, { headers: { 'Authorization': `Bearer ${session.access_token}` } }); if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || 'Failed to fetch pending items.'); } const data = await response.json(); setPendingItems(data); } catch (err) { setError(err.message); } finally { setLoading(false); } }, []); useEffect(() => { if(isAdmin) fetchPendingItems(); }, [isAdmin, fetchPendingItems]); const handleAction = async (type, id, action) => { try { const { data: { session } } = await supabase.auth.getSession(); const endpoint = `/api/admin/${action}/${type}/${id}`; const method = action === 'approve' ? 'PATCH' : 'DELETE'; const response = await fetch(`${API_BASE_URL}${endpoint}`, { method, headers: { 'Authorization': `Bearer ${session.access_token}` } }); if (!response.ok) { const errData = await response.json(); throw new Error(errData.message || `Failed to ${action} item.`); } onUpdate(); fetchPendingItems(); } catch (err) { alert(`Error: ${err.message}`); } }; if (!isAdmin) return <p>You do not have access to this page.</p>; if (loading) return <LoadingSpinner />; return ( <div> <BackButton onClick={() => setPage('home')} /> <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px', color: colors.text}}>Admin Approval Queue</h2> {error && <p style={{color: colors.error}}>{error}</p>} <div style={{marginBottom: '64px'}}> <h3 style={{fontSize: '1.75rem', fontWeight: '600', color: colors.text, marginBottom: '24px'}}>Pending Sale Items ({pendingItems.products.length})</h3> {pendingItems.products.length > 0 ? ( <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}> {pendingItems.products.map(item => ( <PendingItemCard key={item._id} item={item} type="product" onAction={handleAction} /> ))} </div> ) : <p style={{color: colors.textSecondary}}>No items are pending approval.</p>} </div> <div> <h3 style={{fontSize: '1.75rem', fontWeight: '600', color: colors.text, marginBottom: '24px'}}>Pending Rental Items ({pendingItems.rentals.length})</h3> {pendingItems.rentals.length > 0 ? ( <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}> {pendingItems.rentals.map(item => ( <PendingItemCard key={item._id} item={item} type="rental" onAction={handleAction} /> ))} </div> ) : <p style={{color: colors.textSecondary}}>No items are pending approval.</p>} </div> </div> ); }
function PendingItemCard({ item, type, onAction }) { const imageUrl = item.imageUrl ? `${API_BASE_URL}${item.imageUrl}` : `https://placehold.co/150x150/E9ECEF/1A1A1A?text=Img`; return ( <div style={styles.soldProductCard}> <img src={imageUrl} alt={item.name} style={{width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover'}} /> <div style={{flexGrow: 1, textAlign: 'left'}}> <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: colors.text}}>{item.name}</h3> <p style={{color: colors.textSecondary}}>{item.category}</p> <p style={{fontSize: '0.8rem', color: colors.textMuted, marginTop: '8px'}}>Seller/Owner ID: {item.sellerId || item.ownerId}</p> </div> <div style={{display: 'flex', gap: '12px'}}> <button onClick={() => onAction(type, item._id, 'approve')} style={{...styles.button, backgroundColor: colors.success}}>Approve</button> <button onClick={() => onAction(type, item._id, 'reject')} style={{...styles.button, backgroundColor: colors.error}}>Reject</button> </div> </div> ); }
const ss = document.createElement('style'); ss.type = 'text/css'; ss.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`; document.head.appendChild(ss);