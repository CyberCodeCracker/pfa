<?php

namespace App\Models;

use App\Support\Enums\ChatType;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'chat_type',
        'chat_id',
        'sender_id',
        'contenu',
        'attachment_path',
        'attachment_mime',
        'edited_at',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'chat_type'  => ChatType::class,
            'edited_at'  => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function reads()
    {
        return $this->hasMany(MessageRead::class);
    }

    public function isReadBy(User $user): bool
    {
        return $this->reads()->where('user_id', $user->id)->exists();
    }
}
