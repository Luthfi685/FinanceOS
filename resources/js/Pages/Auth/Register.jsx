import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, User, ArrowRight, DollarSign } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        default_currency: 'IDR',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun Baru — FinanceOS" />

            <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-white">Buat Akun Baru</h2>
                <p className="text-xs text-muted mt-1">Mulai kendalikan portofolio finansial Anda hari ini</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="label-luxury">Nama Lengkap</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            id="name"
                            name="name"
                            value={data.name}
                            className="input-luxury pl-10"
                            autoComplete="name"
                            placeholder="Alex Morgan"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

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
                            placeholder="alex@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="label-luxury">Kata Sandi</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="input-luxury pl-10"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div>
                        <label className="label-luxury">Konfirmasi Sandi</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="input-luxury pl-10"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1.5" />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full btn-primary py-3 justify-center text-sm font-bold shadow-emerald-sm"
                    >
                        {processing ? 'Mendaftarkan...' : 'Daftar Sekarang'} <ArrowRight size={16} />
                    </button>
                </div>

                <div className="text-center pt-4 border-t border-surface-border">
                    <p className="text-xs text-muted">
                        Sudah punya akun?{' '}
                        <Link href={route('login')} className="text-emerald font-semibold hover:underline">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
