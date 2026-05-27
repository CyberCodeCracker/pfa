<?php

namespace App\Support\Enums;

enum DocumentStatut: string
{
    case EnAttente = 'en_attente';
    case Valide    = 'validé';
    case Refuse    = 'refusé';
}
