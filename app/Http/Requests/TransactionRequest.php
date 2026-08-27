<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wallet_id'   => ['required', 'integer', 'exists:wallets,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'amount'      => ['required', 'numeric', 'gt:0', 'max:999999999999'],
            'type'        => ['required', 'in:income,expense,transfer'],
            'description' => ['nullable', 'string', 'max:255'],
            'merchant_name'=> ['nullable', 'string', 'max:150'],
            'date'        => ['required', 'date', 'before_or_equal:today'],
            'currency'    => ['required', 'string', 'size:3'],
        ];
    }

    public function messages(): array
    {
        return [
            'wallet_id.required'  => 'Wallet harus dipilih.',
            'wallet_id.exists'    => 'Wallet tidak valid.',
            'amount.required'     => 'Jumlah wajib diisi.',
            'amount.numeric'      => 'Jumlah harus berupa angka.',
            'amount.gt'           => 'Jumlah harus lebih dari 0.',
            'type.required'       => 'Tipe transaksi wajib dipilih.',
            'type.in'             => 'Tipe transaksi tidak valid.',
            'date.required'       => 'Tanggal wajib diisi.',
            'date.before_or_equal'=> 'Tanggal tidak boleh di masa depan.',
        ];
    }
}
