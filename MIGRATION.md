# Migration Guide

## Migrating from 1.x.x to 2.x.x

`allowedHeaders: ['x-cortex-email', 'x-cortex-name']` is now required in the proxy config:

Update [app-config.yaml](https://github.com/backstage/backstage/blob/master/app-config.yaml#L54) to add a new config under
the `proxy` section:

```yaml
'/cortex':
  target: ${CORTEX_BACKEND_HOST_URL}
  headers:
    Authorization: Bearer ${CORTEX_TOKEN}
  allowedHeaders: ['x-cortex-email', 'x-cortex-name']
```
