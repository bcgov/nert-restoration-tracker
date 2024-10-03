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
  - name: RESTORATION_TRACKER_DB_POSTGRESQL_DEV_DEPLOY_USER
    valueFrom:
      secretKeyRef:
        key: database-admin
        name: '${DATABASE_SECRET_REF}'
  - name: RESTORATION_TRACKER_DB_POSTGRESQL_DEV_DEPLOY_PASSWORD
    valueFrom:
      secretKeyRef:
        key: database-admin-password
        name: '${DATABASE_SECRET_REF}'

...
- name: DATABASE_SECRET_REF
  displayName: Database Secret Reference
  description: The name of the secret containing the database credentials.
  required: true
  value: restoration-tracker-creds
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

### Restore

The `backup.sh` script's restore mode makes it very simple to restore the most recent backup of a particular database. It's as simple as running a the following command, for example (run `backup.sh -h` for full details on additional options);

    ./backup.sh -I -r postgres=restoration-tracker-db-postgresql-dev-deploy:5432/restoration_tracker

#### NOTE: `-I` is used as `v2.9.0` causes issues with grant permission with `postgres` user. Skipping errors but still letting Restore to finish successfully.

Following are more detailed steps to perform a restore of a backup.

1. Log into the OpenShift Console and log into OpenShift on the command shell window.
   1. The instructions here use a mix of the console and command line, but all could be done from a command shell using "oc" commands.
1. Scale to 0 all Apps that use the database connection.
   1. This is necessary as the Apps will need to restart to pull data from the restored backup.
   1. It is recommended that you also scale down to 0 your client application so that users know the application is unavailable while the database restore is underway.
      1. A nice addition to this would be a user-friendly "This application is offline" message - not yet implemented.
1. Restart the database pod as a quick way of closing any other database connections from users using port forward or that have rsh'd to directly connect to the database.
1. Open an rsh into the backup pod:
   1. Open a command prompt connection to OpenShift using `oc login` with parameters appropriate for your OpenShift host.
   1. Change to the OpenShift project containing the Backup App `oc project <Project Name>`
   1. List pods using `oc get pods`
   1. Open a remote shell connection to the **backup** pod. `oc rsh <Backup Pod Name>`
1. In the rsh run the backup script in restore mode, `./backup.sh -I -r postgres=restoration-tracker-db-postgresql-dev-deploy:5432/restoration_tracker`, to restore the desired backup file. For full information on how to use restore mode, refer to the script documentation, `./backup.sh -h`. Have the Admin password for the database handy, the script will ask for it during the restore process.
   1. The restore script will automatically grant the database user access to the restored database. If there are other users needing access to the database, such as the DBA group, you will need to additionally run the following commands on the database pod itself using `psql`:
      1. Get a list of the users by running the command `\du`
      1. For each user that is not "postgres" and $POSTGRESQL_USER, execute the command `GRANT SELECT ON ALL TABLES IN SCHEMA public TO "<name of user>";`
   1. If users have been set up with other grants, set them up as well.
1. Verify that the database restore worked
   1. On the database pod, query a table - e.g the USER table: `SELECT * FROM "SBI_USER";` - you can look at other tables if you want.
   1. Verify the expected data is shown.
1. Exit remote shells back to your local command line
1. From the Openshift Console restart the app:
   1. Scale up any pods you scaled down and wait for them to finish starting up. View the logs to verify there were no startup issues.
1. Verify full application functionality.

Done!



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