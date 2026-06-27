const supabaseUrl = 'https://lnvsbzlpimdfjsgbktdn.supabase.co';
const supabaseKey = 'sb_publishable_4Y2RtGHTtjf7QJVb7u1aqQ_-oukGAvJ';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'implicit',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

function normalizeText(text) {
  if (!text) return "";
  return text.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/i̇/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

const StaticData = {
  cities: ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"].sort(),
  categories: ['Kampüs/Okul', 'Özel Ders', 'Proje/Ödev', 'Ev/Ev Arkadaşı', 'Eşya Satışı', 'Yolculuk', 'Hizmet/Yetenek', 'Kayıp Eşya', 'Sosyal/Etkinlik'],
  universities: [
    "Abdullah Gül Üniversitesi",
    "Acıbadem Mehmet Ali Aydınlar Üniversitesi",
    "Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi",
    "Adıyaman Üniversitesi",
    "Afyon Kocatepe Üniversitesi",
    "Afyonkarahisar Sağlık Bilimleri Üniversitesi",
    "Ağrı İbrahim Çeçen Üniversitesi",
    "Akdeniz Üniversitesi",
    "Aksaray Üniversitesi",
    "Alanya Alaaddin Keykubat Üniversitesi",
    "Alanya Hamdullah Emin Paşa Üniversitesi",
    "Alanya Üniversitesi",
    "Altınbaş Üniversitesi",
    "Amasya Üniversitesi",
    "Anadolu Üniversitesi",
    "Anka Teknoloji Üniversitesi",
    "Ankara Bilim Üniversitesi",
    "Ankara Hacı Bayram Veli Üniversitesi",
    "Ankara Medipol Üniversitesi",
    "Ankara Müzik ve Güzel Sanatlar Üniversitesi",
    "Ankara Üniversitesi",
    "Ankara Yıldırım Beyazıt Üniversitesi",
    "Antalya Bilim Üniversitesi",
    "Ardahan Üniversitesi",
    "Arkın Yaratıcı Sanatlar ve Tasarım Üniversitesi",
    "Artvin Çoruh Üniversitesi",
    "Atatürk Üniversitesi",
    "Atılım Üniversitesi",
    "Avrasya Üniversitesi",
    "Aydın Adnan Menderes Üniversitesi",
    "Bahçeşehir Kıbrıs Üniversitesi",
    "Bahçeşehir Üniversitesi",
    "Balıkesir Üniversitesi",
    "Bandırma Onyedi Eylül Üniversitesi",
    "Bartın Üniversitesi",
    "Başkent Üniversitesi",
    "Batman Üniversitesi",
    "Bayburt Üniversitesi",
    "Beykent Üniversitesi",
    "Beykoz Üniversitesi",
    "Bezmiâlem Vakıf Üniversitesi",
    "Bilecik Şeyh Edebali Üniversitesi",
    "Bingöl Üniversitesi",
    "Biruni Üniversitesi",
    "Bitlis Eren Üniversitesi",
    "Boğaziçi Üniversitesi",
    "Bolu Abant İzzet Baysal Üniversitesi",
    "Burdur Mehmet Akif Ersoy Üniversitesi",
    "Bursa Teknik Üniversitesi",
    "Bursa Uludağ Üniversitesi",
    "Çağ Üniversitesi",
    "Çanakkale Onsekiz Mart Üniversitesi",
    "Çankaya Üniversitesi",
    "Çankırı Karatekin Üniversitesi",
    "Çukurova Üniversitesi",
    "Demiroğlu Bilim Üniversitesi",
    "Dicle Üniversitesi",
    "Doğu Akdeniz Üniversitesi",
    "Doğuş Üniversitesi",
    "Dokuz Eylül Üniversitesi",
    "Düzce Üniversitesi",
    "Ege Üniversitesi",
    "Erciyes Üniversitesi",
    "Erzincan Binali Yıldırım Üniversitesi",
    "Erzurum Teknik Üniversitesi",
    "Eskişehir Osmangazi Üniversitesi",
    "Eskişehir Teknik Üniversitesi",
    "Fatih Sultan Mehmet Vakıf Üniversitesi",
    "Fenerbahçe Üniversitesi",
    "Fırat Üniversitesi",
    "Galatasaray Üniversitesi",
    "Gazi Üniversitesi",
    "Gaziantep İslam Bilim ve Teknoloji Üniversitesi",
    "Gaziantep Üniversitesi",
    "Gebze Teknik Üniversitesi",
    "Girne Amerikan Üniversitesi",
    "Giresun Üniversitesi",
    "Gümüşhane Üniversitesi",
    "Hacettepe Üniversitesi",
    "Hakkari Üniversitesi",
    "Haliç Üniversitesi",
    "Harran Üniversitesi",
    "Hasan Kalyoncu Üniversitesi",
    "Hatay Mustafa Kemal Üniversitesi",
    "Hitit Üniversitesi",
    "Iğdır Üniversitesi",
    "İbn Haldun Üniversitesi",
    "İhsan Doğramacı Bilkent Üniversitesi",
    "İnönü Üniversitesi",
    "Isparta Uygulamalı Bilimler Üniversitesi",
    "Işık Üniversitesi",
    "İskenderun Teknik Üniversitesi",
    "İstanbul 29 Mayıs Üniversitesi",
    "İstanbul Arel Üniversitesi",
    "İstanbul Atlas Üniversitesi",
    "İstanbul Aydın Üniversitesi",
    "İstanbul Esenyurt Üniversitesi",
    "İstanbul Galata Üniversitesi",
    "İstanbul Gedik Üniversitesi",
    "İstanbul Gelişim Üniversitesi",
    "İstanbul Kent Üniversitesi",
    "İstanbul Kültür Üniversitesi",
    "İstanbul Medeniyet Üniversitesi",
    "İstanbul Medipol Üniversitesi",
    "İstanbul Okan Üniversitesi",
    "İstanbul Rumeli Üniversitesi",
    "İstanbul Sabahattin Zaim Üniversitesi",
    "İstanbul Sağlık ve Teknoloji Üniversitesi",
    "İstanbul Teknik Üniversitesi",
    "İstanbul Ticaret Üniversitesi",
    "İstanbul Topkapı Üniversitesi",
    "İstanbul Üniversitesi",
    "İstanbul Üniversitesi-Cerrahpaşa",
    "İstanbul Yeni Yüzyıl Üniversitesi",
    "İstinye Üniversitesi",
    "İzmir Demokrasi Üniversitesi",
    "İzmir Ekonomi Üniversitesi",
    "İzmir Kâtip Çelebi Üniversitesi",
    "İzmir Tınaztepe Üniversitesi",
    "İzmir Yüksek Teknoloji Enstitüsü",
    "Jandarma ve Sahil Güvenlik Akademisi",
    "Kadir Has Üniversitesi",
    "Kafkas Üniversitesi",
    "Kahramanmaraş İstiklal Üniversitesi",
    "Kahramanmaraş Sütçü İmam Üniversitesi",
    "Kapadokya Üniversitesi",
    "Karabük Üniversitesi",
    "Karadeniz Teknik Üniversitesi",
    "Karamanoğlu Mehmetbey Üniversitesi",
    "Kastamonu Üniversitesi",
    "Kayseri Üniversitesi",
    "Kıbrıs Batı Üniversitesi",
    "Kıbrıs İlim Üniversitesi",
    "Kıbrıs Sağlık ve Toplum Bilimleri Üniversitesi",
    "Kilis 7 Aralık Üniversitesi",
    "Kırıkkale Üniversitesi",
    "Kırklareli Üniversitesi",
    "Kırşehir Ahi Evran Üniversitesi",
    "Koç Üniversitesi",
    "Kocaeli Üniversitesi",
    "Konya Gıda ve Tarım Üniversitesi",
    "Konya Teknik Üniversitesi",
    "KTO Karatay Üniversitesi",
    "Kütahya Dumlupınar Üniversitesi",
    "Kütahya Sağlık Bilimleri Üniversitesi",
    "Lefke Avrupa Üniversitesi",
    "Lokman Hekim Üniversitesi",
    "Malatya Turgut Özal Üniversitesi",
    "Maltepe Üniversitesi",
    "Manisa Celal Bayar Üniversitesi",
    "Mardin Artuklu Üniversitesi",
    "Marmara Üniversitesi",
    "MEF Üniversitesi",
    "Mersin Üniversitesi",
    "Mimar Sinan Güzel Sanatlar Üniversitesi",
    "Milli Savunma Üniversitesi",
    "Mudanya Üniversitesi",
    "Muğla Sıtkı Koçman Üniversitesi",
    "Munzur Üniversitesi",
    "Muş Alparslan Üniversitesi",
    "Necmettin Erbakan Üniversitesi",
    "Nevşehir Hacı Bektaş Veli Üniversitesi",
    "Niğde Ömer Halisdemir Üniversitesi",
    "Nişantaşı Üniversitesi",
    "Nuh Naci Yazgan Üniversitesi",
    "Onbeş Kasım Kıbrıs Üniversitesi",
    "Ondokuz Mayıs Üniversitesi",
    "Ordu Üniversitesi",
    "Orta Doğu Teknik Üniversitesi",
    "Osmaniye Korkut Ata Üniversitesi",
    "Ostim Teknik Üniversitesi",
    "Özyeğin Üniversitesi",
    "Pamukkale Üniversitesi",
    "Piri Reis Üniversitesi",
    "Polis Akademisi",
    "Rauf Denktaş Üniversitesi",
    "Recep Tayyip Erdoğan Üniversitesi",
    "Sabancı Üniversitesi",
    "Sağlık Bilimleri Üniversitesi",
    "Sakarya Üniversitesi",
    "Sakarya Uygulamalı Bilimler Üniversitesi",
    "Samsun Üniversitesi",
    "Sanko Üniversitesi",
    "Selçuk Üniversitesi",
    "Siirt Üniversitesi",
    "Sinop Üniversitesi",
    "Sivas Bilim ve Teknoloji Üniversitesi",
    "Sivas Cumhuriyet Üniversitesi",
    "Süleyman Demirel Üniversitesi",
    "Şırnak Üniversitesi",
    "Tarsus Üniversitesi",
    "TED Üniversitesi",
    "Tekirdağ Namık Kemal Üniversitesi",
    "TOBB Ekonomi ve Teknoloji Üniversitesi",
    "Tokat Gaziosmanpaşa Üniversitesi",
    "Toros Üniversitesi",
    "Trabzon Üniversitesi",
    "Trakya Üniversitesi",
    "Türk Hava Kurumu Üniversitesi",
    "Türk-Alman Üniversitesi",
    "Ufuk Üniversitesi",
    "Uluslararası Final Üniversitesi",
    "Uluslararası Kıbrıs Üniversitesi",
    "Uşak Üniversitesi",
    "Üsküdar Üniversitesi",
    "Van Yüzüncü Yıl Üniversitesi",
    "Yakın Doğu Üniversitesi",
    "Yalova Üniversitesi",
    "Yaşar Üniversitesi",
    "Yeditepe Üniversitesi",
    "Yıldız Teknik Üniversitesi",
    "Yozgat Bozok Üniversitesi",
    "Yüksek İhtisas Üniversitesi",
    "Zonguldak Bülent Ecevit Üniversitesi"
  ].sort((a, b) => a.localeCompare(b, 'tr'))
};

const DataStore = {
  currentUser: null,

  async init() {
    return new Promise((resolve) => {
      supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('🔵 AUTH EVENT:', event, session ? 'SESSION VAR' : 'SESSION YOK');
        this.currentUser = session ? session.user : null;

        if (event === 'INITIAL_SESSION') {
          console.log('🟡 INITIAL_SESSION, currentUser:', this.currentUser ? this.currentUser.email : 'null');
          resolve();
        }

        if (typeof App !== 'undefined' && App.updateHeaderUI) {
          App.updateHeaderUI();
          if (event === 'SIGNED_IN') App.navigate('#/');
          if (event === 'SIGNED_OUT') App.navigate('#/');
        }
      });
    });
  },

  async register(email, password, name, phone, city) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone, city }
      }
    });
    if (error) throw error;
    return data;
  },

  async login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  async loginWithOAuth(provider) {
    const redirectTo = window.location.origin + '/';
    console.log('🔵 OAuth redirectTo:', redirectTo);
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectTo
      }
    });
    if (error) throw error;
    return data;
  },

  async sendMagicLink(email) {
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) throw error;
    return data;
  },

  getUser() {
    if (!this.currentUser) return null;
    // Google OAuth'ta ad 'full_name', normal kayıtta 'name' olarak gelir
    const meta = this.currentUser.user_metadata || {};
    const name = meta.full_name || meta.name || this.currentUser.email?.split('@')[0] || 'Kullanıcı';
    return {
       id: this.currentUser.id,
       name: name,
       phone: meta.phone || '',
       city: meta.city || '',
       email: this.currentUser.email
    };
  },

  async updateProfile(name, city, phone) {
    const { data, error } = await supabaseClient.auth.updateUser({
      data: { name: name, city: city, phone: phone }
    });
    if (error) throw error;
    // update local reference
    this.currentUser = data.user;
    return data;
  },

  async getAll() {
    const { data, error } = await supabaseClient.from('listings').select('*').order('createdat', { ascending: false });
    if(error) console.error(error);
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabaseClient.from('listings').select('*').eq('id', id).single();
    if(error) console.error(error);
    return data;
  },

  async create(listing) {
    const user = this.getUser();
    if (!user) throw new Error("Giriş yapılmamış");
    listing.userId = user.id;
    const { error } = await supabaseClient.from('listings').insert([listing]);
    if(error) {
       console.error(error);
       throw error;
    }
  },

  async deleteListing(id) {
    const user = this.getUser();
    if (!user) throw new Error("Giriş yapılmamış");
    const { error } = await supabaseClient.from('listings').delete().match({ id: id, userId: user.id });
    if(error) {
       console.error(error);
       throw error;
    }
  },

  async search(query, cityFilter = 'all', categoryFilter = 'all', universityFilter = 'all') {
    let queryBuilder = supabaseClient.from('listings').select('*').order('createdat', { ascending: false });

    if (cityFilter && cityFilter !== 'all') {
      queryBuilder = queryBuilder.eq('city', cityFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      queryBuilder = queryBuilder.eq('category', categoryFilter);
    }

    if (universityFilter && universityFilter !== 'all') {
      queryBuilder = queryBuilder.eq('university', universityFilter);
    }

    if (query) {
      queryBuilder = queryBuilder.ilike('description', `%${query}%`);
    }

    const { data, error } = await queryBuilder;
    if(error) console.error(error);
    return data || [];
  },

  async getFavorites() {
    const user = this.getUser();
    if (!user) return [];
    const { data, error } = await supabaseClient.from('favorites').select('listingid').eq('userid', user.id);
    if(error) {
       console.error(error);
       return [];
    }
    return data ? data.map(f => f.listingid) : [];
  },

  async toggleFavorite(listingId) {
    const user = this.getUser();
    if (!user) return false;
    
    const { data: existing } = await supabaseClient.from('favorites')
      .select('id').match({ userid: user.id, listingid: listingId }).single();

    if (existing) {
       await supabaseClient.from('favorites').delete().match({ id: existing.id });
       return false;
    } else {
       await supabaseClient.from('favorites').insert([{ userid: user.id, listingid: listingId }]);
       return true;
    }
  },

  async sendMessage(receiverId, listingId, content) {
    const user = this.getUser();
    if (!user) throw new Error("Giriş yapılmamış");
    
    const { error } = await supabaseClient.from('messages').insert([{
      sender_id: user.id,
      receiver_id: receiverId,
      listing_id: listingId,
      content: content
    }]);
    if (error) throw error;
  },

  async getMessages(otherUserId) {
    const user = this.getUser();
    if (!user) return [];
    
    const { data, error } = await supabaseClient.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
      
    if (error) { console.error(error); return []; }
    return data;
  },

  async getConversations() {
    const user = this.getUser();
    if (!user) return [];

    const { data, error } = await supabaseClient.from('messages')
      .select('sender_id, receiver_id, content, created_at, listing_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) { console.error(error); return []; }

    const convos = new Map();
    data.forEach(msg => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!convos.has(otherId)) {
        convos.set(otherId, {
          userId: otherId,
          lastMessage: msg.content,
          date: msg.created_at,
          listingId: msg.listing_id
        });
      }
    });

    const convoList = Array.from(convos.values());
    if (convoList.length === 0) return convoList;

    // Batch: listing başlıkları + karşı taraf adları (2 paralel sorgu, N+1 yok)
    const listingIds = [...new Set(convoList.map(c => c.listingId).filter(Boolean))];
    const otherUserIds = [...new Set(convoList.map(c => c.userId))];

    const [listingsRes, namesRes] = await Promise.all([
      listingIds.length > 0
        ? supabaseClient.from('listings').select('id, description').in('id', listingIds)
        : Promise.resolve({ data: [] }),
      supabaseClient.from('listings').select('userId, userName, username').in('userId', otherUserIds)
    ]);

    const listingMap = new Map((listingsRes.data || []).map(l => [l.id, l.description]));
    const nameMap = new Map();
    (namesRes.data || []).forEach(l => {
      if (!nameMap.has(l.userId)) nameMap.set(l.userId, l.userName || l.username || null);
    });

    convoList.forEach(c => {
      c.listingTitle = listingMap.get(c.listingId) || null;
      c.otherUserName = nameMap.get(c.userId) || null;
    });

    return convoList;
  },

  async getUserListings() {
    const user = this.getUser();
    if (!user) return [];
    const { data, error } = await supabaseClient.from('listings').select('*').eq('userId', user.id).order('createdat', { ascending: false });
    if(error) console.error(error);
    return data || [];
  },

  async getUserRatings(userId) {
    try {
      const { data, error } = await supabaseClient
        .from('ratings')
        .select('stars, comment, created_at, rater_id')
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false });
      if (error) { console.error(error); return []; }
      return data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getUserRatingSummary(userId) {
    const ratings = await this.getUserRatings(userId);
    if (ratings.length === 0) return { average: 0, count: 0 };
    const total = ratings.reduce((sum, r) => sum + r.stars, 0);
    return {
      average: Math.round((total / ratings.length) * 10) / 10,
      count: ratings.length
    };
  }
};
