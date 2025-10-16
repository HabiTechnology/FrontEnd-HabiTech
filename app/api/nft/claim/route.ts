import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import DocumentNFTABI from '@/contracts/DocumentNFT.abi.json';
import { uploadToIPFS } from '@/lib/ipfs/pinata';
import { generarPDFResidenteBuffer } from '@/lib/pdf/pdf-residente-buffer';
import { generateNFTImage } from '@/lib/pdf/generate-nft-image';

export async function POST(request: NextRequest) {
  try {
    const { token, walletAddress } = await request.json();

    if (!token || !walletAddress) {
      return NextResponse.json(
        { error: 'Token y wallet address son requeridos' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando token:', token);

    // 1. Verificar token en base de datos
    const tokenData = await query`
      SELECT 
        t.*,
        r.id as residente_id,
        r.usuario_id,
        r.departamento_id,
        r.tipo_relacion,
        r.es_principal,
        r.activo,
        r.fecha_ingreso,
        u.nombre,
        u.apellido,
        u.correo,
        u.numero_documento,
        u.telefono,
        d.numero as departamento_numero,
        d.piso,
        d.dormitorios,
        d.banos,
        d.area_m2,
        d.renta_mensual,
        d.estado as estado_departamento
      FROM nft_claim_tokens t
      JOIN residentes r ON t.residente_id = r.id
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN departamentos d ON r.departamento_id = d.id
      WHERE t.token = ${token}
    `;

    if (tokenData.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      );
    }

    const tokenInfo = tokenData[0];

    // 2. Validaciones
    if (tokenInfo.usado) {
      return NextResponse.json(
        { error: 'Este token ya ha sido utilizado' },
        { status: 400 }
      );
    }

    if (new Date(tokenInfo.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Este token ha expirado' },
        { status: 400 }
      );
    }

    console.log('✅ Token válido para residente:', tokenInfo.nombre, tokenInfo.apellido);

    // 3. Generar PDF del residente
    // Crear estructura compatible con ResidenteParaPDF
    const residenteData = {
      id: tokenInfo.residente_id,
      usuario_id: tokenInfo.usuario_id || 0,
      departamento_id: tokenInfo.departamento_id || 0,
      tipo_relacion: tokenInfo.tipo_relacion || 'propietario',
      es_principal: tokenInfo.es_principal || true,
      activo: tokenInfo.activo !== false,
      fecha_ingreso: tokenInfo.fecha_ingreso || new Date().toISOString(),
      usuario: {
        nombre: tokenInfo.nombre,
        apellido: tokenInfo.apellido,
        correo: tokenInfo.correo,
        numero_documento: tokenInfo.numero_documento || '',
        telefono: tokenInfo.telefono || null,
        imagen_perfil: null
      },
      departamento: {
        numero: tokenInfo.departamento_numero,
        piso: tokenInfo.piso || 1,
        dormitorios: tokenInfo.dormitorios || 2,
        banos: tokenInfo.banos || 1,
        area_m2: tokenInfo.area_m2 || null,
        renta_mensual: tokenInfo.renta_mensual || 0,
        estado: tokenInfo.estado_departamento || 'ocupado'
      }
    };
    
    const pdfBuffer = await generarPDFResidenteBuffer(residenteData);

    console.log('📄 PDF generado, tamaño:', pdfBuffer.length, 'bytes');

    // 3.5. Generar imagen preview para el NFT
    const imageBuffer = await generateNFTImage({
      nombre: tokenInfo.nombre,
      apellido: tokenInfo.apellido,
      departamento_numero: tokenInfo.departamento_numero,
      residente_id: tokenInfo.residente_id
    });

    console.log('🎨 Imagen preview generada, tamaño:', imageBuffer.length, 'bytes');

    // 4. Subir a IPFS (Pinata)
    const ipfsData = await uploadToIPFS(pdfBuffer, imageBuffer, {
      name: `Documento Residente #${tokenInfo.residente_id}`,
      description: `Documento oficial de ${tokenInfo.nombre} ${tokenInfo.apellido} - Depto ${tokenInfo.departamento_numero}`,
      documentType: 'Documento de Residente',
      residentId: tokenInfo.residente_id
    });

    console.log('📦 Subido a IPFS:', ipfsData.ipfsHash);

    // 5. Mintear NFT
    const account = privateKeyToAccount(process.env.PRIVATE_KEY_DEPLOYER as `0x${string}`);
    
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    });

    const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`;

    // Llamar a mintDocument
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: DocumentNFTABI,
      functionName: 'mintDocument',
      args: [
        walletAddress as `0x${string}`,
        `ipfs://${ipfsData.metadataHash}`,
        ipfsData.ipfsHash,
        'Documento de Residente',
        BigInt(tokenInfo.residente_id)
      ]
    });

    console.log('⛓️ Transaction hash:', hash);

    // Esperar confirmación
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('✅ NFT minteado en bloque:', receipt.blockNumber);

    // Extraer el tokenId de los logs del evento Transfer
    let tokenId = '';
    try {
      // Buscar el log del evento Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
      // El evento Transfer tiene el topic: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
      const transferLog = receipt.logs.find(log => 
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      );
      
      if (transferLog && transferLog.topics[3]) {
        // El tokenId está en el tercer topic (índice 3)
        tokenId = BigInt(transferLog.topics[3]).toString();
        console.log('🎯 Token ID extraído:', tokenId);
      }
    } catch (error) {
      console.error('Error extrayendo tokenId:', error);
    }

    // 6. Actualizar token como usado
    await query`
      UPDATE nft_claim_tokens
      SET 
        usado = true,
        wallet_address = ${walletAddress},
        transaction_hash = ${hash},
        claimed_at = NOW()
      WHERE token = ${token}
    `;

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      tokenId: tokenId,
      pdfUrl: ipfsData.pdfUrl,
      imageUrl: ipfsData.imageUrl,
      metadataUrl: ipfsData.metadataUrl,
      message: 'NFT minteado exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error al reclamar NFT:', error);
    return NextResponse.json(
      { 
        error: 'Error al reclamar NFT', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
