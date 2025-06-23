# La Suite territoriale - Site vitrine

https://suiteterritoriale.anct.gouv.fr/

Cette application implémente la page d'accueil de la Suite territoriale, ainsi que le chemin de raccordement pour les collectivités.

Son code est basé sur [Next.js](https://nextjs.org/), et a été initié à partir du [template Next.js de betagouv](https://github.com/betagouv/template-nextjs).

## Lancer le code

Après avoir cloné le projet :

### Développement

```bash
cp .env.development .env # then do some modifications if you want
npx husky # ajouter les vérifications pre-commit
make frontend-install-frozen # installer les node_modules
make frontend-start # pour lancer le site et les conteneurs de base de données
```

Il suffit ensuite de se rendre sur [http://127.0.0.1:3000/](http://127.0.0.1:3000/).

Après avoir modifié une dépendance Python dans `data/pyproject.toml`, il est nécessaire de recréer le lockfile :

```bash
npm run data:poetry:lock
```

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

# Générer les données complètes en JSON avec toutes les communes de France (nécessite une clé Grist)
npm run data:sync:local

# Puis importer ces données en local
npm run db:seed:local
```

### Tests

```
# lancer tous les tests
npm test

# a refaire avant chaque commit
npm run lint
```

### Lancer des vérifications RCPNT manuellement

Il est possible de rentrer dans le conteneur `data` et éxecuter des tâches. Par exemple :

```
npm run data:shell

# Puis, une fois dedans :
python3 -m tasks.check_website [SIRET]
python3 -m tasks.check_dns [SIRET]
python3 -m tasks.sync
```

Cela peut permettre de débugguer des problèmes liés à certains SIRETs en particulier.

Il est recommandé d'ajouter des tests unitaires à chaque nouveau cas pour rendre les vérifications plus robustes.

## Mise à jour des fichiers geoJSON

### Prérequis

- Mapshaper installé sur votre système ([https://github.com/mbloch/mapshaper](https://github.com/mbloch/mapshaper))

### Procédure

#### 1. Téléchargement des données

Télécharger la dernière version des données ADMIN EXPRESS de l'IGN, version France Entière, depuis :
[https://geoservices.ign.fr/adminexpress](https://geoservices.ign.fr/adminexpress)

#### 2. Génération du geoJSON des régions

```bash
mapshaper -i REGION.shp snap -proj wgs84 -simplify 5% weighted keep-shapes -filter-fields INSEE_REG,NOM -rename-fields CODE=INSEE_REG -o format=geojson precision=0.00001 france.json
```

#### 3. Génération des geoJSON des départements par région

```bash
mapshaper -i REGION.shp name=regions -i DEPARTEMENT.shp name=depts -clip target=depts source=regions -proj wgs84 -simplify 5% weighted keep-shapes -filter-fields INSEE_DEP,INSEE_REG,NOM -rename-fields CODE=INSEE_DEP -split INSEE_REG -o format=geojson precision=0.00001
```

#### 4. Génération des geoJSON des communes par département

```bash
mapshaper -i DEPARTEMENT.shp name=depts -i COMMUNE.shp name=communes -clip target=communes source=depts -proj wgs84 -simplify 5% weighted keep-shapes -filter-fields INSEE_COM,INSEE_DEP,NOM -rename-fields CODE=INSEE_COM -split INSEE_DEP -o format=geojson precision=0.00001
```

### Résultats

Cette procédure générera :

- Un fichier `france.json` contenant les données des régions
- Des fichiers séparés pour chaque région, contenant l'ensemble des départements de cette région
- Des fichiers séparés pour département, contenant l'ensemble des communes de ce département
