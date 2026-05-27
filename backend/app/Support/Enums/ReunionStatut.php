<?php

namespace App\Support\Enums;

enum ReunionStatut: string
{
    case Planifiee = 'planifiée';
    case Terminee  = 'terminée';
    case Annulee   = 'annulée';
}
