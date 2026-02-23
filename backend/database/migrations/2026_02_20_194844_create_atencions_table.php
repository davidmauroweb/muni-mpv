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
            $table->date('fecha');
            $table->string('motivo');
            $table->string('descripcion');
            $table->string('resolucion')->nullable();
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
