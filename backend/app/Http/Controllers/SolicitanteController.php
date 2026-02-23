<?php

namespace App\Http\Controllers;

use App\Models\solicitante;
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
        $solicitante->delete();
    }
}
