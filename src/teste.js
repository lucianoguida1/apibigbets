// auth_flow.js
// Executa: node auth_flow.js
const axios = require('axios').default;
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// ===== CONFIG =====
const API_BASE_URL = 'http://localhost:3001'; // ajuste
const creds = {
  name: 'Teste Flow',
  email: `teste.flow+${Date.now()}@bigfut.pro`, // evita conflito
  password: 'Senha@Forte123',
};

// ===== AXIOS + COOKIE JAR (para o refresh httpOnly) =====
const jar = new CookieJar();
const api = wrapper(axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  jar,
  // timeout: 10000,
}));

let accessToken = null;

// helper p/ mostrar respostas resumidas
function logStep(title, info = {}) {
  console.log(`\n=== ${title} ===`);
  if (info.status) console.log('status:', info.status);
  if (info.data) console.log('data:', info.data);
  if (info.cookies) console.log('cookies:', info.cookies);
}

async function registerUser() {
  try {
    const { status, data } = await api.post('/auth/register', {
      name: creds.name,
      email: creds.email.trim().toLowerCase(),
      password: creds.password,
    });
    logStep('REGISTER OK', { status, data });
  } catch (err) {
    if (err.response?.status === 409) {
      logStep('REGISTER (email já existe, seguindo)', { status: err.response.status, data: err.response.data });
      return;
    }
    throw err;
  }
}

async function login() {
  const { status, data, headers } = await api.post('/auth/login', {
    email: creds.email.trim().toLowerCase(),
    password: creds.password,
  });

  accessToken = data.accessToken;
  // Define Authorization para próximas chamadas protegidas
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  // Mostra cookies do jar (deve ter 'rt' com Path=/auth/refresh)
  const cookies = await jar.getCookies(API_BASE_URL);
  logStep('LOGIN OK', { status, data: { user: data.user, accessToken: accessToken?.slice(0, 20) + '...' }, cookies });
}

async function me(label = 'ME') {
  const { status, data } = await api.get('/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  logStep(label, { status, data });
}

async function refresh() {
  const { status, data } = await api.post('/auth/refresh');
  accessToken = data.accessToken;
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  const cookies = await jar.getCookies(API_BASE_URL);
  logStep('REFRESH OK', { status, data: { user: data.user, accessToken: accessToken?.slice(0, 20) + '...' }, cookies });
}

async function logout() {
  const { status, data } = await api.post('/auth/logout');
  logStep('LOGOUT OK', { status, data });
}

(async () => {
  try {
    console.log('Base URL:', API_BASE_URL);
    // 1) Registrar (ou seguir se já existir)
    await registerUser();

    // 2) Login (gera access + salva cookie rt no jar)
    await login();

    // 3) Chamar uma rota protegida com o access atual (opcional)
    await me('ME (antes do refresh)');

    // 4) Refresh (rotaciona cookie rt e devolve novo access)
    await refresh();

    // 5) Chamar rota protegida com novo access (opcional)
    await me('ME (depois do refresh)');

    // 6) Logout (revoga refresh e limpa cookie)
    await logout();
  } catch (err) {
  console.log("err ==> ", err);
    if (err.response) {
      console.error('\n*** ERRO HTTP ***');
      console.error('status:', err.response.status);
      console.error('data  :', err.response.data);
    } else {
      console.error('\n*** ERRO ***');
      console.error(err.message);
    }
    process.exitCode = 1;
  }
})();
