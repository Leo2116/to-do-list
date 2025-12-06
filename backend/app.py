import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import get_db_connection, init_db

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

app = Flask(__name__)
CORS(app)

# Llamar a la función de inicialización de la base de datos directamente
# Esto reemplaza el obsoleto @app.before_first_request
init_db()

@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/styles.css')
def serve_styles():
    return send_from_directory(FRONTEND_DIR, 'styles.css')

@app.route('/app.js')
def serve_app_js():
    return send_from_directory(FRONTEND_DIR, 'app.js')

@app.route('/retos', methods=['GET'])
def get_retos():
    categoria = request.args.get('categoria')
    dificultad = request.args.get('dificultad')
    conn = get_db_connection()
    cur = conn.cursor()
    query = "SELECT * FROM retos"
    params = []
    filters = []
    if categoria:
        filters.append("categoria = %s")
        params.append(categoria)
    if dificultad:
        filters.append("dificultad = %s")
        params.append(dificultad)
    if filters:
        query += " WHERE " + " AND ".join(filters)
    cur.execute(query, params)
    retos = [
        dict(id=row[0], titulo=row[1], descripcion=row[2], categoria=row[3], dificultad=row[4], estado=row[5])
        for row in cur.fetchall()
    ]
    cur.close()
    conn.close()
    return jsonify(retos)

@app.route('/retos', methods=['POST'])
def create_reto():
    data = request.get_json(silent=True) or {}
    required_fields = ['titulo', 'descripcion', 'categoria', 'dificultad', 'estado']
    if not all(field in data and str(data[field]).strip() for field in required_fields):
        return jsonify({'error': 'Faltan campos obligatorios'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO retos (titulo, descripcion, categoria, dificultad, estado)
            VALUES (%s, %s, %s, %s, %s) RETURNING id
        """, (data['titulo'], data['descripcion'], data['categoria'], data['dificultad'], data['estado']))
        reto_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({'id': reto_id}), 201
    except Exception as exc:
        conn.rollback()
        # Responder con el detalle del error para depurar desde el frontend
        return jsonify({'error': str(exc)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/retos/<int:reto_id>', methods=['PUT'])
def update_reto(reto_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE retos SET estado = %s WHERE id = %s
    """, (data['estado'], reto_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Reto actualizado'})

@app.route('/retos/<int:reto_id>', methods=['DELETE'])
def delete_reto(reto_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM retos WHERE id = %s", (reto_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Reto eliminado'})

if __name__ == '__main__':
    app.run(debug=True)
