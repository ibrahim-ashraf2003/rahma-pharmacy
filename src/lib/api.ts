const API_URL=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
const url=(p:string)=>`${API_URL}${p}`;
export const isAuthenticated=()=>!!localStorage.getItem('adminToken');
export const login=async(email:string,password:string)=>{const r=await fetch(url('/api/admin/login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json().catch(()=>({}));if(!r.ok||d.success===false)throw new Error(d.error||'Login failed');if(d.token)localStorage.setItem('adminToken',d.token);return d};
export const logout=()=>localStorage.removeItem('adminToken');
export const apiFetch=async(path:string,options:RequestInit={})=>{const headers=new Headers(options.headers);const t=localStorage.getItem('adminToken');if(t)headers.set('Authorization',`Bearer ${t}`);if(options.body&&!headers.has('Content-Type'))headers.set('Content-Type','application/json');const r=await fetch(url(path),{...options,headers});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||`Request failed: ${r.status}`);return d};
export default apiFetch;
