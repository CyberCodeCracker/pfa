<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnseignantProfile extends Model
{
    protected $table = 'enseignants_profile';

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = ['user_id', 'grade', 'specialite'];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function etablissements()
    {
        return $this->belongsToMany(
            Etablissement::class,
            'enseignant_etablissement',
            'enseignant_id',
            'etablissement_id'
        );
    }
}
