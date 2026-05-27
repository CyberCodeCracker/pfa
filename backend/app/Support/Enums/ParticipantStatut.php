<?php

namespace App\Support\Enums;

enum ParticipantStatut: string
{
    case Invite   = 'invité';
    case Accepte  = 'accepté';
    case Decline  = 'décliné';
    case Present  = 'présent';
    case Absent   = 'absent';
}
