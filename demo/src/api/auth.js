export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('authUser') || 'null') } catch { return null }
}

export function getCountKey(baseName) {
  const user = getCurrentUser()
  return `${baseName}_${user ? user.phone : 'guest'}`
}

export function register(phone, password, nickname) {
  if (!/^1[3-9]\d{9}$/.test(phone)) return { ok: false, error: '请输入正确的手机号（11位）' }
  if (password.length < 6) return { ok: false, error: '密码至少6位' }
  if (!nickname.trim()) return { ok: false, error: '请输入昵称' }
  try {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]')
    if (accounts.find(a => a.phone === phone)) return { ok: false, error: '该手机号已注册，请直接登录' }
    accounts.push({ phone, password, nickname: nickname.trim() })
    localStorage.setItem('accounts', JSON.stringify(accounts))
    const user = { phone, nickname: nickname.trim() }
    localStorage.setItem('authUser', JSON.stringify(user))
    return { ok: true, user }
  } catch {
    return { ok: false, error: '注册失败，请重试' }
  }
}

export function login(phone, password) {
  if (!phone || !password) return { ok: false, error: '请填写手机号和密码' }
  try {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]')
    const account = accounts.find(a => a.phone === phone)
    if (!account) return { ok: false, error: '手机号未注册' }
    if (account.password !== password) return { ok: false, error: '密码错误' }
    const user = { phone, nickname: account.nickname }
    localStorage.setItem('authUser', JSON.stringify(user))
    return { ok: true, user }
  } catch {
    return { ok: false, error: '登录失败，请重试' }
  }
}

export function logout() {
  localStorage.removeItem('authUser')
}

export function maskPhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
