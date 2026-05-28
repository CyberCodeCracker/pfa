<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EtudiantProfile extends Model
{
    protected $table = 'etudiants_profile';

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = ['user_id', 'niveau', 'specialite', 'groupe', 'etablissement_id'];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }
}
