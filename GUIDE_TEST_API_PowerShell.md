# Guide de test des APIs ScholarFlow avec cURL sous PowerShell

Ce guide explique, pas à pas, comment tester les APIs de ScholarFlow depuis **Windows PowerShell**
en utilisant **cURL**. Il tient compte de l'authentification SPA Laravel Sanctum (cookies de session
+ protection CSRF) et des particularités de PowerShell.

---

## 0. Prérequis

1. **Les conteneurs Docker sont démarrés** (nginx, php, mysql, reverb…). Vérifier :
   ```powershell
   docker ps --format "{{.Names}}: {{.Status}}"
   ```
   Vous devez voir `pfa_nginx`, `pfa_php`, `pfa_mysql` en `Up`.

2. **Utiliser `curl.exe`, jamais `curl`.**
   Sous PowerShell, `curl` est un **alias** de `Invoke-WebRequest` (une autre commande qui ne
   comprend pas `-c`, `-b`, `-s`…). Le vrai cURL est `curl.exe` (présent dans `C:\Windows\System32`).
   Vérifier :
   ```powershell
   Get-Command curl.exe | Select-Object Source
   ```

3. **Se placer dans le dossier du projet** (le fichier `cookies.txt` y sera créé) :
   ```powershell
   cd C:\projects\pfa
   ```

---

## 1. Comprendre les 3 règles d'or

L'authentification SPA de Sanctum impose **trois contraintes** sur chaque requête cURL :

| Règle | Pourquoi | Comment |
|-------|----------|---------|
| **Cookies partagés** | La session vit dans un cookie. | `-b cookies.txt -c cookies.txt` (lire + écrire le « cookie jar »). |
| **En-tête `Origin`** | Sanctum n'active la session que pour les domaines « stateful ». Sans `Origin` valide → erreur *« Session store not set on request »*. | `-H "Origin: http://localhost:4200"` sur **toutes** les requêtes. |
| **Jeton CSRF frais** | Les requêtes mutantes (POST/PUT/PATCH/DELETE) exigent un en-tête `X-XSRF-TOKEN` qui correspond au cookie `XSRF-TOKEN` **courant**. Le jeton **change** à chaque appel CSRF et à chaque login. | Ré-extraire `$XSRF` du `cookies.txt` **juste avant** chaque requête mutante. |

> Les domaines stateful configurés sont : `localhost`, `127.0.0.1`, `localhost:4200`.
> N'importe lequel convient pour `Origin` ; on utilise `http://localhost:4200`.

---

## 2. Mise en place — la fonction d'aide `Api`

Collez **une seule fois** ce bloc dans votre session PowerShell. Il définit une fonction `Api`
qui gère automatiquement : le rafraîchissement du jeton CSRF, les en-têtes requis, **et l'envoi
du corps JSON via un fichier temporaire sans BOM**.

```powershell
cd C:\projects\pfa
$base = "http://localhost"

function Api($method, $path, $json) {
  # Ré-extrait et décode le jeton XSRF depuis le cookie jar courant
  $xsrf = [System.Net.WebUtility]::UrlDecode(
    (Select-String -Path cookies.txt -Pattern 'XSRF-TOKEN').Line.Split("`t")[-1])

  $a = @(
    "-s", "-X", $method, "$base$path",
    "-b", "cookies.txt", "-c", "cookies.txt",
    "-H", "Origin: http://localhost:4200",
    "-H", "Accept: application/json"
  )
  if ($json) {
    # Écrit le JSON dans un fichier SANS BOM (UTF8Encoding($false)) puis l'envoie via @fichier.
    # Cela évite (1) l'échappement infernal des guillemets et (2) le BOM que Set-Content ajoute.
    [System.IO.File]::WriteAllText("$PWD\.body.json", $json, (New-Object System.Text.UTF8Encoding($false)))
    $a += @("-H", "Content-Type: application/json", "-H", "X-XSRF-TOKEN: $xsrf", "-d", "@$PWD\.body.json")
  }
  curl.exe @a
}
```

> ### ⚠️ Deux pièges PowerShell que cette fonction règle pour vous
> 1. **Échappement des guillemets** : grâce au fichier temporaire, vous écrivez du **JSON normal
>    avec de vrais guillemets `"`** — **plus besoin de `\"`**.
> 2. **BOM UTF-8** : `Set-Content -Encoding utf8` (PowerShell 5.1) ajoute un BOM (`EF BB BF`) en tête
>    de fichier qui **casse le parsing JSON côté Laravel** (corps vu comme vide → *validation.required*).
>    On utilise `[System.IO.File]::WriteAllText(..., UTF8Encoding($false))` qui n'écrit **pas** de BOM.

