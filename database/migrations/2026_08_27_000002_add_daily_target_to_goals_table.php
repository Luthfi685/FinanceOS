<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->decimal('daily_target', 15, 2)->nullable()->after('target_amount');
            $table->date('last_deposit_at')->nullable()->after('target_date');
            $table->integer('streak_count')->default(0)->after('last_deposit_at');
        });
    }

    public function down(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->dropColumn(['daily_target', 'last_deposit_at', 'streak_count']);
        });
    }
};
