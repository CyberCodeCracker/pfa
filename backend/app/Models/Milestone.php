<?php

namespace App\Models;

use App\Support\Enums\MilestoneStatut;
use Illuminate\Database\Eloquent\Model;

class Milestone extends Model
{
    protected $fillable = [
        'stage_id',
        'titre',
        'description',
        'ordre',
        'statut',
        'completed_at',
        'validated_at',
    ];

    protected function casts(): array
    {
        return [
            'statut'       => MilestoneStatut::class,
            'completed_at' => 'datetime',
            'validated_at' => 'datetime',
        ];
    }

    public function stage()
    {
        return $this->belongsTo(Stage::class);
    }
}
