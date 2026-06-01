Flujo de Trabajo para el Siguiente Programador
Cada vez que realices cambios en el código del frontend y necesites que se reflejen en producción (dali.com.co:5173), debes seguir este orden estrictamente, ya que el comando vite preview se alimenta exclusivamente de la carpeta estática optimizada (dist/):

1. Compilación (Generar cambios)
Entra al directorio del proyecto y compila la aplicación para empaquetar el nuevo código JS/CSS:

Bash
cd /home/didier/proyectos/mock-up-sodexo/frontend
npm run build
2. Reiniciar el demonio
Para asegurar que el proceso tome la compilación limpia y refresque los sockets del sistema:

Bash
sudo systemctl restart mock-sodexo-front
Comandos de Control de la Infraestructura
Usa los siguientes comandos estándar para auditar y controlar el estado del servicio:

Monitorear el estado del servicio (Ver si está activo o fallando):

Bash
sudo systemctl status mock-sodexo-front
Detener el servicio por completo:

Bash
sudo systemctl stop mock-sodexo-front
Iniciar el servicio si se encuentra apagado:

Bash
sudo systemctl start mock-sodexo-front
Ver los logs de salida de Vite y errores de Node en tiempo real:

Bash
tail -f /home/didier/proyectos/mock-up-sodexo/frontend/service.log
Notas Importantes de Redirección (Manejo de Rutas)
El comando vite preview actúa como un servidor de archivos estáticos de producción. Si accedes o refrescas la pestaña directamente desde rutas hijas del router (ej. /login o /dashboard), el servidor devolverá un error HTTP 404 porque busca carpetas físicas en el disco.

Regla: Siempre se debe ingresar a la aplicación web a través de la raíz del dominio: http://www.dali.com.co:5173/. La navegación interna se resolverá mediante el Router del lado del cliente sin inconvenientes.
"""

file_path = "DEPLOYMENT_README.md"
with open(file_path, "w", encoding="utf-8") as f:
f.write(md_content.strip())

print(f"File successfully written to {file_path}")

Tu archivo Markdown (`.md`) está listo para que el próximo desarrollador entienda exactamente la infraestructura que montaste, los comandos de control y cómo actualizar la app cuando haga cambios en el código.

[file-tag: code-generated-file-0-1780067643188506289]

Aquí tienes el contenido del archivo para que lo revises directamente:

```markdown
# Configuración del Servicio Frontend (Mock Sodexo)

Este documento detalla la infraestructura montada para mantener el entorno de frontend del proyecto **Mock Sodexo** activo de forma persistente en la máquina virtual `llama01`. Esto se configuró para cumplir con los requerimientos de demostración continua a clientes finales a través del dominio expuesto.

## Arquitectura del Despliegue

Para garantizar alta disponibilidad y persistencia sin necesidad de mantener sesiones SSH abiertas, se optó por un servicio nativo del sistema operativo gestionado por `systemd`. 

Dado que el entorno de desarrollo utiliza **NVM (Node Version Manager)** bajo el usuario local `didier`, el servicio se configuró apuntando de manera absoluta a los binarios contenidos en el entorno aislado del usuario, evitando colisiones globales y problemas de permisos con `root`.

### Detalles del Servicio `systemd`

El archivo de configuración se encuentra en la ruta global:
`/etc/systemd/system/mock-sodexo-front.service`

#### Contenido del archivo `.service`:
```ini
[Unit]
Description=Servicio Frontend Mock Sodexo
After=network.target

[Service]
Type=simple
User=didier
WorkingDirectory=/home/didier/proyectos/mock-up-sodexo/frontend
Environment="PATH=/home/didier/.nvm/versions/node/v20.20.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/didier/.nvm/versions/node/v20.20.2/bin/npx vite preview --host --port 5173
Restart=always
RestartSec=3
Environment=NODE_ENV=production
StandardOutput=append:/home/didier/proyectos/mock-up-sodexo/frontend/service.log
StandardError=append:/home/didier/proyectos/mock-up-sodexo/frontend/service.log

[Install]
WantedBy=multi-user.target
Flujo de Trabajo para el Siguiente Programador
Cada vez que realices cambios en el código del frontend y necesites que se reflejen en producción (dali.com.co:5173), debes seguir este orden estrictamente, ya que el comando vite preview se alimenta exclusivamente de la carpeta estática optimizada (dist/):

1. Compilación (Generar cambios)
Entra al directorio del proyecto y compila la aplicación para empaquetar el nuevo código JS/CSS:

Bash
cd /home/didier/proyectos/mock-up-sodexo/frontend
npm run build
2. Reiniciar el demonio
Para asegurar que el proceso tome la compilación limpia y refresque los sockets del sistema:

Bash
sudo systemctl restart mock-sodexo-front
Comandos de Control de la Infraestructura
Usa los siguientes comandos estándar para auditar y controlar el estado del servicio:

Monitorear el estado del servicio (Ver si está activo o fallando):

Bash
sudo systemctl status mock-sodexo-front
Detener el servicio por completo:

Bash
sudo systemctl stop mock-sodexo-front
Iniciar el servicio si se encuentra apagado:

Bash
sudo systemctl start mock-sodexo-front
Ver los logs de salida de Vite y errores de Node en tiempo real:

Bash
tail -f /home/didier/proyectos/mock-up-sodexo/frontend/service.log
Notas Importantes de Redirección (Manejo de Rutas)
El comando vite preview actúa como un servidor de archivos estáticos de producción. Si accedes o refrescas la pestaña directamente desde rutas hijas del router (ej. /login o /dashboard), el servidor devolverá un error HTTP 404 porque busca carpetas físicas en el disco.

Regla: Siempre se debe ingresar a la aplicación web a través de la raíz del dominio: http://www.dali.com.co:5173/. La navegación interna se resolverá mediante el Router del lado del cliente sin inconvenientes.