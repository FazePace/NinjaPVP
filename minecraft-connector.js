// Web-Minecraft Integration Script
// Permite comunicación bidireccional entre la página web y el servidor Minecraft

class MinecraftConnector {
    constructor(serverIP = 'localhost', serverPort = 8080) {
        this.serverIP = serverIP;
        this.serverPort = serverPort;
        this.baseURL = `http://${serverIP}:${serverPort}`;
        this.isConnected = false;
    }

    // Ejecutar comando en el servidor Minecraft
    async executeCommand(command) {
        try {
            const response = await fetch(`${this.baseURL}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: command
            });

            if (response.ok) {
                console.log(`Comando ejecutado en Minecraft: ${command}`);
                return true;
            } else {
                console.error(`Error ejecutando comando: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.error('Error de conexión con el servidor Minecraft:', error);
            return false;
        }
    }

    // Obtener estado del servidor
    async getServerStatus() {
        try {
            const response = await fetch(`${this.baseURL}/status`);
            if (response.ok) {
                const status = await response.json();
                this.isConnected = true;
                return status;
            } else {
                this.isConnected = false;
                return null;
            }
        } catch (error) {
            this.isConnected = false;
            console.error('Error obteniendo estado del servidor:', error);
            return null;
        }
    }

    // Verificar conexión
    async checkConnection() {
        const status = await this.getServerStatus();
        return status !== null;
    }

    // Enviar broadcast al servidor
    async broadcast(message) {
        return await this.executeCommand(`broadcast ${message}`);
    }

    // Dar item a un jugador
    async giveItem(player, item, amount = 1) {
        return await this.executeCommand(`give ${player} ${item} ${amount}`);
    }

    // Teleportar jugador
    async teleport(player, target) {
        return await this.executeCommand(`tp ${player} ${target}`);
    }

    // Ejecutar comando personalizado
    async runCommand(command) {
        return await this.executeCommand(command);
    }
}

// Función global para usar desde la consola del navegador
window.mc = new MinecraftConnector();

// Ejemplo de uso:
// mc.broadcast("¡Bienvenido a NinjaPVP!");
// mc.giveItem("Steve", "diamond_sword");
// mc.checkConnection().then(connected => console.log("Conectado:", connected));