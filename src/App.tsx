import { useState, useEffect } from 'react';
import { supabase, Car, Reservation } from './lib/supabase';
import { Car as CarIcon, Calendar, User, Phone, Mail, LogIn, LogOut, Plus, Trash2, Edit, X, Check, ChevronRight, Menu, PhoneCall } from 'lucide-react';

type View = 'home' | 'admin-login' | 'admin-panel';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [cars, setCars] = useState<Car[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchCars();
    checkAdminSession();
  }, []);

  async function fetchCars() {
    const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (data) setCars(data);
    setLoading(false);
  }

  async function fetchReservations() {
    const { data } = await supabase.from('reservations').select('*, cars(*)').order('created_at', { ascending: false });
    if (data) setReservations(data);
  }

  function checkAdminSession() {
    const session = sessionStorage.getItem('admin_session');
    if (session === 'true') setIsAdmin(true);
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');

    const { data, error } = await supabase.rpc('verify_admin_password', {
      p_username: adminUsername,
      p_password: adminPassword
    });

    if (error || !data) {
      setLoginError('Kullanici adi veya sifre hatali!');
      return;
    }

    if (data) {
      setIsAdmin(true);
      sessionStorage.setItem('admin_session', 'true');
      setView('admin-panel');
      fetchReservations();
      setAdminUsername('');
      setAdminPassword('');
    }
  }

  function handleAdminLogout() {
    setIsAdmin(false);
    sessionStorage.removeItem('admin_session');
    setView('home');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
              <CarIcon className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-bold text-slate-900">Rant a Car</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => setView('home')} className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">
                Araclar
              </button>
              {isAdmin ? (
                <>
                  <button onClick={() => { setView('admin-panel'); fetchReservations(); }} className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">
                    Admin Panel
                  </button>
                  <button onClick={handleAdminLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors font-medium">
                    <LogOut className="w-4 h-4" />
                    Cikis Yap
                  </button>
                </>
              ) : (
                <button onClick={() => setView('admin-login')} className="flex items-center gap-2 bg-emerald-600 text-red px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-slate-100 pt-4 animate-fade-in">
              <div className="flex flex-col gap-3">
                <button onClick={() => { setView('home'); setMobileMenuOpen(false); }} className="text-left text-slate-600 hover:text-emerald-600 transition-colors font-medium py-2">
                  Araclar
                </button>
                {isAdmin ? (
                  <>
                    <button onClick={() => { setView('admin-panel'); fetchReservations(); setMobileMenuOpen(false); }} className="text-left text-slate-600 hover:text-emerald-600 transition-colors font-medium py-2">
                      Admin Panel
                    </button>
                    <button onClick={() => { handleAdminLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors font-medium py-2">
                      <LogOut className="w-4 h-4" />
                      Cikis Yap
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setView('admin-login'); setMobileMenuOpen(false); }} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium w-fit">
                    <LogIn className="w-4 h-4" />
                    Admin Girisi
                  </button>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'home' && (
          <HomePage
            cars={cars}
            onSelectCar={(car) => { setSelectedCar(car); setShowReservationModal(true); }}
            onRefresh={fetchCars}
          />
        )}

        {view === 'admin-login' && (
          <AdminLoginPage
            username={adminUsername}
            password={adminPassword}
            error={loginError}
            onUsernameChange={setAdminUsername}
            onPasswordChange={setAdminPassword}
            onSubmit={handleAdminLogin}
          />
        )}

        {view === 'admin-panel' && isAdmin && (
          <AdminPanelPage
            cars={cars}
            reservations={reservations}
            onRefreshCars={fetchCars}
            onRefreshReservations={fetchReservations}
            onAddCar={() => { setEditingCar(null); setShowCarModal(true); }}
            onEditCar={(car) => { setEditingCar(car); setShowCarModal(true); }}
          />
        )}
      </main>

      {/* Reservation Modal */}
      {showReservationModal && selectedCar && (
        <ReservationModal
          car={selectedCar}
          onClose={() => { setShowReservationModal(false); setSelectedCar(null); }}
          onSuccess={() => { setShowReservationModal(false); setSelectedCar(null); fetchCars(); }}
        />
      )}

      {/* Car Modal (Add/Edit) */}
      {showCarModal && isAdmin && (
        <CarModal
          car={editingCar}
          onClose={() => { setShowCarModal(false); setEditingCar(null); }}
          onSuccess={() => { setShowCarModal(false); setEditingCar(null); fetchCars(); }}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CarIcon className="w-8 h-8 text-emerald-500" />
                <span className="text-xl font-bold">Rant a Car</span>
              </div>
              <p className="text-slate-400">Türkiye'nin en güvenilir araç kiralama platformu. 7/24 destek ve uygun fiyatlarla araç kiralamanın en kolay yolu.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Iletisim</h3>
              <div className="space-y-3 text-slate-400">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  <span>0850 123 45 67</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@rantacar.com</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Calisma Saatleri</h3>
              <div className="text-slate-400">
                <p>Pazartesi - Cuma: 08:00 - 20:00</p>
                <p>Cumartesi: 09:00 - 18:00</p>
                <p>Pazar: 10:00 - 16:00</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500">
            <p>&copy; 2024 Rant a Car. Tüm haklari saklidir.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Home Page Component
function HomePage({ cars, onSelectCar, onRefresh }: { cars: Car[]; onSelectCar: (car: Car) => void; onRefresh: () => void }) {
  const availableCars = cars.filter(car => car.is_available);
  const unavailableCars = cars.filter(car => !car.is_available);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white py-16 sm:py-24 mb-12 rounded-none sm:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: '30px 30px'}}></div>
        <div className="relative max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Hayalinizdaki Araci Kiralayin
          </h1>
          <p className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-2xl">
            Genis araç filomuz ile istediginiz araci günlük veya haftalik kiralayabilirsiniz. Uygun fiyatlar, 7/24 destek.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => document.getElementById('cars-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
              Araclari Incele
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-12">
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-100 text-center">
          <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-1">{cars.length}+</div>
          <div className="text-slate-600 text-sm sm:text-base">Arac</div>
        </div>
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-100 text-center">
          <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-1">{availableCars.length}</div>
          <div className="text-slate-600 text-sm sm:text-base">Müsait</div>
        </div>
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-100 text-center">
          <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-1">7/24</div>
          <div className="text-slate-600 text-sm sm:text-base">Destek</div>
        </div>
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-slate-100 text-center">
          <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-1">%100</div>
          <div className="text-slate-600 text-sm sm:text-base">Güvenli</div>
        </div>
      </section>

      {/* Cars Section */}
      <section id="cars-section">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">Müsait Araclar</h2>
        {availableCars.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Su anda müsait araç bulunmamaktadir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {availableCars.map((car, index) => (
              <CarCard key={car.id} car={car} onSelect={onSelectCar} index={index} />
            ))}
          </div>
        )}

        {unavailableCars.length > 0 && (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">Kiralanmis Araclar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {unavailableCars.map((car, index) => (
                <CarCard key={car.id} car={car} onSelect={() => {}} disabled index={index} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// Car Card Component
function CarCard({ car, onSelect, disabled, index }: { car: Car; onSelect: (car: Car) => void; disabled?: boolean; index: number }) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-slide-up ${disabled ? 'opacity-60' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img src={car.image_url} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${car.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {car.is_available ? 'Müsait' : 'Kiralanmis'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg text-slate-900 mb-1">{car.brand} {car.model}</h3>
        <p className="text-slate-500 text-sm mb-3">{car.year} Model</p>
        {car.description && (
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">{car.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-emerald-600">{car.price_per_day.toLocaleString('tr-TR')}</span>
            <span className="text-slate-500 text-sm ml-1">TL/gün</span>
          </div>
          {car.is_available && (
            <button
              onClick={() => onSelect(car)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Kirala
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Admin Login Page
function AdminLoginPage({
  username,
  password,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit
}: {
  username: string;
  password: string;
  error: string;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
        <div className="text-center mb-8">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Girisi</h1>
          <p className="text-slate-500 mt-2">Yönetim paneline erisim için giris yapin</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Kullanici Adi</label>
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              placeholder="Kullanici adinizi girin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              placeholder="Sifrenizi girin"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Giris Yap
          </button>
        </form>
      </div>
    </div>
  );
}

// Admin Panel Page
function AdminPanelPage({
  cars,
  reservations,
  onRefreshCars,
  onRefreshReservations,
  onAddCar,
  onEditCar
}: {
  cars: Car[];
  reservations: Reservation[];
  onRefreshCars: () => void;
  onRefreshReservations: () => void;
  onAddCar: () => void;
  onEditCar: (car: Car) => void;
}) {
  const [activeTab, setActiveTab] = useState<'cars' | 'reservations'>('cars');

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Paneli</h1>
        <button
          onClick={onAddCar}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Yeni Arac Ekle
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('cars')}
          className={`px-5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'cars' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          Araclar ({cars.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'reservations' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          Rezervasyonlar ({reservations.length})
        </button>
      </div>

      {activeTab === 'cars' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Arac</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 hidden sm:table-cell">Yil</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Fiyat</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Durum</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Islemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={car.image_url} alt={car.model} className="w-12 h-12 rounded-lg object-cover hidden sm:block" />
                        <div>
                          <div className="font-medium text-slate-900">{car.brand} {car.model}</div>
                          <div className="text-sm text-slate-500 sm:hidden">{car.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 hidden sm:table-cell">{car.year}</td>
                    <td className="px-6 py-4 text-slate-600">{car.price_per_day.toLocaleString('tr-TR')} TL</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${car.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {car.is_available ? 'Müsait' : 'Kiralanmis'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditCar(car)}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Bu araci silmek istediginize emin misiniz?')) {
                              await supabase.from('cars').delete().eq('id', car.id);
                              onRefreshCars();
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Musteri</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Arac</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 hidden sm:table-cell">Tarihler</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Durum</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Islemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">{res.customer_name}</div>
                        <div className="text-sm text-slate-500">{res.customer_email}</div>
                        <div className="text-sm text-slate-500 md:hidden">{res.cars?.brand} {res.cars?.model}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 hidden md:table-cell">
                      {res.cars?.brand} {res.cars?.model}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="text-sm text-slate-600">
                        <div>{new Date(res.start_date).toLocaleDateString('tr-TR')}</div>
                        <div className="text-slate-400">- {new Date(res.end_date).toLocaleDateString('tr-TR')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        res.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        res.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {res.status === 'pending' ? 'Bekliyor' : res.status === 'confirmed' ? 'Onayli' : res.status === 'completed' ? 'Tamamlandi' : 'Iptal'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={res.status}
                          onChange={async (e) => {
                            await supabase.from('reservations').update({ status: e.target.value }).eq('id', res.id);
                            onRefreshReservations();
                          }}
                          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                        >
                          <option value="pending">Bekliyor</option>
                          <option value="confirmed">Onayli</option>
                          <option value="completed">Tamamlandi</option>
                          <option value="cancelled">Iptal</option>
                        </select>
                        <button
                          onClick={async () => {
                            if (confirm('Bu rezervasyonu silmek istediginize emin misiniz?')) {
                              await supabase.from('reservations').delete().eq('id', res.id);
                              onRefreshReservations();
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Reservation Modal
function ReservationModal({ car, onClose, onSuccess }: { car: Car; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateTotal = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 0;
    return days * car.price_per_day;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      setError('Bitis tarihi baslangiç tarihinden sonra olmalidir.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('reservations').insert({
      car_id: car.id,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      start_date: formData.start_date,
      end_date: formData.end_date,
      total_price: days * car.price_per_day,
      notes: formData.notes || null,
      status: 'pending'
    });

    if (insertError) {
      setError('Rezervasyon olusturulurken bir hata olustu.');
      setLoading(false);
      return;
    }

    await supabase.from('cars').update({ is_available: false }).eq('id', car.id);
    setLoading(false);
    onSuccess();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Rezervasyon Yap</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
            <img src={car.image_url} alt={car.model} className="w-20 h-16 rounded-lg object-cover" />
            <div>
              <h3 className="font-semibold text-slate-900">{car.brand} {car.model}</h3>
              <p className="text-slate-500 text-sm">{car.year} Model</p>
              <p className="text-emerald-600 font-medium">{car.price_per_day.toLocaleString('tr-TR')} TL/gün</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Ad Soyad
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                placeholder="Adiniz ve soyadiniz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                E-posta
              </label>
              <input
                type="email"
                required
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefon
              </label>
              <input
                type="tel"
                required
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Baslangiç
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Bitis
                </label>
                <input
                  type="date"
                  required
                  min={formData.start_date || today}
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notlar (Istemsi)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                rows={3}
                placeholder="Eklemek istediginiz notlar..."
              />
            </div>

            {calculateTotal() > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Toplam Tutar:</span>
                  <span className="text-2xl font-bold text-emerald-600">{calculateTotal().toLocaleString('tr-TR')} TL</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Islemleniyor...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Rezervasyon Yap
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Car Modal (Add/Edit)
function CarModal({ car, onClose, onSuccess }: { car: Car | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    brand: car?.brand || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    price_per_day: car?.price_per_day || 0,
    image_url: car?.image_url || '',
    description: car?.description || '',
    is_available: car?.is_available ?? true
  });
  const [loading, setLoading] = useState(false);
  const isEditing = !!car;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEditing) {
      await supabase.from('cars').update({
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        price_per_day: formData.price_per_day,
        image_url: formData.image_url,
        description: formData.description || null,
        is_available: formData.is_available
      }).eq('id', car.id);
    } else {
      await supabase.from('cars').insert({
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        price_per_day: formData.price_per_day,
        image_url: formData.image_url,
        description: formData.description || null,
        is_available: formData.is_available
      });
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Araci Düzenle' : 'Yeni Arac Ekle'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Marka</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                placeholder="BMW"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Model</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                placeholder="320i"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Yil</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                min="2000"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Günlük Fiyat (TL)</label>
              <input
                type="number"
                required
                value={formData.price_per_day}
                onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Resim URL</label>
            <input
              type="url"
              required
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Aciklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
              rows={3}
              placeholder="Arac hakkinda bilgiler..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="is_available" className="text-slate-700">Müsait olarak isaretle</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEditing ? 'Güncelle' : 'Ekle'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