> **Astuce lisibilité** : pour formater le JSON renvoyé, ajoutez `| ConvertFrom-Json | ConvertTo-Json -Depth 6`
> après un appel `Api ...`.

---

## 3. Étape d'amorçage — obtenir le cookie CSRF

À faire **une fois** au début (et de nouveau si vous obtenez plus tard une erreur *CSRF token mismatch*) :

```powershell
curl.exe -s -c cookies.txt $base/sanctum/csrf-cookie
```

Cela ne renvoie **rien** à l'écran (réponse `204 No Content`) — c'est normal. Le cookie est écrit
dans `C:\projects\pfa\cookies.txt`. Vérifier :

```powershell
Get-Content cookies.txt | Select-String XSRF-TOKEN
```

---

## 4. Sprint 1 — Authentification

### 4.1. Se connecter (enseignant)

```powershell
Api POST /api/login '{"email":"mohamed.benali@enseignant.pfa.tn","password":"Password123!"}'
```
➡️ `{ "data": { "id":1, "role":"enseignant", ... } }`

> **Important** : avec la fonction `Api`, le JSON s'écrit avec de **vrais guillemets `"`** dans une
> chaîne PowerShell entre apostrophes `'...'` — aucun échappement `\"` n'est nécessaire.

### 4.2. Consulter son profil

```powershell
Api GET /api/v1/me $null
```

### 4.3. Changer le mot de passe (si forcé)

```powershell
Api POST /api/v1/auth/change-password '{"current_password":"Password123!","new_password":"NewSecret123","new_password_confirmation":"NewSecret123"}'
```

### 4.4. Mot de passe oublié

```powershell
Api POST /api/v1/auth/forgot-password '{"email":"mohamed.benali@enseignant.pfa.tn"}'
```
> L'email de réinitialisation est visible dans **Mailpit** : http://localhost:8025

### 4.5. Se déconnecter

```powershell
Api POST /api/logout $null
```
➡️ `204 No Content` (aucune sortie). Reconnectez-vous ensuite via 4.1 pour continuer.

---

## 5. Sprint 2 — Gestion de stage

> Restez connecté en tant qu'**enseignant** (étape 4.1).

### 5.1. Lister les établissements (données de référence)

```powershell
Api GET /api/v1/etablissements $null
```

### 5.2. Lister les stages

```powershell
Api GET "/api/v1/stages?per_page=5" $null
```

### 5.3. Créer un stage

```powershell
Api POST /api/v1/stages '{"titre":"Optimisation IA sante","description":"Recherche deep learning","date_debut":"2026-07-01","date_fin":"2026-09-30","niveau":"Master 2","annee_academique":"2025-2026","semestre":"pfe","etablissement_id":1}'
```
➡️ Notez l'`id` du stage retourné (ex. `84`) pour les étapes suivantes.

### 5.4. Consulter un stage

```powershell
Api GET /api/v1/stages/82 $null
```

### 5.5. Modifier un stage (statut + rythme)

```powershell
Api PUT /api/v1/stages/82 '{"statut":"actif","pace_indicator":"on_track"}'
```

### 5.6. Inviter des étudiants

