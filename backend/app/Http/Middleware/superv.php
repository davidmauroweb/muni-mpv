<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class superv
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado'
            ], 401);
        }
    
        if ($user->rol == 'SUPERVISOR') {
            return $next($request);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Acceso no autorizado'
        ], 403);
        
    }
}
