<?php

namespace App\Models;

use App\Support\Enums\ReunionStatut;
use Illuminate\Database\Eloquent\Model;

class Reunion extends Model
{
    protected $fillable = [
        'stage_id',
        'enseignant_id',
        'sujet',
        'description',
        'scheduled_at',
        'duration_minutes',
        'meet_url',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at'     => 'datetime',
            'duration_minutes' => 'integer',
            'statut'           => ReunionStatut::class,
        ];
    }

    public function stage()
    {
        return $this->belongsTo(Stage::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'reunion_participants', 'reunion_id', 'user_id')
            ->withPivot('statut')
            ->withTimestamps();
    }
}
