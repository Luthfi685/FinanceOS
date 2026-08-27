<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['bank', 'e-wallet', 'crypto', 'cash'])->default('bank');
            $table->decimal('balance', 20, 2)->default(0);
            $table->string('currency', 3)->default('IDR');
            $table->string('color', 7)->default('#10B981');
            $table->string('icon')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
