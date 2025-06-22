
# TP1 Software Libre

## Cómo ejecutarlo

En una terminal de Linux, ubicado en la carpeta del proyecto, ejecutar:

```
docker-compose up --build
````

Esto construirá y levantará los contenedores definidos en el archivo `docker-compose.yml`.

---

## Cómo verificar que los datos estén correctamente en la base de datos

Con los contenedores corriendo, en otra terminal ejecutar los siguientes comandos:

1. Acceder al contenedor de MongoDB:

```
docker exec -it tp1-sl-mongo-1 bash
```

2. Iniciar el shell de MongoDB:

```
mongosh
```

3. Seleccionar la base de datos:

```
use livestock-management
```

4. Mostrar las colecciones disponibles:

```
show collections
```

5. Ver el contenido de una colección específica:

```
db.<nombre-de-la-coleccion>.find()
```
---

Ejecucion de los daemon

Los daemon se encargan de monitoriar a los contenedores

(ejecutar pwd en la carpeta daemon para saber la ruta)
(modificar en el daemon la ruta por la que este el git ExecStart=)

1°  cp ../daemon/monitorCliente.service /etc/systemd/system/monitorCliente.service
    cp ../daemon/monitorMongo.service /etc/systemd/system/monitorMongo.service

2°  sudo systemctl daemon-reload
    sudo systemctl start monitorCliente
    sudo systemctl start monitorMongo
    sudo systemctl enable monitorCliente
    sudo systemctl enable monitorMongo
    sudo systemctl status monitorCliente
    sudo systemctl status monitorMongo