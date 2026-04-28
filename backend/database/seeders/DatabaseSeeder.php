<?php

namespace Database\Seeders;

use App\Models\{User, atencion, solicitante};
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        User::insert([[
            'name' => 'Administrador',
            'rol' => 'ADMIN',
            'nombre' => 'Admin',
            'apellido' => 'Istrador',
            'activo' => True,
            'password' => Hash::make('12345678'),
            'area' => 'all'],
            [
            'name' => 'isa',
            'rol' => 'MESA_ENTRADAS',
            'nombre' => 'Isaias',
            'apellido' => 'Mauro',
            'activo' => True,
            'password' => Hash::make('isaisaisa'),
            'area' => 'mesa'],
            [
            'name' => 'clau',
            'rol' => 'PERSONAL',
            'nombre' => 'Claudia',
            'apellido' => 'Quiroga',
            'activo' => False,
            'password' => Hash::make('clauclau'),
            'area' => 'personal']]);
        solicitante::insert([
            'dni' => '26796729',
            'nombre_apellido' => 'david',
            'telefono' => '228155443322',
            'domicilio' => 'Rauch 1800',
            'created_at' => '2026/02/21',
            'updated_at' => '2026/02/21',
            ]);
    }
}
