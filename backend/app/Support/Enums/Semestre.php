<?php

namespace App\Support\Enums;

enum Semestre: string
{
    case Ete = 'ete'; // Stage d'été (semestre 1)
    case Pfe = 'pfe'; // Projet de Fin d'Études (semestre 2)
    case Pfa = 'pfa'; // Projet de Fin d'Année (semestre 2)
}
