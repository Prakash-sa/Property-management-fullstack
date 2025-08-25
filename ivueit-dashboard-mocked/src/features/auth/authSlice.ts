import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const initialToken = (() => { try { return localStorage.getItem('jwt_token'); } catch { return null; } })();

export const login = createAsyncThunk('auth/login', async ({ email, password }: { email: string; password: string }) => {
  const { data } = await api.post('/login', { email, password });
  return data.token as string;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: initialToken as string | null, status: 'idle' as 'idle'|'loading'|'succeeded'|'failed', error: null as string | null },
  reducers: {
    logout(state) { state.token = null; try { localStorage.removeItem('jwt_token'); } catch {} },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; });
    b.addCase(login.fulfilled, (s, a) => { s.status = 'succeeded'; s.token = a.payload; try { localStorage.setItem('jwt_token', a.payload); } catch {} });
    b.addCase(login.rejected, (s, a) => { s.status = 'failed'; s.error = a.error?.message || 'Login failed'; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
