<?php

namespace App\Support\Enums;

enum MilestoneStatut: string
{
    case Pending     = 'pending';      // Not started
    case InProgress  = 'in_progress';  // Work underway
    case Completed   = 'completed';    // Student marked done, awaiting teacher
    case Validated   = 'validated';    // Teacher signed off
}
