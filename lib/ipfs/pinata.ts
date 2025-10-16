// ===================================================
// 🌐 PINATA IPFS INTEGRATION - API REST
// ===================================================

/**
 * Upload PDF, imagen preview y metadata a IPFS via Pinata REST API
 */
export async function uploadToIPFS(
  pdfBuffer: Buffer,
  imageBuffer: Buffer,
  metadata: {
    name: string;
    description: string;
    residentId: number;
    documentType: string;
  }
): Promise<{ ipfsHash: string; imageHash: string; metadataHash: string; pdfUrl: string; imageUrl: string; metadataUrl: string }> {
  try {
    const PINATA_JWT = process.env.PINATA_JWT!;
    const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

    // 1. Upload PDF usando Pinata API REST
    const formData = new FormData();
    // Convertir Buffer a Uint8Array que sí es compatible con Blob
    const pdfArray = new Uint8Array(pdfBuffer);
    const pdfBlob = new Blob([pdfArray], { type: 'application/pdf' });
    formData.append('file', pdfBlob, `documento-residente-${metadata.residentId}.pdf`);

    console.log('📤 Subiendo PDF a IPFS...');
    const fileResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      throw new Error(`Error subiendo PDF: ${fileResponse.statusText} - ${errorText}`);
    }

    const fileData = await fileResponse.json();
    const ipfsHash = fileData.IpfsHash;
    
    console.log('✅ PDF subido a IPFS:', ipfsHash);

    // 2. Upload imagen preview
    const imageFormData = new FormData();
    const imageArray = new Uint8Array(imageBuffer);
    const imageBlob = new Blob([imageArray], { type: 'image/png' });
    imageFormData.append('file', imageBlob, `imagen-residente-${metadata.residentId}.png`);

    console.log('📤 Subiendo imagen preview a IPFS...');
    const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: imageFormData
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      throw new Error(`Error subiendo imagen: ${imageResponse.statusText} - ${errorText}`);
    }

    const imageData = await imageResponse.json();
    const imageHash = imageData.IpfsHash;
    
    console.log('✅ Imagen preview subida a IPFS:', imageHash);

    // 3. Crear metadata NFT (estándar ERC721/OpenSea)
    const nftMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: `ipfs://${imageHash}`, // Imagen preview principal
      animation_url: `ipfs://${ipfsHash}`, // PDF como contenido animado
      attributes: [
        {
          trait_type: 'Document Type',
          value: metadata.documentType
        },
        {
          trait_type: 'Resident ID',
          value: metadata.residentId.toString()
        },
        {
          trait_type: 'Minted Date',
          value: new Date().toISOString().split('T')[0]
        },
        {
          trait_type: 'Platform',
          value: 'HabiTech'
        }
      ]
    };

    // 3. Upload metadata JSON
    console.log('📤 Subiendo metadata a IPFS...');
    const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pinataContent: nftMetadata,
        pinataMetadata: {
          name: `metadata-${metadata.residentId}.json`
        }
      })
    });

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      throw new Error(`Error subiendo metadata: ${metadataResponse.statusText} - ${errorText}`);
    }

    const metadataData = await metadataResponse.json();
    const metadataHash = metadataData.IpfsHash;
    
    console.log('✅ Metadata subida a IPFS:', metadataHash);

    // 4. Construir URLs
    const pdfUrl = `https://${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
    const imageUrl = `https://${PINATA_GATEWAY}/ipfs/${imageHash}`;
    const metadataUrl = `https://${PINATA_GATEWAY}/ipfs/${metadataHash}`;

    return {
      ipfsHash,
      imageHash,
      metadataHash,
      pdfUrl,
      imageUrl,
      metadataUrl
    };

  } catch (error) {
    console.error('❌ Error subiendo a IPFS:', error);
    throw new Error(`No se pudo subir el archivo a IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Obtener archivo desde IPFS
 */
export async function getFromIPFS(ipfsHash: string): Promise<Blob> {
  try {
    const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
    const url = `https://${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error obteniendo archivo: ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('❌ Error obteniendo de IPFS:', error);
    throw error;
  }
}