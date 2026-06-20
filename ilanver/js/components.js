const Components = {
  renderShowcaseCard(listing, favIds = []) {
    const isFav = favIds.includes(listing.id);
    const currentUser = typeof DataStore !== 'undefined' ? DataStore.getUser() : null;
    const isMyAd = currentUser && currentUser.id === listing.userId;
    
    return `
      <div class="product-card" style="position:relative;">
        <button onclick="event.stopPropagation(); App.navigate('#/detail/${listing.id}')" style="position:absolute; inset:0; width:100%; height:100%; background:transparent; border:none; cursor:pointer; z-index:1;"></button>
        <button onclick="event.stopPropagation(); App.handleToggleFavorite('${listing.id}')" style="position:absolute; top:8px; right:8px; background:var(--surface); border:1px solid var(--border-color); border-radius:50%; width:30px; height:30px; box-shadow:0 2px 4px rgba(0,0,0,0.1); cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; z-index:10; transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">
           ${isFav ? '❤️' : '🤍'}
        </button>
        ${isMyAd ? `<button onclick="event.stopPropagation(); App.handleDeleteListing('${listing.id}')" style="position:absolute; top:8px; left:8px; background:#EF4444; border:none; border-radius:50%; width:30px; height:30px; box-shadow:0 2px 4px rgba(0,0,0,0.2); cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; z-index:10; transition:all 0.2s; color:white;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';" title="İlanı Sil">🗑️</button>` : ''}
        <div class="card-img-box">
          ${listing.image ? `<img src="${listing.image}" alt="Görsel" loading="lazy">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9CA3AF;font-size:2rem;">📷</div>`}
        </div>
        <div class="card-content">
          <div class="card-title">${App.escapeHTML(listing.description)}</div>
          <div class="card-footer" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
               <span class="card-location">${App.escapeHTML(listing.city)}</span><br>
               <span class="card-price" style="font-weight:700; color:var(--primary-blue);">
                  ${(!listing.price || listing.price == 0) ? 'Ücretsiz' : listing.price + ' TL'}
               </span>
            </div>
            ${currentUser && !isMyAd ? `
               <button onclick="event.stopPropagation(); App.handleOpenChat('${listing.userId}', '${listing.id}')" style="background:var(--bg-color); color:var(--primary-blue); border:1px solid var(--border-color); border-radius:8px; padding:6px 12px; font-size:12px; cursor:pointer; font-weight:600; transition:background 0.2s;" onmouseover="this.style.background='rgba(0,102,255,0.1)';" onmouseout="this.style.background='var(--bg-color)';">💬 Mesaj</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  renderSidebar(activeCategory) {
    const categories = [
      { id: 'all', icon: '✨', label: 'Tüm İlanlar' },
      { id: 'Özel Ders', icon: '📚', label: 'Özel Ders' },
      { id: 'Proje/Ödev', icon: '💻', label: 'Proje / Ödev' },
      { id: 'Emlak', icon: '🏢', label: 'Ev / Emlak' },
      { id: 'Ev/Ev Arkadaşı', icon: '🛏️', label: 'Ev Arkadaşı' },
      { id: 'Vasıta', icon: '🚗', label: 'Vasıta / Ulaşım' },
      { id: 'Eşya Satışı', icon: '🛋️', label: 'İkinci El Eşya' },
      { id: 'Hizmet/Yetenek', icon: '🤝', label: 'Hizmetler' },
      { id: 'Kayıp Eşya', icon: '🔍', label: 'Kayıp Eşya' },
      { id: 'Sosyal/Etkinlik', icon: '☕', label: 'Sosyal & Etkinlik' }
    ];

    return `
      <aside class="side-menu">
        <div class="menu-title">KATEGORİLER</div>
        <div class="menu-list">
        ${categories.map(c => {
          const isActive = activeCategory === c.id;
          return `
          <div onclick="App.handleCategoryFilter('${c.id}')" class="menu-item ${isActive ? 'active' : ''}">
            <span class="menu-icon">${c.icon}</span>
            <span>${c.label}</span>
          </div>
        `}).join('')}
        </div>
      </aside>
    `;
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.display = 'none';
      toast.remove();
    }, 3000);
  }
};
