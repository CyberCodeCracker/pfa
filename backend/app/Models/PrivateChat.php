<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrivateChat extends Model
{
    public $timestamps = false;

    protected $fillable = ['enseignant_id', 'etudiant_id', 'created_at'];

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'enseignant_id');
    }

    public function etudiant()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'chat_id')
            ->where('chat_type', 'private')
            ->orderBy('created_at');
    }
}
