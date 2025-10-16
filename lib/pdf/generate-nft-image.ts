// ===================================================
// 🎨 GENERADOR DE IMAGEN NFT PARA PREVIEW - ESTILO PREMIUM
// ===================================================

/**
 * Genera una imagen elegante para el preview del NFT
 * Diseño corporativo profesional en formato 1:1 (cuadrado) para NFTs
 */
export async function generateNFTImage(residente: {
  nombre: string;
  apellido: string;
  departamento_numero: string;
  residente_id: number;
}): Promise<Buffer> {
  // Usar canvas para generar la imagen
  const { createCanvas } = await import('canvas');
  // Formato 1:1 (cuadrado) - tamaño óptimo para NFTs y MetaMask
  const size = 1000;
  const width = size;
  const height = size;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fondo azul corporativo elegante
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, width, height);

  // Acento decorativo superior (línea dorada)
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(0, 0, width, 6);

  // Logo HabiTech con sombra - más compacto
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(width / 2, 80, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.fillStyle = '#16213e';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HT', width / 2, 80);

  // Título principal - más compacto
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('DOCUMENTO OFICIAL', width / 2, 160);

  // Línea decorativa dorada
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 130, 172);
  ctx.lineTo(width / 2 + 130, 172);
  ctx.stroke();

  // Card info con sombra elegante - optimizado para 1:1
  const cardY = 210;
  const cardHeight = 520;
  const cardX = 60;
  const cardWidth = width - 120;
  
  // Sombra del card
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;
  
  ctx.fillStyle = 'rgba(255,255,255,0.98)';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 15);
  ctx.fill();
  
  // Resetear sombra
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Borde decorativo dorado sutil
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 15);
  ctx.stroke();

  // Título card con estilo premium
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('RESIDENTE CERTIFICADO', width / 2, cardY + 45);

  // Nombre con mejor tipografía
  ctx.fillStyle = '#16213e';
  ctx.font = 'bold 38px Arial';
  let nombreCompleto = `${residente.nombre} ${residente.apellido}`;
  if (nombreCompleto.length > 20) ctx.font = 'bold 32px Arial';
  if (nombreCompleto.length > 25) ctx.font = 'bold 28px Arial';
  if (nombreCompleto.length > 30) ctx.font = 'bold 24px Arial';
  ctx.fillText(nombreCompleto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()), width / 2, cardY + 100);

  // Línea decorativa dorada elegante
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 280, cardY + 120);
  ctx.lineTo(width / 2 + 280, cardY + 120);
  ctx.stroke();

  // Sección departamento con mejor diseño
  ctx.fillStyle = '#6b7280';
  ctx.font = '20px Arial';
  ctx.fillText('DEPARTAMENTO', width / 2, cardY + 180);
  
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 110px Arial';
  ctx.fillText(residente.departamento_numero, width / 2, cardY + 310);

  // ID con mejor estilo
  ctx.fillStyle = '#9ca3af';
  ctx.font = '18px Arial';
  ctx.fillText(`ID: ${residente.residente_id}`, width / 2, cardY + 370);

  // Badge verificado - MÁS ANCHO Y CENTRADO
  const badgeY = cardY + cardHeight - 70;
  const badgeWidth = 400; // Extra ancho para formato cuadrado
  const badgeHeight = 48;
  const badgeX = width / 2 - (badgeWidth / 2); // Centrado perfecto
  
  // Sombra del badge
  ctx.shadowColor = 'rgba(30, 64, 175, 0.4)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;
  
  ctx.fillStyle = '#1e40af'; // azul corporativo
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY - (badgeHeight / 2), badgeWidth, badgeHeight, 24);
  ctx.fill();
  
  // Resetear sombra
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Borde dorado del badge
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY - (badgeHeight / 2), badgeWidth, badgeHeight, 24);
  ctx.stroke();
  
  // Texto del badge centrado perfectamente
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CERTIFICADO EN BLOCKCHAIN', width / 2, badgeY);

  // Footer elegante con mejor espaciado - optimizado para cuadrado
  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const fechaEmision = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  ctx.fillText(`Emitido: ${fechaEmision}`, width / 2, height - 70);
  
  ctx.font = 'bold 18px Arial';
  ctx.fillText('HabiTech 2025', width / 2, height - 40);
  
  // Línea decorativa inferior
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, height - 20);
  ctx.lineTo(width / 2 + 80, height - 20);
  ctx.stroke();

  // Acento decorativo inferior (línea dorada)
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(0, height - 6, width, 6);

  return canvas.toBuffer('image/png');
}
