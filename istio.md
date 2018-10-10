# Definition d'Istio

## Gestion du traffic

La gestion du traffic d'istio  permet de découper le traffic selon des règles établies et gérées par le service Pilot et Envoy.

Ces règles peuvent permettre de découper le traffic et d'envoyer par exemple 5% du traffic vers un service dans une version canarie et le reste vers la version de production du service.

<img src="https://istio.io/docs/concepts/traffic-management/TrafficManagementOverview.svg" />

### Pilot et Envoy

Pilot gére et configure tous les Envoy proxy déployés dans les services Mesh d'Istio. Il permet de configurer les règles que l'on souhaite pour router le traffic entre les Envoy Proxys et dispose d'autres fonctionnalités comme la gestion des cas d'échec avec les timeouts, les retries, et circuit breakers.

Pilot maintient les informations de tous les Envoys Proxys déployés dans le réseau Mesh, permettant ainsi à ces derniers de connaitres l'existences des envoys proxys voisins via le service discovery.

<img src="https://istio.io/docs/concepts/traffic-management/PilotAdapters.svg">


## Request Routing

La représentation des services déployés dans le réseau Mesh est maintenu par Pilot, ce modèle est indépendant de la plateforme d'orchestration utilisée (Kubernets, Mesos, ...)

Istio introduit un concept de versionning de service, qui permet de diviser les instances de services  par des versions (v1, v2) ou des environnements (prod, dev).

Ces variantes ne sont pas nécessairement des versions de code applicatif, ou d'image docker. Ils peuvent être un changement d'un service déployé dans  différents environnements.

Dans l'image ci-dessous, un client d'un service Kubernetes n'a pas connaissance des différentes versions du service. Ils peut aisément continuer à accéder au service via son ip ou son nom d'hôte. Le Envoy Proxy intercepte les requêtes et les transferts toutes entre le client et le service.

L'Envoy Proxy détermine quel version de service à utiliser selon les règles de routages (routing rules) qui ont été spécifiés à Pilot.

<img src="https://istio.io/docs/concepts/traffic-management/ServiceModel_Versions.svg">

# Installation d'Istio
## Récupération de la dernière version des fichiers Binaires 

Récupérer le binaire Istio selon la version de votre système (Linux, Windows), le Readme se base sur une version windows du binaire, la commandes restent les identiques pour les deux versions du binaire :

https://github.com/istio/istio/releases

## Ajout du binaire dans le PATH windows

Rajouter le chemin vers l'exécutable istioctl.exe dans la variable PATH du système Windows.

## Démarrage de Minikube

Il faut au minimum 8GB de ram et 4 CPU pour lancer Istio. Adapter si besoin le type de Driver.

```minikube start --memory=8192 --cpus=4 --kubernetes-version=v1.10.0 --extra-config=controller-manager.cluster-signing-cert-file="/var/lib/localkube/certs/ca.crt" --extra-config=controller-manager.cluster-signing-key-file="/var/lib/localkube/certs/ca.key" --vm-driver="virtualbox"```


## Configurer istio pour Minikube

### Installation des Custom Resource Definitions

Installer les CRDs via la commande ci-dessous :

```kubectl apply -f install/kubernetes/helm/istio/templates/crds.yaml```

### Installer Istio sans authentification TLS

```kubectl apply -f install/kubernetes/istio-demo.yaml```

## Vérification de l'installation

### Services Kubernetes

Vérifier que les services ci-dessous sont déployés dans le namespaces istio-system :

```kubectl get svc -n istio-system```
```
NAME                       TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)                                                                                                     AGE
grafana                    ClusterIP      10.109.134.37    <none>        3000/TCP                                                                                                    9m
istio-citadel              ClusterIP      10.109.136.191   <none>        8060/TCP,9093/TCP                                                                                           9m
istio-egressgateway        ClusterIP      10.101.102.42    <none>        80/TCP,443/TCP                                                                                              9m
istio-galley               ClusterIP      10.107.103.20    <none>        443/TCP,9093/TCP                                                                                            9m
istio-ingressgateway       LoadBalancer   10.97.140.195    <pending>     80:31380/TCP,443:31390/TCP,31400:31400/TCP,15011:31842/TCP,8060:30576/TCP,15030:31721/TCP,15031:30697/TCP   9m
istio-pilot                ClusterIP      10.111.151.164   <none>        15010/TCP,15011/TCP,8080/TCP,9093/TCP                                                                       9m
istio-policy               ClusterIP      10.100.187.245   <none>        9091/TCP,15004/TCP,9093/TCP                                                                                 9m
istio-sidecar-injector     ClusterIP      10.104.178.58    <none>        443/TCP                                                                                                     9m
istio-statsd-prom-bridge   ClusterIP      10.96.49.123     <none>        9102/TCP,9125/UDP                                                                                           9m
istio-telemetry            ClusterIP      10.104.251.191   <none>        9091/TCP,15004/TCP,9093/TCP,42422/TCP                                                                       9m
jaeger-agent               ClusterIP      None             <none>        5775/UDP,6831/UDP,6832/UDP                                                                                  9m
jaeger-collector           ClusterIP      10.102.4.252     <none>        14267/TCP,14268/TCP                                                                                         9m
jaeger-query               ClusterIP      10.111.78.173    <none>        16686/TCP                                                                                                   9m
prometheus                 ClusterIP      10.103.135.68    <none>        9090/TCP                                                                                                    9m
servicegraph               ClusterIP      10.102.146.46    <none>        8088/TCP                                                                                                    9m
tracing                    ClusterIP      10.96.160.51     <none>        80/TCP                                                                                                      9m
zipkin                     ClusterIP      10.108.176.229   <none>        9411/TCP                                                                                                    9m
```

