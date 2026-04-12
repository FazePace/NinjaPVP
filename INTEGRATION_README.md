# Integración Web-Minecraft NinjaPVP

## Descripción
Sistema de comunicación bidireccional entre la página web NinjaPVP y el servidor Minecraft.

## Funcionalidades

### 1. Sincronización Automática
- Los datos de jugadores se sincronizan automáticamente cada 5 minutos
- Archivo generado: `C:\Users\feano\Desktop\assets\players.json`
- Comando manual: `/syncweb` (requiere permiso `antichup.admin`)

### 2. Servidor HTTP Integrado
- Puerto: 8080
- Endpoints disponibles:
  - `POST /execute` - Ejecutar comandos en el servidor
  - `GET /status` - Obtener estado del servidor (jugadores online, TPS)

### 3. Comando /web
- Uso: `/web <comando>`
- Permiso: `antichup.admin`
- Ejemplos:
  - `/web broadcast ¡Bienvenido a NinjaPVP!`
  - `/web give Steve diamond_sword`
  - `/web tp Steve 0 100 0`

### 4. Conector JavaScript (minecraft-connector.js)
Funciones disponibles desde la consola del navegador:

```javascript
// Verificar conexión
await mc.checkConnection()

// Enviar broadcast
await mc.broadcast("Mensaje desde la web")

// Dar items
await mc.giveItem("jugador", "diamond_sword", 1)

// Teleportar
await mc.teleport("jugador1", "jugador2")

// Comando personalizado
await mc.runCommand("time set day")
```

## Instalación

1. **Compilar el plugin:**
   ```bash
   cd D:\AntiChup
   .\gradlew build
   ```

2. **Copiar al servidor:**
   ```bash
   copy AntiChup-1.0.jar D:\server\plugins\
   ```

3. **Reiniciar el servidor** para cargar el nuevo plugin

4. **Agregar el script a la web:**
   - El archivo `minecraft-connector.js` ya está incluido en `preview.html`

## Configuración

### Puerto del Servidor Web
Por defecto usa el puerto 8080. Para cambiarlo, modificar en `AntiChup.java`:
```java
webServer.start(8080); // Cambiar el número de puerto
```

### Firewall
Asegurarse de que el puerto 8080 esté abierto en el firewall para conexiones desde la web.

## Seguridad

- Los comandos desde la web se ejecutan con permisos de consola
- Solo usuarios con permiso `antichup.admin` pueden usar `/web`
- Considerar implementar autenticación adicional para producción

## Testing

1. **Verificar servidor web:**
   - Abrir `http://localhost:8080/status` en el navegador
   - Debería devolver JSON con estado del servidor

2. **Probar comandos desde web:**
   - Abrir consola del navegador en `preview.html`
   - Ejecutar: `await mc.broadcast("Test desde web")`

3. **Verificar sincronización:**
   - Ejecutar `/syncweb` en el servidor
   - Verificar que `players.json` se actualice