```powershell
Api POST /api/v1/stages/82/affectations '{"etudiants":[{"nom":"Lefebvre","prenom":"Sophie","email":"sophie@univ.tn"}]}'
```
> L'email d'invitation apparaît dans **Mailpit** (http://localhost:8025).

### 5.7. Étapes (milestones)

```powershell
# Créer une étape
Api POST /api/v1/stages/82/milestones '{"titre":"Conception","description":"Cadrage du projet","ordre":1}'

# Valider l'étape (remplacez 5 par l'id retourné)
Api POST /api/v1/milestones/5/validate $null

# Rouvrir l'étape
Api POST /api/v1/milestones/5/reopen $null
```

### 5.8. Documents (téléversement multipart)

Le téléversement utilise `multipart/form-data`, donc on appelle `curl.exe` directement
(pas la fonction `Api`) avec `-F`. Pensez à rafraîchir `$XSRF` juste avant :

```powershell
$XSRF = [System.Net.WebUtility]::UrlDecode((Select-String -Path cookies.txt -Pattern 'XSRF-TOKEN').Line.Split("`t")[-1])

curl.exe -s -X POST http://localhost/api/v1/stages/82/documents `
  -b cookies.txt -c cookies.txt `
  -H "Origin: http://localhost:4200" -H "Accept: application/json" `
  -H "X-XSRF-TOKEN: $XSRF" `
  -F "fichier=@C:\chemin\vers\rapport.pdf" `
  -F "is_report=1"
```

```powershell
# Lister les documents d'un stage
Api GET /api/v1/stages/82/documents $null

# Valider un document (remplacez 3 par l'id)
Api POST /api/v1/documents/3/valider $null

# Refuser un document (motif obligatoire)
Api POST /api/v1/documents/3/refuser '{"commentaire":"Ajoutez la bibliographie."}'

# Annoter un rapport (commentaire public + note privee)
Api POST /api/v1/documents/3/annotate '{"teacher_comment":"Bon travail.","teacher_note":"A surveiller partie 3."}'
```

### 5.9. Feedback noté

```powershell
Api POST /api/v1/stages/82/feedbacks '{"etudiant_id":100,"contenu":"Tres bonne progression sur la phase de conception, continuez ainsi.","note":16.5}'
```
> `contenu` doit faire entre **20 et 3000 caractères**.

```powershell
# Lister les feedbacks d'un stage
Api GET /api/v1/stages/82/feedbacks $null
```

---

## 6. Sprint 3 — Réunions, messagerie, notifications

### 6.1. Réunions

```powershell
# Planifier une reunion
Api POST /api/v1/stages/82/reunions '{"sujet":"Point mi-stage","description":"Revue","scheduled_at":"2026-07-15T09:00:00","duration_minutes":60,"meet_url":"https://meet.google.com/abc-defg-hij","participant_ids":[100]}'

# Lister les reunions (calendrier)
Api GET "/api/v1/reunions?per_page=100" $null

# Terminer avec compte-rendu (remplacez 12 par l'id)
Api POST /api/v1/reunions/12/terminer '{"compte_rendu":"Decisions prises et actions de suivi."}'

# Annuler une reunion
Api POST /api/v1/reunions/12/annuler $null
```

### 6.2. Discussion de groupe (chat public du stage)

```powershell
# Lire les messages (le {publicChat} se resout par stage_id)
Api GET /api/v1/chats/public/82/messages $null

# Envoyer un message
Api POST /api/v1/chats/public/82/messages '{"contenu":"Bonjour a tous !"}'
```

### 6.3. Messagerie privée

```powershell
# Demarrer/obtenir une conversation avec l'utilisateur 100
Api POST /api/v1/chats/private '{"user_id":100}'

# Lister mes conversations (avec unread_count)
Api GET /api/v1/chats/private $null

# Envoyer un message prive (remplacez 4 par l'id de conversation)
Api POST /api/v1/chats/private/4/messages '{"contenu":"Pouvez-vous m envoyer la derniere version ?"}'

# Total des messages non lus
Api GET /api/v1/chats/private/unread-count $null

# Marquer une conversation comme lue
Api POST /api/v1/chats/private/4/read $null
```

### 6.4. Notifications

```powershell
# Lister
Api GET /api/v1/notifications $null

# Marquer une notification lue (remplacez l'UUID)
Api POST /api/v1/notifications/UUID_NOTIF/read $null

# Tout marquer comme lu
Api POST /api/v1/notifications/read-all $null
```

### 6.5. Statistiques tableau de bord (via la liste filtrée)

```powershell
# Stages actifs (lire meta.total)
Api GET "/api/v1/stages?filter%5Bstatut%5D=actif&per_page=1" $null

# Stages termines
Api GET "/api/v1/stages?filter%5Bstatut%5D=termin%C3%A9&per_page=1" $null
```

---

## 7. Tester en tant qu'étudiant

Pour tester les actions étudiant (dépôt de document, lecture de feedback…), déconnectez-vous puis
reconnectez-vous avec un compte étudiant :

```powershell
Api POST /api/logout $null
curl.exe -s -c cookies.txt $base/sanctum/csrf-cookie      # nouveau cookie CSRF
Api POST /api/login '{"email":"perabi7287@5nek.com","password":"MOT_DE_PASSE_ETUDIANT"}'
```

---

## 8. Dépannage (erreurs fréquentes)

| Erreur | Cause | Solution |
|--------|-------|----------|
| *« Session store not set on request »* | En-tête `Origin` manquant ou non stateful. | Ajouter `-H "Origin: http://localhost:4200"`. |
| *« CSRF token mismatch »* | `$XSRF` périmé (le jeton a tourné). | Ré-exécuter `csrf-cookie` puis ré-extraire `$XSRF` juste avant la requête (la fonction `Api` le fait déjà). |
| *validation.required* alors que les champs sont fournis | Corps JSON non reçu : BOM UTF-8 en tête de fichier, ou guillemets mal échappés. | Utiliser la fonction `Api` (fichier sans BOM via `UTF8Encoding($false)`). Ne **pas** utiliser `Set-Content -Encoding utf8` pour le corps. |
| *401 Unauthorized* | Session expirée / pas connecté. | Refaire login (étape 4.1). |
| *419* | Cookie CSRF absent. | Relancer l'étape 3 (csrf-cookie). |
| *429 Too Many Requests* | Throttle (5 logins/min). | Attendre 1 minute. |
| `curl : paramètre introuvable` | Vous utilisez l'alias `curl` au lieu de `curl.exe`. | Toujours écrire `curl.exe`. |
| Sortie illisible | JSON brut. | Ajouter `| ConvertFrom-Json | ConvertTo-Json -Depth 6`. |
| Le temps réel (chat/notifs) ne se teste pas en cURL | WebSocket. | Tester dans le navigateur (deux comptes). |

---

## 9. Comptes de test (environnement de dev)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Enseignant | `mohamed.benali@enseignant.pfa.tn` | `Password123!` |
| Étudiant | `perabi7287@5nek.com` | *(défini à l'acceptation de l'invitation)* |

> Emails sortants (invitations, réinitialisations) : **Mailpit** → http://localhost:8025

---

## 10. Récapitulatif express

```powershell
# 1. Préparation (une fois)
cd C:\projects\pfa
$base = "http://localhost"
function Api($method,$path,$json){ $x=[System.Net.WebUtility]::UrlDecode((Select-String -Path cookies.txt -Pattern 'XSRF-TOKEN').Line.Split("`t")[-1]); $a=@("-s","-X",$method,"$base$path","-b","cookies.txt","-c","cookies.txt","-H","Origin: http://localhost:4200","-H","Accept: application/json"); if($json){[System.IO.File]::WriteAllText("$PWD\.body.json",$json,(New-Object System.Text.UTF8Encoding($false)));$a+=@("-H","Content-Type: application/json","-H","X-XSRF-TOKEN: $x","-d","@$PWD\.body.json")}; curl.exe @a }

# 2. Amorçage + login (JSON avec de vrais guillemets, sans échappement)
curl.exe -s -c cookies.txt $base/sanctum/csrf-cookie
Api POST /api/login '{"email":"mohamed.benali@enseignant.pfa.tn","password":"Password123!"}'

# 3. Tester
Api GET /api/v1/me $null
Api GET "/api/v1/stages?per_page=5" $null
```
