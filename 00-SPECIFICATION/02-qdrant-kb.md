# Goal

Gestion de Flujos de Ingesta

# Intentions

- Necesito que la opción "Library" permita gestionar flujos para ingesta de contenidos desde source (adaptadores para folder,file,timer) hacia sink (qdrant,neo4j,API,postgres) y al medio procesadores (embedder,javascript,python). 
- Cada flujodebe tener un titulo, descripcion y un modelo de flujo tipo grafo con nodos (source que inicia, procesadores y nodos sink finalizadores del flujo). 
- Los modelo de flujo se diseñanarán en un diseñador visual con un panel a la derecha que contiene agrupado por tipologia los diferentes tipos de nodos, al centro el lienzo de dibujo que funciona en modo drag & drop de los nodos y a la derecha un panel que se activa al seleccionar con un click sobre el nodo. Los nodos en el lienzo se unen sobre pequeños circulos en cada uno de los lados al centro de cada lado. 
- Los nodos source tienen un circulo sobre el borde derecho, mientras los sink tienen un circulo sobre el borde izquierdo. Una flecha de flujo siempre conecta puntos en los nodos indicando el sentido del flujo de secuencia. Sobre los flujos viajan mensajes.