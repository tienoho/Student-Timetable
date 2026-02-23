import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Profile } from './types/supabase';
import Auth from './components/Auth';
import CalendarView from './components/CalendarView';
import { LogOut, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from './lib/utils';
import { Toaster } from 'sonner';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
      setIsConfigured(false);
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setIsTableMissing(false);
      setFetchError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      // Check for missing table error (PostgREST error code PGRST205 or 404 with specific message)
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        setIsTableMissing(true);
      } else if (error.code === 'PGRST116') {
        // Profile not found (trigger might have failed or user created before table)
        console.log('Profile missing, attempting to create...');
        await createMissingProfile(userId);
      } else {
        setFetchError(error.message || 'Có lỗi xảy ra khi tải thông tin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createMissingProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const newProfile = {
        id: userId,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Học sinh',
        grade_level: parseInt(user.user_metadata?.grade_level) || 6, // Default to 6 if missing
        avatar_url: null
      };

      const { error } = await supabase
        .from('profiles')
        .insert([newProfile]);

      if (error) throw error;
      
      // Retry fetching
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (fetchError) throw fetchError;
      setProfile(data);
      setFetchError(null); // Clear any previous error
      
    } catch (err: any) {
      console.error('Error creating missing profile:', err);
      setFetchError('Không thể tạo hồ sơ người dùng. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setFetchError(null);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 text-amber-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-slate-900">Yêu cầu cấu hình Supabase</h1>
          </div>
          <p className="text-slate-600 mb-6 text-lg">
            Ứng dụng cần kết nối với Supabase để hoạt động. Vui lòng thực hiện các bước sau:
          </p>
          <div className="space-y-4 text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold mb-2">1. Tạo dự án Supabase</h3>
              <p>Truy cập <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">supabase.com</a> và tạo một dự án mới.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold mb-2">2. Chạy SQL Script</h3>
              <p>Mở SQL Editor trong Supabase và chạy đoạn mã trong file <code>supabase-schema.sql</code> để tạo bảng và thiết lập bảo mật (RLS).</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-bold mb-2">3. Cấu hình biến môi trường</h3>
              <p>Thêm các biến sau vào môi trường của bạn (hoặc file <code>.env</code>):</p>
              <ul className="list-disc list-inside mt-2 font-mono text-sm bg-slate-800 text-slate-200 p-3 rounded-lg">
                <li>VITE_SUPABASE_URL="your-project-url"</li>
                <li>VITE_SUPABASE_ANON_KEY="your-anon-key"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTableMissing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-slate-900">Chưa khởi tạo Database</h1>
          </div>
          <p className="text-slate-600 mb-6 text-lg">
            Kết nối đến Supabase thành công nhưng không tìm thấy bảng dữ liệu.
          </p>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mb-6">
            <h3 className="font-bold text-slate-900 mb-2">Cách khắc phục:</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700">
              <li>Mở <strong>SQL Editor</strong> trong Dashboard dự án Supabase của bạn.</li>
              <li>Sao chép toàn bộ nội dung file <code>supabase-schema.sql</code> trong dự án này.</li>
              <li>Dán vào SQL Editor và nhấn <strong>Run</strong>.</li>
              <li>Sau khi chạy xong, nhấn nút "Thử lại" bên dưới.</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Đã chạy SQL, Thử lại ngay
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100">
          {fetchError ? (
            <>
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Lỗi tải dữ liệu</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">{fetchError}</p>
              <button
                onClick={handleSignOut}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất để thử lại
              </button>
            </>
          ) : (
            <>
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative z-10 shadow-sm border border-slate-100">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Đang chuẩn bị hồ sơ</h2>
              <p className="text-slate-500">Vui lòng đợi trong giây lát...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const isPrimarySchool = profile.grade_level ? profile.grade_level <= 5 : false;

  return (
    <div className={cn(
      "min-h-screen flex flex-col relative overflow-hidden",
      isPrimarySchool 
        ? "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50 via-amber-50/50 to-rose-50" 
        : "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-cyan-50"
    )}>
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className={cn(
          "absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-30",
          isPrimarySchool ? "bg-orange-300" : "bg-indigo-300"
        )}></div>
        <div className={cn(
          "absolute top-[60%] -left-[10%] w-[40%] h-[40%] rounded-full blur-3xl opacity-20",
          isPrimarySchool ? "bg-rose-300" : "bg-cyan-300"
        )}></div>
      </div>

      <Toaster position="top-center" richColors />
      
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center rounded-2xl font-bold text-white shadow-lg relative overflow-hidden group",
              isPrimarySchool 
                ? "w-14 h-14 bg-gradient-to-br from-orange-400 to-rose-500 text-2xl" 
                : "w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 text-xl"
            )}>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {profile.full_name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h1 className={cn(
                "font-bold text-slate-900 flex items-center gap-2",
                isPrimarySchool ? "text-2xl" : "text-xl"
              )}>
                {profile.full_name}
                {isPrimarySchool && <Sparkles className="w-5 h-5 text-amber-500" />}
              </h1>
              <p className={cn(
                "font-medium flex items-center gap-1.5",
                isPrimarySchool ? "text-orange-600 text-base" : "text-indigo-600 text-sm"
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                Học sinh lớp {profile.grade_level}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <CalendarView profile={profile} />
      </main>
    </div>
  );
}
