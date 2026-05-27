<?php

namespace App\Models;

use App\Support\Enums\Role;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'must_change_password',
        'last_login_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'   => 'datetime',
            'last_login_at'       => 'datetime',
            'password'            => 'hashed',
            'must_change_password' => 'boolean',
            'role'                => Role::class,
        ];
    }

    public function isEnseignant(): bool
    {
        return $this->role === Role::Enseignant;
    }

    public function isEtudiant(): bool
    {
        return $this->role === Role::Etudiant;
    }

    public function enseignantProfile()
    {
        return $this->hasOne(EnseignantProfile::class);
    }

    public function etudiantProfile()
    {
        return $this->hasOne(EtudiantProfile::class);
    }

    public function stages()
    {
        return $this->hasMany(Stage::class, 'enseignant_id');
    }

    public function affectations()
    {
        return $this->hasMany(Affectation::class, 'etudiant_id');
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }
}
