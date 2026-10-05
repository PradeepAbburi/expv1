import { useEffect, useMemo, useRef, useState, type ComponentType, type FormEvent, type ReactNode } from 'react';
import {
  AirVent, ArrowLeft, ArrowRight, ArrowUpRight, Baby, Bell, Bike, BriefcaseBusiness, Brush, CalendarDays, Camera, Car, Check, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign, Clapperboard, Clock, Dumbbell, ExternalLink, Eye, EyeOff, GraduationCap, Grid2X2, Heart, Home, LayoutDashboard, MapPin, MessageCircle, Monitor, MoreHorizontal, Music2, Navigation, PawPrint, Phone, Plane, Plus, Search, Scissors, Send, Settings, Share2, ShieldCheck, ShoppingBag, Sparkles, Star, Stethoscope, Trash2, Utensils, Users, Wrench, X, Zap, type LucideProps,
} from 'lucide-react';
import {
  auth,
  onAuthStateChanged,
  signOut,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  fetchServices,
  fetchBookings,
  addService,
  addBooking,
  type User,
  type ServiceRecord,
  type BookingRecord,
  type CustomField,
} from './lib/firebase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Force light theme always
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.style.colorScheme = 'light';

type Page = 'Overview' | 'Services' | 'Bookings' | 'BookingFlow' | 'Messages' | 'My Cards' | 'Professional' | 'Profile' | 'AllCategories';
type Icon = ComponentType<LucideProps>;
type Professional = {
  name: string;
  role: string;
  location: string;
  rating: string;
  reviews: number;
  price: string;
  image: string;
  avatar?: string;
  tags: string[];
  verified?: boolean;
  bio?: string;
  lat?: number;
  lng?: number;
};
type Category = { label: string; icon: Icon; tone: string };

export interface CountryOption {
  code: string;
  name: string;
  dial: string;
  center: [number, number];
  zoom: number;
  regions: { name: string; coords: [number, number] }[];
}

