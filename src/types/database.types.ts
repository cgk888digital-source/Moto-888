export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.4" }
  public: {
    Tables: {
      diagnosticos: {
        Row: { created_at: string; id: string; moto_id: string; nivel_urgencia: string | null; pregunta_enriquecida: string | null; respuesta_ai: string | null; sintoma_original: string; user_id: string }
        Insert: { created_at?: string; id?: string; moto_id: string; nivel_urgencia?: string | null; pregunta_enriquecida?: string | null; respuesta_ai?: string | null; sintoma_original: string; user_id: string }
        Update: { created_at?: string; id?: string; moto_id?: string; nivel_urgencia?: string | null; pregunta_enriquecida?: string | null; respuesta_ai?: string | null; sintoma_original?: string; user_id?: string }
        Relationships: []
      }
      evento_asistentes: {
        Row: { created_at: string | null; evento_id: string; respuesta: string | null; user_id: string }
        Insert: { created_at?: string | null; evento_id: string; respuesta?: string | null; user_id: string }
        Update: { created_at?: string | null; evento_id?: string; respuesta?: string | null; user_id?: string }
        Relationships: []
      }
      eventos: {
        Row: { creador_id: string; created_at: string | null; cupos_max: number | null; descripcion: string | null; estado: string | null; fecha_hora: string; grupo_id: string | null; id: string; punto_partida: string | null; ruta_gpx_url: string | null; titulo: string; voy_count: number | null }
        Insert: { creador_id: string; created_at?: string | null; cupos_max?: number | null; descripcion?: string | null; estado?: string | null; fecha_hora: string; grupo_id?: string | null; id?: string; punto_partida?: string | null; ruta_gpx_url?: string | null; titulo: string; voy_count?: number | null }
        Update: { creador_id?: string; created_at?: string | null; cupos_max?: number | null; descripcion?: string | null; estado?: string | null; fecha_hora?: string; grupo_id?: string | null; id?: string; punto_partida?: string | null; ruta_gpx_url?: string | null; titulo?: string; voy_count?: number | null }
        Relationships: []
      }
      follows: {
        Row: { created_at: string | null; follower_id: string; following_id: string }
        Insert: { created_at?: string | null; follower_id: string; following_id: string }
        Update: { created_at?: string | null; follower_id?: string; following_id?: string }
        Relationships: []
      }
      grupo_miembros: {
        Row: { created_at: string | null; grupo_id: string; rol: string | null; user_id: string }
        Insert: { created_at?: string | null; grupo_id: string; rol?: string | null; user_id: string }
        Update: { created_at?: string | null; grupo_id?: string; rol?: string | null; user_id?: string }
        Relationships: []
      }
      grupos: {
        Row: { admin_id: string; categoria: string | null; created_at: string | null; descripcion: string | null; foto_url: string | null; id: string; miembros_count: number | null; nombre: string; tipo: string | null }
        Insert: { admin_id: string; categoria?: string | null; created_at?: string | null; descripcion?: string | null; foto_url?: string | null; id?: string; miembros_count?: number | null; nombre: string; tipo?: string | null }
        Update: { admin_id?: string; categoria?: string | null; created_at?: string | null; descripcion?: string | null; foto_url?: string | null; id?: string; miembros_count?: number | null; nombre?: string; tipo?: string | null }
        Relationships: []
      }
      mantenimientos: {
        Row: { costo: number | null; created_at: string; fecha: string; foto_url: string | null; id: string; km_al_servicio: number; moto_id: string; notas: string | null; proximo_km: number | null; taller: string | null; tipo_servicio: string }
        Insert: { costo?: number | null; created_at?: string; fecha?: string; foto_url?: string | null; id?: string; km_al_servicio: number; moto_id: string; notas?: string | null; proximo_km?: number | null; taller?: string | null; tipo_servicio: string }
        Update: { costo?: number | null; created_at?: string; fecha?: string; foto_url?: string | null; id?: string; km_al_servicio?: number; moto_id?: string; notas?: string | null; proximo_km?: number | null; taller?: string | null; tipo_servicio?: string }
        Relationships: []
      }
      motos: {
        Row: { ano: number; created_at: string; es_nueva: boolean; fecha_compra: string | null; id: string; kit_tipo: string | null; km_actuales: number; marca: string; modelo: string; nfc_activado: boolean; nfc_token: string | null; taller_acceso: boolean; tipo_aceite: string; user_id: string }
        Insert: { ano: number; created_at?: string; es_nueva?: boolean; fecha_compra?: string | null; id?: string; kit_tipo?: string | null; km_actuales?: number; marca: string; modelo: string; nfc_activado?: boolean; nfc_token?: string | null; taller_acceso?: boolean; tipo_aceite?: string; user_id: string }
        Update: { ano?: number; created_at?: string; es_nueva?: boolean; fecha_compra?: string | null; id?: string; kit_tipo?: string | null; km_actuales?: number; marca?: string; modelo?: string; nfc_activado?: boolean; nfc_token?: string | null; taller_acceso?: boolean; tipo_aceite?: string; user_id?: string }
        Relationships: []
      }
      pois: {
        Row: { created_at: string | null; direccion: string | null; id: string; lat: number; lng: number; nombre: string; rating: number | null; reportado_por: string | null; telefono: string | null; tipo: string; verificado: boolean | null }
        Insert: { created_at?: string | null; direccion?: string | null; id?: string; lat: number; lng: number; nombre: string; rating?: number | null; reportado_por?: string | null; telefono?: string | null; tipo: string; verificado?: boolean | null }
        Update: { created_at?: string | null; direccion?: string | null; id?: string; lat?: number; lng?: number; nombre?: string; rating?: number | null; reportado_por?: string | null; telefono?: string | null; tipo?: string; verificado?: boolean | null }
        Relationships: []
      }
      post_comentarios: {
        Row: { contenido: string; created_at: string | null; id: string; post_id: string; user_id: string }
        Insert: { contenido: string; created_at?: string | null; id?: string; post_id: string; user_id: string }
        Update: { contenido?: string; created_at?: string | null; id?: string; post_id?: string; user_id?: string }
        Relationships: []
      }
      post_likes: {
        Row: { created_at: string | null; post_id: string; user_id: string }
        Insert: { created_at?: string | null; post_id: string; user_id: string }
        Update: { created_at?: string | null; post_id?: string; user_id?: string }
        Relationships: []
      }
      posts: {
        Row: { comentarios_count: number | null; contenido: string | null; created_at: string | null; fotos: string[] | null; id: string; likes_count: number | null; ref_id: string | null; tipo: string; user_id: string }
        Insert: { comentarios_count?: number | null; contenido?: string | null; created_at?: string | null; fotos?: string[] | null; id?: string; likes_count?: number | null; ref_id?: string | null; tipo?: string; user_id: string }
        Update: { comentarios_count?: number | null; contenido?: string | null; created_at?: string | null; fotos?: string[] | null; id?: string; likes_count?: number | null; ref_id?: string | null; tipo?: string; user_id?: string }
        Relationships: []
      }
      registros_taller: {
        Row: { confirmado_dueno: boolean | null; costo_cobrado: number | null; created_at: string; fotos_piezas: string[] | null; id: string; km_registrado: number | null; moto_id: string; notas_mecanico: string | null; registrado_via: string; tipo_servicio: string | null }
        Insert: { confirmado_dueno?: boolean | null; costo_cobrado?: number | null; created_at?: string; fotos_piezas?: string[] | null; id?: string; km_registrado?: number | null; moto_id: string; notas_mecanico?: string | null; registrado_via?: string; tipo_servicio?: string | null }
        Update: { confirmado_dueno?: boolean | null; costo_cobrado?: number | null; created_at?: string; fotos_piezas?: string[] | null; id?: string; km_registrado?: number | null; moto_id?: string; notas_mecanico?: string | null; registrado_via?: string; tipo_servicio?: string | null }
        Relationships: []
      }
      roadguardian_alertas: {
        Row: { cancelada: boolean | null; contacto_alertado: string | null; created_at: string | null; google_maps_url: string | null; id: string; lat: number; lng: number; user_id: string }
        Insert: { cancelada?: boolean | null; contacto_alertado?: string | null; created_at?: string | null; google_maps_url?: string | null; id?: string; lat: number; lng: number; user_id: string }
        Update: { cancelada?: boolean | null; contacto_alertado?: string | null; created_at?: string | null; google_maps_url?: string | null; id?: string; lat?: number; lng?: number; user_id?: string }
        Relationships: []
      }
      roadguardian_contactos: {
        Row: { created_at: string | null; id: string; nombre: string; orden: number | null; relacion: string | null; telefono: string; user_id: string }
        Insert: { created_at?: string | null; id?: string; nombre: string; orden?: number | null; relacion?: string | null; telefono: string; user_id: string }
        Update: { created_at?: string | null; id?: string; nombre?: string; orden?: number | null; relacion?: string | null; telefono?: string; user_id?: string }
        Relationships: []
      }
      rutas: {
        Row: { created_at: string | null; descripcion: string | null; dificultad: string | null; distancia_km: number | null; estado_region: string | null; gpx_url: string | null; id: string; likes_count: number | null; mapa_url: string | null; tipo_terreno: string | null; titulo: string; user_id: string }
        Insert: { created_at?: string | null; descripcion?: string | null; dificultad?: string | null; distancia_km?: number | null; estado_region?: string | null; gpx_url?: string | null; id?: string; likes_count?: number | null; mapa_url?: string | null; tipo_terreno?: string | null; titulo: string; user_id: string }
        Update: { created_at?: string | null; descripcion?: string | null; dificultad?: string | null; distancia_km?: number | null; estado_region?: string | null; gpx_url?: string | null; id?: string; likes_count?: number | null; mapa_url?: string | null; tipo_terreno?: string | null; titulo?: string; user_id?: string }
        Relationships: []
      }
      rutas_comentarios: {
        Row: { contenido: string; created_at: string | null; id: string; ruta_id: string; user_id: string }
        Insert: { contenido: string; created_at?: string | null; id?: string; ruta_id: string; user_id: string }
        Update: { contenido?: string; created_at?: string | null; id?: string; ruta_id?: string; user_id?: string }
        Relationships: []
      }
      rutas_media: {
        Row: { created_at: string | null; id: string; orden: number | null; ruta_id: string; tipo: string | null; url: string }
        Insert: { created_at?: string | null; id?: string; orden?: number | null; ruta_id: string; tipo?: string | null; url: string }
        Update: { created_at?: string | null; id?: string; orden?: number | null; ruta_id?: string; tipo?: string | null; url?: string }
        Relationships: []
      }
      telemetria_rutas: {
        Row: { created_at: string | null; distancia_km: number | null; duracion_seg: number | null; gpx_url: string | null; id: string; lean_angle_max: number | null; roadguardian_activo: boolean | null; ruta_id: string | null; user_id: string; velocidad_max: number | null; velocidad_prom: number | null }
        Insert: { created_at?: string | null; distancia_km?: number | null; duracion_seg?: number | null; gpx_url?: string | null; id?: string; lean_angle_max?: number | null; roadguardian_activo?: boolean | null; ruta_id?: string | null; user_id: string; velocidad_max?: number | null; velocidad_prom?: number | null }
        Update: { created_at?: string | null; distancia_km?: number | null; duracion_seg?: number | null; gpx_url?: string | null; id?: string; lean_angle_max?: number | null; roadguardian_activo?: boolean | null; ruta_id?: string | null; user_id?: string; velocidad_max?: number | null; velocidad_prom?: number | null }
        Relationships: []
      }
      users: {
        Row: { created_at: string; email: string; id: string; nombre: string | null; plan: string; stripe_customer_id: string | null }
        Insert: { created_at?: string; email: string; id: string; nombre?: string | null; plan?: string; stripe_customer_id?: string | null }
        Update: { created_at?: string; email?: string; id?: string; nombre?: string | null; plan?: string; stripe_customer_id?: string | null }
        Relationships: []
      }
      marketplace_vendedores: {
        Row: { id: string; user_id: string; nombre_tienda: string; tipo: string | null; ubicacion: string | null; descripcion: string | null; verificado: boolean | null; rating_promedio: number | null; total_ventas: number | null; foto_url: string | null; created_at: string | null }
        Insert: { id?: string; user_id: string; nombre_tienda: string; tipo?: string | null; ubicacion?: string | null; descripcion?: string | null; verificado?: boolean | null; rating_promedio?: number | null; total_ventas?: number | null; foto_url?: string | null; created_at?: string | null }
        Update: { id?: string; user_id?: string; nombre_tienda?: string; tipo?: string | null; ubicacion?: string | null; descripcion?: string | null; verificado?: boolean | null; rating_promedio?: number | null; total_ventas?: number | null; foto_url?: string | null; created_at?: string | null }
        Relationships: []
      }
      marketplace_productos: {
        Row: { id: string; vendedor_id: string; titulo: string; descripcion: string | null; precio: number; categoria: string; condicion: string | null; motos_compatibles: string[] | null; fotos: string[] | null; stock: number | null; estado: string | null; vistas: number | null; created_at: string | null }
        Insert: { id?: string; vendedor_id: string; titulo: string; descripcion?: string | null; precio: number; categoria: string; condicion?: string | null; motos_compatibles?: string[] | null; fotos?: string[] | null; stock?: number | null; estado?: string | null; vistas?: number | null; created_at?: string | null }
        Update: { id?: string; vendedor_id?: string; titulo?: string; descripcion?: string | null; precio?: number; categoria?: string; condicion?: string | null; motos_compatibles?: string[] | null; fotos?: string[] | null; stock?: number | null; estado?: string | null; vistas?: number | null; created_at?: string | null }
        Relationships: []
      }
      marketplace_transacciones: {
        Row: { id: string; producto_id: string; comprador_id: string; vendedor_id: string; precio_base: number; comision_pct: number; comision_monto: number; total_pagado: number; neto_vendedor: number; estado: string | null; stripe_payment_id: string | null; created_at: string | null }
        Insert: { id?: string; producto_id: string; comprador_id: string; vendedor_id: string; precio_base: number; comision_pct: number; comision_monto: number; total_pagado: number; neto_vendedor: number; estado?: string | null; stripe_payment_id?: string | null; created_at?: string | null }
        Update: { id?: string; producto_id?: string; comprador_id?: string; vendedor_id?: string; precio_base?: number; comision_pct?: number; comision_monto?: number; total_pagado?: number; neto_vendedor?: number; estado?: string | null; stripe_payment_id?: string | null; created_at?: string | null }
        Relationships: []
      }
      marketplace_resenas: {
        Row: { id: string; vendedor_id: string; comprador_id: string; transaccion_id: string | null; rating: number; comentario: string | null; created_at: string | null }
        Insert: { id?: string; vendedor_id: string; comprador_id: string; transaccion_id?: string | null; rating: number; comentario?: string | null; created_at?: string | null }
        Update: { id?: string; vendedor_id?: string; comprador_id?: string; transaccion_id?: string | null; rating?: number; comentario?: string | null; created_at?: string | null }
        Relationships: []
      }
      marketplace_mensajes: {
        Row: { id: string; producto_id: string; remitente_id: string; destinatario_id: string; contenido: string; leido: boolean | null; created_at: string | null }
        Insert: { id?: string; producto_id: string; remitente_id: string; destinatario_id: string; contenido: string; leido?: boolean | null; created_at?: string | null }
        Update: { id?: string; producto_id?: string; remitente_id?: string; destinatario_id?: string; contenido?: string; leido?: boolean | null; created_at?: string | null }
        Relationships: []
      }
      marketplace_guardados: {
        Row: { producto_id: string; user_id: string; created_at: string | null }
        Insert: { producto_id: string; user_id: string; created_at?: string | null }
        Update: { producto_id?: string; user_id?: string; created_at?: string | null }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      decrement_likes: { Args: { post_id: string }; Returns: undefined }
      decrement_miembros: { Args: { grupo_id: string }; Returns: undefined }
      decrement_voy: { Args: { evento_id: string }; Returns: undefined }
      generate_nfc_token: { Args: never; Returns: string }
      increment_comentarios: { Args: { post_id: string }; Returns: undefined }
      increment_likes: { Args: { post_id: string }; Returns: undefined }
      increment_miembros: { Args: { grupo_id: string }; Returns: undefined }
      increment_voy: { Args: { evento_id: string }; Returns: undefined }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Update"]
export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]

export const Constants = { public: { Enums: {} } } as const
