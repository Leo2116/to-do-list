const { createApp } = Vue;

createApp({
    data() {
        return {
            retos: [],
            filtros: {
                categoria: '',
                dificultad: ''
            },
            nuevoReto: {
                titulo: '',
                descripcion: '',
                categoria: '',
                dificultad: 'medio',
                estado: 'pendiente'
            },
            mostrarFormulario: false,
            guardando: false,
            cargando: false,
            notificacion: { tipo: '', texto: '' },
            baseUrl: '/retos',
            nivelesDificultad: [
                { value: '', label: 'Todas', icon: 'all_inclusive' },
                { value: 'bajo', label: 'Baja', icon: 'hiking' },
                { value: 'medio', label: 'Media', icon: 'stacked_line_chart' },
                { value: 'alto', label: 'Alta', icon: 'flash_on' }
            ]
        };
    },
    computed: {
        categoriasDisponibles() {
            const categorias = new Set(this.retos.map(reto => reto.categoria));
            return Array.from(categorias).filter(Boolean).sort();
        },
        resumen() {
            const completados = this.retos.filter(r => r.estado === 'completado').length;
            return { completados, total: this.retos.length };
        }
    },
    methods: {
        async cargarRetos() {
            this.cargando = true;
            try {
                const params = new URLSearchParams();
                if (this.filtros.categoria) params.append('categoria', this.filtros.categoria);
                if (this.filtros.dificultad) params.append('dificultad', this.filtros.dificultad);

                const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
                const respuesta = await fetch(url);
                this.retos = await respuesta.json();
            } catch (error) {
                console.error('Error al cargar los retos', error);
                this.notificar('error', 'No se pudieron cargar los retos');
            } finally {
                this.cargando = false;
            }
        },
        abrirFormulario() {
            this.mostrarFormulario = true;
        },
        cerrarFormulario() {
            this.mostrarFormulario = false;
        },
        limpiarFormulario() {
            this.nuevoReto = {
                titulo: '',
                descripcion: '',
                categoria: '',
                dificultad: 'medio',
                estado: 'pendiente'
            };
        },
        async crearReto() {
            if (!this.nuevoReto.titulo.trim() || !this.nuevoReto.descripcion.trim() || !this.nuevoReto.categoria.trim()) {
                this.notificar('error', 'Completa título, descripción y categoría');
                return;
            }
            this.guardando = true;
            try {
                const respuesta = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(this.nuevoReto)
                });

                if (!respuesta.ok) {
                    const msg = await respuesta.text();
                    let detail = msg;
                    try {
                        const parsed = JSON.parse(msg);
                        detail = parsed.error || parsed.message || msg;
                    } catch (_) {}
                    throw new Error(detail || 'No se pudo guardar');
                }

                this.limpiarFormulario();
                this.cerrarFormulario();
                await this.cargarRetos();
                this.notificar('ok', 'Reto guardado');
            } catch (error) {
                console.error('Error al crear el reto', error);
                this.notificar('error', error.message || 'No se pudo guardar el reto');
            } finally {
                this.guardando = false;
            }
        },
        async actualizarEstado(reto) {
            try {
                const respuesta = await fetch(`${this.baseUrl}/${reto.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: reto.estado })
                });
                if (!respuesta.ok) {
                    throw new Error('No se pudo actualizar el estado');
                }
            } catch (error) {
                console.error('Error al actualizar el reto', error);
                this.notificar('error', 'No se pudo actualizar el estado');
            }
        },
        async eliminarReto(retoId) {
            if (!confirm('¿Seguro que deseas eliminar este reto?')) return;
            try {
                const respuesta = await fetch(`${this.baseUrl}/${retoId}`, { method: 'DELETE' });
                if (!respuesta.ok) {
                    throw new Error('No se pudo eliminar');
                }
                this.retos = this.retos.filter(reto => reto.id !== retoId);
                this.notificar('ok', 'Reto eliminado');
            } catch (error) {
                console.error('Error al eliminar el reto', error);
                this.notificar('error', 'No se pudo eliminar el reto');
            }
        },
        estadoClase(estado) {
            return `estado-${(estado || '').replace(/\s+/g, '-')}`;
        },
        formatearEstado(estado) {
            if (!estado) return '';
            return estado.charAt(0).toUpperCase() + estado.slice(1);
        },
        seleccionarDificultad(valor) {
            this.filtros.dificultad = valor === this.filtros.dificultad ? '' : valor;
            this.cargarRetos();
        },
        notificar(tipo, texto) {
            this.notificacion = { tipo, texto };
            clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => {
                this.notificacion = { tipo: '', texto: '' };
            }, 2800);
        }
    },
    mounted() {
        this.cargarRetos();
    }
}).mount('#app');
