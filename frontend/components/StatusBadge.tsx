import React from 'react';
import { EstadoAtencion } from '../types';

export const StatusBadge: React.FC<{ status: EstadoAtencion }> = ({ status }) => {
  const currentStatus = status?.toLowerCase();
  switch (currentStatus) {
    case EstadoAtencion.REGISTRADO:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Registrado
        </span>
      );
    case EstadoAtencion.EN_ATENCION:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          En Atención
        </span>
      );
    case EstadoAtencion.ATENDIDO:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Atendido
        </span>
      );
    default:
      return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">Error: {currentStatus}</span>;
  }
};