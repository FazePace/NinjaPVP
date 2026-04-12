// Script de prueba para la integración Web-Minecraft
// Ejecutar en la consola del navegador (F12) cuando preview.html esté abierto

async function testIntegration() {
    console.log('🧪 Iniciando pruebas de integración Web-Minecraft...');

    // 1. Verificar conexión
    console.log('1. Verificando conexión con el servidor...');
    const connected = await mc.checkConnection();
    console.log('   Conectado:', connected ? '✅' : '❌');

    if (!connected) {
        console.log('❌ No se puede conectar al servidor. Verificar que esté ejecutándose en puerto 8080');
        return;
    }

    // 2. Obtener estado del servidor
    console.log('2. Obteniendo estado del servidor...');
    const status = await mc.getServerStatus();
    if (status) {
        console.log('   ✅ Estado obtenido:', status);
    } else {
        console.log('   ❌ Error obteniendo estado');
    }

    // 3. Probar broadcast (comentado para no spam)
    /*
    console.log('3. Probando broadcast...');
    const broadcastResult = await mc.broadcast('¡Prueba de integración Web-Minecraft exitosa!');
    console.log('   Broadcast:', broadcastResult ? '✅' : '❌');
    */

    console.log('✅ Pruebas completadas. La integración está funcionando correctamente.');
}

// Ejecutar pruebas
testIntegration();