# Diagrammes de séquence — Scripts Mermaid

> Versions Mermaid des 8 diagrammes de séquence (Sprints 1 à 3).
> Mermaid ne possède pas les icônes UML «boundary/control/entity» de PlantUML ;
> le stéréotype est donc indiqué en texte dans le libellé de chaque participant.
> Convention : `->>` = appel, `-->>` = retour.

---

## Sprint 1 — Authentification & Sécurité

### 1. Se connecter

```mermaid
sequenceDiagram
    actor Visiteur
    participant Login as «boundary»<br/>Page de Connexion (LoginPage)
    participant API as «control»<br/>API Backend
    Visiteur->>Login: saisir(email, motDePasse)
    Login->>API: getCsrfCookie()
    API-->>Login: xsrfToken
    Login->>API: login(email, motDePasse, remember)
    alt identifiants valides
        API-->>Login: utilisateur(rôle, établissements)
        Login->>Visiteur: afficherTableauDeBord()
    else identifiants invalides
        API-->>Login: erreurValidation(message)
        Login->>Visiteur: afficherErreur(message)
    else trop de tentatives
        API-->>Login: tropDeTentatives()
        Login->>Visiteur: afficherErreur(reessayerPlusTard)
    end
```

### 2. Accepter invitation + changement forcé

```mermaid
sequenceDiagram
    actor Etu as Étudiant invité
    participant Page as «boundary»<br/>Page d'Acceptation d'Invitation
    participant API as «control»<br/>API Backend
    Etu->>Page: ouvrirLien(token)
    Etu->>Page: definirMotDePasse(nouveauMotDePasse, confirmation)
    Page->>API: accepterInvitation(token, nouveauMotDePasse, confirmation)
    alt jeton valide et mot de passe conforme
        API-->>Page: utilisateur
        Page->>Etu: redirigerVersEspace()
    else jeton expiré / invalide
        API-->>Page: erreurValidation(message)
        Page->>Etu: afficherErreur(message)
    end
```

---

## Sprint 2 — Gestion de Stage

### 3. Créer un stage + inviter des étudiants

```mermaid
sequenceDiagram
    actor Ens as Enseignant
    participant Form as «boundary»<br/>Formulaire de Stage (StageForm)
    participant API as «control»<br/>API Backend
    actor Etu as Étudiant invité
    Ens->>Form: saisir(titre, dates, etablissement, type)
    Form->>API: creerStage(titre, dates, etablissementId, semestre)
    alt données valides
        API-->>Form: stage
        Form->>Ens: afficherStageCree(stage)
    else validation échouée (dates, établissement)
        API-->>Form: erreursValidation(erreurs)
        Form->>Ens: afficherErreurs(erreurs)
    end
    Note over Ens,Etu: Affectation d'étudiants
    Ens->>Form: ajouterEtudiants(nom, prenom, email)
    Form->>API: affecterEtudiants(stageId, etudiants)
    API-->>Form: nombreInvites
    API->>Etu: envoyerInvitation(lien, motDePasseTemporaire)
    Form->>Ens: confirmerInvitation()
```

### 4. Dépôt + validation d'un document

```mermaid
sequenceDiagram
    actor Etu as Étudiant
    participant Docs as «boundary»<br/>Onglet Documents (StageDocuments)
    participant API as «control»<br/>API Backend
    actor Ens as Enseignant
    Etu->>Docs: choisirFichier(fichier)
    Docs->>Etu: demanderConfirmationRapport()
    Etu->>Docs: confirmer(estRapport)
    Docs->>API: televerserDocument(stageId, fichier, estRapport)
    alt type de fichier autorisé
        API-->>Docs: document(en_attente)
        Docs->>Etu: ajouterAListe(document)
        API->>Ens: notifier(documentDepose)
    else type non autorisé
        API-->>Docs: erreurValidation(message)
        Docs->>Etu: afficherErreur(message)
    end
    Note over Etu,Ens: Validation par l'enseignant
    Ens->>Docs: validerDocument()
    Docs->>API: validerDocument(documentId)
    API-->>Docs: document(validé)
    API->>Etu: notifier(documentValide)
    Docs->>Ens: mettreAJourStatut(document)
```

### 5. Cycle de vie d'une étape

```mermaid
sequenceDiagram
    actor Ens as Enseignant
    participant Steps as «boundary»<br/>Onglet Étapes (StageMilestones)
    participant API as «control»<br/>API Backend
    Ens->>Steps: creerEtape(titre, ordre)
    Steps->>API: creerMilestone(stageId, titre, ordre)
    API-->>Steps: etape(pending)
    Steps->>Ens: ajouterATimeline(etape)
    Ens->>Steps: validerEtape()
    Note right of Steps: Validable uniquement si toutes<br/>les étapes précédentes sont validées
    Steps->>API: validerMilestone(milestoneId)
    API-->>Steps: etape(validated)
    Steps->>Ens: mettreAJourProgression()
    Ens->>Steps: rouvrirEtape()
    Steps->>API: rouvrirMilestone(milestoneId)
    API-->>Steps: etape(inProgress)
    Steps->>Ens: afficherEtapeRouverte()
```

---

## Sprint 3 — Tableaux de bord, Messagerie & Notifications

### 6. Message de groupe en temps réel

```mermaid
sequenceDiagram
    actor A as Émetteur
    participant ChatA as «boundary»<br/>Discussion émetteur (StageChat)
    participant API as «control»<br/>API Backend
    participant WS as «control»<br/>Reverb (WebSocket)
    participant ChatB as «boundary»<br/>Discussion destinataire (StageChat)
    actor B as Destinataire
    A->>ChatA: saisirMessage(contenu)
    ChatA->>API: envoyerMessagePublic(stageId, contenu, socketId)
    API-->>ChatA: message
    ChatA->>A: afficherMessage(message)
    API->>WS: diffuserToOthers(MessagePosted, stageId)
    WS->>ChatB: MessagePosted(message)
    ChatB->>B: afficherMessage(message)
```

### 7. Abonnement & authentification d'un canal privé

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant Echo as «boundary»<br/>Page Messagerie / Discussion (EchoService)
    participant WS as «control»<br/>Reverb (WebSocket)
    participant API as «control»<br/>API Backend
    U->>Echo: ouvrirConversation()
    Echo->>WS: connecter()
    WS-->>Echo: socketId
    Echo->>API: autoriserCanal(socketId, channelName)
    Note right of Echo: Le cookie de session Sanctum<br/>est envoyé (cross-origin)
    alt utilisateur autorisé sur le canal
        API-->>Echo: auth, channelData
        Echo->>WS: subscribe(auth)
        WS-->>Echo: subscriptionSucceeded
        Echo->>U: recevoirMessagesTempsReel()
    else non autorisé
        API-->>Echo: accesRefuse()
        Echo->>U: afficherAbonnementRefuse()
    end
```

### 8. Notification temps réel + navigation

```mermaid
sequenceDiagram
    actor Ens as Enseignant (déclencheur)
    participant API as «control»<br/>API Backend
    participant WS as «control»<br/>Reverb (WebSocket)
    participant Side as «boundary»<br/>Barre latérale (Sidebar)
    actor U as Destinataire
    participant NotifPage as «boundary»<br/>Page Notifications
    Ens->>API: planifierReunion(donnees)
    API->>WS: diffuserNotification(userId, notification)
    WS->>Side: notification(donnees)
    Side->>U: incrementerBadge()
    U->>NotifPage: cliquerNotification(notificationId)
    NotifPage->>API: marquerCommeLue(notificationId)
    API-->>NotifPage: ok
    NotifPage->>U: naviguerVersPage(stageId, onglet)
```
