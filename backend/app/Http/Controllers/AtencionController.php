<?php

namespace App\Http\Controllers;

use App\Models\{atencion,User};
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AtencionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return atencion::join('solicitantes', 'solicitantes.id', 'atencions.solicitante_id')
            ->leftjoin('users','atencions.usuario_asignado_id','users.id')
            ->select('solicitantes.nombre_apellido AS solicitante_nombre','solicitantes.dni AS solicitante_dni','atencions.*','users.apellido AS personal_nombre')->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $nuevo = new atencion();
        $nuevo->solicitante_id = $request->solicitante_id;
        $nuevo->usuario_creador_id = auth()->user()->id;
        $nuevo->usuario_asignado_id = $request->asignada_a="" ? null : $request->asignada_a;
        $nuevo->estado = $request->filled('asignada_a') ? 'en_atencion' : 'registrado';
        $nuevo->fecha = Carbon::now()->format('Y-m-d');
        $nuevo->motivo = $request->tipo_tramite;
        $nuevo->descripcion = $request->descripcion;
        $nuevo->resolucion = null;
        $nuevo->save();
        $acargo = User::where('id', $nuevo->usuario_asignado_id)->select('nombre','apellido','rol')->first();
        $datos = [
            'id' => $nuevo->id,
            'fecha_creacion' => $nuevo->created_at,
            'solicitante_nombre' => $request->solicitante_nombre,
            'solicitante_dni' => $request->solicitante_dni,
            'solicitante_domicilio' => $request->solicitante_domicilio,
            'solicitante_telefono' => $request->solicitante_telefono,
            'motivo' => $request->tipo_tramite,
            'atencion_dispensada' => $request->atencion_dispensada,
            'personal_nombre' => $acargo->nombre." ".$acargo->apellido,
            'personal_cargo' => $acargo->rol,
        ];
        return response()->json([
            'success' => true,
            'message' => 'Atención Creada',
            'data' => $datos
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(atencion $atencion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(atencion $atencion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, atencion $atencion)
    {
        $update = atencion::find($atencion->id);
        $update->estado = 'atendido';
        $update->resolucion = $request->atencion_dispensada;
        $update->save();
        // La fecha se calcula automáticamente con laravel al modificar un campo modifica el campo updated_at
        return response()->json([
            'success' => true,
            'message' => 'Atención Dispensada',
            'data' => $update
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(atencion $atencion)
    {
        //
    }
}
