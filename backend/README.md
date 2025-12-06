# Backend - Tablero Interactivo de Retos

## Requisitos
- Python 3.8+
- PostgreSQL

## Instalación

1. Clona el repositorio y entra en la carpeta `backend`.
2. Copia `.env.example` a `.env` y configura tus credenciales de PostgreSQL.
3. Instala dependencias:
   ```
   pip install -r requirements.txt
   ```
4. Crea la base de datos en PostgreSQL:
   ```
   createdb retosdb
   ```
5. Ejecuta el servidor Flask:
   ```
   python app.py
   ```
   El backend estará disponible en `http://localhost:5000`.

## Endpoints
- `GET /retos`
- `GET /retos?categoria=<valor>&dificultad=<valor>`
- `POST /retos`
- `PUT /retos/<id>`
- `DELETE /retos/<id>`
