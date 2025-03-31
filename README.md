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
npm run db:seed:sample:local

# Générer les données complètes avec toutes les communes de France (nécessite une clé Grist)
npm run data:sync

# Puis importer ces données en local
npm run db:seed:local
```

### Tests

```
# lancer tous les tests
npm test
```
