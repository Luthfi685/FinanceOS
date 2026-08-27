<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:100'],
            'type'       => ['required', 'in:bank,e-wallet,crypto,cash'],
            'balance'    => ['sometimes', 'numeric', 'min:0'],
            'currency'   => ['required', 'string', 'size:3'],
            'color'      => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'icon'       => ['nullable', 'string', 'max:50'],
            'is_default' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'   => 'Nama wallet wajib diisi.',
            'type.required'   => 'Tipe wallet wajib dipilih.',
            'type.in'         => 'Tipe wallet tidak valid.',
            'currency.size'   => 'Currency harus 3 karakter (contoh: IDR, USD).',
            'color.regex'     => 'Format warna tidak valid (gunakan hex #RRGGBB).',
        ];
    }
}
