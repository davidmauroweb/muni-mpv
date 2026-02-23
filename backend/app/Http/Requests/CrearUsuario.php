<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CrearUsuario extends FormRequest
{
    // IMPORTANTE: Cambiar a true para permitir el uso
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'name'     => 'required|string|unique:users,name|max:255',
            'password' => 'required|string|min:8',
            'nombre'   => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'rol'      => 'required|string',
            'area'     => 'required|string',
        ];
    }

    // Opcional: Personalizar los mensajes de error
    public function messages(): array
    {
        return [
            'name.unique' => 'Este nombre de usuario ya está registrado.',
            'name.required' => 'El nombre de usuario no puede estar vacío.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'errors' => $validator->errors()
        ], 422));
    }
}