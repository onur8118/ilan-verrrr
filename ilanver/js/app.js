/* ============================================
   İlanVer – Application Controller
   ============================================ */

const App = {
  currentPage: 'home',
  searchQuery: '',
  currentCityFilter: 'all',
  currentCategoryFilter: 'all',
  currentSort: 'newest',
  selectedImageData: null,
  lastHash: null,

  async init() {
    try {
      // Google OAuth geri dönüşünde hash'te access_token olabilir
      // Supabase bunu kendisi işler ama önce biraz bekleyelim
      const hash = window.location.hash || '';
      if (hash.includes('access_token') || hash.includes('error_description')) {
        // OAuth callback: Supabase'in session'ı işlemesini bekle
        await new Promise(resolve => setTimeout(resolve, 500));
        // Temiz URL'ye geç
        window.history.replaceState(null, '', window.location.pathname + '#/');
      }

      await DataStore.init();
      
      try {
         const savedTheme = localStorage.getItem('ilanver_theme');
         if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            const btn = document.getElementById('theme-toggle-btn');
            if(btn) btn.innerHTML = '☀️';
         }
      } catch (e) {
         console.warn('Storage read blocked', e);
      }
  
      this.updateHeaderUI();
  
      window.addEventListener('hashchange', () => this.handleRoute());
      this.handleRoute();
    } catch(e) {
      console.error('App init failed critically:', e);
    }
  },

  updateHeaderUI() {
    const user = DataStore.getUser();
    console.log('🟢 updateHeaderUI:', user ? user.email : 'NULL');
    const navMessages = document.getElementById('nav-messages');
    const navFavorites = document.getElementById('nav-favorites');
    const navProfile = document.getElementById('nav-profile');
    const navProfileAvatar = document.getElementById('nav-profile-avatar');
    const navCreate = document.getElementById('nav-create');
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');

    if (user) {
       if(navMessages) navMessages.style.display = 'flex';
       if(navFavorites) navFavorites.style.display = 'flex';
       if(navProfile) navProfile.style.display = 'none';
       if(navProfileAvatar) {
          navProfileAvatar.style.display = 'flex';
          const firstLetter = (user.name || user.email || 'U').trim().charAt(0).toUpperCase();
          navProfileAvatar.textContent = firstLetter;
          
          const avatarColors = ['#E11D48', '#BE185D', '#1D4ED8', '#047857', '#B45309', '#7C3AED', '#0369A1', '#4D7C0F'];
          const colorIndex = firstLetter.charCodeAt(0) % avatarColors.length;
          navProfileAvatar.style.backgroundColor = avatarColors[colorIndex];
       }
       if(navCreate) navCreate.style.display = 'inline-block';
       if(navLogin) navLogin.style.display = 'none';
       if(navLogout) navLogout.style.display = 'inline-block';
    } else {
       if(navMessages) navMessages.style.display = 'none';
       if(navFavorites) navFavorites.style.display = 'none';
       if(navProfile) navProfile.style.display = 'none';
       if(navProfileAvatar) navProfileAvatar.style.display = 'none';
       if(navCreate) navCreate.style.display = 'none';
       if(navLogin) navLogin.style.display = 'inline-block';
       if(navLogout) navLogout.style.display = 'none';
    }
  },

  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const btn = document.getElementById('theme-toggle-btn');
    if (isDark) {
       document.documentElement.removeAttribute('data-theme');
       localStorage.setItem('ilanver_theme', 'light');
       if(btn) btn.innerHTML = '🌙';
    } else {
       document.documentElement.setAttribute('data-theme', 'dark');
       localStorage.setItem('ilanver_theme', 'dark');
       if(btn) btn.innerHTML = '☀️';
    }
  },

  escapeHTML(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  async handleRoute() {
    const hash = window.location.hash || '#/';
    const parts = hash.replace('#/', '').split('/');
    const page = parts[0] || 'home';

    // Her route değişiminde header'ı güncelle (oturum durumu doğru yansısın)
    this.updateHeaderUI();

    this.currentPage = page;
    let html = '';

    const container = document.getElementById('page-container');
    if(container && this.currentPage !== page) {
       container.innerHTML = '<div style="text-align:center; padding:100px; font-size:20px; color:var(--text-muted);">Yükleniyor... ⏳</div>';
    }

    try {
      // Korumalı Rotalar (Route Guards)
      const user = DataStore.getUser();
      const protectedRoutes = ['create', 'profile', 'favorites', 'messages'];
      
      if (protectedRoutes.includes(page) && !user) {
         Components.showToast('Bu sayfayı görüntülemek için giriş yapmalısınız.', 'error');
         this.navigate('#/login');
         return;
      }

      const navbar = document.querySelector('.top-navbar');
      if (navbar) {
         if (page === 'login' || page === 'register') {
            navbar.style.display = 'none';
         } else {
            navbar.style.display = '';
         }
      }

      switch (page) {
        case 'home': case '': html = await Pages.renderHome(); break;
        case 'login': html = await Pages.renderLogin(); break;
        case 'register': html = await Pages.renderRegister(); break;
        case 'create': 
          this.selectedImageData = null; 
          html = await Pages.renderCreate(); 
          break;
        case 'detail': html = await Pages.renderDetail(parts[1]); break;
        case 'profile': html = await Pages.renderProfile(); break;
        case 'favorites': html = await Pages.renderFavorites(); break;
        case 'messages': html = await Pages.renderMessages(); break;
        default: html = await Pages.renderHome();
      }
      this.renderPage(html);
    } catch(err) {
      console.error('Yükleme hatası:', err);
      if(container) {
         container.innerHTML = `<div style="text-align:center; padding:100px; font-size:20px; color:#EF4444;">
           Bağlantı hatası oluştu! Lütfen internetinizi kontrol edin.<br>
           <button onclick="App.handleRoute()" style="margin-top:20px; padding:10px 20px; background:var(--primary-blue); color:white; border:none; border-radius:8px; cursor:pointer;">Tekrar Dene</button>
         </div>`;
      }
    }
  },

  async handleToggleFavorite(id) {
    const isNowFav = await DataStore.toggleFavorite(id);
    if(isNowFav) {
       Components.showToast('İlan favorilere eklendi! ❤️', 'success');
    } else {
       Components.showToast('İlan favorilerden çıkarıldı.', 'info');
    }
    this.handleRoute();
  },

  async handleDeleteListing(id) {
    if(confirm('İlanı silmek istediğinize emin misiniz?')) {
       try {
         await DataStore.deleteListing(id);
         Components.showToast('İlan silindi.', 'info');
         this.handleRoute();
       } catch (err) {
         Components.showToast('İlan silinemedi: Yetkiniz yok veya sunucu hatası.', 'error');
       }
    }
  },

  navigate(path) {
    window.location.hash = path;
  },

  renderPage(html) {
    const container = document.getElementById('page-container');
    if (!container) return;
    
    // Animasyonu sıfırla (yeniden tetiklemek için class'ı kaldır ve geri ekle)
    container.style.animation = 'none';
    container.offsetHeight; /* Reflow */
    container.style.animation = null; 
    
    container.innerHTML = html;
    
    const currentHash = window.location.hash || '#/';
    if (this.lastHash !== currentHash) {
       window.scrollTo(0, 0);
       this.lastHash = currentHash;
    }
  },

  handleSearch(query) {
    this.searchQuery = query;
    this.handleRoute();
  },

  handleCityFilter(city) {
    this.currentCityFilter = city;
    this.handleRoute();
  },

  handleCategoryFilter(cat) {
    this.currentCategoryFilter = cat;
    this.handleRoute();
  },

  handleImageSelect(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
          Components.showToast("Fotoğraf boyutu 5MB'dan küçük olmalıdır.", 'error');
          input.value = '';
          return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
         const img = new Image();
         img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
               if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
               if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            App.selectedImageData = compressedBase64;
            
            const preview = document.getElementById('upload-preview');
            const text = document.getElementById('upload-text');
            if(preview && text) {
               preview.src = compressedBase64;
               preview.style.display = 'block';
               text.style.display = 'none';
            }
         };
         img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  },

  async handleCreateSubmit() {
    const user = DataStore.getUser();
    if (!user) {
       Components.showToast('İlan vermek için giriş yapmalısınız.', 'error');
       return;
    }
    
    const category = document.getElementById('ad-category').value;
    const desc = document.getElementById('ad-desc').value;
    const city = document.getElementById('ad-city').value;
    const price = document.getElementById('ad-price').value || 0;
    const phone = document.getElementById('ad-phone').value;

    if(!category || !desc || !phone || !city) {
        Components.showToast('Lütfen Kategori, Açıklama, Şehir ve Telefon alanlarını doldurun.', 'error');
        return;
    }

    const submitBtn = document.getElementById('submit-ad-btn');
    submitBtn.innerText = 'Yükleniyor...';
    submitBtn.disabled = true;

    try {
       await DataStore.create({
         image: this.selectedImageData || '', 
         category: category,
         description: desc,
         city: city,
         price: price,
         userName: user.name,
         phone: phone,
         createdAt: new Date().toISOString()
       });
       
       Components.showToast('İlanınız yayında! 🎉', 'success');
       this.navigate('#/profile');
    } catch (error) {
       Components.showToast('İlan yüklenirken hata oluştu.', 'error');
       submitBtn.innerText = 'İlanı Yayınla';
       submitBtn.disabled = false;
    }
  },

  async handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const city = document.getElementById('reg-city').value;
    const password = document.getElementById('reg-pass').value;

    try {
      await DataStore.register(email, password, name, phone, city);
      Components.showToast('Kayıt başarılı! Lütfen giriş yapın (E-posta doğrulaması gerekebilir).', 'success');
      this.navigate('#/login');
    } catch (err) {
      Components.showToast('Kayıt hatası: ' + err.message, 'error');
    }
  },

  async handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('log-email').value;
    const password = document.getElementById('log-pass').value;
    const rememberBox = document.getElementById('log-remember');

    try {
      if (rememberBox && !rememberBox.checked) {
         localStorage.setItem('ilanver_remember', 'false');
      } else {
         localStorage.removeItem('ilanver_remember');
      }

      await DataStore.login(email, password);
      Components.showToast('Başarıyla giriş yaptınız!', 'success');
      this.updateHeaderUI();
      this.navigate('#/home');
    } catch (err) {
      Components.showToast('Giriş hatası: ' + err.message, 'error');
    }
  },

  async handleOAuthLogin(provider) {
    try {
      await DataStore.loginWithOAuth(provider);
    } catch(err) {
      Components.showToast(err.message, 'error');
    }
  },

  async handleMagicLink() {
    const email = document.getElementById('log-email').value;
    if (!email) {
      Components.showToast('Lütfen önce E-Posta adresinizi girin.', 'error');
      return;
    }
    
    Components.showToast('Kod gönderiliyor...', 'success');
    try {
      await DataStore.sendMagicLink(email);
      Components.showToast('Giriş bağlantısı e-postanıza gönderildi! Gelen kutunuzu kontrol edin.', 'success');
    } catch(err) {
      Components.showToast(err.message, 'error');
    }
  },

  toggleProfileEdit() {
    this.isProfileEditing = !this.isProfileEditing;
    this.handleRoute(); 
  },

  async handleProfileSave() {
    const name = document.getElementById('edit-profile-name').value;
    const city = document.getElementById('edit-profile-city').value;
    const phone = document.getElementById('edit-profile-phone').value;
    
    try {
      await DataStore.updateProfile(name, city, phone);
      this.isProfileEditing = false;
      Components.showToast('Profiliniz başarıyla güncellendi!', 'success');
      this.handleRoute(); 
    } catch(err) {
      Components.showToast('Hata oluştu: ' + err.message, 'error');
    }
  },

  handleOpenChat(userId, listingId) {
    this.activeChatUserId = userId;
    this.activeChatListingId = listingId;
    this.navigate('#/messages');
  },

  async handleSendMessage(receiverId) {
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    if (!content) return;
    
    try {
       input.value = ''; 
       await DataStore.sendMessage(receiverId, this.activeChatListingId, content);
       this.handleRoute(); // Ekranı yenile (mesajı göster)
       // Scroll to bottom
       setTimeout(() => {
          const container = document.getElementById('chat-messages-container');
          if(container) container.scrollTop = container.scrollHeight;
       }, 50);
    } catch(err) {
       Components.showToast('Mesaj gönderilemedi.', 'error');
       input.value = content; 
    }
  },

  async handleLogout() {
    try {
      await DataStore.logout();
      Components.showToast('Çıkış yapıldı.', 'info');
      this.updateHeaderUI();
      this.navigate('#/');
    } catch (err) {
      Components.showToast('Çıkış yapılırken hata oluştu.', 'error');
    }
  },

  handleFindLocationForSearch() {
    if (!navigator.geolocation) {
      Components.showToast('Tarayıcınız konum özelliğini desteklemiyor.', 'error');
      return;
    }

    const btn = document.getElementById('header-loc-btn');
    if (btn) btn.innerHTML = '⏳ Aranıyor...';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=tr`);
          const data = await response.json();
          
          let province = data.address.province || data.address.city || data.address.town || data.address.state;
          if (province) {
             province = province.replace(' Province', '').replace(' İli', '').trim();
             
             let foundCity = null;
             let pNorm = typeof normalizeText === 'function' ? normalizeText(province) : province.toLowerCase();
             
             for (let city of StaticData.cities) {
                let cNorm = typeof normalizeText === 'function' ? normalizeText(city) : city.toLowerCase();
                if (cNorm === pNorm) {
                   foundCity = city;
                   break;
                }
             }
             
             if(foundCity) {
                Components.showToast(`Konumunuz bulundu: ${foundCity}. Yakındaki ilanlar listeleniyor.`, 'success');
                App.handleCityFilter(foundCity);
             } else {
                Components.showToast(`Bulunan konum (${province}) sistemde yok. Varsayılan (İstanbul) gösteriliyor.`, 'info');
                App.handleCityFilter('İstanbul'); 
             }
          } else {
             Components.showToast('Şehir bilgisi alınamadı.', 'error');
          }
        } catch (error) {
          Components.showToast('Konum servisine erişilemedi.', 'error');
        } finally {
          if (btn) btn.innerHTML = '📍 Yakınımda Bul';
        }
      },
      (error) => {
        if (btn) btn.innerHTML = '📍 Yakınımda Bul';
        Components.showToast('Konum izni verilmedi. Standart ilanlar gösteriliyor.', 'error');
      }
    );
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
