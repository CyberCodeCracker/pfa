<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'stage_id',
        'etudiant_id',
        'enseignant_id',
        'contenu',
        'note',
        'document_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'note'       => 'float',
            'created_at' => 'datetime',
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

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
