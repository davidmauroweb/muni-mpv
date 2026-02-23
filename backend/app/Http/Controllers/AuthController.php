<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'password' => 'required|string',
        ]);
    
        $user = User::where('name', $request->name)->first();
    
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }
    
        $token = JWTAuth::fromUser($user);
    
        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }
}


