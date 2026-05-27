<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublicChat extends Model
{
    public $timestamps = false;

    protected $fillable = ['stage_id', 'created_at'];

    public function resolveRouteBinding($value, $field = null): static
    {
        return static::where('stage_id', $value)->firstOrFail();
    }

    public function stage()
    {
        return $this->belongsTo(Stage::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'chat_id')
            ->where('chat_type', 'public')
            ->orderBy('created_at');
    }
}
