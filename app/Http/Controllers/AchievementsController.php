<?php

namespace App\Http\Controllers;

use App\Models\UserBadge;
use App\Services\BadgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AchievementsController extends Controller
{
    protected BadgeService $badgeService;

    public function __construct(BadgeService $badgeService)
    {
        $this->badgeService = $badgeService;
    }

    public function index(): Response
    {
        $user = Auth::user();

        // Evaluate & award any new badges
        $newlyAwarded = $this->badgeService->evaluate($user);

        // Fetch all earned badges
        $earned = UserBadge::where('user_id', $user->id)
            ->orderByDesc('earned_at')
            ->get()
            ->map(fn($b) => [
                'id'          => $b->id,
                'badge_key'   => $b->badge_key,
                'badge_name'  => $b->badge_name,
                'emoji'       => $b->emoji,
                'description' => $b->description,
                'category'    => $b->category,
                'level'       => $b->level,
                'xp_reward'   => $b->xp_reward,
                'earned_at'   => $b->earned_at->format('d M Y'),
            ]);

        // XP & Level
        $totalXp   = $this->badgeService->getTotalXp($user);
        $levelInfo = $this->badgeService->getLevelInfo($totalXp);

        // All definitions (to show locked badges)
        $allDefs = $this->badgeService->allDefinitions();
        $earnedKeys = $earned->pluck('badge_key')->toArray();

        $locked = [];
        foreach ($allDefs as $key => $def) {
            if (!in_array($key, $earnedKeys)) {
                $locked[] = [
                    'badge_key'   => $key,
                    'badge_name'  => $def['name'],
                    'emoji'       => $def['emoji'],
                    'description' => $def['description'],
                    'category'    => $def['category'],
                    'level'       => $def['level'],
                    'xp_reward'   => $def['xp'],
                    'locked'      => true,
                ];
            }
        }

        return Inertia::render('Achievements/Index', [
            'earnedBadges'   => $earned,
            'lockedBadges'   => $locked,
            'newlyAwarded'   => collect($newlyAwarded)->map(fn($b) => $b->badge_name)->toArray(),
            'totalXp'        => $totalXp,
            'levelInfo'      => $levelInfo,
            'badgeCount'     => $earned->count(),
            'totalPossible'  => count($allDefs),
        ]);
    }
}
