<?php
use App\Http\Controllers\{UserController, AuthController, SolicitanteController, AtencionController};
use Illuminate\Support\Facades\Route;

//Route::apiResource('users', UserController::class);
# SIN Login
Route::post('auth/login', [AuthController::class, 'login']);

# Todos los roles tienen acceso a las lecturas.
Route::middleware('auth:api')->group(function () {
    # Atenciones
    Route::get('/atenciones', [AtencionController::class, 'index']);
    # Solicitantes
    Route::get('/solicitantes', [SolicitanteController::class, 'index']);
    # Usuarios
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/personal-activo', [UserController::class, 'personalActivo']);
});
# ADMINISTRADOR solo gestiona usuarios.
Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});
# PERSONAL solo crea solicitantes y atenciones
Route::middleware(['auth:api', 'personal'])->group(function () {
    Route::post('/solicitantes', [SolicitanteController::class, 'store']);
    Route::post('/atenciones', [AtencionController::class, 'store']);
});

# MESA DE ENTRADAS actualiza y elimina solicitantes -> incluye funciones de personal
Route::middleware(['auth:api', 'me'])->group(function () {
    Route::put('/solicitantes/{solicitante}', [SolicitanteController::class, 'update']);
    Route::delete('/solicitantes/{solicitante}', [SolicitanteController::class, 'destroy']);
});

# SUPERVISOR actualiza atenciones -> incluye funciones de mesa de entradas que, también, cumple funciones de personal.
Route::middleware(['auth:api', 'super'])->group(function () {
    Route::put('/atenciones/{atencion}', [AtencionController::class, 'update']);
});
?>