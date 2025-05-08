# Outil de Diagnostic Réseau

Un outil de diagnostic réseau moderne avec une interface web conviviale pour visualiser et analyser les performances réseau.

## Fonctionnalités

- **Informations système** : Affiche les informations de base du système, l'utilisation du CPU et de la RAM avec visualisations
- **Test de Ping** : Vérifie la connectivité avec une adresse IP ou un nom de domaine spécifique
- **Test de Port** : Vérifie si un port spécifique est ouvert sur une adresse IP donnée
- **Test de Vitesse Internet** : Mesure la vitesse de téléchargement, d'envoi et la latence
- **Ping Multiple** : Teste la connectivité avec plusieurs adresses IP en parallèle
- **Diagnostic Complet** : Exécute tous les tests ci-dessus en une seule opération
- **Export de Rapport** : Génère un rapport complet au format CSV

## Installation

1. Assurez-vous que Python 3.8+ est installé sur votre système
2. Clonez ce dépôt ou décompressez l'archive téléchargée
3. Installez les dépendances requises:

```bash
pip install -r requirements.txt
```

## Utilisation

1. Démarrez l'application:

```bash
python main.py
```

2. Ouvrez votre navigateur web et accédez à `http://localhost:5000`
3. Utilisez l'interface pour exécuter divers tests de diagnostic réseau

## Dépendances

- Flask: Framework web léger
- Ping3: Utilitaire de ping pur Python
- Psutil: Informations système et surveillance
- Speedtest-cli: Test de vitesse Internet
- Pandas: Manipulation et analyse de données
- Chart.js: Visualisations côté client

## Structure du Projet

- `app.py`: Application Flask principale et points d'API
- `network_diagnostics.py`: Fonctions de diagnostic réseau
- `templates/`: Fichiers de modèle HTML
- `static/`: Ressources statiques (CSS, JavaScript)
- `static/js/main.js`: Logique JavaScript principale
- `static/js/charts.js`: Configuration et mise à jour des graphiques
- `static/css/style.css`: Styles CSS personnalisés

## Captures d'écran

L'interface utilisateur présente un design moderne avec un thème clair/sombre, des visualisations interactives et des rapports détaillés.

## Licence

Ce projet est disponible sous licence MIT.

## Contributeurs

Développé par [Votre nom/organisation]