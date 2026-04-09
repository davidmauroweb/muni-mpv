<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class atencion extends Model
{
    protected $fillable = [
        'solicitante_id', 'usuario_creador_id', 'usuario_asignado_id', 'estado',
        'sx', 'edad', 'fecha', 'servicio', 'caps', 'motivo', 'descripcion',
        'resolucion', 'atencion_dispensada'
    ];
}
