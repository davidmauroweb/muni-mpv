<?php

namespace App\Http\Controllers;
use App\Http\Requests\{CrearUsuario, EditarUsuario};
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function login()
    {
        return response()->json(User::all());
    }
    public function index()
    {
        return User::all();
        
    }

    public function store(CrearUsuario $request)
    {
        $data = $request->validated(); 
        $data['password'] = Hash::make($data['password']); 
    
        $user = User::create($data);

        return response()->json([
            'message' => 'Usuario creado correctamente',
            'user' => $user
        ], 200);
    }

    public function show(User $user)
    {
        //
    }

    public function update(EditarUsuario $request, User $user)
    {
        $data = $request->validated();
    
        // Si enviaron password, la encriptamos; si no, la quitamos del array para no borrar la actual
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
    
        $user->update($data);
    
        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user
        ], 200);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json([
            'message' => 'Usuario eliminado correctamente',
            'user' => $user
        ], 200);
    }

    public function personalActivo()
    {
        return User::where('rol','=', 'PERSONAL')->orWhere('rol', '=', 'SUPERVISOR')->get();
    }
}