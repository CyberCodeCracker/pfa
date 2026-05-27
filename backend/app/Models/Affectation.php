<?php

namespace App\Models;

use App\Support\Enums\AffectationStatut;
use Illuminate\Database\Eloquent\Model;

class Affectation extends Model
{
    protected $fillable = [
        'stage_id',
        'etudiant_id',
        'date_affectation',
        'statut',
        'invitation_token',
        'invitation_sent_at',
        'invitation_accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'date_affectation'        => 'date',
            'invitation_sent_at'      => 'datetime',
            'invitation_accepted_at'  => 'datetime',
            'statut'                  => AffectationStatut::class,
        ];
    }

    public function stage()
    {
        return $this->belongsTo(Stage::class);
    }

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }
}
