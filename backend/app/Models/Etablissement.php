<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    protected $fillable = ['nom', 'code', 'ville'];

    public function enseignants()
    {
        return $this->belongsToMany(
            EnseignantProfile::class,
            'enseignant_etablissement',
            'etablissement_id',
            'enseignant_id'
        );
    }

    public function stages()
    {
        return $this->hasMany(Stage::class);
    }
}
