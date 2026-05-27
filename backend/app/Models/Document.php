<?php

namespace App\Models;

use App\Support\Enums\DocumentStatut;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'stage_id',
        'uploader_id',
        'nom',
        'fichier',
        'mime',
        'taille',
        'statut',
        'commentaire',
        'version',
        'parent_document_id',
        'date_upload',
    ];

    protected function casts(): array
    {
        return [
            'statut'      => DocumentStatut::class,
            'date_upload' => 'datetime',
            'taille'      => 'integer',
            'version'     => 'integer',
        ];
    }

    public function stage()
    {
        return $this->belongsTo(Stage::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }

    public function parent()
    {
        return $this->belongsTo(Document::class, 'parent_document_id');
    }

    public function versions()
    {
        return $this->hasMany(Document::class, 'parent_document_id');
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }
}
