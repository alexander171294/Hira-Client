# DEPRECATED STATUS

La nueva versión del cliente se encuentra aquí:

https://github.com/hirananet/HiraClient

El nucleo del cliente (todo el parser de IRC) se encuentra aquí:

https://github.com/hirananet/IRCore

La versión mobile se encuentra aquí:

https://github.com/hirananet/Hirana

Ante cualquier otra duda por favor revisar la web de nuestra red:

https://www.hirana.net/

# Hira-Client

IRC Client for Hira network and others 

![InitialPreview](https://i.imgur.com/1xw8ukh.png)

# Releases:

## Docker HUB:

https://hub.docker.com/r/alexander171294/hira-client/tags

## Live instance:

https://web.hirana.net/

https://hira.tandilserver.com/

## Embeber cliente:

Puede embeber el cliente con un iframe agregando un parametro de embebido para eliminar la lista de chats y que quede más grande.

```
<iframe style="width: 100%;border: none;height: 60vh;" id="iframeCBox" src="https://web.hirana.net/#skin=dark;embedded=true;apodoSecundario=Tulkalen;autojoin=alcatraz;requestNick=Tulkalex"></iframe>
```

Parametros disponibles:

* **skin**: puede ser dark o light para que se vea en modo oscuro o claro.

* **embedded**: true o no ponerlo en el link, permite eliminar la lista de canales/privados para tener más espacio de chat.

* **apodo**: configura el apodo inicial (opcional).

* **apodoSecundario**: configura el apodo secundario.

* **autojoin**: indica el canal al cual unirse.

* **server**: indica el servidor al cual unirse (por defecto kappa.)

* **requestNick**: indica que se debe abrir el popup y preguntar si quiere ese nick (si se pasa de parametro el valor 0 se pondrá de nick "invitado" y un numero al azar), si este parametro no está en la url, el cliente conectará automáticamente y pondrá de apodo el informado en el parametro apodo, si este parámetro está en vez de usar apodo se usa el parametro requestnick para indicar el apodo o generar uno random (tener en cuenta que este parametro anula el parametro "apodo" pero no el "apodo secundario"). Este parametro levanta el popup para consultar en vez de conectar directamente.


