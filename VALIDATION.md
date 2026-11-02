# Verificación

- `npm test`: 16 pruebas correctas: variantes, datos no finitos/desalineados, histogramas y extremos numéricos, CSV con neutralización de fórmulas, actualización acotada, coordenadas/tamaños de burbuja, helpers de intervalos, overlays inmutables y liberación de grupos.
- Una prueba renderiza los **35 ejemplos** con ECharts real en SVG SSR y comprueba que no hay NaN/Infinity en la geometría. En ese test el grafo usa layout circular determinista; el ejemplo de navegador utiliza force.
- `npm run build`: compilación Angular de biblioteca, galería y **aplicación Ionic 9**. Ionic consume los archivos compilados en `dist/lumina-charts`.
- `npm pack ./dist/lumina-charts --pack-destination .`: paquete `lumina-charts-0.2.0.tgz`, con manifiesto, tipos, módulo Angular, guías móvil/funciones y licencia.
- Revisión en navegador local: gráficos visibles, zoom por controles, guardado de rango 15–85, incorporación de un nuevo punto conservando ese rango y tabla accesible con el nuevo dato.
- En Ionic: exportación PNG desde SVG (payload generado), cambio de ancho, navegación a Gantt y regreso con contador de entradas incrementado. La página Ionic conserva su instancia; el adaptador gestiona el ciclo de vida de la gráfica.
- `npm audit --omit=dev`: 0 vulnerabilidades notificadas en dependencias de producción durante esta verificación.
- La instalación npm informó 18 avisos moderados en herramientas de desarrollo tras añadir el ejemplo Ionic/Capacitor. No se aplicaron actualizaciones forzadas de versiones mayores. La auditoría con `--omit=dev` no informó avisos en producción.

No se ha publicado el paquete en npm. No se han compilado ni firmado aplicaciones nativas Android/iOS, ni comprobado gestos físicos, compartir/guardar nativo, VoiceOver/TalkBack o toda la matriz de navegadores. No se han verificado todas las combinaciones de opciones de ECharts ni SSR de una aplicación Angular consumidora completa. La biblioteca protege la inicialización del motor con `isPlatformBrowser`.
