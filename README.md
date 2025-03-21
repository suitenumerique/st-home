# La Suite territoriale - Site vitrine

https://suiteterritoriale.anct.gouv.fr/

Cette application implémente la page d'accueil de la Suite territoriale, ainsi que le chemin de raccordement pour les collectivités.

Son code est basé sur [Next.js](https://nextjs.org/), et a été initié à partir du [template Next.js de betagouv](https://github.com/betagouv/template-nextjs).

## Lancer le code

Après avoir cloné le projet :

### Développement

```bash
docker-compose up -d # pour lancer les conteneurs de base de données
npm install # pour installer les dépendances
npm run dev # pour lancer en mode développement
```

Il suffit ensuite de se rendre sur [http://127.0.0.1:3000/](http://127.0.0.1:3000/).

### Base de données

L'application utilise [Drizzle ORM](https://orm.drizzle.team/) pour gérer la base de données PostgreSQL.

Pour réinitialiser la base de données avec des données de test :

```bash
# Appliquer les migrations
npm run db:reset:local

# Explorer la base de données avec Drizzle Studio
npm run db:browse:local
```

### Importer les données des communes

L'application utilise une base de données des communes françaises. Vous pouvez importer ces données en utilisant les commandes suivantes :

```bash
# Importer les données de test (un petit ensemble de communes)
npm run import:communes:test

# Importer les données de production (fournir les chemins vers vos fichiers JSON)
npm run import:communes:prod /chemin/vers/votre/communes.json /chemin/vers/votre/structures.json
```

Par exemple :

```bash
npm run import:communes:prod ./data/communes.json ./data/structures.json
```

Le script va :

1. Lire le fichier JSON contenant les données des communes
2. Importer les structures de mutualisation depuis le fichier structures.json spécifié
3. Créer ou mettre à jour les communes (organisations) et les lier à leurs structures respectives
4. Gérer les erreurs et afficher la progression

### Tests

```
# lancer les tests unitaires
npm run test

# lancer les tests end-to-end
npm run e2e --ui
```

### Documentation

La documentation est disponible dans le dossier `docs`.

- [Architecture](docs/architecture.md)
