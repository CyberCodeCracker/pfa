<?php

namespace App\Support\Enums;

enum StageStatut: string
{
    case Actif     = 'actif';
    case Suspendu  = 'suspendu';
    case Termine   = 'terminé';
}
