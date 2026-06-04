<?php

namespace App\Support\Enums;

enum Semestre: string
{
    case S1 = 'S1'; // Semestre 1 — validation des stages d'été
    case S2 = 'S2'; // Semestre 2 — PFE / PFA
}
