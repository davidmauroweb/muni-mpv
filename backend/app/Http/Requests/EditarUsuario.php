<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; 

class EditarUsuario extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'name')->ignore($user),
            ],
            'password' => 'nullable|string|min:8',
            'nombre'   => 'required|string',
            'apellido' => 'required|string',
            'rol'      => 'required|string',
            'area'     => 'required|string',
        ];
    }
    
    public function messages(): array
    {
        return [
            'name.unique' => 'Este nombre de usuario ya está registrado.',
            'name.required' => 'El nombre de usuario no puede estar vacío.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        ];
    }
    
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new \Illuminate\Http\Exceptions\HttpResponseException(response()->json([
            'errors' => $validator->errors()
        ], 422));
    }
}
