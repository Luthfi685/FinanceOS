<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('cost', 20, 2);
            $table->string('currency', 3)->default('IDR');
            $table->enum('billing_cycle', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])->default('monthly');
            $table->date('due_date');
            $table->date('next_billing_date')->nullable();
            $table->string('category')->nullable();
            $table->string('icon')->nullable();
            $table->string('color', 7)->default('#6B7280');
            $table->boolean('is_active')->default(true);
            $table->boolean('auto_record')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_subscriptions');
    }
};
