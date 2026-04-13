<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('atencions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitante_id')->constrained(table: 'solicitantes', indexName: 'id');
            $table->foreignId('usuario_creador_id')->references('id')->on('users');
            $table->foreignId('usuario_asignado_id')->references('id')->on('users')->nullable();
            $table->string('estado');
            $table->boolean('sx'); // 0: Hombre - 1: Mujer
            $table->string('edad'); // 0: -1, 1: 1a4, 2: 5a9, 3: 10a14, 4:15a19, 5:20a34, 6:35a49, 7:50a64, 8:65+
            $table->date('fecha');
            $table->unsignedSmallInteger('servicio');
            $table->unsignedSmallInteger('caps');
            $table->unsignedSmallInteger('os')->nullable();
            $table->string('motivo');
            $table->string('descripcion');
            $table->string('resolucion')->nullable();
            $table->string('atencion_dispensada')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atencions');
    }
};