export const COUNTRIES: CountryOption[] = [
  {
    code: 'IN',
    name: 'India',
    dial: '+91',
    center: [20.5937, 78.9629],
    zoom: 5,
    regions: [
      { name: 'Visakhapatnam, Andhra Pradesh', coords: [17.6868, 83.2185] },
      { name: 'Hyderabad, Telangana', coords: [17.3850, 78.4867] },
      { name: 'Bengaluru, Karnataka', coords: [12.9716, 77.5946] },
      { name: 'Chennai, Tamil Nadu', coords: [13.0827, 80.2707] },
      { name: 'Mumbai, Maharashtra', coords: [19.0760, 72.8777] },
      { name: 'Delhi NCR', coords: [28.6139, 77.2090] },
      { name: 'Kolkata, West Bengal', coords: [22.5726, 88.3639] },
      { name: 'Pune, Maharashtra', coords: [18.5204, 73.8567] },
      { name: 'Ahmedabad, Gujarat', coords: [23.0225, 72.5714] },
      { name: 'Jaipur, Rajasthan', coords: [26.9124, 75.7873] },
      { name: 'Kochi, Kerala', coords: [9.9312, 76.2673] },
      { name: 'Vijayawada, Andhra Pradesh', coords: [16.5062, 80.6480] },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    dial: '+1',
    center: [37.0902, -95.7129],
    zoom: 4,
    regions: [
      { name: 'New York, NY', coords: [40.7128, -74.0060] },
      { name: 'Los Angeles, CA', coords: [34.0522, -118.2437] },
      { name: 'Chicago, IL', coords: [41.8781, -87.6298] },
      { name: 'Houston, TX', coords: [29.7604, -95.3698] },
      { name: 'San Francisco, CA', coords: [37.7749, -122.4194] },
      { name: 'Seattle, WA', coords: [47.6062, -122.3321] },
      { name: 'Miami, FL', coords: [25.7617, -80.1918] },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dial: '+44',
    center: [55.3781, -3.4360],
    zoom: 6,
    regions: [
      { name: 'London, England', coords: [51.5074, -0.1278] },
      { name: 'Manchester, England', coords: [53.4808, -2.2426] },
      { name: 'Birmingham, England', coords: [52.4862, -1.8904] },
      { name: 'Edinburgh, Scotland', coords: [55.9533, -3.1883] },
      { name: 'Glasgow, Scotland', coords: [55.8642, -4.2518] },
    ],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dial: '+971',
    center: [23.4241, 53.8478],
    zoom: 7,
    regions: [
      { name: 'Dubai', coords: [25.2048, 55.2708] },
      { name: 'Abu Dhabi', coords: [24.4539, 54.3773] },
      { name: 'Sharjah', coords: [25.3463, 55.4209] },
      { name: 'Ajman', coords: [25.4052, 55.5136] },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    dial: '+1',
    center: [56.1304, -106.3468],
    zoom: 4,
    regions: [
      { name: 'Toronto, ON', coords: [43.6532, -79.3832] },
      { name: 'Vancouver, BC', coords: [49.2827, -123.1207] },
      { name: 'Montreal, QC', coords: [45.5017, -73.5673] },
      { name: 'Calgary, AB', coords: [51.0447, -114.0719] },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    dial: '+61',
    center: [-25.2744, 133.7751],
    zoom: 4,
    regions: [
      { name: 'Sydney, NSW', coords: [-33.8688, 151.2093] },
      { name: 'Melbourne, VIC', coords: [-37.8136, 144.9631] },
      { name: 'Brisbane, QLD', coords: [-27.4698, 153.0251] },
      { name: 'Perth, WA', coords: [-31.9505, 115.8605] },
    ],
  },
  {
    code: 'SG',
    name: 'Singapore',
    dial: '+65',
    center: [1.3521, 103.8198],
    zoom: 11,
    regions: [
      { name: 'Central Area, Singapore', coords: [1.2897, 103.8501] },
      { name: 'Jurong, Singapore', coords: [1.3329, 103.7436] },
      { name: 'Tampines, Singapore', coords: [1.3533, 103.9452] },
      { name: 'Woodlands, Singapore', coords: [1.4382, 103.7891] },
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    dial: '+49',
    center: [51.1657, 10.4515],
    zoom: 6,
    regions: [
      { name: 'Berlin', coords: [52.5200, 13.4050] },
      { name: 'Munich', coords: [48.1351, 11.5820] },
      { name: 'Frankfurt', coords: [50.1109, 8.6821] },
      { name: 'Hamburg', coords: [53.5511, 9.9937] },
    ],
  },
];

const photos = {
  wedding: 'https://images.pexels.com/photos/33072063/pexels-photo-33072063.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  camera: 'https://images.pexels.com/photos/33072059/pexels-photo-33072059.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  studio: 'https://images.pexels.com/photos/36697251/pexels-photo-36697251.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  worker: 'https://images.pexels.com/photos/16552843/pexels-photo-16552843.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  mechanic: 'https://images.pexels.com/photos/9112798/pexels-photo-9112798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

const professionals: Professional[] = [
  { name: 'Raj Photography', role: 'Wedding Photographer', location: 'Visakhapatnam', rating: '4.8', reviews: 126, price: '₹15,000+', image: photos.camera, avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300', tags: ['Wedding', 'Events', 'Portrait'], verified: true, bio: 'Capturing your special moments with creativity and care. Raj Photography brings a thoughtful eye, warm direction, and polished edits to weddings, events, portraits, and commercial work.', lat: 17.6868, lng: 83.2185 },
  { name: 'Moment Studio', role: 'Candid Photography', location: 'Visakhapatnam', rating: '4.7', reviews: 98, price: '₹8,000+', image: photos.wedding, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300', tags: ['Pre-Wedding', 'Events'], bio: 'Moment Studio specializes in candid photography that tells your story naturally. We blend in and capture genuine emotions as they unfold.', lat: 17.7230, lng: 83.3020 },
  { name: 'ShotHQ', role: 'Product Photographer', location: 'Visakhapatnam', rating: '4.6', reviews: 74, price: '₹5,000+', image: photos.studio, avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300', tags: ['Events', 'Product'], verified: true, bio: 'ShotHQ delivers clean, professional product photography that makes your products shine on any platform.', lat: 17.7000, lng: 83.2500 },
  { name: 'LensPro', role: 'Portrait Specialist', location: 'Visakhapatnam', rating: '4.9', reviews: 52, price: '₹6,000+', image: photos.camera, avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300', tags: ['Portrait', 'Commercial'], bio: 'LensPro creates stunning portraits that reveal personality and character in every frame.', lat: 17.6800, lng: 83.2800 },
];

const categories: Category[] = [
  ['Home Services', Home, 'blue'], ['Beauty & Wellness', Sparkles, 'pink'], ['Photography', Camera, 'yellow'], ['Education', GraduationCap, 'green'], ['Fitness', Dumbbell, 'orange'], ['Repairs', Wrench, 'sky'], ['Cleaning', Brush, 'mint'], ['Automotive', Car, 'lavender'], ['Plumbing', Wrench, 'blue'], ['Electrical', Zap, 'yellow'], ['Painting', Brush, 'pink'], ['Catering', Utensils, 'orange'], ['Music & DJ', Music2, 'lavender'], ['Event Planning', CalendarDays, 'green'], ['Graphic Design', Clapperboard, 'sky'], ['Web Development', BriefcaseBusiness, 'blue'], ['Tutoring', GraduationCap, 'yellow'], ['Yoga', Dumbbell, 'mint'], ['Personal Trainer', Users, 'pink'], ['Dance Classes', Sparkles, 'orange'], ['Pet Care', PawPrint, 'lavender'], ['Child Care', Baby, 'green'], ['Elder Care', Stethoscope, 'blue'], ['Health & Wellness', Heart, 'pink'], ['Salon at Home', Scissors, 'yellow'], ['Makeup Artist', Sparkles, 'orange'], ['Tailoring', Scissors, 'mint'], ['Laundry', Brush, 'sky'], ['Pest Control', ShieldCheck, 'green'], ['AC Repair', AirVent, 'blue'], ['Car Wash', Car, 'yellow'], ['Bike Service', Bike, 'pink'], ['Packers & Movers', Plane, 'lavender'], ['Interior Design', Home, 'orange'], ['Legal Services', BriefcaseBusiness, 'sky'], ['Accounting', CircleDollarSign, 'green'], ['Real Estate', Home, 'blue'], ['Travel Planner', Plane, 'yellow'], ['Food & Baking', Utensils, 'pink'], ['Handmade & Crafts', Scissors, 'orange'], ['Photography Studio', Camera, 'mint'], ['Fashion Styling', ShoppingBag, 'lavender'], ['Mobile Repair', Phone, 'sky'], ['Home Décor', Home, 'green'], ['Marketing', Send, 'blue']
].map(([label, icon, tone]) => ({ label: label as string, icon: icon as Icon, tone: tone as string }));

const categoryEmoji: Record<string, string> = {
  'Home Services': '🏠', 'Beauty & Wellness': '💆', 'Photography': '📷', 'Education': '📚',
  'Fitness': '🏋️', 'Repairs': '🔧', 'Cleaning': '🧹', 'Automotive': '🚗',
  'Plumbing': '🔩', 'Electrical': '⚡', 'Painting': '🎨', 'Catering': '🍽️',
  'Music & DJ': '🎵', 'Event Planning': '🎉', 'Graphic Design': '🖥️', 'Web Development': '💻',
  'Tutoring': '📝', 'Yoga': '🧘', 'Personal Trainer': '💪', 'Dance Classes': '💃',
  'Pet Care': '🐾', 'Child Care': '👶', 'Elder Care': '🤝', 'Health & Wellness': '❤️',
  'Salon at Home': '✂️', 'Makeup Artist': '💄', 'Tailoring': '🪡', 'Laundry': '🧺',
  'Pest Control': '🐛', 'AC Repair': '❄️', 'Car Wash': '🚿', 'Bike Service': '🏍️',
  'Packers & Movers': '📦', 'Interior Design': '🛋️', 'Legal Services': '⚖️', 'Accounting': '💰',
  'Real Estate': '🏢', 'Travel Planner': '✈️', 'Food & Baking': '🍰', 'Handmade & Crafts': '🧶',
  'Photography Studio': '🎬', 'Fashion Styling': '👗', 'Mobile Repair': '📱', 'Home Décor': '🪴',
  'Marketing': '📣',
};

// Sprite sheet: 1536×1024, 8 cols × 6 rows. Each cell = 192 × 170.67px.
const SPRITE_COLS = 8;
const SPRITE_ROWS = 6;
const categoryIndex: Record<string, number> = {};
categories.forEach((c, i) => { categoryIndex[c.label] = i; });

// CSS percentage sprite — background-size: 800% 600% makes each cell
// exactly fill the container, at any card width/height. No pixel guessing.
function getCategoryBg(label: string): React.CSSProperties {
  const idx = categoryIndex[label] ?? 0;
  const col = idx % SPRITE_COLS;
  const row = Math.floor(idx / SPRITE_COLS);
  // Percentage formula: (col / (N-1)) * 100% aligns the correct cell to the container edge
  const xPct = col === 0 ? 0 : (col / (SPRITE_COLS - 1)) * 100;
  const yPct = row === 0 ? 0 : (row / (SPRITE_ROWS - 1)) * 100;
  return {
    backgroundImage:    'url(/category-grid.png)',
    backgroundSize:     `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
    backgroundPosition: `${xPct}% ${yPct}%`,
    backgroundRepeat:   'no-repeat',
  };
}



const navItems: { label: Page; icon: Icon }[] = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Services', icon: Grid2X2 }, { label: 'Bookings', icon: CalendarDays }, { label: 'Messages', icon: MessageCircle }, { label: 'My Cards', icon: BriefcaseBusiness },
];

const mobileNavItems: { label: Page; icon: Icon }[] = [
  { label: 'Services', icon: Grid2X2 }, { label: 'Bookings', icon: CalendarDays }, { label: 'Messages', icon: MessageCircle }, { label: 'My Cards', icon: BriefcaseBusiness }, { label: 'Overview', icon: LayoutDashboard },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState<Page>('Services');
  const [role, setRole] = useState<'user' | 'professional'>('user');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedService, setSelectedService] = useState('Photography');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [location, setLocation] = useState('Visakhapatnam');
  const [showLocation, setShowLocation] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [toast, setToast] = useState('');
  const [chat, setChat] = useState('Raj Photography');
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const dataLoadedRef = useRef(false);

  // ── Firebase auth listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Load Firestore data after login ─────────────────────────────────────────
  useEffect(() => {
    if (!user || dataLoadedRef.current) return;
    dataLoadedRef.current = true;
    let mounted = true;
    const load = async () => {
      try {
        const [svc, bkn] = await Promise.all([fetchServices(), fetchBookings()]);
        if (!mounted) return;
        setServices(svc);
        setBookings(bkn);
      } catch { /* Firestore rules may block unauthenticated; silently skip */ }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  const filteredCategories = useMemo(() => categories.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())), [query]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2400); };
  const openProfessional = (p: Professional) => { setSelectedProfessional(p); setPage('Professional'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openService = (s: string) => { setSelectedService(s); setPage('Services'); setQuery(''); };

  const createService = async (details: Omit<ServiceRecord, 'id'>) => {
    if (role !== 'professional') { notify('Only professional accounts can publish services.'); return; }
    try {
      const saved = await addService(details);
      setServices((cur) => [saved, ...cur]);
      setShowAddService(false);
      notify('Service published successfully');
    } catch { notify('Could not save this service. Please try again.'); }
  };

  const createBooking = async (date: string, timeSlot?: string, customResponses?: Record<string, string>) => {
    if (!selectedProfessional) return;
    const amount = Number(selectedProfessional.price.replace(/[^0-9]/g, '')) || 0;
    try {
      const saved = await addBooking({
        service_title: selectedProfessional.role,
        professional_name: selectedProfessional.name,
        service_date: date,
        time_slot: timeSlot || '10:00 AM',
        custom_responses: customResponses,
        amount,
        status: 'pending',
      });
      setBookings((cur) => [...cur, saved].sort((a, b) => a.service_date.localeCompare(b.service_date)));
      setPage('Bookings');
      notify('Booking confirmed successfully');
    } catch { notify('Could not create this booking. Please try again.'); }
  };

  const handleSignOut = async () => {
    await signOut();
    dataLoadedRef.current = false;
    setPage('Services');
    notify('You have been signed out');
  };

  const switchRole = () => {
    const next = role === 'professional' ? 'user' : 'professional';
    setRole(next);
    setPage(next === 'professional' ? 'Overview' : 'Services');
    setShowAccountMenu(false);
    notify(next === 'professional' ? 'Professional workspace opened' : 'Customer workspace opened');
  };

  const visibleNavItems = role === 'professional' ? navItems : navItems.filter(({ label }) => label !== 'Overview');
  const userInitials = (user?.displayName ?? user?.email ?? 'RP').slice(0, 2).toUpperCase();
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Raj Photography';

  if (authLoading) return <div className="auth-loading"><span className="brand-mark"><Zap size={18} fill="currentColor" /></span><strong>Loading Expertène</strong></div>;
  if (!user) return <AuthFlow />;

  const isMobilePage = page === 'Professional' || page === 'BookingFlow' || page === 'AllCategories';
  const hideTopbar = page === 'Messages' || page === 'Bookings' || page === 'My Cards';
  const fullscreenPage = page === 'Messages';

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Zap size={18} fill="currentColor" /></span> Expertène</div>
      <p className="nav-label" style={{marginTop:'28px'}}>Workspace</p>
      <nav className="main-nav">{visibleNavItems.map(({ label, icon: Icon }) => <button className={`nav-item ${page === label || (label === 'Services' && page === 'Professional') ? 'active' : ''}`} onClick={() => setPage(label)} key={label}><Icon size={18} /><span>{label}</span>{label === 'Messages' && <b className="nav-count">3</b>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="upgrade-card"><Sparkles size={20} /><strong>Go pro, get noticed</strong><p>Stand out and reach more customers.</p><button onClick={() => notify('Pro upgrade preview opened')}>Explore Pro <ArrowUpRight size={14} /></button></div><div className="account-menu-wrap"><button className="sidebar-user" onClick={() => setShowAccountMenu((v) => !v)}><span className="avatar">{userInitials}</span><span><strong>{displayName}</strong><small>{role === 'professional' ? 'Professional' : 'Customer'}</small></span><MoreHorizontal size={18} /></button>{showAccountMenu && <div className="account-menu"><button onClick={() => { setPage('My Cards'); setShowAccountMenu(false); }}><Users size={15} /> My profile</button><button onClick={() => notify('Settings saved automatically')}><Settings size={15} /> Settings</button><button onClick={switchRole}><BriefcaseBusiness size={15} /> Switch to {role === 'professional' ? 'customer' : 'professional'}</button><button onClick={() => void handleSignOut()}><ArrowLeft size={15} /> Sign out</button></div>}</div></div>
    </aside>
    <main className={`main-content${hideTopbar ? ' no-topbar' : ''}`}>
      {!hideTopbar && <header className="topbar">
        <div className="mobile-brand"><span className="brand-mark"><Zap size={17} fill="currentColor" /></span> Expertène</div>
        <div className="crumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{page === 'Professional' ? selectedProfessional?.name : page}</strong></div>
        <div className="top-actions"><button className="icon-button"><Bell size={19} /><i /></button><button className="location-top" onClick={() => setShowLocation(true)}><MapPin size={15} /> {location}<ChevronDown size={13} /></button><span className="avatar avatar-top">{userInitials}</span></div>
      </header>}
      <div className={`page-wrap${isMobilePage ? ' no-bottom-bar' : ''}${fullscreenPage ? ' page-fullscreen' : ''}${hideTopbar ? ' page-no-topbar' : ''}`}>
        {page === 'Overview' && <Overview openService={openService} onExplore={() => setPage('Services')} onNotify={notify} onSearch={(q) => { setQuery(q); setPage('Services'); }} />}
        {page === 'Services' && <Services query={query} setQuery={setQuery} categories={filteredCategories} selectedService={selectedService} selectService={openService} onProfile={openProfessional} onLocation={() => setShowLocation(true)} customServices={services} onAddService={() => setShowAddService(true)} canAddService={role === 'professional'} onAllCategories={() => setPage('AllCategories')} />}
        {page === 'AllCategories' && <AllCategoriesPage categories={filteredCategories} query={query} setQuery={setQuery} onSelect={openService} onBack={() => setPage('Services')} />}
        {page === 'Bookings' && <Bookings bookings={bookings} onExplore={() => setPage('Services')} onNotify={notify} />}
        {page === 'BookingFlow' && selectedProfessional && <BookingFlow professional={selectedProfessional} onBack={() => setPage('Professional')} onConfirm={createBooking} onCancel={() => { setPage('Professional'); notify('Booking cancelled'); }} />}
        {page === 'Messages' && <Messages chat={chat} setChat={setChat} onNotify={notify} />}
        {page === 'My Cards' && <Cards onProfile={openProfessional} onNotify={notify} />}
        {page === 'Professional' && selectedProfessional && <ProfessionalPage professional={selectedProfessional} onBack={() => setPage('Services')} onBook={() => setPage('BookingFlow')} onMessage={() => { setChat(selectedProfessional.name); setPage('Messages'); }} />}
      </div>
    </main>
    <nav className="mobile-bottom-nav">
      {mobileNavItems.map(({ label, icon: Icon }) => (
        <button key={label} className={`bottom-nav-item ${page === label || (label === 'Services' && page === 'Professional') || (label === 'Services' && page === 'BookingFlow') ? 'active' : ''}`} onClick={() => setPage(label)}>
          <Icon size={21} /><span>{label}</span>
        </button>
      ))}
    </nav>
    {showLocation && <LeafletLocationPicker location={location} onClose={() => setShowLocation(false)} onSelect={(next) => { setLocation(next); setShowLocation(false); notify(`Location changed to ${next}`); }} />}
    {showAddService && <AddServiceModal onClose={() => setShowAddService(false)} onSubmit={createService} />}
    {toast && <div className="toast"><span className="toast-check"><Check size={14} /></span>{toast}</div>}
  </div>;
}

function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) { return <div className="page-title"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{children}</div>; }

function Overview({ onExplore, onNotify, openService, onSearch }: { onExplore: () => void; onNotify: (message: string) => void; openService: (service: string) => void; onSearch: (query: string) => void }) {
  const [homeQuery, setHomeQuery] = useState('');
  return (
    <>
      <PageTitle eyebrow="SATURDAY, 12 OCTOBER 2026" title="Good morning ✦">
        <div className="title-actions">
          <button className="secondary-button" onClick={() => onNotify('Date range updated')}><CalendarDays size={16} /> Oct 01 — Oct 31 <ChevronDown size={15} /></button>
          <button className="primary-button" onClick={onExplore}><Plus size={17} /> Find a professional</button>
        </div>
      </PageTitle>

      <div className="sticky-search-wrapper">
        <div className="service-search home-sticky-search">
          <Search size={20} />
          <input
            value={homeQuery}
            onChange={(e) => setHomeQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && homeQuery.trim()) {
                onSearch(homeQuery.trim());
              }
            }}
            placeholder="Search services like photography, plumbing, yoga, tutoring... (Press Enter)"
          />
          {homeQuery.trim() ? (
            <button
              className="small-primary"
              style={{ padding: '6px 14px', borderRadius: '6px' }}
              onClick={() => onSearch(homeQuery.trim())}
            >
              Search
            </button>
          ) : (
            <kbd>⌘ K</kbd>
          )}
        </div>
      </div>

      <section className="hero-banner"><div className="hero-copy"><span className="pill pill-dark">YOUR WEEK AT A GLANCE</span><h2>Make room for<br /><em>good work.</em></h2><p>Book trusted professionals around you, without the back and forth.</p><button className="white-button" onClick={onExplore}>Explore services <ArrowUpRight size={16} /></button></div><div className="hero-art"><div className="art-circle" /><div className="art-card"><Camera size={25} /><strong>12,840</strong><small>professionals nearby</small></div><div className="floating-star">✦</div></div></section><div className="stat-grid"><Stat label="Upcoming bookings" value="04" change="+2 this week" color="blue" icon={CalendarDays} /><Stat label="Saved professionals" value="28" change="+6 this month" color="yellow" icon={Heart} /><Stat label="Profile views" value="342" change="+18.6%" color="green" icon={Users} /><Stat label="Total spent" value="₹24,800" change="This month" color="pink" icon={CircleDollarSign} /></div><div className="section-grid"><section className="panel schedule-panel"><div className="panel-heading"><div><p className="eyebrow">UP NEXT</p><h3>Today's schedule</h3></div><button className="text-button" onClick={() => onNotify('Calendar view opened')}>View calendar <ArrowUpRight size={15} /></button></div><div className="schedule-list"><ScheduleRow time="09:00 AM" title="Available" meta="Keep your day flexible" color="green" /><ScheduleRow time="12:00 PM" title="Break" meta="Lunch & reset" color="yellow" /><ScheduleRow time="02:00 PM" title="Pre-Wedding shoot" meta="with Kumar · 2 hrs" color="pink" /></div><div className="quick-actions"><button onClick={onExplore}><Plus size={17} /> Add booking</button><button onClick={() => onNotify('Availability editor opened')}><CalendarDays size={17} /> Update availability</button><button onClick={() => openService('Photography')}><Camera size={17} /> Browse photography</button></div></section><section className="panel recommendations-panel"><div className="panel-heading"><div><p className="eyebrow">POPULAR NEAR YOU</p><h3>Explore services</h3></div><button className="icon-button plain" onClick={onExplore}><ArrowUpRight size={18} /></button></div><div className="overview-service-grid">{categories.slice(0, 6).map(({ label, icon: Icon, tone }) => <button className={`service-tile tone-${tone}`} onClick={() => openService(label)} key={label}><span><Icon size={19} /></span><strong>{label}</strong><small>120+ pros</small></button>)}</div></section></div>
    </>
  );
}

function Stat({ label, value, change, color, icon: Icon }: { label: string; value: string; change: string; color: string; icon: Icon }) { return <div className={`stat-card stat-${color}`}><div className="stat-top"><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><small><ArrowUpRight size={13} /> {change}</small></div>; }
function ScheduleRow({ time, title, meta, color }: { time: string; title: string; meta: string; color: string }) { return <div className="schedule-row"><time>{time}</time><div className={`schedule-dot dot-${color}`} /><div><strong>{title}</strong><small>{meta}</small></div><ChevronRight size={16} /></div>; }

function Services({ query, setQuery, categories: results, selectedService, selectService, onProfile, onLocation, customServices, onAddService, canAddService, onAllCategories }: { query: string; setQuery: (value: string) => void; categories: Category[]; selectedService: string; selectService: (service: string) => void; onProfile: (professional: Professional) => void; onLocation: () => void; customServices: ServiceRecord[]; onAddService: () => void; canAddService: boolean; onAllCategories: () => void }) {
  // Show 10 directory items (one full row of 10); Show More navigates to AllCategories
  const DIRECTORY_LIMIT = 10;
  const directoryItems = query ? results : results.slice(0, DIRECTORY_LIMIT);
  return (
    <>
      <PageTitle eyebrow="DISCOVER LOCAL TALENT" title="What do you need help with?">
        <div className="title-actions">
          <button className="location-selector" onClick={onLocation}><MapPin size={16} /> Visakhapatnam <ChevronDown size={15} /></button>
          {canAddService && <button className="primary-button" onClick={onAddService}><Plus size={16} /> Add a service</button>}
        </div>
      </PageTitle>
      <div className="sticky-search-wrapper">
        <div className="service-search"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services like photography, repairs, yoga..." /><kbd>⌘ K</kbd></div>
      </div>

    <div className="all-services-heading"><div><p className="eyebrow">THE FULL DIRECTORY</p><h3>All services</h3></div><span>{results.length === categories.length ? '45+ categories' : `${results.length} matches`}</span></div>
    <div className="service-directory">{directoryItems.map(({ label }) => (
      <button className="directory-card" onClick={() => selectService(label)} key={label}>
        <span className="directory-illust" style={getCategoryBg(label)} />
        <span className="directory-label"><strong>{label}</strong></span>
      </button>
    ))}</div>
    {!query && <button className="show-more-button" onClick={onAllCategories}><Grid2X2 size={16} /> Browse all 45+ categories</button>}
    <section className="service-results"><div className="popular-heading"><div><p className="eyebrow">FEATURED PROFESSIONALS</p><h3>{selectedService} specialists</h3></div><span>125 professionals found</span></div>{professionals.map((p) => <ProfessionalRow professional={p} onProfile={onProfile} key={p.name} />)}</section>
    {customServices.length > 0 && <section className="service-results"><div className="popular-heading"><div><p className="eyebrow">YOUR PUBLISHED WORK</p><h3>Services you added</h3></div><span>{customServices.length} saved</span></div><div className="custom-service-grid">{customServices.map((s) => <article className="custom-service-card panel" key={s.id}><img src={s.image_url} alt="" /><div><h3>{s.title}</h3><p>{s.description}</p><strong>₹{s.price.toLocaleString('en-IN')}</strong><small>Available {s.available_date}</small></div></article>)}</div></section>}
    </>
  );
}

function AllCategoriesPage({ categories: all, query, setQuery, onSelect, onBack }: { categories: Category[]; query: string; setQuery: (v: string) => void; onSelect: (s: string) => void; onBack: () => void }) {
  return (
    <div>
      <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to Services</button>
      <PageTitle eyebrow="FULL DIRECTORY" title="All Categories">
        <div className="service-search" style={{maxWidth:'380px',boxShadow:'none'}}><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search categories..." /></div>
      </PageTitle>
      <div className="all-cats-grid">
        {all.map(({ label }) => (
          <button key={label} className="directory-card" onClick={() => { onSelect(label); onBack(); }}>
            <span className="directory-illust" style={getCategoryBg(label)} />
            <span className="directory-label"><strong>{label}</strong></span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfessionalRow({ professional, onProfile }: { professional: Professional; onProfile: (professional: Professional) => void }) {
  return <article className="professional-card"><button className="professional-card-image-btn" onClick={() => onProfile(professional)}><img src={professional.avatar || professional.image} alt={professional.role} /></button><div className="professional-info"><div className="professional-heading"><div><button className="professional-name-btn" onClick={() => onProfile(professional)}><h3>{professional.name} {professional.verified && <span className="verified"><Check size={10} /></span>}</h3></button><p>{professional.role}</p></div><button className="heart-button"><Heart size={18} /></button></div><div className="professional-meta"><span><Star size={13} fill="currentColor" /> {professional.rating} <small>({professional.reviews})</small></span><span><MapPin size={13} /> {professional.location}</span></div><div className="tag-row">{professional.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="card-footer"><strong>From {professional.price}</strong><button className="outline-button" onClick={() => onProfile(professional)}>View full profile <ArrowUpRight size={13} /></button></div></div></article>;
}

const sampleReviews = [
  { name: 'Aarav Mehta', avatar: 'AM', rating: 5, date: 'Sep 2026', text: 'Absolutely amazing experience! The photos came out beautifully and the team was so professional and easy to work with. Highly recommend!' },
  { name: 'Priya Sharma', avatar: 'PS', rating: 5, date: 'Aug 2026', text: 'Raj captured our wedding perfectly. Every shot tells a story. Would definitely book again for future events.' },
  { name: 'Kiran Reddy', avatar: 'KR', rating: 4, date: 'Jul 2026', text: 'Great work overall. A few delays in delivery but the final photos were worth every rupee. Very talented photographer.' },
  { name: 'Sunil Varma', avatar: 'SV', rating: 5, date: 'Jun 2026', text: 'Booked for a corporate event. Very punctual, professional, and creative. Our team loved the results!' },
];

type ProjectItem = {
  title: string;
  client: string;
  date: string;
  category: string;
  image: string;
  description: string;
  tags: string[];
  link: string;
  linkText: string;
};

function ProjectModal({ project, onClose }: { project: ProjectItem; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal-header">
          <div>
            <span className="project-category-badge">{project.category}</span>
            <h2>{project.title}</h2>
            <p className="project-modal-meta">{project.client} &middot; {project.date}</p>
          </div>
          <button className="icon-button modal-close-btn" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
        </div>
        <div className="project-modal-image-wrap">
          <img src={project.image} alt={project.title} />
        </div>
        <div className="project-modal-body">
          <h4>Case Study &amp; Overview</h4>
          <p>{project.description}</p>
          <div className="project-tags">
            {project.tags.map((t) => <span key={t} className="project-tag-pill">#{t}</span>)}
          </div>
        </div>
        <div className="project-modal-footer">
          <button className="secondary-button" onClick={onClose}>Close</button>
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="primary-button"
            onClick={(e) => { e.preventDefault(); alert(`Live portfolio link for ${project.title} opened.`); }}
          >
            {project.linkText} <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

function ImageViewerModal({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const prev = () => setCurrentIndex(i => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setCurrentIndex(i => (i < images.length - 1 ? i + 1 : 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  return (
    <div className="image-viewer-backdrop" onClick={onClose}>
      <div className="image-viewer-content" onClick={e => e.stopPropagation()}>
        <div className="image-viewer-top">
          <span className="image-viewer-counter">Photo {currentIndex + 1} of {images.length}</span>
          <button className="image-viewer-close" onClick={onClose} aria-label="Close viewer">
            <X size={20} />
          </button>
        </div>

        <div className="image-viewer-stage">
          <button className="image-viewer-nav prev" onClick={prev} aria-label="Previous photo">
            <ChevronLeft size={24} />
          </button>
          <div className="image-viewer-img-wrap">
            <img src={images[currentIndex]} alt={`Work sample ${currentIndex + 1}`} />
          </div>
          <button className="image-viewer-nav next" onClick={next} aria-label="Next photo">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="image-viewer-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`viewer-thumb-btn ${i === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`View photo ${i + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfessionalPage({ professional, onBack, onBook, onMessage }: { professional: Professional; onBack: () => void; onBook: () => void; onMessage: () => void }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [professional.name]);
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const avgRating = parseFloat(professional.rating);
  const breakdown = [5,4,3,2,1].map(star => ({ star, pct: star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 6 : star === 2 ? 2 : 2 }));

  // Service detail data
  const serviceDetails = [
    { title: 'Wedding Photography', price: '₹15,000', image: professional.image, daysActive: 842, completed: 87, posted: 'Mar 2022', desc: 'Full-day coverage with edited album, drone shots & highlight reel. Includes pre-shoot consultation.' },
    { title: 'Pre-Wedding Shoot', price: '₹8,000', image: 'https://images.pexels.com/photos/33072063/pexels-photo-33072063.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', daysActive: 720, completed: 54, posted: 'Jul 2022', desc: 'Outdoor & studio pre-wedding sessions. Up to 4 hrs, 200+ edited photos delivered digitally.' },
    { title: 'Event Photography', price: '₹12,000', image: 'https://images.pexels.com/photos/36697251/pexels-photo-36697251.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', daysActive: 610, completed: 39, posted: 'Nov 2022', desc: 'Corporate events, birthdays, conferences. Quick 48-hr turnaround on edited photos.' },
  ];

  // Gallery images
  const galleryImages = [
    professional.image,
    'https://images.pexels.com/photos/33072063/pexels-photo-33072063.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    'https://images.pexels.com/photos/36697251/pexels-photo-36697251.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    'https://images.pexels.com/photos/16552843/pexels-photo-16552843.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
  ];

  const projects: ProjectItem[] = [
    { title: 'Sharma Destination Wedding 2026', client: 'Deepa & Vikram', date: 'Aug 2026', category: 'Wedding', image: professional.image, description: 'Full-day coverage of a 500-guest destination wedding in Udaipur. Delivered 1,200 edited photos and a 5-minute cinematic reel.', tags: ['Wedding', 'Cinematic', 'Udaipur'], link: '#', linkText: 'View live gallery' },
    { title: 'TechFusion Global Summit', client: 'TechFusion Pvt Ltd', date: 'Jul 2026', category: 'Corporate', image: 'https://images.pexels.com/photos/36697251/pexels-photo-36697251.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', description: 'Two-day conference photography covering keynotes, panels, and networking sessions. 800+ images delivered in 48 hrs.', tags: ['Corporate', 'Conference', 'Events'], link: '#', linkText: 'View deck & samples' },
    { title: 'Priya & Rohan Coastal Pre-Wedding', client: 'Priya Menon', date: 'Jun 2026', category: 'Pre-Wedding', image: 'https://images.pexels.com/photos/33072063/pexels-photo-33072063.jpeg?auto=compress&cs=tinysrgb&h=400&w=600', description: 'Outdoor pre-wedding session at Rushikonda Beach. Golden-hour portraits with cinematic color grading and drone shots.', tags: ['Pre-Wedding', 'Beach', 'Cinematic'], link: '#', linkText: 'View album' },
  ];

  return (
    <div className="professional-page">
      {/* ── Storefront Banner with Top Badges & Back Button (Exact Match) ── */}
      <div className="storefront-hero-block">
        <div className="storefront-banner">
          <img src={professional.image} alt={professional.name} />
          <div className="storefront-overlay" />
          <button className="profile-back-btn" onClick={onBack}><ArrowLeft size={14} /> Back</button>
          <span className="storefront-badge-left">
            <ShoppingBag size={12} color="#16a34a" /> {professional.tags[0]?.toUpperCase() || 'SERVICE'}
          </span>
          <div className="storefront-top-right">
            <span className="storefront-badge-right"><span className="status-dot-green" /> OPEN NOW</span>
            <button className="storefront-dots-btn" title="Share profile" onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Profile link copied to clipboard!'); }}><MoreHorizontal size={16} /></button>
          </div>
        </div>

        {/* ── Floating Header Card (Squircle Profile Picture properly inside it) ── */}
        <div className="storefront-header-card">
          <div className="storefront-dp-squircle">
            {professional.avatar ? (
              <img src={professional.avatar} alt={professional.name} className="storefront-dp-img" />
            ) : (
              <span className="storefront-dp-initial">{professional.name.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="storefront-header-text">
            <h1 className="storefront-store-title">
              {professional.name}
              {professional.verified && <span className="verified-gold"><Check size={12} /></span>}
            </h1>
            <p className="storefront-store-subtitle"><MapPin size={13} color="#f5a623" /> {professional.location}</p>
          </div>
        </div>

        {/* ── Action & Meta Bar (White & Blue scheme, removed call, reviews, timings) ── */}
        <div className="storefront-toolbar">
          <div className="storefront-toolbar-meta">
            <div className="toolbar-pill">
              <Star size={15} fill="#f5a623" color="#f5a623" />
              <div className="toolbar-pill-text">
                <strong>{professional.rating}</strong>
                <small>{professional.reviews} REVIEWS</small>
              </div>
            </div>
            <div className="toolbar-pill">
              <MapPin size={15} color="var(--blue)" />
              <div className="toolbar-pill-text">
                <small style={{ color: 'var(--blue)' }}>LOCATION</small>
                <span>{professional.location}</span>
              </div>
            </div>
          </div>
          <div className="storefront-toolbar-actions">
            <button className="toolbar-btn secondary" onClick={() => document.getElementById('profile-map-card')?.scrollIntoView({ behavior: 'smooth' })}>
              <Navigation size={13} /> View Map
            </button>
            <button className="toolbar-btn icon-btn" onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Profile link copied to clipboard!'); }} title="Share">
              <Share2 size={14} /> Share
            </button>
            <button className="toolbar-btn heart-btn" title="Save" onClick={() => alert('Saved to your favorites!')}>
              <Heart size={14} fill="#f43f5e" color="#f43f5e" /> Saved
            </button>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="profile-socials">
        <a href="#" className="social-pill" onClick={e=>e.preventDefault()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          Instagram
        </a>
        <a href="#" className="social-pill" onClick={e=>e.preventDefault()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
          Twitter
        </a>
        <a href="#" className="social-pill" onClick={e=>e.preventDefault()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          LinkedIn
        </a>
        <a href="#" className="social-pill social-pill-web" onClick={e=>e.preventDefault()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Website
        </a>
      </div>

      <div className="profile-main-grid">
        {/* ── Left Column ── */}
        <div className="profile-left">

          {/* 1. About */}
          <section className="profile-section">
            <h2 className="profile-section-h2">About</h2>
            <p className="profile-bio">{professional.bio ?? 'A trusted professional on Expertène, delivering quality service with care and attention to detail.'}</p>
          </section>

          {/* 2. Services Offered — kept directly under the About section as requested */}
          <section className="profile-section">
            <div className="section-title" style={{marginBottom:'16px'}}>
              <div>
                <h2 className="profile-section-h2" style={{margin:'0 0 3px'}}>Services Offered</h2>
                <p className="section-subtext" style={{margin:0,fontSize:'12px',color:'#718292'}}>Direct bookings, transparent pricing &amp; verified track record</p>
              </div>
              <span className="pill pill-light">{serviceDetails.length} services</span>
            </div>
            <div className="service-detail-list">
              {serviceDetails.map((svc) => (
                <div key={svc.title} className="service-detail-card">
                  <div className="sdc-img"><img src={svc.image} alt={svc.title} /></div>
                  <div className="sdc-body">
                    <div className="sdc-top">
                      <div>
                        <h3 className="sdc-title">{svc.title}</h3>
                        <p className="sdc-desc">{svc.desc}</p>
                      </div>
                      <span className="sdc-price">{svc.price}</span>
                    </div>
                    <div className="sdc-stats">
                      <div className="sdc-stat"><CalendarDays size={12} /><span>Posted <strong>{svc.posted}</strong></span></div>
                      <div className="sdc-stat"><Zap size={12} /><span>Active <strong>{svc.daysActive} days</strong></span></div>
                      <div className="sdc-stat"><Check size={12} /><span><strong>{svc.completed}</strong> completed</span></div>
                    </div>
                    <button className="sdc-book-btn" onClick={onBook}>Book this service <ArrowUpRight size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Photo Gallery */}
          <section className="profile-section">
            <div className="section-title" style={{marginBottom:'14px'}}>
              <h2 className="profile-section-h2">Photos &amp; Work</h2>
              <button className="text-button">See all <ArrowUpRight size={13} /></button>
            </div>
            <div className="profile-gallery">
              {galleryImages.map((src, i) => (
                <div key={i} className="gallery-thumb"><img src={src} alt="Work sample" /></div>
              ))}
            </div>
          </section>

          {/* 4. Featured Projects Section (Images, Description, Links & Prominent Open Button) ── */}
          <section className="profile-section">
            <div className="section-title" style={{marginBottom:'16px'}}>
              <div>
                <h2 className="profile-section-h2" style={{margin:'0 0 3px'}}>Featured Projects</h2>
                <p className="section-subtext" style={{margin:0,fontSize:'12px',color:'#718292'}}>Client commissions, deliverables and live case studies</p>
              </div>
              <span className="pill pill-light">{projects.length} projects</span>
            </div>
            <div className="projects-list-grid">
              {projects.map((proj) => (
                <article key={proj.title} className="project-card">
                  <div className="project-thumb-wrap" onClick={() => setActiveProject(proj)}>
                    <img src={proj.image} alt={proj.title} />
                    <span className="project-badge">{proj.category}</span>
                  </div>
                  <div className="project-info">
                    <div className="project-title-row">
                      <h3 className="project-name" onClick={() => setActiveProject(proj)}>{proj.title}</h3>
                      <span className="project-client-date">{proj.client} &middot; {proj.date}</span>
                    </div>
                    <p className="project-description">{proj.description}</p>
                    <div className="project-tags">
                      {proj.tags.map((t) => <span key={t} className="project-tag-pill">#{t}</span>)}
                    </div>
                    <div className="project-actions">
                      <button className="project-open-btn" onClick={() => setActiveProject(proj)}>
                        <ExternalLink size={13} /> Open Project
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Ratings & Reviews */}
          <section className="profile-section" id="profile-reviews-section">
            <h2 className="profile-section-h2">Ratings &amp; Reviews</h2>
            <div className="ratings-summary">
              <div className="ratings-score">
                <strong className="ratings-big">{professional.rating}</strong>
                <div className="ratings-stars">{[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= Math.round(avgRating) ? '#f5a623' : 'none'} color="#f5a623" />)}</div>
                <small>{professional.reviews} reviews</small>
              </div>
              <div className="ratings-breakdown">
                {breakdown.map(({ star, pct }) => (
                  <div key={star} className="rating-bar-row">
                    <span>{star} <Star size={10} fill="#f5a623" color="#f5a623" /></span>
                    <div className="rating-bar"><div className="rating-bar-fill" style={{width:`${pct}%`}} /></div>
                    <small>{pct}%</small>
                  </div>
                ))}
              </div>
            </div>
            <div className="reviews-list">
              {sampleReviews.map(r => (
                <div key={r.name} className="review-item">
                  <div className="review-header">
                    <div className="review-avatar">{r.avatar}</div>
                    <div>
                      <strong className="review-name">{r.name}</strong>
                      <div className="review-meta">
                        {[1,2,3,4,5].map(s => <Star key={s} size={11} fill={s<=r.rating?'#f5a623':'none'} color="#f5a623" />)}
                        <small>{r.date}</small>
                      </div>
                    </div>
                  </div>
                  <p className="review-text">{r.text}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── Right Sidebar: Book Card + Map UNDER it + Stats Card ── */}
        <aside className="profile-right">
          {/* 1. Book Card */}
          <div className="profile-book-card">
            <p className="eyebrow">READY WHEN YOU ARE</p>
            <h3>Book {professional.name.split(' ')[0]}</h3>
            <p>Send a request and get a response within a few hours.</p>
            <strong className="profile-price">From {professional.price}</strong>
            <button className="primary-button full" onClick={onBook}>Book a service <ArrowUpRight size={16} /></button>
            <button className="outline-button full" style={{marginTop:'8px'}} onClick={onMessage}><MessageCircle size={15} /> Start a conversation</button>
          </div>

          {/* 2. Map in profile UNDER the book card on right side */}
          {professional.lat != null && professional.lng != null && (
            <div className="profile-map-card panel" id="profile-map-card">
              <div className="profile-map-head">
                <div>
                  <p className="eyebrow" style={{marginBottom: 2}}>SERVICE LOCATION</p>
                  <h4>{professional.location}</h4>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${professional.lat},${professional.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="map-direct-btn"
                >
                  <Navigation size={12} /> Directions
                </a>
              </div>
              <ProfileMap lat={professional.lat} lng={professional.lng} name={professional.name} />
            </div>
          )}

          {/* 3. Stats Card */}
          <div className="profile-stats-card">
            <div className="profile-stat"><strong>{professional.reviews}</strong><small>Reviews</small></div>
            <div className="profile-stat"><strong>{professional.rating}</strong><small>Avg rating</small></div>
            <div className="profile-stat"><strong>3+ yrs</strong><small>Experience</small></div>
          </div>
        </aside>
      </div>

      {activeProject && (
        <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      )}
    </div>
  );
}
function ClockIcon() { return <span className="clock-icon">◷</span>; }

function GoogleIcon() { return <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>; }

function ProfileMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
    mapRef.current = map;
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, name]);
  return <div className="profile-map-container" ref={containerRef} />;
}

function Bookings({ bookings, onExplore, onNotify }: { bookings: BookingRecord[]; onExplore: () => void; onNotify: (message: string) => void }) {
  const [selectedDay, setSelectedDay] = useState('12');
  const daysWithBookings = new Set(bookings.map((b) => b.service_date.slice(-2)));
  return <><PageTitle eyebrow="YOUR PLANS" title="Bookings"><div className="segmented"><button className="selected">Upcoming <b>{bookings.length}</b></button><button>Completed</button><button>Cancelled</button></div></PageTitle>
    <div className="booking-page-grid"><div className="booking-column">{bookings.length ? bookings.map((b) => <BookingRow key={b.id} image={photos.camera} title={b.service_title} professional={b.professional_name} date={`${b.service_date} · 10:00 AM`} amount={`₹${b.amount.toLocaleString('en-IN')}`} status={b.status} color={b.status === 'pending' ? 'yellow' : 'green'} onNotify={onNotify} />) : <div className="empty-state"><CalendarDays size={30} /><h3>No bookings yet</h3><p>Choose a professional to start your first booking.</p></div>}</div>
    <div className="calendar-panel panel"><div className="panel-heading"><div><p className="eyebrow">OCTOBER 2026</p><h3>Select a day</h3></div><CalendarDays size={19} /></div><div className="calendar-week">{['S','M','T','W','T','F','S'].map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}</div><div className="calendar-days">{Array.from({ length: 31 }, (_, i) => { const day = String(i + 1).padStart(2, '0'); return <button className={`${selectedDay === day ? 'today' : ''} ${daysWithBookings.has(day) ? 'has-event' : ''}`} onClick={() => setSelectedDay(day)} key={day}>{i + 1}{daysWithBookings.has(day) && <i />}</button>; })}</div><p className="calendar-note">{daysWithBookings.has(selectedDay) ? 'You have a booking on this day.' : 'No booking selected for this day.'}</p></div></div>
    <div className="empty-cta"><div><p className="eyebrow">KEEP EXPLORING</p><h3>Need something else?</h3><p>There are 125+ trusted professionals ready to help.</p></div><button className="primary-button" onClick={onExplore}>Find a professional <ArrowUpRight size={16} /></button></div>
  </>;
}
function BookingRow({ image, title, professional, date, amount, status, color, onNotify }: { image: string; title: string; professional: string; date: string; amount: string; status: string; color: string; onNotify: (message: string) => void }) { return <div className="booking-row panel"><img src={image} alt="" /><div className="booking-row-main"><span className={`status status-${color}`}>{status}</span><h3>{title}</h3><p>{professional} <span>·</span> {date}</p><strong>{amount}</strong></div><button className="more-button" onClick={() => onNotify('Booking options opened')}><MoreHorizontal size={19} /></button></div>; }

function Messages({ chat, setChat, onNotify }: { chat: string; setChat: (chat: string) => void; onNotify: (message: string) => void }) {
  const messages = [{ name: 'Raj Photography', text: 'Perfect! Booking confirmed. Looking forward!', image: photos.camera, time: '10:26 AM' }, { name: 'Kumar Reddy', text: 'Can you share the moodboard?', image: photos.worker, time: 'Yesterday' }, { name: 'Arjun Mehta', text: 'Finalizing the details for Saturday.', image: photos.studio, time: '2 Oct' }, { name: 'Neha Gupta', text: 'Service enquiry', image: photos.wedding, time: '1 Oct' }];
  const active = messages.find((m) => m.name === chat) ?? messages[0];
  const [showList, setShowList] = useState(false);
  return <div className="messages-full">
    <div className={`messages-list-panel ${showList ? 'visible' : ''}`}>
      <div className="message-search"><Search size={16} /><input placeholder="Search conversations..." /></div>
      {messages.map((m, i) => <button className={`conversation ${m.name === active.name ? 'unread' : ''}`} key={m.name} onClick={() => { setChat(m.name); setShowList(false); }}><img src={m.image} alt="" /><div><strong>{m.name}</strong><p>{m.text}</p></div><span>{m.time}</span>{i === 0 && <i />}</button>)}
    </div>
    <div className="messages-chat-panel">
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => setShowList(true)}><ArrowLeft size={18} /></button>
        <img src={active.image} alt="" />
        <div><strong>{active.name}</strong><small><span className="online-dot" /> Online now</small></div>
        <div className="chat-header-actions"><button><Phone size={18} /></button><button><MoreHorizontal size={19} /></button></div>
      </div>
      <div className="chat-body"><div className="chat-date">TODAY</div><div className="bubble received">Hi! I'm interested in wedding photography. Are you available on Oct 12?<small>10:24 AM</small></div><div className="bubble sent">Yes! I'm available. Here are the available time slots.<small>10:25 AM <Check size={12} /></small></div><div className="booking-preview"><div className="preview-icon"><CalendarDays size={20} /></div><div><strong>Booking request</strong><p>Wedding Photography</p><small>12 Oct 2026 · 10:00 AM</small></div><strong>₹15,000</strong></div><div className="bubble received short">Perfect! Booking confirmed. Looking forward!</div></div>
      <div className="message-composer"><button><Plus size={18} /></button><input placeholder="Type a message..." /><button className="send-button" onClick={() => onNotify('Message sent')}><Send size={15} /></button></div>
    </div>
  </div>;
}

function Cards({ onNotify, onProfile }: { onNotify: (message: string) => void; onProfile: (professional: Professional) => void }) {
  const saved = professionals.concat({ ...professionals[0], name: 'Ari AC Services', role: 'AC Repair & Installation', image: photos.mechanic, price: '₹700+' });
  return <><PageTitle eyebrow="YOUR SAVED SHORTLIST" title="My cards"><button className="primary-button" onClick={() => onNotify('New card created')}><Plus size={17} /> Add a card</button></PageTitle><div className="cards-tabs"><button className="active">Saved <b>28</b></button><button>Recently viewed <b>8</b></button></div><div className="cards-grid">{saved.map((p, i) => <div className="saved-card panel" key={`${p.name}-${i}`}><div className="saved-card-image"><img src={p.image} alt="" /><button onClick={() => onNotify('Removed from saved cards')}><Heart size={18} fill="currentColor" /></button></div><div className="saved-card-body"><h3>{p.name}</h3><p>{p.role}</p><div className="saved-meta"><span><Star size={13} fill="currentColor" /> {p.rating}</span><span><MapPin size={13} /> 3.2 km</span></div><div className="saved-actions"><button className="outline-button" onClick={() => onProfile(p)}>View details</button><button className="small-primary" onClick={() => onNotify(`Booking ${p.name}`)}>Book now</button></div></div></div>)}</div></>;
}

function LeafletLocationPicker({ location, onClose, onSelect }: { location: string; onClose: () => void; onSelect: (location: string) => void }) {
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState(location);
  const [detecting, setDetecting] = useState(false);
  const [searchResults, setSearchResults] = useState<{ name: string; coords: [number, number] }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const countryObj = useMemo(() => COUNTRIES.find((c) => c.code === selectedCountry) ?? COUNTRIES[0], [selectedCountry]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initialCoords = countryObj.regions.find((r) => r.name.toLowerCase().includes(location.toLowerCase()))?.coords ?? countryObj.center;
    const map = L.map(containerRef.current).setView(initialCoords, countryObj.zoom + 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    const marker = L.marker(initialCoords, { draggable: true }).addTo(map);
    marker.bindPopup(location).openPopup();

    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`);
        const data = await res.json();
        const place = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || 'Pinned location';
        setSelectedName(place);
        marker.bindPopup(place).openPopup();
      } catch {
        setSelectedName(`${pos.lat.toFixed(2)}, ${pos.lng.toFixed(2)}`);
      }
    });

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const place = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || 'Pinned location';
        setSelectedName(place);
        marker.bindPopup(place).openPopup();
      } catch {
        setSelectedName(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
      }
    });

    mapRef.current = map;
    markerRef.current = marker;
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  const handleCountrySwitch = (code: string) => {
    setSelectedCountry(code);
    const c = COUNTRIES.find((x) => x.code === code) ?? COUNTRIES[0];
    if (mapRef.current && markerRef.current) {
      const firstRegion = c.regions[0] ?? { name: c.name, coords: c.center };
      mapRef.current.setView(firstRegion.coords, c.zoom + 5);
      markerRef.current.setLatLng(firstRegion.coords);
      markerRef.current.bindPopup(firstRegion.name).openPopup();
      setSelectedName(firstRegion.name.split(',')[0]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRegionClick = (reg: { name: string; coords: [number, number] }) => {
    const short = reg.name.split(',')[0];
    setSelectedName(short);
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView(reg.coords, 12);
      markerRef.current.setLatLng(reg.coords);
      markerRef.current.bindPopup(reg.name).openPopup();
    }
  };

  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) { setSearchResults([]); return; }
    const local = countryObj.regions.filter((r) => r.name.toLowerCase().includes(val.toLowerCase()));
    setSearchResults(local);

    if (val.trim().length >= 3) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=${countryObj.code.toLowerCase()}&q=${encodeURIComponent(val)}&limit=5`);
        const data = await res.json();
        const apiMatches = data.map((item: any) => ({
          name: item.display_name.split(',').slice(0, 3).join(','),
          coords: [parseFloat(item.lat), parseFloat(item.lon)] as [number, number],
        }));
        setSearchResults([...local, ...apiMatches.filter((a: any) => !local.some((l) => l.name === a.name))]);
      } catch { /* keep local matches */ }
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.address || {};
          const countryCode = (addr.country_code || '').toUpperCase();
          const place = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || 'My Location';
          const matchCountry = COUNTRIES.find((c) => c.code === countryCode);
          if (matchCountry) setSelectedCountry(matchCountry.code);
          setSelectedName(place);
          if (mapRef.current && markerRef.current) {
            mapRef.current.setView([latitude, longitude], 13);
            markerRef.current.setLatLng([latitude, longitude]);
            markerRef.current.bindPopup(`📍 ${place}`).openPopup();
          }
        } catch {
          setSelectedName(`Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
          if (mapRef.current && markerRef.current) {
            mapRef.current.setView([latitude, longitude], 13);
            markerRef.current.setLatLng([latitude, longitude]);
          }
        } finally {
          setDetecting(false);
        }
      },
      () => { setDetecting(false); },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">LOCATION SETTINGS</p>
            <h2>Choose your region & country</h2>
          </div>
          <button onClick={onClose}><X size={19} /></button>
        </div>

        <div className="modal-country-row">
          <div className="modal-country-select-wrap">
            <span className="field-sub">Country:</span>
            <select value={selectedCountry} onChange={(e) => handleCountrySwitch(e.target.value)} className="country-select">
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.dial})</option>)}
            </select>
          </div>
          <button type="button" className="location-detect-btn" onClick={detectLocation} disabled={detecting}>
            <Navigation size={13} /> {detecting ? 'Detecting...' : 'Detect location'}
          </button>
        </div>

        <div className="map-search-row">
          <Search size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => void handleSearchChange(e.target.value)}
            placeholder={`Search places or regions in ${countryObj.name}...`}
          />
          {searchQuery && <button type="button" className="clear-btn" onClick={() => { setSearchQuery(''); setSearchResults([]); }}><X size={13} /></button>}
        </div>

        {searchResults.length > 0 && (
          <div className="search-results-list">
            {searchResults.slice(0, 6).map((res, i) => (
              <button key={`${res.name}-${i}`} type="button" className="search-result-item" onClick={() => { handleRegionClick(res); setSearchResults([]); }}>
                <MapPin size={13} /> <span>{res.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="leaflet-map-container" ref={containerRef} />

        <div className="location-regions-scroll">
          <small className="regions-heading">Popular places in {countryObj.name}:</small>
          <div className="region-chips-grid">
            {countryObj.regions.map((reg) => {
              const short = reg.name.split(',')[0];
              return (
                <button
                  key={reg.name}
                  className={`region-chip ${selectedName === short || selectedName === reg.name ? 'active' : ''}`}
                  onClick={() => handleRegionClick(reg)}
                >
                  <MapPin size={11} /> {short}
                </button>
              );
            })}
          </div>
        </div>

        <button className="primary-button full" onClick={() => onSelect(selectedName)}>
          Select & Use {selectedName} <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Auth Flow: Landing → Sign In / Sign Up ──────────────────────────────────
type AuthStep = 'landing' | 'signin' | 'signup';

function AuthFlow() {
  const [step, setStep] = useState<AuthStep>('landing');
  if (step === 'landing') return <LandingPage onSignIn={() => setStep('signin')} onSignUp={() => setStep('signup')} />;
  return <AuthScreen step={step} setStep={setStep} />;
}

// Popular categories shown on landing
const landingCategories = [
  { label: 'Home Services', icon: Home, tone: 'blue' },
  { label: 'Beauty & Wellness', icon: Sparkles, tone: 'pink' },
  { label: 'Photography', icon: Camera, tone: 'yellow' },
  { label: 'Education', icon: GraduationCap, tone: 'green' },
  { label: 'Fitness', icon: Dumbbell, tone: 'orange' },
  { label: 'Repairs', icon: Wrench, tone: 'sky' },
  { label: 'Cleaning', icon: Brush, tone: 'mint' },
  { label: 'Automotive', icon: Car, tone: 'lavender' },
  { label: 'Events', icon: CalendarDays, tone: 'pink' },
  { label: 'Design & Creative', icon: Monitor, tone: 'blue' },
];

const landingProfessionals = [
  { name: 'Raj Photography', role: 'Wedding Photographer', rating: '4.8', reviews: 126, distance: '3.2 km', tags: ['Wedding', 'Events', 'Portrait'], verified: true, image: 'https://images.pexels.com/photos/33072059/pexels-photo-33072059.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
  { name: 'Moment Studio', role: 'Candid Photography', rating: '4.7', reviews: 98, distance: '5.1 km', tags: ['Pre-Wedding', 'Events'], verified: false, image: 'https://images.pexels.com/photos/33072063/pexels-photo-33072063.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
  { name: 'ShotHQ', role: 'Product Photographer', rating: '4.6', reviews: 74, distance: '7.8 km', tags: ['Events', 'Product'], verified: true, image: 'https://images.pexels.com/photos/36697251/pexels-photo-36697251.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
  { name: 'LensPro', role: 'Portrait Specialist', rating: '4.9', reviews: 52, distance: '9.4 km', tags: ['Portrait', 'Commercial'], verified: false, image: 'https://images.pexels.com/photos/33072059/pexels-photo-33072059.jpeg?auto=compress&cs=tinysrgb&h=400&w=600' },
];

function LandingPage({ onSignIn, onSignUp }: { onSignIn: () => void; onSignUp: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <div className="lp-root">
      {/* ── Nav ── */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-brand"><span className="brand-mark"><Zap size={16} fill="currentColor" /></span> Expertène</div>
          <nav className="lp-nav-links">
            <button>Find Services</button>
            <button>For Professionals</button>
            <button>How it works</button>
          </nav>
          <div className="lp-nav-actions">
            <button className="lp-nav-loc"><MapPin size={14} /> Visakhapatnam <ChevronDown size={12} /></button>
            <button className="lp-nav-bell"><Bell size={17} /></button>
            <button className="lp-signin-btn" onClick={onSignIn}>Sign In</button>
            <button className="lp-signup-btn" onClick={onSignUp}>Get Started <ArrowUpRight size={13} /></button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-hero-badge"><ShieldCheck size={13} /> Local Professionals. Real Solutions.</div>
          <h1 className="lp-hero-h1">Find the right<br /><em>professional</em><br />for every need.</h1>
          <p className="lp-hero-sub">Trusted local professionals. Real people. Real services.</p>
          <div className="lp-search-bar">
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for services (e.g. AC repair, photography...)"
            />
            <div className="lp-search-loc"><MapPin size={13} /> Visakhapatnam</div>
            <button className="lp-search-btn" onClick={onSignIn}><Search size={16} /></button>
          </div>
          <div className="lp-trust-badges">
            <span><ShieldCheck size={14} /> Verified Professionals</span>
            <span><Check size={14} /> Secure Bookings</span>
            <span><MessageCircle size={14} /> Easy Chat</span>
            <span><Star size={14} /> Real Reviews</span>
          </div>
        </div>
        <div className="lp-hero-visual">
          <div className="lp-hero-img-wrap">
            <img src="https://images.pexels.com/photos/33072059/pexels-photo-33072059.jpeg?auto=compress&cs=tinysrgb&h=700&w=500" alt="Professional" />
            <div className="lp-hero-card lp-hero-card-1">
              <Star size={13} fill="#f5a623" color="#f5a623" /><strong>4.9</strong><span>Top Rated</span>
            </div>
            <div className="lp-hero-card lp-hero-card-2">
              <Check size={13} /><strong>Booking Confirmed!</strong><small>Wedding Photography</small>
            </div>
            <div className="lp-hero-card lp-hero-card-3">
              <strong>12,840+</strong><small>Professionals nearby</small>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Categories ── */}
      <section className="lp-section">
        <div className="lp-section-head">
          <div>
            <p className="eyebrow" style={{margin:'0 0 8px',color:'var(--blue)'}}>POPULAR SERVICE CATEGORIES</p>
            <h2 className="lp-section-h2">Popular Service Categories</h2>
          </div>
          <button className="lp-see-all" onClick={onSignIn}>See all <ArrowUpRight size={14} /></button>
        </div>
        <div className="lp-cat-grid">
          {landingCategories.map(({ label, icon: Icon, tone }) => (
            <button key={label} className={`lp-cat-card tone-${tone}`} onClick={onSignIn}>
              <span className="lp-cat-icon"><Icon size={24} /></span>
              <strong>{label}</strong>
            </button>
          ))}
        </div>
      </section>

      {/* ── Featured Professionals ── */}
      <section className="lp-section lp-section-alt">
        <div className="lp-section-head">
          <div>
            <p className="eyebrow" style={{margin:'0 0 8px',color:'var(--blue)'}}>125 PROFESSIONALS FOUND</p>
            <h2 className="lp-section-h2">Top Professionals Near You</h2>
          </div>
          <button className="lp-see-all" onClick={onSignIn}>View all <ArrowUpRight size={14} /></button>
        </div>
        <div className="lp-pros-grid">
          {landingProfessionals.map(p => (
            <article key={p.name} className="lp-pro-card" onClick={onSignIn}>
              <div className="lp-pro-img"><img src={p.image} alt={p.role} /><button className="lp-heart"><Heart size={16} /></button></div>
              <div className="lp-pro-info">
                <div className="lp-pro-heading">
                  <h3>{p.name} {p.verified && <span className="verified"><Check size={9} /></span>}</h3>
                  <div className="lp-pro-rating"><Star size={11} fill="#f5a623" color="#f5a623" /> {p.rating} <small>({p.reviews})</small></div>
                </div>
                <p className="lp-pro-role">{p.role}</p>
                <div className="lp-pro-meta"><MapPin size={11} /> {p.distance}<span className="lp-pro-tags">{p.tags.map(t => <span key={t}>{t}</span>)}</span></div>
                <button className="lp-view-btn" onClick={e => { e.stopPropagation(); onSignIn(); }}>View Profile <ArrowUpRight size={11} /></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="lp-section">
        <div className="lp-section-head" style={{marginBottom:'32px'}}>
          <div>
            <p className="eyebrow" style={{margin:'0 0 8px',color:'var(--blue)'}}>HOW IT WORKS</p>
            <h2 className="lp-section-h2">Three steps to get started</h2>
          </div>
        </div>
        <div className="lp-how-grid">
          {[
            { n:'01', icon: Search, title:'Search a service', desc:'Tell us what you need — cleaning, photography, repairs and more.' },
            { n:'02', icon: Users, title:'Choose a professional', desc:'Browse verified profiles, reviews, ratings and pricing.' },
            { n:'03', icon: CalendarDays, title:'Book & chat instantly', desc:'Pick a time, confirm your booking, and chat directly in the app.' },
          ].map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="lp-how-card">
              <div className="lp-how-num">{n}</div>
              <div className="lp-how-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="lp-cta-band">
        <div>
          <h2>Ready to find your next professional?</h2>
          <p>Join thousands of happy customers across Visakhapatnam.</p>
        </div>
        <div className="lp-cta-actions">
          <button className="lp-cta-primary" onClick={onSignUp}>Create Free Account <ArrowUpRight size={15} /></button>
          <button className="lp-cta-ghost" onClick={onSignIn}>Sign In</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-brand" style={{color:'#fff',marginBottom:'8px'}}><span className="brand-mark"><Zap size={16} fill="currentColor" /></span> Expertène</div>
          <p className="lp-footer-desc">Trusted local professionals. Real people. Real services.</p>
          <p className="lp-footer-copy">© 2026 Expertène. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function AuthScreen({ step, setStep }: { step: AuthStep; setStep: (s: AuthStep) => void }) {
  const mode = step === 'signup' ? 'signup' : 'signin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('IN');
  const [userLocation, setUserLocation] = useState('Visakhapatnam, Andhra Pradesh');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [mapResults, setMapResults] = useState<{ name: string; coords: [number, number] }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const signupMapRef = useRef<L.Map | null>(null);
  const signupMarkerRef = useRef<L.Marker | null>(null);

  const countryObj = useMemo(() => COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0], [country]);

  // Leaflet map setup when showMapPicker toggles
  useEffect(() => {
    if (!showMapPicker || !mapContainerRef.current) return;
    if (signupMapRef.current) {
      setTimeout(() => signupMapRef.current?.invalidateSize(), 80);
      return;
    }

    const initialCoords = countryObj.regions.find((r) => r.name.toLowerCase().includes(userLocation.toLowerCase()))?.coords ?? countryObj.center;
    const map = L.map(mapContainerRef.current).setView(initialCoords, countryObj.zoom + 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    const marker = L.marker(initialCoords, { draggable: true }).addTo(map);
    marker.bindPopup(userLocation).openPopup();

    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`);
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || 'Pinned place';
        const st = data.address?.state ? `, ${data.address.state}` : '';
        const loc = `${city}${st}`;
        setUserLocation(loc);
        marker.bindPopup(loc).openPopup();
      } catch {
        setUserLocation(`${pos.lat.toFixed(2)}, ${pos.lng.toFixed(2)}`);
      }
    });

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || 'Pinned place';
        const st = data.address?.state ? `, ${data.address.state}` : '';
        const loc = `${city}${st}`;
        setUserLocation(loc);
        marker.bindPopup(loc).openPopup();
      } catch {
        setUserLocation(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
      }
    });

    signupMapRef.current = map;
    signupMarkerRef.current = marker;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      signupMapRef.current = null;
      signupMarkerRef.current = null;
    };
  }, [showMapPicker]);

  const handleCountryChange = (nextCountry: string) => {
    setCountry(nextCountry);
    const c = COUNTRIES.find((x) => x.code === nextCountry) ?? COUNTRIES[0];
    const defaultRegion = c.regions[0] ?? { name: c.name, coords: c.center };
    setUserLocation(defaultRegion.name);
    setMapSearch('');
    setMapResults([]);

    if (signupMapRef.current && signupMarkerRef.current) {
      signupMapRef.current.setView(defaultRegion.coords, c.zoom + 5);
      signupMarkerRef.current.setLatLng(defaultRegion.coords);
      signupMarkerRef.current.bindPopup(defaultRegion.name).openPopup();
    }
  };

  const selectRegion = (reg: { name: string; coords: [number, number] }) => {
    setUserLocation(reg.name);
    if (signupMapRef.current && signupMarkerRef.current) {
      signupMapRef.current.setView(reg.coords, 12);
      signupMarkerRef.current.setLatLng(reg.coords);
      signupMarkerRef.current.bindPopup(reg.name).openPopup();
    }
  };

  const handleMapSearchChange = async (val: string) => {
    setMapSearch(val);
    if (!val.trim()) { setMapResults([]); return; }
    const local = countryObj.regions.filter((r) => r.name.toLowerCase().includes(val.toLowerCase()));
    setMapResults(local);

    if (val.trim().length >= 3) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=${countryObj.code.toLowerCase()}&q=${encodeURIComponent(val)}&limit=5`);
        const data = await res.json();
        const api = data.map((item: any) => ({
          name: item.display_name.split(',').slice(0, 3).join(','),
          coords: [parseFloat(item.lat), parseFloat(item.lon)] as [number, number],
        }));
        setMapResults([...local, ...api.filter((a: any) => !local.some((l) => l.name === a.name))]);
      } catch { /* silently fallback */ }
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.address || {};
          const countryCode = (addr.country_code || '').toUpperCase();
          const place = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || 'My Location';
          const st = addr.state ? `, ${addr.state}` : '';
          const fullPlace = `${place}${st}`;

          const match = COUNTRIES.find((c) => c.code === countryCode);
          if (match) setCountry(match.code);
          setUserLocation(fullPlace);

          if (signupMapRef.current && signupMarkerRef.current) {
            signupMapRef.current.setView([latitude, longitude], 13);
            signupMarkerRef.current.setLatLng([latitude, longitude]);
            signupMarkerRef.current.bindPopup(`📍 ${fullPlace}`).openPopup();
          }
        } catch {
          setUserLocation(`Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
        } finally {
          setDetectingLoc(false);
        }
      },
      () => {
        setDetectingLoc(false);
        setError('Location access denied or unavailable. Please pick a region manually.');
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      const friendly: Record<string, string> = {
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/invalid-credential': 'Invalid email or password. Please try again.',
      };
      const code = Object.keys(friendly).find((k) => raw.includes(k));
      setError(code ? friendly[code] : raw);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      if (raw.includes('popup-closed-by-user')) { setLoading(false); return; }
      setError(raw);
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-art">
        <span className="brand-mark auth-brand-mark"><Zap size={21} fill="currentColor" /></span>
        <h1>Good work<br /><em>starts here.</em></h1>
        <p>Find trusted local professionals, book with confidence, and keep every detail in one place.</p>
        <div className="auth-sticker"><Check size={15} /> 125+ verified professionals</div>
      </div>
      <div className="auth-card">
        {/* Back button → always goes to landing */}
        <button className="auth-back-btn" onClick={() => { setError(''); setStep(mode === 'signup' ? 'signin' : 'landing'); }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="brand"><span className="brand-mark"><Zap size={18} fill="currentColor" /></span> Expertène</div>
        <p className="eyebrow">{mode === 'signin' ? 'WELCOME BACK' : 'CREATE YOUR ACCOUNT'}</p>
        <h2>{mode === 'signin' ? 'Welcome back!' : 'Join Expertène today'}</h2>
        <p className="auth-subtitle">{mode === 'signin' ? 'Sign in to continue to Expertène.' : 'Save services, manage bookings, and publish your own work.'}</p>
        <button className="google-button" onClick={() => void handleGoogle()} disabled={loading}><GoogleIcon /> {loading ? 'Connecting...' : 'Continue with Google'}</button>
        <div className="auth-divider"><span>or continue with</span></div>
        <form onSubmit={submit}>
          {mode === 'signup' && <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Raj Sharma" /></label>}
          <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" /></label>
          <label className="password-label">Password
            <div className="password-wrap">
              <input type={showPassword ? 'text' : 'password'} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="At least 6 characters" />
              <button type="button" className={`eye-toggle ${showPassword ? 'visible' : ''}`} onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <span className="eye-icon"><EyeOff size={18} className="eye-closed" /><Eye size={18} className="eye-open" /></span>
              </button>
            </div>
          </label>

          {/* ── Country & Map Region Selector in Signup ── */}
          {mode === 'signup' && (
            <div className="signup-location-section">
              <label>Country
                <select value={country} onChange={(e) => handleCountryChange(e.target.value)} className="country-select">
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.dial})</option>)}
                </select>
              </label>

              <div className="signup-region-header">
                <label style={{margin:0}}>City / Region</label>
                <button type="button" className="location-detect-btn-sm" onClick={detectLocation} disabled={detectingLoc}>
                  <Navigation size={12} /> {detectingLoc ? 'Detecting GPS...' : 'Current location'}
                </button>
              </div>

              <div className="signup-loc-bar">
                <div className="loc-bar-info">
                  <MapPin size={15} className="loc-pin-icon" />
                  <span><strong>{userLocation}</strong> &middot; {countryObj.name}</span>
                </div>
                <button type="button" className="signup-map-toggle-btn" onClick={() => setShowMapPicker((v) => !v)}>
                  {showMapPicker ? 'Close map' : 'Choose on map'}
                </button>
              </div>

              {showMapPicker && (
                <div className="signup-map-card">
                  <div className="map-search-row">
                    <Search size={14} />
                    <input
                      type="text"
                      value={mapSearch}
                      onChange={(e) => void handleMapSearchChange(e.target.value)}
                      placeholder={`Search places in ${countryObj.name}...`}
                    />
                    {mapSearch && <button type="button" className="clear-btn" onClick={() => { setMapSearch(''); setMapResults([]); }}><X size={13} /></button>}
                  </div>

                  {mapResults.length > 0 && (
                    <div className="search-results-list">
                      {mapResults.slice(0, 5).map((r, i) => (
                        <button key={`${r.name}-${i}`} type="button" className="search-result-item" onClick={() => { selectRegion(r); setMapResults([]); }}>
                          <MapPin size={12} /> <span>{r.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="signup-leaflet-map" ref={mapContainerRef} />

                  <div className="signup-regions-tray">
                    <small className="regions-heading">Places in {countryObj.name}:</small>
                    <div className="region-chips-grid">
                      {countryObj.regions.map((reg) => {
                        const short = reg.name.split(',')[0];
                        return (
                          <button
                            key={reg.name}
                            type="button"
                            className={`region-chip ${userLocation.includes(short) ? 'active' : ''}`}
                            onClick={() => selectRegion(reg)}
                          >
                            <MapPin size={11} /> {short}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full" disabled={loading}>
            {loading ? 'Opening your workspace...' : mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowUpRight size={16} />
          </button>
        </form>
        <p className="auth-switch">
          {mode === 'signin' ? 'New to Expertène?' : 'Already have an account?'}{' '}
          <button onClick={() => { setStep(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
            {mode === 'signin' ? 'Create account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

// Form field types for custom booking forms
type FormFieldType = 'text' | 'textarea' | 'select' | 'date' | 'number' | 'phone';
type FormField = { id: string; label: string; type: FormFieldType; placeholder?: string; required: boolean; options?: string[] };

// Recommended form templates based on service type
const FORM_RECOMMENDATIONS: Record<string, FormField[]> = {
  Photography: [
    { id: 'event_type', label: 'Type of event', type: 'select', required: true, options: ['Wedding', 'Pre-Wedding', 'Birthday', 'Corporate Event', 'Portrait Session', 'Product Shoot', 'Other'] },
    { id: 'venue', label: 'Venue / Location', type: 'text', placeholder: 'e.g. Beach Road, Visakhapatnam', required: true },
    { id: 'guest_count', label: 'Approx. number of guests', type: 'number', placeholder: 'e.g. 150', required: false },
    { id: 'special_requests', label: 'Special requests or ideas', type: 'textarea', placeholder: 'Drone shots, specific poses, colour palette...', required: false },
  ],
  default: [
    { id: 'description', label: 'Describe what you need', type: 'textarea', placeholder: 'Tell the professional what you need in detail...', required: true },
    { id: 'address', label: 'Service address', type: 'text', placeholder: 'Where should the professional come?', required: false },
    { id: 'special_requests', label: 'Any special requirements?', type: 'textarea', placeholder: 'Anything else the professional should know...', required: false },
  ],
};

function BookingFlow({ professional, onBack, onConfirm, onCancel }: {
  professional: Professional;
  onBack: () => void;
  onConfirm: (date: string, timeSlot?: string, customResponses?: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}) {
  const STEPS = ['Date', 'Time Slot', 'Details', 'Review'] as const;
  type Step = 0 | 1 | 2 | 3;

  const [step, setStep] = useState<Step>(0);
  const [date, setDate] = useState('2026-10-12');
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [saving, setSaving] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const recommended = FORM_RECOMMENDATIONS[professional.tags?.[0] ?? ''] ?? FORM_RECOMMENDATIONS.default;
  const [fields, setFields] = useState<FormField[]>(recommended);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const addField = (type: FormFieldType) => {
    const id = `field_${Date.now()}`;
    setFields(f => [...f, { id, label: 'New field', type, placeholder: 'Enter value...', required: false }]);
  };
  const removeField = (id: string) => setFields(f => f.filter(ff => ff.id !== id));
  const setResponse = (id: string, value: string) => setResponses(r => ({ ...r, [id]: value }));

  const confirm = async () => {
    setSaving(true);
    await onConfirm(date, timeSlot, responses);
    setSaving(false);
  };

  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];
  const dateDisplay = new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (cancelled) return (
    <div className="booking-result cancelled-result">
      <div className="result-icon"><X size={34} /></div>
      <h1>Booking cancelled</h1>
      <p>No request was sent. You can come back whenever you are ready.</p>
      <button className="primary-button" onClick={onBack}>Back to profile</button>
    </div>
  );

  return (
    <div className="booking-flow">
      <button className="back-button" onClick={step === 0 ? onBack : () => setStep((step - 1) as Step)}>
        <ArrowLeft size={16} /> {step === 0 ? `Back to ${professional.name}` : `Back to ${STEPS[step - 1]}`}
      </button>

      <div className="booking-flow-header">
        <div>
          <p className="eyebrow">BOOKING FLOW &middot; {professional.name}</p>
          <h1>Book a service</h1>
          <p>Step {step + 1} of {STEPS.length} &mdash; {STEPS[step]}</p>
        </div>
        <div className="flow-steps">
          {STEPS.map((s, i) => (
            <span key={s} className={`flow-step ${step === i ? 'current' : i < step ? 'done' : ''}`}>
              <span className="flow-step-num">{i < step ? <Check size={11} /> : i + 1}</span>
              <small>{s}</small>
            </span>
          ))}
        </div>
      </div>

      <div className="booking-flow-grid">
        <div className="booking-step-card panel">

          {step === 0 && (
            <>
              <div className="step-heading">
                <span className="step-label">STEP 01</span>
                <h2>When should it happen?</h2>
                <p>Pick your preferred date. {professional.name} is generally available weekdays and weekends.</p>
              </div>
              <div className="flow-calendar">
                <div className="flow-calendar-title">
                  <strong>October 2026</strong>
                  <span><button>&#8249;</button><button>&#8250;</button></span>
                </div>
                <div className="calendar-week">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <span key={d}>{d}</span>)}</div>
                <div className="flow-date-grid">
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = String(i + 1).padStart(2, '0');
                    const val = `2026-10-${day}`;
                    const isPast = i < 2;
                    return (
                      <button
                        key={val}
                        className={`flow-date-btn ${date === val ? 'selected' : ''} ${isPast ? 'disabled' : ''}`}
                        disabled={isPast}
                        onClick={() => setDate(val)}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="selected-date-display">
                <CalendarDays size={16} />
                <span>Selected: <strong>{dateDisplay}</strong></span>
              </div>
              <button className="primary-button full" onClick={() => setStep(1)}>
                Continue to Time Slot <ArrowUpRight size={16} />
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="step-heading">
                <span className="step-label">STEP 02</span>
                <h2>Choose a time slot</h2>
                <p>All slots are in IST. {professional.name} usually responds within 2 hours.</p>
              </div>
              <div className="time-slots-grid">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`time-slot-btn ${timeSlot === slot ? 'selected' : ''}`}
                    onClick={() => setTimeSlot(slot)}
                  >
                    <Clock size={13} />
                    {slot}
                  </button>
                ))}
              </div>
              <div className="selected-date-display" style={{marginTop: '20px'}}>
                <Clock size={16} />
                <span>Selected: <strong>{timeSlot}</strong> on <strong>{dateDisplay}</strong></span>
              </div>
              <button className="primary-button full" onClick={() => setStep(2)}>
                Continue to Details <ArrowUpRight size={16} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="step-heading">
                <span className="step-label">STEP 03</span>
                <h2>Add booking details</h2>
                <p>Help {professional.name} prepare for your appointment.</p>
              </div>
              <div className="booking-form-recommendation">
                <Sparkles size={14} />
                <span>Smart form suggested for <strong>{professional.tags?.[0] ?? 'this service'}</strong></span>
              </div>
              <div className="custom-fields-list">
                {fields.map((field) => (
                  <div key={field.id} className="custom-field-row">
                    <div className="custom-field-header">
                      <label className="custom-field-label">{field.label}{field.required && <span className="req-star">*</span>}</label>
                      <button className="field-remove-btn" onClick={() => removeField(field.id)} title="Remove field"><X size={13} /></button>
                    </div>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="field-input"
                        placeholder={field.placeholder}
                        value={responses[field.id] ?? ''}
                        onChange={e => setResponse(field.id, e.target.value)}
                        rows={3}
                      />
                    ) : field.type === 'select' && field.options ? (
                      <select
                        className="field-input"
                        value={responses[field.id] ?? ''}
                        onChange={e => setResponse(field.id, e.target.value)}
                      >
                        <option value="">Select an option...</option>
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        className="field-input"
                        type={field.type}
                        placeholder={field.placeholder}
                        value={responses[field.id] ?? ''}
                        onChange={e => setResponse(field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="add-field-section">
                <p className="eyebrow" style={{margin:'0 0 10px'}}>ADD A FIELD</p>
                <div className="add-field-pills">
                  {(['text','textarea','select','number','phone'] as FormFieldType[]).map(type => (
                    <button key={type} className="add-field-pill" onClick={() => addField(type)}>
                      <Plus size={12} /> {type}
                    </button>
                  ))}
                </div>
              </div>
              <button className="primary-button full" style={{marginTop: '24px'}} onClick={() => setStep(3)}>
                Review Booking <ArrowUpRight size={16} />
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="step-heading">
                <span className="step-label">STEP 04</span>
                <h2>Review your request</h2>
                <p>Everything looks good? Send your booking request.</p>
              </div>
              <div className="review-card">
                <img src={professional.image} alt="" />
                <div>
                  <strong>{professional.name}</strong>
                  <p>{professional.role}</p>
                  <span><Star size={13} fill="currentColor" /> {professional.rating} &middot; {professional.location}</span>
                </div>
              </div>
              <div className="review-lines">
                <div><span>Date</span><strong>{dateDisplay}</strong></div>
                <div><span>Time</span><strong>{timeSlot}</strong></div>
                <div><span>Estimated price</span><strong>{professional.price}</strong></div>
                {Object.entries(responses).filter(([, v]) => v).map(([k, v]) => {
                  const field = fields.find(f => f.id === k);
                  return field ? <div key={k}><span>{field.label}</span><strong>{v}</strong></div> : null;
                })}
              </div>
              <button className="primary-button full" disabled={saving} onClick={confirm}>
                {saving ? 'Sending request...' : 'Confirm booking'} <Check size={16} />
              </button>
              <button className="cancel-link" onClick={() => setCancelled(true)}>Cancel booking</button>
            </>
          )}
        </div>

        <aside className="booking-summary-card">
          <p className="eyebrow">YOUR REQUEST</p>
          <h3>{professional.role}</h3>
          <p>We will notify {professional.name} and keep you updated in Messages.</p>
          <div className="summary-row"><span>Professional</span><strong>{professional.name}</strong></div>
          <div className="summary-row"><span>Date</span><strong>{date}</strong></div>
          <div className="summary-row"><span>Time</span><strong>{timeSlot}</strong></div>
          <div className="summary-row"><span>From</span><strong>{professional.price}</strong></div>
          <div className="booking-progress-track">
            {STEPS.map((s, i) => (
              <div key={s} className={`progress-track-step ${i <= step ? 'done' : ''}`}>
                <div className="progress-track-dot">{i < step ? <Check size={10} /> : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <button className="outline-button full" onClick={onCancel}><X size={15} /> Leave booking</button>
        </aside>
      </div>
    </div>
  );
}

function AddServiceModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (details: Omit<ServiceRecord, 'id'>) => Promise<void> }) {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [price, setPrice] = useState(''); const [date, setDate] = useState('2026-10-20'); const [imageUrl, setImageUrl] = useState(photos.camera); const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaving(true); await onSubmit({ title, description, price: Number(price), available_date: date, image_url: imageUrl }); setSaving(false); };
  return <div className="modal-backdrop" onClick={onClose}><div className="service-modal" onClick={(e) => e.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">PUBLISH YOUR WORK</p><h2>Add a service</h2></div><button onClick={onClose}><X size={19} /></button></div><form className="service-form" onSubmit={submit}><label>Service title<input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} placeholder="Wedding photography" /></label><label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} placeholder="Describe what customers will receive..." /></label><div className="form-two"><label>Starting price<input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="15000" /></label><label>Available date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label></div><label>Image URL<input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required type="url" placeholder="https://..." /></label><div className="service-preview"><img src={imageUrl} alt="Preview" /><div><strong>{title || 'Your service title'}</strong><small>{description || 'Your description will appear here.'}</small></div></div><button className="primary-button full" disabled={saving}>{saving ? 'Publishing service...' : 'Publish service'} <ArrowUpRight size={16} /></button></form></div></div>;
}

export default App;
