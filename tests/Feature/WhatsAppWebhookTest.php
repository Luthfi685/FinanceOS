<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WhatsAppWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_webhook_returns_health_status(): void
    {
        $response = $this->get('/api/webhook/whatsapp');
        $response->assertStatus(200);
        $response->assertJson(['status' => true]);
    }

    public function test_saldo_command(): void
    {
        Http::fake([
            'https://api.fonnte.com/*' => Http::response(['status' => true], 200),
        ]);

        $user = User::first();
        if (!$user) {
            $user = User::factory()->create();
        }

        $user->update(['whatsapp_number' => '6283126435560']);

        $response = $this->postJson('/api/webhook/whatsapp', [
            'sender'  => '6283126435560',
            'message' => 'saldo',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['status', 'reply']);
        $this->assertStringContainsString('Ringkasan Dompet & Saldo', $response->json('reply'));
    }

    public function test_add_transaction_via_whatsapp(): void
    {
        Http::fake([
            'https://api.fonnte.com/*' => Http::response(['status' => true], 200),
        ]);

        $user = User::first();
        if (!$user) {
            $user = User::factory()->create();
        }

        $user->update(['whatsapp_number' => '6283126435560']);

        $wallet = $user->wallets()->firstOrCreate(
            ['name' => 'BCA'],
            ['type' => 'bank', 'balance' => 500000]
        );

        $initialBalance = $wallet->fresh()->balance;

        $response = $this->postJson('/api/webhook/whatsapp', [
            'sender'  => '6283126435560',
            'message' => 'kopi kenangan 25rb bca',
        ]);

        $response->assertStatus(200);
        $this->assertStringContainsString('Transaksi Berhasil Dicatat', $response->json('reply'));

        // Assert balance decreased by 25,000
        $this->assertEquals($initialBalance - 25000, $wallet->fresh()->balance);
    }
}
