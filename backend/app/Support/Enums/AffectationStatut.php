<?php

namespace App\Support\Enums;

enum AffectationStatut: string
{
    case Invite  = 'invité';
    case Actif   = 'actif';
    case Retire  = 'retiré';
}
