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
                'message' => 'No autenticado'
            ], 401);
        }
    
        if ($user->rol == 'MESA_ENTRADAS' || $user->rol == 'SUPERVIDOR') {
            return $next($request);
        }

        return response()->json([
            'message' => 'Acceso no autorizado'
        ], 403);
        
    }
}
