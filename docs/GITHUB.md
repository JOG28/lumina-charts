# Guardar y probar en GitHub antes de npm

El proyecto se puede guardar en un repositorio privado de tu cuenta personal. La creación del repositorio y el primer push requieren acceso confirmado a esa cuenta. Esta preparación no publica el paquete en npm.

## Comprobaciones locales

Desde la carpeta del proyecto:

```sh
npm ci
npm test
npm run build
npm pack ./dist/lumina-charts --pack-destination .
```

El paquete resultante se puede instalar en otro proyecto Angular 21 mediante `npm install /ruta/lumina-charts-0.2.0.tgz echarts`.

No se versionan node_modules, dist, cachés de Angular, archivos tgz, credenciales npm ni archivos .env. El paquete se vuelve a construir a partir del código y package-lock.json.

## Pruebas automáticas

`.github/workflows/ci.yml` ejecuta, en Ubuntu con Node 24:

1. Instalación reproducible con npm ci.
2. Pruebas unitarias y render SVG de los 35 ejemplos.
3. Compilación de biblioteca, galería y aplicación Ionic.
4. Creación de un paquete instalable con npm pack.
5. Conservación del paquete como artefacto descargable durante 7 días.

Se ejecuta al subir commits, abrir/actualizar pull requests o manualmente desde Actions. Solo necesita lectura del repositorio; no usa credenciales de npm ni contiene un paso de publicación.

El estado verde en GitHub solo se puede confirmar después del primer push y de que termine la ejecución. Las compilaciones nativas Android/iOS y las pruebas en dispositivos siguen siendo pasos separados.

## Antes de publicar

- Probar la navegación Ionic, el giro/cambio de tamaño y los gestos en dispositivos reales.
- Comprobar exportación y compartir con Capacitor en Android/iOS.
- Elegir nombre npm y completar repositorio, autor y enlaces en el paquete.
- Revisar las dependencias de desarrollo y ejecutar npm audit --omit=dev.
- Publicar una beta cuando el paquete probado esté aprobado.

Referencias oficiales: [checkout](https://github.com/actions/checkout), [Node](https://github.com/actions/setup-node), [artefactos](https://github.com/actions/upload-artifact).
