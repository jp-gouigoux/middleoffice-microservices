# Instanciation de middleoffice-microservices dans Kubernetes

Remarque: ceci est une plateforme de démonstration permettant de mettre en place une architecture microservices dans un environnement Kubernetes
## Structure répo git

Répertoire deploy:

Contient les manifestes de déploiements des objets Kubernetes "Deployement, POD, Service, Ingress, Namespace" :

- mongo-deploy : service et déploiement mongo
- elastic-deploy : service et déploiement elasticsearch
- api-deploy : service et déploiement des apis
- ux-portal-deploy : service et déploiement des uxs
- traefik-deploy : service, ingress, rbac, et déploiement du reverse proxy traefik point d'entrée du lab

## Prérequis

- Disposer d'un environnement Kubernetes (Minikube, Kubeadm, GKE, Kubernetes intégré à Docker)
- Cloner ce le repository Git
- Diposer de Kubectl pour administrer Kubernetes
- modifier le fichier hosts de votre station de travail

## Modification fichier Hosts

Récupérer l'ip du noeud Kubernetes : 192.168.99.100

```shell
### fichier hosts
192.168.99.100 portal.microservice.k8s.lab traefik-ui.microservice.k8s.lab elastic.microservice.k8s.lab
```

## URLS

http://portal.microservice.k8s.lab
http://traefik-ui.microservice.k8s.lab
http://elastic.microservice.k8s.lab

## Description des Pods

1 POD MONGO, 1 conteneur
1 POD ElasticSearch, 1 conteneur
1 POD API Rest JAVASCRIPT, 3 conteneurs
1 POD UX JAVASCRIPT, 5 conteneurs
1 POD REVERSE PROXY Traefik, 1 conteneur


## Création du Namespaces

L'architecture proposée ici sera intégré dans un seul Namespaces Kubernetes nommé middleoffice. Tous les Pods déployés dans ce namespaces partageront l'accès aux ressources présentes dans ce namespaces.

```shell
kubectl create -f namespace.yaml
```


## Déploiements des Pods

### ElasticSearch

Elasticsearch va nous permettre d'indexer la donnée issue des Apis

```shell
kubectl create -f deploy/elastic-deploy/
```

Cela va créer un déploiement nommé 'elastic-déployement' dans le namespace middleoffice. 
Ce déploiement contient qu'un seul POD elasticsearch (option: replicas: 1) qui écoutera sur le port 9200.
Un livenessProbe a été mis en place, il permet de vérifier que l'api elasticsearch est opérationnelle, si elle ne répond plus le déploiement recréera un nouveau Pod. 
Un label 'app: elastic' est aussi appliqué à se déploiement et au POD elasticsearch permettant de catégoriser notre déploiement mais aussi lui appliquer lier des éléments Kubernetes, comme des services, des de rolling-update ou encore des Scall Up ou Down


Enfin un service elastic-service sera créé qui s'appliquera au label app: elastic qui exposera le port 9200 vers le port 9200 du pod elastic. Cette exposition sera interne au cluster (type: ClusterIP).


### Apis

```shell
kubectl create -f deploy/ux-portal-deploy/ux-portal-deploy.yaml
kubectl create -f deploy/ux-portal-deploy/service-ux.yaml
```

Cela va créer un déploiement nommé 'mo-api-deployment' dans le namespace middleoffice. 
Ce déploiement contient qu'un seul POD qui lui contient 3 microservices Node.JS (mo-portal, mo-uxrequest, mo-uxrequest-vote, uxrequests-tobevoted, mo-uxrequesttype) ils exposent des apis Rest qui écouteront sur les ports 80-81-82 respectivement. 
Ces Apis seront consommés par l'UX. Un label app: mo-api est positionné sur le déploiement.
Enfin un service mo-ux sera créé qui s'appliquera au label app: mo-ux qui exposera les ports 80 à 84 vers les ports 80-84 du pod mo-ux-portal. Cette exposition sera interne au cluster (type: ClusterIP).


### Mongo

```shell
kubectl create -f deploy/mongo-deploy/
```

Création d'un déploiement mongo, utilisé pour écrire les données des apis. 
Un service de type NodePort est créé pour exposer le service mongo directement sur le noeud sur le port 30017.

Accès à MongoDB :

```Ip de votre serveur Kubernetes et le ort du service NodePort (30017)
```




### Ux


```shell
kubectl create -f deploy/api-deploy/api-deploy.yaml
kubectl create -f deploy/api-deploy/service-api.yaml
```

Cela va créer un déploiement nommé 'mo-ux-deployment' dans le namespace middleoffice. 
Ce déploiement contient qu'un seul POD qui lui contient 3 microservices Node.JS (mo-apirequest, mo-apirequesttype, mo-apirequesttype) ils exposent des apis Rest qui écouteront sur les ports 80-81-82 respectivement. Ces Apis seront consommés par l'UX. 
Un label app: mo-api est positionné sur le déploiement.
Enfin un service mo-api-service sera créé qui s'appliquera au label app: mo-api qui exposera les ports 80-81-82 vers les ports 80-81-82 du pod mo-api. Cette exposition sera interne au cluster (type: ClusterIP).


### Traefik

Dans le répertoire deploy 

```shell
kubectl create -f traefik-ingress/traefik-deploy.yaml -f traefik-ingress/configmap-traefik.yaml -f  traefik-ingress/rbac-ingress.yaml -f traefik-ingress/traefik-ingress.yaml -f traefik-ingress/service-traefik.yaml

```

Création d'un ingress traefik avec les rbac nécessaires pour effectuer ces tâches.

### Commandes

```shell
kubectl get pods -n middleoffice
kubectl describe pods "IDPOD" -n midddleoffice
kubectl logs "IDPOD" -c "conteneur" -n middleoffice
kubectl get ing -n middleoffice
kubectl get svc -n middleoffice
```