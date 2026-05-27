<?php

namespace App\Support\Enums;

enum StageStatut: string
{
    case Brouillon = 'brouillon';
    case Actif     = 'actif';
    case Archive   = 'archivé';
    case Termine   = 'terminé';
}
