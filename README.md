# TP1 Software Libre

## Descripción

Este proyecto es una plataforma de gestión de ganado y zonas, con frontend en Next.js y backend con endpoints RESTful. Utiliza MongoDB con capacidades geoespaciales para búsquedas avanzadas.

## Ejecución rápida

En la raíz del proyecto, ejecuta:

```
docker-compose up --build
```

Esto construirá y levantará los contenedores definidos en `docker-compose.yml`.

---

## Funcionalidades principales

- **Gestión de ganado**: Alta, baja, modificación y búsqueda de vacas.
- **Gestión de zonas**: Alta, baja, modificación y búsqueda de zonas geográficas.
- **Búsqueda geoespacial**: Puedes buscar vacas dentro de un radio usando geosearch de MongoDB, tanto desde la interfaz como desde la API.
- **Monitoreo de contenedores**: Daemons en Bash monitorean el estado de los contenedores y notifican por Telegram si hay problemas.

---

## Búsqueda geoespacial (geosearch)

### Desde la interfaz

- En la sección "Ganado", puedes buscar vacas por radio usando el botón destacado "Buscar vacas". Esto abre un modal donde ingresas latitud, longitud y radio (en km). La búsqueda se realiza usando geosearch en MongoDB.

### Desde la API

- Endpoint general: `/api/cattle?lat=LAT&lng=LNG&radius=RADIO`
- Endpoint dedicado: `/api/cattle-geosearch?lat=LAT&lng=LNG&radius=RADIO`

Ambos endpoints devuelven las vacas dentro del radio especificado, usando `$geoWithin` y `$centerSphere` de MongoDB.

---

## Verificar datos en la base de datos

1. Accede al contenedor de MongoDB:

```
docker exec -it mongo bash
```

2. Inicia el shell de MongoDB:

```
mongosh
```

3. Selecciona la base de datos:

```
use livestock-management
```

4. Muestra las colecciones:

```
show collections
```

5. Consulta una colección:

```
db.<nombre-de-la-coleccion>.find()
```

---

## Monitoreo y notificaciones por Telegram

Hay scripts Bash en `daemon/` que monitorean los contenedores y envían alertas a Telegram si alguno falla. Puedes probar el envío manual de mensajes con el script interactivo:

```
python3 send_telegram.py
```

Completa el mensaje y se enviará al chat configurado.

---

## Ejecución de los daemon

Los daemon se encargan de monitoriar a los contenedores.

> **Nota importante:**
> Antes de copiar los servicios, revisá y modificá la ruta absoluta del script en el campo `ExecStart=` de cada archivo `.service`.
> Para saber la ruta exacta, ejecutá `pwd` dentro de la carpeta `daemon` y usá esa ruta en el archivo.

Ejemplo:

1. Ejecutá en la terminal:

```
cd daemon
pwd
```

2. Copiá la ruta que te muestra y reemplazala en la línea `ExecStart=` de los archivos `monitorCliente.service` y `monitorMongo.service`.

3. Luego, copiá los archivos de servicio:

```
cp ../daemon/monitorCliente.service /etc/systemd/system/monitorCliente.service
cp ../daemon/monitorMongo.service /etc/systemd/system/monitorMongo.service
```

4. Recargá los servicios y activalos:

```
sudo systemctl daemon-reload
sudo systemctl start monitorCliente
sudo systemctl start monitorMongo
sudo systemctl enable monitorCliente
sudo systemctl enable monitorMongo
sudo systemctl status monitorCliente
sudo systemctl status monitorMongo
```

Asegúrate de editar la ruta de `ExecStart` en los archivos `.service` si tu ruta local es diferente.

---

## Notas

- Si usas búsquedas geoespaciales, asegúrate de tener un índice 2dsphere en el campo `position` de la colección `cattle`.
- El archivo `send_telegram.py` permite enviar mensajes personalizados a tu bot de Telegram.
- El sistema está pensado para ser usado y probado en Linux.