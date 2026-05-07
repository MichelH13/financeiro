// Supabase Configuration
// IMPORTANTE: Substitua estas variaveis pelas suas credenciais do Supabase
// Use a URL que você pegou lá no Supabase (Project URL)
const SUPABASE_URL = 'https://ijfvqilgwtvpabbiupdn.supabase.co'; 

// Use a Chave ANON (Project API Key) que fica no mesmo lugar da URL no Supabase
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI'; 


// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const loadingOverlay = document.getElementById('loading');
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const totalBalanceEl = document.getElementById('total-balance');

// State
let currentUser = null;
let transactions = [];

// Utility Functions
function showLoading() {
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

// Auth Functions
async function signInWithGoogle() {
  showLoading();
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    alert('Erro ao fazer login. Tente novamente.');
    hideLoading();
  }
}

async function signOut() {
  showLoading();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    currentUser = null;
    transactions = [];
    showLoginScreen();
  } catch (error) {
    console.error('Erro ao sair:', error.message);
    alert('Erro ao sair. Tente novamente.');
  } finally {
    hideLoading();
  }
}

function showLoginScreen() {
  loginScreen.classList.remove('hidden');
  appScreen.classList.add('hidden');
}

function showAppScreen() {
  loginScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
}

function updateUserInfo(user) {
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  
  userNameEl.textContent = name;
  
  if (avatar) {
    userAvatarEl.src = avatar;
    userAvatarEl.style.display = 'block';
  } else {
    userAvatarEl.style.display = 'none';
  }
}

// Transaction Functions
async function loadTransactions() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('date', { ascending: false });

    if (error) throw error;
    
    transactions = data || [];
    renderTransactions();
    updateSummary();
  } catch (error) {
    console.error('Erro ao carregar transacoes:', error.message);
  }
}

async function addTransaction(transaction) {
  showLoading();
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: currentUser.id
      }])
      .select()
      .single();

    if (error) throw error;
    
    transactions.unshift(data);
    renderTransactions();
    updateSummary();
    transactionForm.reset();
    document.getElementById('date').valueAsDate = new Date();
  } catch (error) {
    console.error('Erro ao adicionar transacao:', error.message);
    alert('Erro ao adicionar transacao. Tente novamente.');
  } finally {
    hideLoading();
  }
}

async function deleteTransaction(id) {
  if (!confirm('Deseja realmente excluir esta transacao?')) return;
  
  showLoading();
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);

    if (error) throw error;
    
    transactions = transactions.filter(t => t.id !== id);
    renderTransactions();
    updateSummary();
  } catch (error) {
    console.error('Erro ao excluir transacao:', error.message);
    alert('Erro ao excluir transacao. Tente novamente.');
  } finally {
    hideLoading();
  }
}

function renderTransactions() {
  if (transactions.length === 0) {
    transactionList.innerHTML = '<p class="empty-message">Nenhuma transacao encontrada</p>';
    return;
  }

  transactionList.innerHTML = transactions.map((t, index) => `
    <div class="transaction-item">
      <div class="transaction-left">
        <span class="transaction-index">${index + 1}.</span>
        <div class="transaction-icon ${t.type}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${t.type === 'income' 
              ? '<path d="M12 19V5M5 12l7-7 7 7"/>'
              : '<path d="M12 5v14M5 12l7 7 7-7"/>'
            }
          </svg>
        </div>
        <div class="transaction-info">
          <h3>${t.description}</h3>
          <p>${t.category} • ${formatDate(t.date)}</p>
        </div>
      </div>
      <div class="transaction-right">
        <span class="transaction-amount ${t.type}">
          ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
        </span>
        <button class="delete-btn" onclick="deleteTransaction('${t.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

function updateSummary() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const balance = income - expenses;

  totalIncomeEl.textContent = formatCurrency(income);
  totalExpensesEl.textContent = formatCurrency(expenses);
  totalBalanceEl.textContent = formatCurrency(balance);
  
  // Update balance color based on value
  if (balance >= 0) {
    totalBalanceEl.style.color = 'var(--primary)';
  } else {
    totalBalanceEl.style.color = 'var(--destructive)';
  }
}

// Event Listeners
googleLoginBtn.addEventListener('click', signInWithGoogle);
logoutBtn.addEventListener('click', signOut);

transactionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const transaction = {
    description: document.getElementById('description').value,
    amount: parseFloat(document.getElementById('amount').value),
    type: document.getElementById('type').value,
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  };

  await addTransaction(transaction);
});

// Set default date to today
document.getElementById('date').valueAsDate = new Date();

// Auth State Listener
supabase.auth.onAuthStateChange(async (event, session) => {
  hideLoading();
  
  if (session?.user) {
    currentUser = session.user;
    updateUserInfo(currentUser);
    showAppScreen();
    await loadTransactions();
  } else {
    currentUser = null;
    showLoginScreen();
  }
});

// Check initial auth state
async function init() {
  showLoading();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    currentUser = session.user;
    updateUserInfo(currentUser);
    showAppScreen();
    await loadTransactions();
  } else {
    showLoginScreen();
  }
  hideLoading();
}

init();
