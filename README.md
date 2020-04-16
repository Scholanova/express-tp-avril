# PROJET EXPRESS NODE.JS AVRIL

Nom de l'élève : Florian Bématol

## CONSIGNES GÉNÉRALES  
Le projet correspondant aux cours du 16 et 17 Avril 2020. 
Il fait suite au projet express du 20 et 21 Février et 19 et 20 Mars.

NPM doit être installé sur votre machine, ainsi que Postgres.
Il vous faut cloner le repository, creer une branche à votre nom sous le format `eleves/nom-prenom`.
Commitez à chaque étape que vous réussissez. Les étapes sont numérotées, veuillez indiquer le numéro de l'étape réalisée
au début de votre message de commit (message : "Etape 2 - Ajout de l'implémentation de la validité d'un article")

## PREREQUIS 
- Savoir utiliser npm
- Comprendre le JS
- Connaissance d'Express, de EJS et de Sequelize 

## PARTIE 0 - VERIFICATION QUE LE PROJET TOURNE
- Cloner le projet
- Installer les dépendances avec `npm install`
- Initialiser le projet avec `npm run db:init`, `npm run db:migrate`, `npm run db:seed` et `npm run db:test:init`
- Lancer les tests avec `npm test` et verifier qu'ils passent tous
- Lancer le server avec `npm start` et verifier qu'il se lance sur le port 3000
- Lancer le server de dev avec `npm run start:dev` et verifier qu'il se lance le port 3000
- Créez une branche avec notre nom et checkout dessus
- Commitez en remplaçant dans le readme "XXXXXXX XXXXXXX" par votre nom et prénom, puis poussez sur Origin.
 (n'oubliez pas d'indiquer "Etape 0 - ..." en début de votre message de commit) 

## PARTIE 1 - FINIR LES RÈGLES DE VALIDATION D'UN AUTEUR
Le projet est un blog, l'idée est d'avoir des auteurs, que l'on peut gérer, qui vont avoir des articles, et ces mêmes 
articles pourront avoir des commentaires d'autres auteurs. 
La partie sur les auteurs est commencée mais pas fini, il s'agit avant de commencer la suite de la finaliser.

