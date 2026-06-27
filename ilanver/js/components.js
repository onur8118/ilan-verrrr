const Components = {
  renderShowcaseCard(listing, favIds = []) {
    const isFav = favIds.includes(listing.id);
    const currentUser = typeof DataStore !== 'undefined' ? DataStore.getUser() : null;
    const isMyAd = currentUser && currentUser.id === listing.userId;
    
    return `
      <div class="product-card">

        <!-- Tüm karta tıklama katmanı -->
        <button onclick="event.stopPropagation(); App.navigate('#/detail/${listing.id}')" style="position:absolute; inset:0; width:100%; height:100%; background:transparent; border:none; cursor:pointer; z-index:1;"></button>

        <!-- Görsel alanı -->
        <div style="position:relative; width:100%; height:160px; overflow:hidden; background:var(--bg-color);">
          ${listing.image
            ? `<img src="${listing.image}" alt="Görsel" loading="lazy" class="card-img" style="width:100%; height:100%; object-fit:cover; display:block;">`
            : `<div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; color:#9CA3AF;"><span style="font-size:2.2rem;">📷</span><span style="font-size:11px; font-weight:500;">Görsel yok</span></div>`
          }

          <!-- Kategori rozeti (görsel sol alt) -->
          <div style="position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,0.52); color:white; font-size:11px; font-weight:600; padding:3px 9px; border-radius:20px; z-index:2; max-width:calc(100% - 52px); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; backdrop-filter:blur(3px);">${App.escapeHTML(listing.category)}</div>

          <!-- Favori butonu (görsel sağ üst) -->
          <button onclick="event.stopPropagation(); App.handleToggleFavorite('${listing.id}')" style="position:absolute; top:8px; right:8px; background:white; border:none; border-radius:50%; width:34px; height:34px; box-shadow:0 2px 6px rgba(0,0,0,0.15); cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; z-index:10; transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.12)';" onmouseout="this.style.transform='scale(1)';">
            ${isFav ? '❤️' : '🤍'}
          </button>

          <!-- Sil butonu (görsel sol üst, sadece kendi ilanı) -->
          ${isMyAd ? `<button onclick="event.stopPropagation(); App.handleDeleteListing('${listing.id}')" style="position:absolute; top:8px; left:8px; background:white; border:none; border-radius:50%; width:34px; height:34px; box-shadow:0 2px 6px rgba(0,0,0,0.15); cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; z-index:10; transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.12)';" onmouseout="this.style.transform='scale(1)';" title="İlanı Sil">🗑️</button>` : ''}
        </div>

        <!-- Kart gövdesi -->
        <div style="padding:12px 14px 14px; display:flex; flex-direction:column; flex:1;">

          <!-- Başlık (2 satır clamp) -->
          <div style="font-weight:700; font-size:13px; color:var(--text-main); margin-bottom:4px; line-height:1.35; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:2.7em;">${App.escapeHTML(listing.description)}</div>

          <!-- Şehir + Üniversite -->
          <div style="font-size:11px; color:var(--text-muted); margin-bottom:${listing.course ? '4px' : '6px'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            📍 ${App.escapeHTML(listing.city)}${listing.university ? ` · ${App.escapeHTML(listing.university)}` : ''}
          </div>

          <!-- Ders rozeti -->
          ${listing.course ? `<div style="margin-bottom:6px;"><span style="display:inline-block; background:rgba(37,99,235,0.08); color:#2563eb; font-size:10.5px; font-weight:600; padding:2px 8px; border-radius:20px; max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📚 ${App.escapeHTML(listing.course)}</span></div>` : ''}

          <!-- Alt satır: fiyat + mesaj butonu -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:8px; margin-top:auto;">
            <div style="font-size:14px; font-weight:800; color:${(!listing.price || listing.price == 0) ? '#16a34a' : '#2563eb'};">
              ${(!listing.price || listing.price == 0) ? 'Ücretsiz' : Number(listing.price).toLocaleString('tr-TR') + ' TL'}
            </div>
            ${currentUser && !isMyAd ? `
              <button onclick="event.stopPropagation(); App.handleOpenChat('${listing.userId}', '${listing.id}')" style="position:relative; z-index:10; background:rgba(37,99,235,0.09); color:#2563eb; border:none; border-radius:7px; padding:5px 11px; font-size:12px; cursor:pointer; font-weight:600; transition:background 0.15s;" onmouseover="this.style.background='rgba(37,99,235,0.18)';" onmouseout="this.style.background='rgba(37,99,235,0.09)';">💬 Mesaj</button>
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
