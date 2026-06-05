<?php

namespace App\Support\Enums;

enum PaceIndicator: string
{
    case Ahead    = 'ahead';     // En avance — rythme excellent
    case OnTrack  = 'on_track';  // À l'heure — satisfaisant
    case Behind   = 'behind';    // En retard — à surveiller
    case AtRisk   = 'at_risk';   // En difficulté — intervention requise
}
