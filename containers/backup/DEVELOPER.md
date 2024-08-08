# Openshift Commands to setup Backup Container

## <summary>Example of a Postgres deployment</summary>

The following outlines the deployment of a simple backup of three PostgreSQL databases in the same project namespace, on OCP v4.x.

1. As per OCP4 [docs](https://developer.gov.bc.ca/OCP4-Backup-and-Restore), 25G of the storage class `netapp-file-backup` is the default quota. If this is insufficient, you may [request](https://github.com/BCDevOps/devops-requests/issues/new/choose) more.

2. `git clone https://github.com/BCDevOps/backup-container.git && cd backup-container`.

Create the image.

```bash
oc -n d83219-tools process -f ./templates/backup/backup-build.yaml | oc -n d83219-tools create -f -
```

3. Configure (./config/backup.conf) (listing your database(s), and setting your cron schedule).

```bash
postgres=restoration-tracker-db-postgresql:5432/restoration-tracker
# postgres=pawslimesurvey-postgresql:5432/pawslimesurvey

0 1 * * * default ./backup.sh -s
0 4 * * * default ./backup.sh -s -v all
```

4. Configure references to your DB credentials in [backup-deploy.yaml](./openshift/templates/backup/backup-deploy.yaml), replacing the boilerplate `DATABASE_USER` and `DATABASE_PASSWORD` environment variables.

```yaml
- name: EAOFIDER_POSTGRESQL_USER
  valueFrom:
    secretKeyRef:
      name: eaofider-postgresql
      key: "${DATABASE_USER_KEY_NAME}"
- name: EAOFIDER_POSTGRESQL_PASSWORD
  valueFrom:
    secretKeyRef:
      name: eaofider-postgresql
      key: "${DATABASE_PASSWORD_KEY_NAME}"
```

Note that underscores should be used in the environment variable names.

5. Create your customized `./openshift/backup-deploy.overrides.param` parameter file, if required.

6. Deploy the app; here the example namespace is `d83219-dev` and the app name is `backup-postgres`:

```bash
oc -n d83219-dev create configmap backup-conf --from-file=./config/backup.conf
oc -n d83219-dev label configmap backup-conf app=backup-postgres

oc -n d83219-dev process -f ./templates/backup/backup-deploy.yaml | oc -n d83219-dev create -f -
```

To clean up the deployment

```bash
oc -n d83219-dev delete pvc/backup-postgres-pvc pvc/backup-verification secret/backup-postgres secret/ftp-secret dc/backup-postgres networkpolicy/backup-postgres configmap/backup-conf
```

To clean up the image stream and build configuration

```bash
oc -n d83219-tools delete buildconfig/backup-postgres imagestream/backup-postgres 
```

### NOTE: User Management Role Binding Required in tools env
```
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: 'system:image-pullers'
  namespace: d83219-tools
  annotations:
    openshift.io/description: >-
      Allows all pods in this namespace to pull images from this namespace.  It
      is auto-managed by a controller; remove subjects to disable.
subjects:
  - kind: Group
    apiGroup: rbac.authorization.k8s.io
    name: 'system:serviceaccounts:d83219-tools'
  - kind: Group
    apiGroup: rbac.authorization.k8s.io
    name: 'system:serviceaccounts:d83219-dev'
  - kind: Group
    apiGroup: rbac.authorization.k8s.io
    name: 'system:serviceaccounts:d83219-test'
  - kind: Group
    apiGroup: rbac.authorization.k8s.io
    name: 'system:serviceaccounts:d83219-prod'
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: 'system:image-puller'
```