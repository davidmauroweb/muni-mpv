<?php

namespace App\Http\Controllers;

use App\Models\{solicitante,atencion};
use Illuminate\Http\Request;

class SolicitanteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return solicitante::all();
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
        $nuevo = new solicitante();
        $nuevo->dni=$request->dni;
        $nuevo->telefono=$request->telefono;
        $nuevo->nombre_apellido=$request->nombre_apellido;
        $nuevo->domicilio=$request->domicilio;
        $nuevo->save();
    }

    /**
     * Display the specified resource.
     */
    public function show(solicitante $solicitante)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(solicitante $solicitante)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, solicitante $solicitante)
    {
        $Actual = solicitante::find($solicitante->id);
        $Actual->dni=$request->dni;
        $Actual->telefono=$request->telefono;
        $Actual->nombre_apellido=$request->nombre_apellido;
        $Actual->domicilio=$request->domicilio;
        $Actual->save();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(solicitante $solicitante)
    {
        $q = atencion::where('solicitante_id',$solicitante->id)->count();
        if ($q == 0){
        $solicitante->delete();
        return response()->json([
            'success' => true,
            'message' => 'Solicitante Eliminado',
            'data' => $solicitante->nombre_apellido
        ], 200);
        }else{
            return response()->json([
                'success' => false,
                'message' => 'El solicitante tiene atenciones cargadas '. $q,
                'data' => $solicitante->nombre_apellido
            ], 200);
        }
    }
}
