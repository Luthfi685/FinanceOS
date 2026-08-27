<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 20, 2);
            $table->enum('type', ['income', 'expense', 'transfer'])->default('expense');
            $table->string('description')->nullable();
            $table->string('merchant_name')->nullable();
            $table->date('date');
            $table->string('currency', 3)->default('IDR');
            $table->boolean('is_ai_generated')->default(false);
            $table->json('ai_metadata')->nullable();
            $table->string('receipt_path')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'type']);
            $table->index(['wallet_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
