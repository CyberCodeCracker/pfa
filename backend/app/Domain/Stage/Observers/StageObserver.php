<?php

namespace App\Domain\Stage\Observers;

use App\Models\PublicChat;
use App\Models\Stage;

class StageObserver
{
    public function created(Stage $stage): void
    {
        PublicChat::create([
            'stage_id'   => $stage->id,
            'created_at' => now(),
        ]);
    }
}
