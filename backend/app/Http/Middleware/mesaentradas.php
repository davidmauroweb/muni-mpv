<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class mesaentradas
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado'
            ], 401);
        }
    
        if ($user->rol == 'MESA_ENTRADAS' || $user->rol == 'SUPERVISOR') {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Acceso no autorizado'
        ], 403);
        
    }
}
