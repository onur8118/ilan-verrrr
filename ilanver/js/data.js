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
  categories: ['Kampüs/Okul', 'Özel Ders', 'Proje/Ödev', 'Ev/Ev Arkadaşı', 'Eşya Satışı', 'Yolculuk', 'Hizmet/Yetenek', 'Kayıp Eşya', 'Sosyal/Etkinlik']
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
    const { data, error } = await supabaseClient.from('listings').select('*').order('createdAt', { ascending: false });
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

  async search(query, cityFilter = 'all', categoryFilter = 'all') {
    let queryBuilder = supabaseClient.from('listings').select('*').order('created_at', { ascending: false });
    
    if (cityFilter && cityFilter !== 'all') {
      queryBuilder = queryBuilder.eq('city', cityFilter);
    }
    
    if (categoryFilter && categoryFilter !== 'all') {
      queryBuilder = queryBuilder.eq('category', categoryFilter);
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
    const { data, error } = await supabaseClient.from('favorites').select('listingId').eq('userId', user.id);
    if(error) {
       console.error(error);
       return [];
    }
    return data ? data.map(f => f.listingId) : [];
  },

  async toggleFavorite(listingId) {
    const user = this.getUser();
    if (!user) return false;
    
    const { data: existing } = await supabaseClient.from('favorites')
      .select('id').match({ userId: user.id, listingId: listingId }).single();
      
    if (existing) {
       await supabaseClient.from('favorites').delete().match({ id: existing.id });
       return false;
    } else {
       await supabaseClient.from('favorites').insert([{ userId: user.id, listingId: listingId }]);
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
    return Array.from(convos.values());
  },

  async getUserListings() {
    const user = this.getUser();
    if (!user) return [];
    const { data, error } = await supabaseClient.from('listings').select('*').eq('userId', user.id).order('created_at', { ascending: false });
    if(error) console.error(error);
    return data || [];
  }
};