Dans le cas d'une installation dans un environnemnt qui ne supporte pas les LoadBalancers externes (Minikube), l'EXTERNAL-IP des services istio-ingress et istio-ingressgateway restera dans l'état pending. Il faudra alors configurer ces services en mode NodePort ou utiliser le port-forwarding.

### Pods Kubernetes

Il faut s'assurer que tous les pods Istio sont déployés et que tous leurs conteneurs docker sont Up et dans l'état Running :
istio-pilot-*, istio-ingressgateway-*, istio-egressgateway-*, istio-policy-*, istio-telemetry-*, istio-citadel-*, prometheus-*, istio-galley-*, istio-sidecar-injector-*

la commande à utiliser est la suivante :

```kubectl get pods -n istio-system```
```
NAME                                        READY     STATUS      RESTARTS   AGE
grafana-66469c4d95-d5h55                    1/1       Running     0          18m
istio-citadel-5799b76c66-w4wkv              1/1       Running     0          18m
istio-cleanup-secrets-hl9nl                 0/1       Completed   0          18m
istio-egressgateway-6578f84b68-wmq2d        1/1       Running     0          18m
istio-galley-5bf4d6b8f7-k2bfx               1/1       Running     0          18m
istio-grafana-post-install-2xs27            0/1       Completed   0          18m
istio-ingressgateway-67995c486c-m9hk5       1/1       Running     0          18m
istio-pilot-5c778f6dfd-8fq2c                0/2       Pending     0          18m
istio-policy-8667975f76-x2hqx               2/2       Running     0          18m
istio-sidecar-injector-5b5fcf4df6-zvhzw     1/1       Running     0          18m
istio-statsd-prom-bridge-7f44bb5ddb-lmrvr   1/1       Running     0          18m
istio-telemetry-7d87746bbf-8zq2s            2/2       Running     0          18m
istio-tracing-ff94688bb-glbmb               1/1       Running     0          18m
prometheus-84bd4b9796-vrlr9                 1/1       Running     0          18m
servicegraph-7875b75b4f-4r88c               1/1       Running     0          18m
```

## Injection d'une configuration Envoy sidecar dans un deployement existant


le paramètre kube-inject permet d'injecter l'envoy sidecar dans un objet Kubernetes, un service, un configmap ou encore un deploiement.

Examples de commandes istioctl kube-inject :
```
# mise à jour d'une ressource à la volée.
kubectl apply -f <(istioctl kube-inject -f <resource.yaml>)

# création d'une version persistante du déploiement du sidecar envoy injecté

istioctl kube-inject -f deployment.yaml -o deployment-injected.yaml

# mise à jour d'un déploiement existant avec le sidecar envoy.
kubectl get deployment -o yaml | istioctl kube-inject -f - | kubectl apply -f -

# Ccréation d'une version persistante du déploiement du sidecar envoy injecté
# Et injection d'une configmap istio-inject
istioctl kube-inject -f deployment.yaml -o deployment-injected.yaml --injectConfigMapName istio-inject

```
### Injection d'un sidecar envoy dans le pod api-deploy
Pour faciliter la modification des fichiers de déploiement existant nous allons injecter la configuration de l'envoy istio dans notre déploiement. La commande ci-dessous va créer un nouveau fichier disposant de la configuration du nouveau container istio-envoy.


```istioctl kube-inject -f api-deploy/api-deploy.yaml -o api-deploy/api-deploy-istio-sidecar.yaml```

## création VirtualService

La création du VirtualService va nous permettre de définir les routes disponibles pour accéder aux applications et à leurs différentes versions

## création DestinationRule

La création de Route Rule permet de définir la répartition du traffic entre les services de différentes versions et cela selon différents paramètres, cookie http, utilisateur, pourcentage d'utilisateur. Il est aussi possible de simuler des erreurs HTTP.

## creation service

Le service nous permettra d'exposer les applicatifs déployés dont le flux sera contrôllé par Istio.

## création deployment

La création du déploiement va créer nos Pods en version 1 et en version 2.
Une fois les pods déployés, il sera possible de vérifier la gestion des flux par Istio.



## Installation middleoffice avec istio

```kubectl create -f namespaces.yaml```
```kubectl create -f ux-portal-deploy\ux-portal-deploy-istio-sidecar.yaml -f ux-portal-deploy\service-ux.yaml -f ux-portal-deploy\VirtualService.yaml -f ux-portal-deploy\destinationrule.yaml```
    
