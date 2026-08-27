<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Wallet;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReceiptScannerController extends Controller
{
    protected GeminiService $gemini;

    public function __construct(GeminiService $gemini)
    {
        $this->gemini = $gemini;
    }

    /**
     * Upload receipt and parse via Gemini Multimodal OCR
     */
    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'receipt' => ['required', 'image', 'max:8192'], // Max 8MB image
        ]);

        $file = $request->file('receipt');
        $mimeType = $file->getMimeType();
        $tempPath = $file->getRealPath();

        $result = $this->gemini->scanReceipt($tempPath, $mimeType);

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        $parsedData = $result['data'] ?? [];

        // Match or find suggested category in user's category list
        $suggestedName = $parsedData['suggested_category'] ?? 'Belanja';
        $matchedCategory = Auth::user()->categories()
            ->where('type', 'expense')
            ->where('name', 'LIKE', "%{$suggestedName}%")
            ->first();

        // Default to first wallet if none selected
        $defaultWallet = Auth::user()->wallets()->where('is_default', true)->first() 
            ?? Auth::user()->wallets()->first();

        $enhancedData = array_merge($parsedData, [
            'matched_category_id' => $matchedCategory?->id,
            'default_wallet_id' => $defaultWallet?->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $enhancedData,
        ]);
    }
}
