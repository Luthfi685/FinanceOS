<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('badge_key')->index();       // e.g. 'streak_7', 'first_million', 'dream_conqueror'
            $table->string('badge_name');
            $table->string('emoji');
            $table->string('description');
            $table->string('category');                 // 'streak', 'wealth', 'discipline', 'achievement'
            $table->string('level')->default('bronze'); // bronze, silver, gold, diamond
            $table->integer('xp_reward')->default(0);
            $table->timestamp('earned_at');
            $table->timestamps();
            $table->unique(['user_id', 'badge_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_badges');
    }
};