On va ici utiliser une librairie connue pour simplifier la validation. La libraire s'appelle `Joi`, et la documentation 
se situe [ici](https://hapi.dev/module/joi/). Le but est de ne pas à avoir réinventer des règles standard, comme la présence, 
des limites de taille, format d'email, etc. `Joi` est une librairie que vous risquez de croiser si vous faites du node.js.  

- Etape 2 - corriger l'authorService pour prendre en compte la longueur minimale de la propriété `name` 
   Dé-skippez le test `when the author name is to short`   
- Etape 3 - corriger l'authorService pour prendre en compte la propriété `language`
    - Dé-skippez les tests concernant la propriété `language`
    - N'oubliez pas de vérifier que tous les autres tests passent toujours
- Etape 4 - créez une migration de données pour rajouter la colonne `language` en base de donnée
- Etape 5 - mettez à jour les données de tests du repository pour prendre en compte la nouvelle propriété `language`  
- Etape 6 - mettez à jour les vues (list, show et new) et le router et ses tests pour prendre en compte la nouvelle propriété `language`  
    
## PARTIE 2 - PERMETTRE DE FILTRER LES AUTEURS PAR LANGUE D'ÉCRITURE
- Etape 7 - ajouter une fonction `listForLanguage` sur le repository pour pouvoir récupérer les auteurs qui ont comme langue 
celle passée en paramètre 
    - Dé-skippez les tests concernant la fonction `listForLanguage`
    - N'oubliez pas de vérifier que tous les autres tests passent toujours
- Étape 8 - ajouter une fonction `listForLanguage` sur le service pour pouvoir récupérer vérifier les paramètres d'appel au repository
    - Dé-skippez les tests concernant la fonction `listForLanguage`
    - N'oubliez pas de vérifier que tous les autres tests passent toujours
- Étape 9 - ajouter deux pages et les méthodes associées sur le `authorRouter` pour pouvoir filter les auteurs par langue.
    - Faites un formulaire sur l'url `/authors/filter` avec comme champ `language` pour passer en paramètre la langue de filtration.
    Avec donc une méthode `GET` et une méthode `POST` sur cette url, pour pouvoir lire le paramètre récupéré. N'oubliez pas 
    d'écrire de nouveaux tests sur la méthode `POST` (comme pour `/authors/new`)
    - Vérifier que si le service renvoie une erreur, cette erreur s'affiche bien (comme pour `/authors/new`)
    - Vérifier que si le service renvoie une liste d'auteurs, la liste des auteurs s'affichent sur `/authors/filter` 
    (avec un message "No authors found" si la liste est vide) 
    - N'oubliez pas de vérifier que tous les autres tests passent toujours avant de commitez

## PARTIE 3 - AJOUTER DES LIVRES AUX AUTEURS
On va ajouter une ressource nouvelle (le livre) au système.

- Étape 10 - Création d'un livre (Repository)  
    - Créez un nouveau service `bookRepository` avec son fichier de tests (vide pour l'instnt)
    - Créez une migration pour créer une nouvelle table `books` avec les colonnes `title: String` 
    et une référence clé étrangère à la table `authors` (colonne `authorId`)
    - Créez un modèle `Books` 
    - Créez un couple de fonctions `get` et `create` sur le `bookRepository` (en prenant pour exemple les tests de `authorRepository`)
    Dans les tests, n'oubliez pas de créer un auteur et de l'insérer en base de donnée pour pouvoir lier un livre à un auteur.
    La création doit échouer (il doit y avoir un test à ce sujet du coup) si l'id `authorId` du livre correspond à
     un auteur qui n'existe pas en base de données.
 - Étape 11 - Création d'un livre (Service)
    - Créez un nouveau service `bookService` avec son fichier de tests (vide pour l'instant)
    - Créez une nouvelle fonction `create` qui va appeler le respository si les données de création sont valides et 
    une erreur de validation sinon. Le livre pour être valide doit avec un titre, et un auteur (propriété `authorId`). 
    (il faut vérifier que l'id est présent dans les données et soit un interger, par contre la vérification de présence se 
    fait par la base de donnée, au niveau du repository lors de la fonction `create` et n'est donc pas la responsabilité du service)
 - Étape 12 - Visualisation des livres d'un auteur
    - Ajouter une fonction `listForAuthor` au `bookRepository` (renvoie vide si pas de livre pour cet auteur, et ses livres sinon.)
    - Ajouter sur la page `show` d'un auteur la liste de livres de l'auteur (url: `/authors/:id`)
    - Modifier le fichier de seeds pour créer des livres aux auteurs. 
 - Étape 13 - Création d'un formulaire de création de livre
    - Ajouter un formulaire accessible par un lien depuis la page `show` d'un auteur pour créer un livre. 
    L'URL sera de la forme `/authors/:id/books/new/`. Bien penser à ne pas donner à remplir à l'utilisateur l'id de l'auteur.
    Le seul champ à remplir de la part de l'utilisteur est donc titre. Si le titre n'est pas rempli, une erreur doit être affichée. 
    
## AIDE POUR LA MIGRATION DE BASE DE DONNÉES

Pour créer une nouvelle migration faites la commande suivante :
 
`$ npx sequelize migration:create --name <le nom de votre migration>`

Voici un exemple de migration pour l'ajout d'une colonne sur la table `Person`. 
```javascript
module.exports = {
  up: (queryInterface, Sequelize) => {
        queryInterface.addColumn('Person', 'petName', {
          type: Sequelize.DataTypes.STRING
        })
    }
  },
  down: (queryInterface, Sequelize) => {
        queryInterface.removeColumn('Person', 'petName')
  }
};
```
