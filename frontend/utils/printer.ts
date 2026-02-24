import { Atencion } from "../types";

export const printVoucher = async (atencion: Atencion): Promise<void> => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor habilite las ventanas emergentes para imprimir.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Comprobante de Atención - ${atencion.id}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-text { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
          .title { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .subtitle { font-size: 16px; font-style: italic; }
          .voucher-no { font-size: 20px; font-weight: bold; border: 2px solid #000; padding: 10px; display: inline-block; margin-top: 15px; }
          .row { display: flex; margin-bottom: 12px; }
          .label { font-weight: bold; width: 150px; flex-shrink: 0; }
          .value { flex-grow: 1; border-bottom: 1px dotted #999; }
          .box { border: 1px solid #000; padding: 15px; margin-top: 20px; height: 225px; }
          .box-title { font-weight: bold; margin-bottom: 10px; display: block; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; text-align: center; }
          .signature { border-top: 1px solid #000; width: 200px; padding-top: 5px; }
          .legal { margin-top: 40px; font-size: 10px; text-align: center; color: #666; }
          
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-text">Municipalidad de Azul</div>
          <div class="subtitle">Secretaría de Desarrollo de la Comunidad</div>
          <div class="title">MESA DE ENTRADAS</div>
          <div class="voucher-no">COMPROBANTE N° ${atencion.id}</div>
          <div style="margin-top: 10px;">Fecha: ${new Date(atencion.fecha_creacion).toLocaleString('es-AR')}</div>
        </div>

        <div class="row">
          <span class="label">Solicitante:</span>
          <span class="value">${atencion.solicitante_nombre}</span>
        </div>
        <div class="row">
          <span class="label">DNI:</span>
          <span class="value">${atencion.solicitante_dni}</span>
        </div>
        <div class="row">
          <span class="label">Domicilio:</span>
          <span class="value">${atencion.solicitante_domicilio}</span>
        </div>
        <div class="row">
          <span class="label">Teléfono:</span>
          <span class="value">${atencion.solicitante_telefono || '-'}</span>
        </div>
        
        <div style="margin: 20px 0; border-top: 1px solid #ccc;"></div>

        <div class="row">
          <span class="label">Motivo:</span>
          <span class="value">${atencion.motivo}</span>
        </div>
        <div class="row">
          <span class="label">Personal Asignado:</span>
          <span class="value">${atencion.personal_nombre} (${atencion.personal_cargo})</span>
        </div>

        <div class="box">
          <span class="box-title">ATENCIÓN DISPENSADA / RESOLUCIÓN (Espacio para completar manualmente):</span>
          <p style="font-family: monospace; white-space: pre-wrap;">${atencion.atencion_dispensada || ''}</p>
          <div style="height: 100%; min-height: 300px;"></div>
        </div>

        <div class="footer">
          <div>
            <div class="signature">Firma del Solicitante</div>
          </div>
          <div>
            <div class="signature">Firma Responsable Municipal</div>
            <div style="font-size: 12px; margin-top: 4px;">Aclaración / Sello</div>
          </div>
        </div>

        <div class="legal">
          Documento generado electrónicamente por el Sistema de Mesa de Entradas de la Municipalidad de Azul.
          Validez interna.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  return Promise.resolve();
};