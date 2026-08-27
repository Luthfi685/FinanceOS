import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Masuk — FinanceOS" />

            <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-white">Selamat Datang Kembali</h2>
                <p className="text-xs text-muted mt-1">Akses dashboard dan portofolio kekayaan Anda</p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-emerald bg-emerald/10 p-3 rounded-xl border border-emerald/20">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="label-luxury">Alamat Email</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="input-luxury pl-10"
                            autoComplete="username"
                            placeholder="nama@email.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="label-luxury mb-0">Kata Sandi</label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-emerald hover:underline"
                            >
                                Lupa sandi?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="input-luxury pl-10"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded bg-surface-elevated border-surface-border text-emerald focus:ring-emerald/40"
                        />
                        <span className="text-xs text-muted">Ingat saya di perangkat ini</span>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full btn-primary py-3 justify-center text-sm font-bold shadow-emerald-sm"
                    >
                        {processing ? 'Memproses...' : 'Masuk ke Akun'} <ArrowRight size={16} />
                    </button>
                </div>

                <div className="text-center pt-4 border-t border-surface-border">
                    <p className="text-xs text-muted">
                        Belum memiliki akun?{' '}
                        <Link href={route('register')} className="text-emerald font-semibold hover:underline">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
