# API OpenShift Templates

This folder contains yaml templates for the api builds, deployments, etc.

## API Prerequisites For Deploying On OpenShift

The pipeline code builds and deploys all pods/images/storage/etc needed to deploy the application. However, there are some secrets that cannot be automatically deployed (as they cannot be committed to GitHub). You must manually create and populate these secrets.

- Create Database Secret (restoration-tracker-creds)
- Create ObjectStore Secret (restoration-tracker-object-store)

The included templates under `prereqs` can be imported via the "Import YAML" page in OpenShift.

## API Node image stream and version 

The imagestreamtag `image-registry.openshift-image-registry.svc:5000/openshift/nodejs-20-minimal:1-41.1712567743` listed in the `api.bc.yaml` must exists in the OpenShift tools environment.

 - If the required imagestreamtag does not exist, or the image stream exists but has no matching tag, run the following command using the OC CLI.

    ```
    oc import-image ubi8/nodejs-20-minimal:1-41.1712567743 --from=registry.access.redhat.com/ubi8/nodejs-20-minimal:1-41.1712567743 --confirm
    ```

  - Note: At the time of writing this, the image is `nodejs-20-minimal:1-41.1712567743`, update the above command as needed if the image or version has since changed.
