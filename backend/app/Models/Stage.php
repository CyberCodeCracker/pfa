<?php

namespace App\Models;

use App\Support\Enums\StageStatut;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'statut',
        'niveau',
        'etablissement_id',
        'enseignant_id',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin'   => 'date',
            'statut'     => StageStatut::class,
        ];
    }

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function affectations()
    {
        return $this->hasMany(Affectation::class);
    }

    public function etudiants()
    {
        return $this->hasManyThrough(User::class, Affectation::class, 'stage_id', 'id', 'id', 'etudiant_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    public function reunions()
    {
        return $this->hasMany(Reunion::class);
    }

    public function publicChat()
    {
        return $this->hasOne(PublicChat::class);
    }
}
