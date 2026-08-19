# Deploy na OCI OKE - Passo a passo

## Pre-requisitos
- Conta na OCI com OKE habilitado
- OCI CLI instalada
- Docker instalado
- Conta na OpenAI (chave de API)
- Conta no Tavily (chave de API)
- Conta no OCIR (Oracle Container Registry)

---

## Passo 1: Configurar OCI CLI e kubectl

```bash
# Instalar OCI CLI (se ainda nao tiver)
# Windows: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm

# Configurar OCI CLI
oci setup config

# Gerar comando kubectl para o cluster
# (Execute apos criar o cluster no console OCI)
oci ce cluster create-kubeconfig --cluster-id <CLUSTER_ID> --file ~/.kube/config
```

---

## Passo 2: Criar container no OCIR

```bash
# Login no OCIR
docker login iad.ocir.io

# Criar repositorio no console OCI:
# Developer Services -> Container Registry -> Create Repository
# Namespace: <SEU_NAMESPACE>
# Repository: agente-financeiro
```

---

## Passo 3: Build e push da imagem Docker

```bash
# No diretorio do projeto
cd agente-financeiro

# Build da imagem
docker build -t iad.ocir.io/<SEU_NAMESPACE>/agente-financeiro:latest .

# Login no OCIR
docker login iad.ocir.io

# Push da imagem
docker push iad.ocir.io/<SEU_NAMESPACE>/agente-financeiro:latest
```

---

## Passo 4: Atualizar deployment.yaml

Edite o arquivo `k8s/deployment.yaml` e substitua `<seu-repositorio-ocir>` pelo seu namespace OCIR:

```yaml
# Antes:
image: <seu-repositorio-ocir>/agente-financeiro:latest

# Depois:
image: iad.ocir.io/<SEU_NAMESPACE>/agente-financeiro:latest
```

---

## Passo 5: Criar secrets no Kubernetes

```bash
kubectl create secret generic agente-financeiro-secrets `
  --from-literal=openai-api-key=SUA_CHAVE_OPENAI `
  --from-literal=tavily-api-key=SUA_CHAVE_TAVILY
```

---

## Passo 6: Aplicar manifests

```bash
kubectl apply -f k8s/deployment.yaml
```

---

## Passo 7: Verificar status

```bash
# Verificar pods
kubectl get pods

# Verificar service
kubectl get service agente-financeiro-service

# Verificar logs (se houver problemas)
kubectl logs -l app=agente-financeiro
```

---

## Passo 8: Acessar a aplicacao

O LoadBalancer vai gerar um IP externo. Acesse:

```
http://<IP_EXTERNO>
```

Para obter o IP externo:

```bash
kubectl get service agente-financeiro-service
```

---

## Troubleshooting

| Problema | Solucao |
|---|---|
| Pods nao iniciando | Verificar logs: `kubectl logs -l app=agente-financeiro` |
| Erro de imagem | Verificar se o push foi feito corretamente |
| Erro de secrets | Verificar se o secret foi criado: `kubectl get secrets` |
| Service sem IP externo | Aguardar alguns minutos ou verificar OKE |

---

## Comandos uteis

```bash
# Verificar pods em tempo real
kubectl get pods -w

# Verificar eventos
kubectl get events

# Deletar deployment (se precisar recriar)
kubectl delete -f k8s/deployment.yaml

# Verificar secrets
kubectl get secrets
kubectl describe secret agente-financeiro-secrets
```
