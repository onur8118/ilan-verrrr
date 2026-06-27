const Pages = {
  async renderHome() {
    let listings = await DataStore.search(App.searchQuery, App.currentCityFilter, App.currentCategoryFilter, App.currentUniversityFilter);

    if (App.currentSort === 'price_asc') {
       listings.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (App.currentSort === 'price_desc') {
       listings.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
       listings.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
    }

    const favIds = await DataStore.getFavorites();

    return `
      <div class="main-layout">
        
        <!-- Yapısal Pazar Yeri Sol Menüsü -->
        ${Components.renderSidebar(App.currentCategoryFilter)}

        <!-- Ana İçerik -->
        <main class="content-area">
           
           <div class="info-banner">
              <div>
                 <h2 style="font-size:22px; font-weight:700; margin-bottom:5px;">Kampüste aradığın her şey burada!</h2>
                 <p style="color:var(--text-muted); font-size:14px;">İkinci el eşyadan özel derse, ev arkadaşından yolculuğa kadar tüm ilanları incele.</p>
              </div>
              <button onclick="App.navigate('#/create')" class="post-ad-btn" style="background:#4B5563; color:white; padding:12px 24px;">Hemen İlan Ver</button>
           </div>

           <div class="grid-header" style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                 <div class="grid-title">
                   ${App.searchQuery 
                      ? `"<span style="color:var(--primary-blue);">${App.escapeHTML(App.searchQuery)}</span>" için sonuçlar` 
                      : (App.currentCategoryFilter === 'all' ? 'Öne Çıkan İlanlar' : App.currentCategoryFilter + ' İlanları')}
                   ${App.currentCityFilter !== 'all' 
                      ? `<span style="font-size:13px; color:var(--text-muted); margin-left:10px; background:var(--bg-color); padding:4px 10px; border-radius:12px; border:1px solid var(--border-color); cursor:pointer; font-weight:500;" onclick="App.handleCityFilter('all')" title="Şehir Filtresini Temizle">📍 ${App.escapeHTML(App.currentCityFilter)} ✖</span>` 
                      : ''}
                 </div>
                 <span style="color:var(--text-muted); font-size:13px;">${listings.length} sonuç bulundu</span>
              </div>
              <div style="display:flex; gap:10px;">
                 <select onchange="App.handleUniversityFilter(this.value)" style="padding:8px 12px; border-radius:8px; border:1px solid var(--border-color); background:var(--surface); color:var(--text-main); outline:none; font-weight:600; cursor:pointer;">
                    <option value="all" ${App.currentUniversityFilter === 'all' ? 'selected' : ''}>Tüm Üniversiteler</option>
                    ${StaticData.universities.map(u => `<option value="${u}" ${App.currentUniversityFilter === u ? 'selected' : ''}>${u}</option>`).join('')}
                 </select>
                 <select onchange="App.handleSortChange(this.value)" style="padding:8px 12px; border-radius:8px; border:1px solid var(--border-color); background:var(--surface); color:var(--text-main); outline:none; font-weight:600; cursor:pointer;">
                    <option value="newest" ${App.currentSort === 'newest' ? 'selected' : ''}>En Yeni</option>
                    <option value="price_asc" ${App.currentSort === 'price_asc' ? 'selected' : ''}>En Ucuz</option>
                    <option value="price_desc" ${App.currentSort === 'price_desc' ? 'selected' : ''}>En Pahalı</option>
                 </select>
              </div>
           </div>

           <div class="cards-grid">
             ${listings.length === 0 ? `<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--text-muted); background:var(--surface); border:1px solid var(--border-color); border-radius:12px;">Henüz hiç ilan verilmemiş. İlk ilanı veren sen ol!</div>` : ''}
             ${listings.map(l => Components.renderShowcaseCard(l, favIds)).join('')}
           </div>
        </main>
      </div>
    `;
  },

  async renderDetail(id) {
    const listing = await DataStore.getById(id);
    if(!listing) return `<div class="main-layout"><div class="form-container" style="width:100%; text-align:center;">İlan bulunamadı.</div></div>`;
    
    return `
      <div class="main-layout" style="display:block; max-width:1000px;">
         <button class="link-btn" onclick="window.history.back()" style="margin-bottom:20px; display:inline-block; border:none; background:transparent; cursor:pointer;">← Geri Dön</button>
         
         <div class="form-container" style="max-width:100%; display:flex; gap:30px;">
            <div style="flex:1;">
               ${listing.image ? `<img src="${listing.image}" style="width:100%; border-radius:12px; border:1px solid var(--border-color);">` : `<div style="width:100%; aspect-ratio:1; background:var(--bg-color); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#9CA3AF; font-size:3rem;">📷</div>`}
               
               <div style="margin-top:30px;">
                  <h3 style="font-size:18px; margin-bottom:15px; font-weight:700;">İlan Açıklaması</h3>
                  <p style="font-size:15px; line-height:1.7; color:var(--text-muted); white-space:pre-wrap;">${App.escapeHTML(listing.description)}</p>
               </div>
            </div>
            
            <div style="width: 350px;">
               <h1 style="font-size:24px; color:var(--text-main); margin-bottom:20px; font-weight:700;">${(!listing.price || listing.price == 0) ? 'Ücretsiz' : listing.price + ' TL'}</h1>
               <div style="font-size:15px; color:var(--text-muted); margin-bottom:20px;">${App.escapeHTML(listing.description).substring(0,60)}...</div>
               
               <div style="border-top:1px solid var(--border-color); border-bottom:1px solid var(--border-color); padding:15px 0; margin-bottom:20px;">
                  <div style="margin-bottom:10px; display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">İlan No</span> <strong>${listing.id}</strong></div>
                  <div style="margin-bottom:10px; display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">Konum</span> <strong>${App.escapeHTML(listing.city)}</strong></div>
                  ${listing.university ? `<div style="margin-bottom:10px; display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">Üniversite</span> <strong>${App.escapeHTML(listing.university)}</strong></div>` : ''}
                  ${listing.course ? `<div style="margin-bottom:10px; display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">Ders</span> <strong>${App.escapeHTML(listing.course)}</strong></div>` : ''}
                  <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">Kategori</span> <strong style="color:var(--primary-blue);">${App.escapeHTML(listing.category)}</strong></div>
               </div>
               
               <div style="background:var(--bg-color); border-radius:12px; padding:20px; text-align:center;">
                  <div style="width:60px; height:60px; background:white; border-radius:50%; margin:0 auto 10px auto; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:700; color:var(--primary-blue); border:1px solid var(--border-color);">
                     ${listing.userName ? listing.userName.charAt(0) : '?'}
                  </div>
                  <div style="font-weight:700; font-size:16px; margin-bottom:15px;">${App.escapeHTML(listing.userName)}</div>
                  
                  <div style="display:flex; gap:10px;">
                     <button class="post-ad-btn" style="flex:1; background:var(--surface); color:var(--text-main); border:1px solid var(--border-color); font-size:14px;" onclick="alert('Telefon: ${App.escapeHTML(listing.phone)}')">📞 Ara</button>
                     <button class="post-ad-btn" style="flex:1; background:var(--primary-blue); font-size:14px;" onclick="App.handleOpenChat('${listing.userId}', '${listing.id}')">💬 Mesaj At</button>
                  </div>
                  
                  <div style="font-size:12px; color:var(--text-muted); margin-top:10px;">İlan Sahibi ile İletişime Geçin</div>
                </div>

                ${DataStore.getUser() && DataStore.getUser().id === listing.userId ? `
                <button onclick="App.handleDeleteListing('${listing.id}')" style="width:100%; margin-top:15px; padding:12px; background:#FEE2E2; color:#DC2626; border:1px solid #FECACA; border-radius:10px; cursor:pointer; font-weight:700; font-size:14px; transition:all 0.2s;" onmouseover="this.style.background='#FECACA';" onmouseout="this.style.background='#FEE2E2';">
                  🗑️ Bu İlanı Sil
                </button>` : ''}
             </div>
         </div>
      </div>
    `;
  },

  async renderCreate() {
    const cityOptions = `<option value="">Şehir Seçiniz</option>` + StaticData.cities.map(c => `<option value="${c}">${c}</option>`).join('');
    const catOptions = `<option value="">Kategori Seçiniz</option>` + StaticData.categories.map(c => `<option value="${c}">${c}</option>`).join('');
    const uniOptions = `<option value="">Üniversite Seçiniz</option>` + StaticData.universities.map(u => `<option value="${u}">${u}</option>`).join('');

    return `
      <div style="max-width:800px; margin:40px auto; padding:0 20px;">
         <div class="form-container">
            <h2 style="font-size:24px; margin-bottom:10px; font-weight:700;">Hızlı İlan Ver</h2>
            <p style="color:var(--text-muted); margin-bottom:30px;">İlanınızı oluşturmak için aşağıdaki bilgileri eksiksiz doldurun.</p>
            
            <form onsubmit="event.preventDefault(); App.handleCreateSubmit();">
              
              <div class="input-group">
                 <label class="input-label">Kategori</label>
                 <select id="ad-category" class="input-field" required onchange="App.toggleCourseField(this.value)">
                   ${catOptions}
                 </select>
              </div>

              <div class="input-group">
                 <label class="input-label">Fotoğraf (Opsiyonel)</label>
                 <input type="file" id="image-upload" accept="image/*" style="display:none;" onchange="App.handleImageSelect(this)">
                 <div style="border:2px dashed var(--border-color); border-radius:8px; padding:30px; text-align:center; cursor:pointer; background:var(--bg-color); transition:all 0.2s;" onclick="document.getElementById('image-upload').click()">
                    <div id="upload-text">
                       <div style="font-size:24px; margin-bottom:10px;">📸</div>
                       <div style="font-weight:600; color:var(--primary-blue);">Bilgisayardan Seç veya Sürükle</div>
                    </div>
                    <img id="upload-preview" src="" style="width:100px; height:100px; object-fit:cover; display:none; margin:15px auto 0 auto; border-radius:8px;">
                 </div>
              </div>

              <div class="input-group">
                 <label class="input-label">Fiyat (TL) - Ücretsiz ise 0 yazın</label>
                 <input type="number" id="ad-price" class="input-field" placeholder="Örn: 500" min="0" required>
              </div>

              <div class="input-group">
                 <label class="input-label">İlan Başlığı / Açıklaması</label>
                 <textarea id="ad-desc" class="input-field" style="height:120px; resize:vertical;" placeholder="Ne satıyorsunuz veya ne arıyorsunuz?" maxlength="1000" required></textarea>
              </div>

              <div class="input-group">
                 <label class="input-label">Üniversite</label>
                 <select id="ad-university" class="input-field" required>
                   ${uniOptions}
                 </select>
              </div>

              <div id="course-field-wrapper" class="input-group" style="display:none;">
                 <label class="input-label">Ders</label>
                 <input type="text" id="ad-course" class="input-field" placeholder="Ders (örn. Matematik 1)" maxlength="100">
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                 <div class="input-group">
                    <label class="input-label">Şehir</label>
                    <select id="ad-city" class="input-field" required>
                      ${cityOptions}
                    </select>
                 </div>

                 <div class="input-group">
                    <label class="input-label">Telefon Numarası</label>
                    <input type="tel" id="ad-phone" class="input-field" value="${App.escapeHTML(DataStore.getUser().phone || '')}" maxlength="20" required>
                 </div>
              </div>

              <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end; gap:15px;">
                <button type="button" class="link-btn" style="border:none; background:transparent; padding:10px 20px; cursor:pointer;" onclick="window.history.back()">İptal</button>
                <button type="submit" id="submit-ad-btn" class="post-ad-btn" style="background:var(--primary-blue); padding:10px 30px;">İlanı Yayınla</button>
              </div>

            </form>
         </div>
      </div>
    `;
  },

  async renderFavorites() {
    const favIds = await DataStore.getFavorites();
    const allListings = await DataStore.getAll();
    const listings = allListings.filter(l => favIds.includes(l.id));

    return `
      <div class="main-layout" style="display:block; max-width:1200px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
           <h2 style="font-size:24px; font-weight:700;">Favori İlanlarım</h2>
           <span style="color:var(--text-muted); font-weight:500;">Toplam ${listings.length} İlan</span>
        </div>
        <div class="cards-grid">
           ${listings.length === 0 ? `<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--text-muted); background:var(--surface); border:1px solid var(--border-color); border-radius:12px;">Henüz favorilere eklediğiniz bir ilan bulunmuyor. Ana sayfadaki ilanların sağ üst köşesindeki kalp ikonuna tıklayarak favorilerinizi oluşturabilirsiniz.</div>` : ''}
           ${listings.map(l => Components.renderShowcaseCard(l, favIds)).join('')}
        </div>
      </div>
    `;
  },

  async renderMessages() {
    return `
      <div class="main-layout" style="display:block; max-width:1200px;">
        <h2 style="font-size:24px; font-weight:700; margin-bottom:20px;">Mesajlarım</h2>
        
        <div style="display:flex; background:var(--surface); border:1px solid var(--border-color); border-radius:12px; height:600px; overflow:hidden;">
           
           <!-- Sol Taraf: Kişiler Listesi -->
           <div style="width:320px; border-right:1px solid var(--border-color); display:flex; flex-direction:column;">
              <div style="padding:20px; border-bottom:1px solid var(--border-color); font-weight:600; font-size:16px;">Sohbetler</div>
              
              <div style="flex:1; overflow-y:auto;">
                 <!-- Örnek Sohbet 1 -->
                 <div style="padding:15px 20px; display:flex; gap:15px; align-items:center; border-bottom:1px solid var(--border-color); cursor:pointer; background:var(--bg-color);">
                    <div style="width:45px; height:45px; background:var(--primary-blue); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px;">A</div>
                    <div style="flex:1; min-width:0;">
                       <div style="font-weight:600; font-size:15px; margin-bottom:4px; color:var(--text-main);">Ahmet Kaya</div>
                       <div style="font-size:13px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Buzdolabı hala satılık mı?</div>
                    </div>
                 </div>
                 
                 <!-- Örnek Sohbet 2 -->
                 <div style="padding:15px 20px; display:flex; gap:15px; align-items:center; border-bottom:1px solid var(--border-color); cursor:pointer; transition:background 0.2s;" onmouseover="this.style.background='var(--bg-color)';" onmouseout="this.style.background='transparent';">
                    <div style="width:45px; height:45px; background:var(--border-color); color:var(--text-main); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px;">Z</div>
                    <div style="flex:1; min-width:0;">
                       <div style="font-weight:600; font-size:15px; margin-bottom:4px; color:var(--text-main);">Zeynep Yılmaz</div>
                       <div style="font-size:13px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Tamamdır, yarın görüşürüz.</div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Sağ Taraf: Mesajlaşma Alanı -->
           <div style="flex:1; display:flex; flex-direction:column; background:var(--bg-color);">
              
              <!-- Chat Header -->
              <div style="padding:20px; background:var(--surface); border-bottom:1px solid var(--border-color); display:flex; align-items:center; gap:15px;">
                 <div style="width:45px; height:45px; background:var(--primary-blue); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px;">A</div>
                 <div>
                    <div style="font-weight:600; font-size:16px; color:var(--text-main);">Ahmet Kaya</div>
                    <div style="font-size:13px; color:var(--text-muted);">İlan: Eski Buzdolabı</div>
                 </div>
              </div>

              <!-- Chat Messages -->
              <div style="flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:15px;">
                 <div style="align-self:flex-end; background:var(--primary-blue); color:white; padding:12px 18px; border-radius:18px 18px 4px 18px; max-width:70%; font-size:14px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                    Merhaba, ilanınızdaki buzdolabı hala duruyor mu?
                 </div>
                 
                 <div style="align-self:flex-start; background:var(--surface); border:1px solid var(--border-color); color:var(--text-main); padding:12px 18px; border-radius:18px 18px 18px 4px; max-width:70%; font-size:14px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                    Evet, hala satılık. Ne zaman gelip bakmak istersiniz?
                 </div>
                 
                 <div style="align-self:flex-end; background:var(--primary-blue); color:white; padding:12px 18px; border-radius:18px 18px 4px 18px; max-width:70%; font-size:14px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                    Yarın öğleden sonra uygun mudur?
                 </div>
              </div>

              <!-- Chat Input -->
              <div style="padding:20px; background:var(--surface); border-top:1px solid var(--border-color); display:flex; gap:15px; align-items:center;">
                 <input type="text" placeholder="Bir mesaj yazın..." style="flex:1; padding:14px 20px; border:1px solid var(--border-color); border-radius:24px; font-size:14px; background:var(--bg-color); outline:none; color:var(--text-main); transition:border 0.2s;" onfocus="this.style.borderColor='var(--primary-blue)';">
                 <button style="background:var(--primary-blue); color:white; border:none; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; transition:transform 0.2s; box-shadow:0 4px 10px rgba(37,99,235,0.3);" onmouseover="this.style.transform='scale(1.05)';" onmouseout="this.style.transform='scale(1)';">
                    ➤
                 </button>
              </div>

           </div>
        </div>
      </div>
    `;
  },

  async renderProfile() {
    const user = DataStore.getUser();
    const myAds = await DataStore.getUserListings();
    const isEditing = App.isProfileEditing || false;

    return `
      <div class="main-layout" style="display:block; max-width:1200px;">
        <h2 style="font-size:24px; font-weight:700; margin-bottom:20px;">Profilim ve İlanlarım</h2>
        
        <div style="display:flex; gap:30px; align-items:flex-start;">
           <!-- Sol: Kullanıcı Kartı -->
           <div style="width:300px; background:var(--surface); border:1px solid var(--border-color); border-radius:12px; padding:30px; text-align:center; position:sticky; top:100px;">
              <div style="width:100px; height:100px; background:var(--primary-blue); color:white; border-radius:50%; margin:0 auto 15px auto; display:flex; align-items:center; justify-content:center; font-size:40px; font-weight:700;">
                 ${user.name ? user.name.charAt(0) : '?'}
              </div>
              
              ${isEditing ? `
                 <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-bottom:15px;">
                    <input type="text" id="edit-profile-name" value="${App.escapeHTML(user.name)}" style="border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main); padding:8px 12px; border-radius:8px; width:100%; box-sizing:border-box;" placeholder="Ad Soyad">
                    <input type="text" id="edit-profile-city" value="${App.escapeHTML(user.city)}" style="border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main); padding:8px 12px; border-radius:8px; width:100%; box-sizing:border-box;" placeholder="Şehir">
                    <input type="tel" id="edit-profile-phone" value="${App.escapeHTML(user.phone)}" style="border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main); padding:8px 12px; border-radius:8px; width:100%; box-sizing:border-box;" placeholder="Telefon">
                 </div>
                 <button onclick="App.handleProfileSave()" style="width:100%; background:var(--primary-blue); color:white; padding:10px; border:none; border-radius:8px; cursor:pointer; font-weight:bold; margin-bottom:10px;">Kaydet</button>
                 <button onclick="App.toggleProfileEdit()" style="width:100%; background:transparent; color:var(--text-muted); padding:10px; border:1px solid var(--border-color); border-radius:8px; cursor:pointer; font-weight:bold;">İptal</button>
              ` : `
                 <h3 style="font-size:20px; font-weight:700; margin-bottom:5px; color:var(--text-main);">${App.escapeHTML(user.name)}</h3>
                 <div style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">${App.escapeHTML(user.city)} | ${App.escapeHTML(user.phone)}</div>
                 <button onclick="App.toggleProfileEdit()" class="post-ad-btn" style="width:100%; background:var(--bg-color); color:var(--text-main); border:1px solid var(--border-color); cursor:pointer;">Profili Düzenle</button>
              `}
           </div>
           
           <!-- Sağ: İlanlarım Listesi -->
           <div style="flex:1;">
              <div style="background:var(--surface); border:1px solid var(--border-color); border-radius:12px; padding:20px;">
                 <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid var(--border-color);">
                    <h3 style="font-size:18px; font-weight:700; color:var(--text-main);">Yayındaki İlanlarım</h3>
                    <span style="color:var(--text-muted); font-weight:500;">${myAds.length} İlan</span>
                 </div>
                 
                 ${myAds.length === 0 ? `<div style="text-align:center; padding:40px; color:var(--text-muted); background:var(--bg-color); border-radius:8px;">Yayında hiç ilanınız bulunmuyor. Yeni bir ilan vererek başlayabilirsiniz.</div>` : ''}
                 
                 <div style="display:flex; flex-direction:column; gap:15px;">
                    ${myAds.map(ad => `
                       <div style="display:flex; gap:15px; border:1px solid var(--border-color); border-radius:8px; padding:15px; align-items:center; background:var(--bg-color); transition:transform 0.2s;" onmouseover="this.style.transform='translateX(5px)';" onmouseout="this.style.transform='translateX(0)';">
                          <div style="width:80px; height:80px; background:var(--surface); border-radius:8px; overflow:hidden; border:1px solid var(--border-color);">
                             ${ad.image ? `<img src="${ad.image}" style="width:100%; height:100%; object-fit:cover;">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9CA3AF;font-size:24px;">📷</div>`}
                          </div>
                          <div style="flex:1; min-width:0;">
                             <div style="font-weight:600; font-size:15px; margin-bottom:5px; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${App.escapeHTML(ad.description)}</div>
                             <div style="font-size:13px; color:var(--text-muted); margin-bottom:8px;">Kategori: <strong style="color:var(--primary-blue);">${App.escapeHTML(ad.category)}</strong> | Şehir: ${App.escapeHTML(ad.city)}</div>
                             <div style="font-size:11px; color:var(--text-muted);">İlan No: #${ad.id}</div>
                          </div>
                          <div>
                             <button onclick="App.handleDeleteListing('${ad.id}')" style="background:#EF4444; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s; box-shadow:0 2px 5px rgba(239,68,68,0.3);" onmouseover="this.style.background='#DC2626'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='#EF4444'; this.style.transform='scale(1)';">
                                🗑️ İlanı Sil
                             </button>
                          </div>
                       </div>
                    `).join('')}
                 </div>
              </div>
           </div>
        </div>
      </div>
    `;
  },

  async renderMessages() {
    const user = DataStore.getUser();
    if(!user) return `<div style="padding:50px; text-align:center; color:var(--text-muted);">Mesajları görmek için giriş yapmalısınız.</div>`;

    const convos = await DataStore.getConversations();
    const activeChatId = App.activeChatUserId || null;
    const activeConvo = convos.find(c => c.userId === activeChatId);
    const activeName = (activeConvo && activeConvo.otherUserName) ? activeConvo.otherUserName : 'Mesajlaşma';
    let messagesHTML = `
      <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; background:var(--bg-color); color:var(--text-muted);">
        <div style="font-size:2.8rem;">💬</div>
        <div style="font-size:15px; font-weight:600;">Bir sohbet seçin</div>
        <div style="font-size:13px; opacity:0.65;">Soldaki listeden kişi seçerek mesajlaşmaya başlayın.</div>
      </div>
    `;

    if (activeChatId) {
       const msgs = await DataStore.getMessages(activeChatId);
       const headerInitial = activeName.charAt(0).toUpperCase();
       messagesHTML = `
          <div style="flex:1; display:flex; flex-direction:column; background:var(--bg-color);">

             <!-- Chat Header -->
             <div style="padding:14px 20px; border-bottom:1px solid var(--border-color); background:var(--surface); display:flex; align-items:center; justify-content:space-between; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="display:flex; align-items:center; gap:12px;">
                   <div style="width:40px; height:40px; background:#2563eb; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:white; font-size:16px; flex-shrink:0;">${headerInitial}</div>
                   <div style="font-weight:700; font-size:15px; color:var(--text-main);">${App.escapeHTML(activeName)}</div>
                </div>
                <button onclick="App.activeChatUserId = null; App.handleRoute();" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:18px; width:32px; height:32px; border-radius:6px; display:flex; align-items:center; justify-content:center; transition:background 0.15s;" onmouseover="this.style.background='var(--bg-color)';" onmouseout="this.style.background='transparent';">✕</button>
             </div>

             <!-- Messages Area -->
             <div id="chat-messages-container" style="flex:1; overflow-y:auto; padding:20px 24px; display:flex; flex-direction:column; gap:4px;">
                ${msgs.length === 0 ? `
                  <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:var(--text-muted);">
                    <div style="font-size:2rem;">👋</div>
                    <div style="font-size:14px; font-weight:500;">İlk mesajı siz gönderin!</div>
                  </div>
                ` : ''}
                ${msgs.map(m => {
                   const isMe = m.sender_id === user.id;
                   return `
                      <div style="display:flex; justify-content:${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:2px;">
                         <div style="max-width:68%; padding:10px 14px; border-radius:${isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'}; background:${isMe ? '#2563eb' : '#f1f5f9'}; color:${isMe ? '#ffffff' : 'var(--text-main)'}; font-size:14px; line-height:1.5; box-shadow:0 1px 2px rgba(0,0,0,0.07);">
                            <div>${App.escapeHTML(m.content)}</div>
                            <div style="font-size:10px; text-align:right; margin-top:4px; opacity:0.6;">${new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                         </div>
                      </div>
                   `;
                }).join('')}
             </div>

             <!-- Input Area -->
             <div style="padding:14px 20px; border-top:1px solid var(--border-color); background:var(--surface); display:flex; gap:10px; align-items:center;">
                <input type="text" id="chat-input" placeholder="Mesajınızı yazın..." style="flex:1; padding:11px 18px; border-radius:24px; border:1.5px solid var(--border-color); background:var(--bg-color); color:var(--text-main); outline:none; font-size:14px; transition:border-color 0.2s;" onfocus="this.style.borderColor='#2563eb';" onblur="this.style.borderColor='var(--border-color)';" onkeypress="if(event.key === 'Enter') App.handleSendMessage('${activeChatId}')">
                <button onclick="App.handleSendMessage('${activeChatId}')" style="background:#2563eb; color:white; border:none; width:44px; height:44px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; box-shadow:0 2px 8px rgba(37,99,235,0.35); transition:transform 0.15s, box-shadow 0.15s;" onmouseover="this.style.transform='scale(1.08)'; this.style.boxShadow='0 4px 12px rgba(37,99,235,0.45)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(37,99,235,0.35)';">➤</button>
             </div>

          </div>
       `;
    }

    return `
      <div class="main-layout" style="display:flex; height:calc(100vh - 120px); max-width:1200px; margin:0 auto; border:1px solid var(--border-color); border-radius:16px; overflow:hidden; background:var(--surface); box-shadow:0 4px 24px rgba(0,0,0,0.07);">

         <!-- Sol Taraf: Sohbetler -->
         <div style="width:300px; background:var(--surface); border-right:1px solid var(--border-color); display:flex; flex-direction:column; flex-shrink:0;">
            <div style="padding:18px 20px; border-bottom:1px solid var(--border-color); font-weight:700; font-size:17px; color:var(--text-main);">Mesajlarım</div>
            <div style="flex:1; overflow-y:auto; padding:8px;">
               ${convos.length === 0 ? '<div style="text-align:center; padding:30px 16px; color:var(--text-muted); font-size:14px;">Henüz mesajınız yok.</div>' : ''}
               ${convos.map(c => {
                  const isActive = activeChatId === c.userId;
                  const initial = (c.otherUserName || '?').charAt(0).toUpperCase();
                  return `
                  <div onclick="App.activeChatUserId = '${c.userId}'; App.activeChatListingId = '${c.listingId}'; App.handleRoute();" style="display:flex; gap:12px; align-items:center; padding:11px 12px; border-radius:10px; cursor:pointer; margin-bottom:2px; background:${isActive ? 'rgba(37,99,235,0.09)' : 'transparent'}; border:${isActive ? '1px solid rgba(37,99,235,0.18)' : '1px solid transparent'}; transition:background 0.15s;" onmouseover="this.style.background='${isActive ? 'rgba(37,99,235,0.09)' : 'rgba(0,0,0,0.04)'}';" onmouseout="this.style.background='${isActive ? 'rgba(37,99,235,0.09)' : 'transparent'}';">
                     <div style="width:44px; height:44px; background:#2563eb; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:white; font-size:17px; flex-shrink:0;">${initial}</div>
                     <div style="flex:1; min-width:0;">
                        <div style="font-weight:600; font-size:14px; color:var(--text-main); margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${App.escapeHTML(c.otherUserName || 'Kullanıcı')}</div>
                        ${c.listingTitle ? `<div style="font-size:11px; color:#2563eb; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${App.escapeHTML(c.listingTitle)}</div>` : ''}
                        <div style="font-size:12px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${App.escapeHTML(c.lastMessage)}</div>
                     </div>
                  </div>
                  `;
               }).join('')}
            </div>
         </div>

         <!-- Sağ Taraf: Chat Ekranı -->
         ${messagesHTML}
      </div>
    `;
  },

  async renderLogin() {
    return `
      <div class="auth-wrapper">
         <div class="auth-left">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div class="auth-left-title">İhtiyacın olanı bul,<br><strong>kullanmadığını sat.</strong></div>
         </div>
         <div class="auth-right">
            <div class="auth-top-toggle">
               <a href="#/login" class="active">Giriş Yap</a>
               <a href="#/register">Kayıt Ol</a>
            </div>
            <div class="auth-title">Hesabınıza <strong>Giriş Yapın</strong></div>
            <div class="social-login-container">
               <button class="social-btn" onclick="App.handleOAuthLogin('google')" style="width:100%;">
                  <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Google ile Giriş Yap
               </button>
            </div>
            
            <div class="auth-divider">veya e-posta ile</div>

            <form onsubmit="App.handleLoginSubmit(event)">
               <div class="auth-input-group">
                  <label class="auth-label">E-Posta Adresi</label>
                  <input type="email" id="log-email" name="email" class="auth-input" placeholder="E-posta adresiniz" autocomplete="username" required>
               </div>
               <div class="auth-input-group">
                  <label class="auth-label">Şifre</label>
                  <input type="password" id="log-pass" name="password" class="auth-input" placeholder="Şifreniz" autocomplete="current-password" required>
               </div>
               
               <label class="remember-me">
                  <input type="checkbox" id="log-remember" checked> Beni Hatırla
               </label>
               
               <button type="submit" class="auth-pill-btn" style="width:100%;">Şifreyle Giriş Yap</button>
               
               <button type="button" class="auth-pill-btn" style="width:100%; background:transparent; border:1px solid #00D2FF; color:#00D2FF; margin-top:15px; box-shadow:none;" onclick="App.handleMagicLink()">Kodu E-postama Gönder (Şifresiz)</button>
            </form>
         </div>
      </div>
    `;
  },

  async renderRegister() {
    return `
      <div class="auth-wrapper">
         <div class="auth-left">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div class="auth-left-title">Hemen aramıza katıl,<br><strong>fırsatları kaçırma.</strong></div>
         </div>
         <div class="auth-right">
            <div class="auth-top-toggle">
               <a href="#/login">Giriş Yap</a>
               <a href="#/register" class="active">Kayıt Ol</a>
            </div>
            <div class="auth-title">Yeni Hesap <strong>Oluşturun</strong></div>
            <div class="social-login-container">
               <button class="social-btn" onclick="App.handleOAuthLogin('google')" style="width:100%;">
                  <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                  Google ile Kayıt Ol
               </button>
            </div>
            
            <div class="auth-divider">veya e-posta ile</div>

            <form onsubmit="App.handleRegisterSubmit(event)">
               <div class="auth-input-group">
                  <label class="auth-label">Ad Soyad</label>
                  <input type="text" id="reg-name" name="name" class="auth-input" placeholder="Tam adınız" autocomplete="name" required>
               </div>
               <div class="auth-input-group">
                  <label class="auth-label">E-Posta Adresi</label>
                  <input type="email" id="reg-email" name="email" class="auth-input" placeholder="E-posta adresiniz" autocomplete="email" required>
               </div>
               <div class="auth-input-group">
                  <label class="auth-label">Şifre</label>
                  <input type="password" id="reg-pass" name="password" class="auth-input" placeholder="En az 6 karakter" autocomplete="new-password" minlength="6" required>
               </div>
               <div style="display:flex; gap:20px;">
                  <div class="auth-input-group" style="flex:1;">
                     <label class="auth-label">Şehir</label>
                     <input type="text" id="reg-city" class="auth-input" placeholder="Yaşadığınız Şehir" required>
                  </div>
                  <div class="auth-input-group" style="flex:1;">
                     <label class="auth-label">Telefon</label>
                     <input type="tel" id="reg-phone" class="auth-input" placeholder="05XX XXX XX XX" required>
                  </div>
               </div>
               <label style="display:flex; align-items:center; gap:10px; color:#94A3B8; font-size:12px; cursor:pointer;">
                  <input type="checkbox" required style="accent-color:#00D2FF; width:16px; height:16px;">
                  Tüm <strong style="color:white; border-bottom:1px solid #94A3B8;">Kullanım Koşullarını</strong> kabul ediyorum.
               </label>
               <br>
               <button type="submit" class="auth-pill-btn">Ücretsiz Kayıt Ol</button>
            </form>
         </div>
      </div>
    `;
  }
};
