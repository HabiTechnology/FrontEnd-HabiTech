'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Wallet, FileText, ExternalLink, Copy } from 'lucide-react';
import DashboardPageLayout from '@/components/dashboard/layout';
import { PageTransition } from '@/components/animations/page-transition';

type ClaimStatus = 'idle' | 'validating' | 'connecting' | 'minting' | 'success' | 'error';

function ClaimNFTContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { ready, authenticated, login, user } = usePrivy();

  const [status, setStatus] = useState<ClaimStatus>('idle');
  const [message, setMessage] = useState('');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [metadataUrl, setMetadataUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');
  const [autoImportAttempted, setAutoImportAttempted] = useState(false);
  const [manualWalletAddress, setManualWalletAddress] = useState<string>('');
  const [walletError, setWalletError] = useState<string>('');

  // Validar token al cargar
  useEffect(() => {
    if (token && ready) {
      validateToken();
    }
  }, [token, ready]);

  // Auto-importar NFT a MetaMask después del éxito
  useEffect(() => {
    if (status === 'success' && tokenId && !autoImportAttempted && typeof window !== 'undefined') {
      autoImportNFTToMetaMask();
    }
  }, [status, tokenId, autoImportAttempted]);

  const validateToken = async () => {
    setStatus('validating');
    setMessage('Validando código QR...');

    try {
      const response = await fetch('/api/nft/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Token inválido o expirado');
        return;
      }

      setTokenInfo(data);
      setStatus('idle');
      setMessage('Token válido. Ingresa la dirección de wallet para reclamar el NFT.');
    } catch (error) {
      console.error('Error validando token:', error);
      setStatus('error');
      setMessage('Error al validar el token');
    }
  };

  // Validar formato de dirección Ethereum
  const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Manejar cambio de wallet address
  const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setManualWalletAddress(value);
    
    if (value && !isValidEthereumAddress(value)) {
      setWalletError('Dirección de wallet inválida. Debe comenzar con 0x y tener 42 caracteres.');
    } else {
      setWalletError('');
    }
  };

  // Función para auto-importar el NFT a MetaMask
  const autoImportNFTToMetaMask = async () => {
    setAutoImportAttempted(true);

    try {
      // Verificar que existe MetaMask
      if (typeof window.ethereum === 'undefined') {
        console.log('MetaMask no está instalado');
        return;
      }

      const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
      
      if (!contractAddress || !tokenId) {
        console.log('Faltan datos para importar NFT');
        return;
      }

      console.log('🎯 Intentando auto-importar NFT a MetaMask...');
      console.log('Contract:', contractAddress);
      console.log('Token ID:', tokenId);

      // Usar la API de MetaMask para agregar el NFT automáticamente
      const wasAdded = await (window.ethereum as any).request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: contractAddress,
            tokenId: tokenId,
          },
        },
      });

      if (wasAdded) {
        console.log('✅ NFT agregado a MetaMask automáticamente!');
        setMessage('¡NFT reclamado y agregado a MetaMask exitosamente!');
      } else {
        console.log('❌ Usuario rechazó agregar el NFT');
      }
    } catch (error) {
      console.error('Error al auto-importar NFT:', error);
      // No mostramos error al usuario, solo fallback silencioso
    }
  };

  const handleClaim = async () => {
    // Validar que se haya ingresado una wallet válida
    if (!manualWalletAddress) {
      setWalletError('Por favor ingresa una dirección de wallet');
      return;
    }

    if (!isValidEthereumAddress(manualWalletAddress)) {
      setWalletError('Dirección de wallet inválida');
      return;
    }

    setStatus('minting');
    setMessage('Generando PDF y subiendo a IPFS...');
    setWalletError('');

    try {
      const response = await fetch('/api/nft/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          walletAddress: manualWalletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Error al reclamar NFT');
        return;
      }

      setTransactionHash(data.transactionHash);
      setMetadataUrl(data.metadataUrl);
      setImageUrl(data.imageUrl);
      setPdfUrl(data.pdfUrl);
      setTokenId(data.tokenId || '');
      setStatus('success');
      setMessage('¡NFT reclamado exitosamente!');
    } catch (error) {
      console.error('Error reclamando NFT:', error);
      setStatus('error');
      setMessage('Error al procesar la transacción');
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="w-full max-w-4xl shadow-2xl">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="flex items-center gap-3 text-3xl">
              <XCircle className="h-10 w-10 text-destructive" />
              Token No Encontrado
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <p className="text-muted-foreground text-lg">
              No se encontró un token válido en la URL. Por favor, escanea el código QR nuevamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="space-y-3 pb-8">
          <CardTitle className="text-2xl flex items-center gap-3">
            <FileText className="h-6 w-12 text-blue-500" />
            Reclamar Documento como NFT
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-8">
          {/* Estado de validación */}
          {status === 'validating' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Token válido - mostrar info */}
          {tokenInfo && status === 'idle' && (
            <div className="space-y-6">
              <Alert className="border-blue-500 bg-blue-500/10 py-4">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <AlertDescription className="text-blue-500 text-base font-medium">
                  Token válido y listo para reclamar
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Residente ID:</span>
                  <span className="font-mono">{tokenInfo.residenteId}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Expira:</span>
                  <span className="font-mono">{new Date(tokenInfo.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Input manual de wallet address */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="walletAddress" className="text-lg font-semibold">
                      Dirección de Wallet (Ethereum)
                    </Label>
                    {authenticated && user?.wallet?.address && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (user?.wallet?.address) {
                            setManualWalletAddress(user.wallet.address);
                            setWalletError('');
                          }
                        }}
                        className="text-xs"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Usar mi wallet
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="walletAddress"
                      type="text"
                      placeholder="0x1234567890abcdef1234567890abcdef12345678"
                      value={manualWalletAddress}
                      onChange={handleWalletAddressChange}
                      className={`text-base py-6 pr-12 font-mono ${
                        walletError ? 'border-red-500 focus-visible:ring-red-500' : ''
                      }`}
                    />
                    <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                  {walletError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      {walletError}
                    </p>
                  )}
                  {manualWalletAddress && !walletError && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Dirección válida
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Ingresa la dirección de wallet de Ethereum donde se enviará el NFT. 
                    Debe comenzar con "0x" y tener 42 caracteres.
                  </p>
                </div>

                {!authenticated && (
                  <Alert className="border-blue-500 bg-blue-500/10">
                    <Wallet className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-600 dark:text-blue-400 text-sm">
                      <strong>Opcional:</strong> Puedes{' '}
                      <button
                        onClick={login}
                        className="underline font-semibold hover:text-blue-700"
                      >
                        conectar tu wallet con Privy
                      </button>
                      {' '}para usar tu dirección automáticamente.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleClaim} 
                  className="w-full text-lg py-6"
                  size="lg"
                  disabled={!manualWalletAddress || !!walletError}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Reclamar NFT
                </Button>
              </div>
            </div>
          )}

          {/* Minteo en progreso */}
          {status === 'minting' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">{message}</p>
                  <p className="text-sm text-muted-foreground">
                    Este proceso puede tomar unos minutos. Por favor no cierres esta ventana.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Éxito */}
          {status === 'success' && (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-500/10 py-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertDescription className="text-green-500 font-semibold text-base">
                  {message}
                </AlertDescription>
              </Alert>

              {/* Info de la wallet destino */}
              <Alert className="border-blue-500 bg-blue-500/10 py-4">
                <Wallet className="h-5 w-5 text-blue-500" />
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  <div className="space-y-1">
                    <p className="font-semibold text-base">NFT enviado a:</p>
                    <p className="font-mono text-sm break-all">
                      {manualWalletAddress}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Botón para importar a MetaMask */}
              {tokenId && typeof window !== 'undefined' && window.ethereum && (
                <Button
                  onClick={autoImportNFTToMetaMask}
                  className="w-full text-base py-5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  size="lg"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Importar NFT a MetaMask
                </Button>
              )}

              <div className="space-y-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {tokenId && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Token ID:</p>
                    <p className="font-mono text-sm text-blue-600 dark:text-blue-400">#{tokenId}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold mb-1">Imagen del NFT:</p>
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm break-all"
                  >
                    Ver Imagen Preview
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  </a>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1">Documento PDF:</p>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm break-all"
                  >
                    Ver Documento Completo
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  </a>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1">Transaction Hash:</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm break-all"
                  >
                    {transactionHash?.slice(0, 10)}...{transactionHash?.slice(-8)}
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  </a>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1">Metadata IPFS:</p>
                  <a
                    href={metadataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm break-all"
                  >
                    Ver Metadata JSON
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  </a>
                </div>
              </div>

              <Alert className="border-blue-500 bg-blue-500/10">
                <Wallet className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-600 dark:text-blue-400 text-sm">
                  <strong>Importación automática:</strong> Si tienes MetaMask, el NFT se importará automáticamente. 
                  Si no aparece, usa el botón "Importar NFT a MetaMask" arriba.
                </AlertDescription>
              </Alert>

              <p className="text-sm text-muted-foreground text-center">
                Tu NFT ya está en tu wallet. Revisa MetaMask o tu wallet favorita para verlo.
              </p>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClaimNFTPage() {
  return (
    <PageTransition>
      <DashboardPageLayout
        header={{
          title: "Reclamar Documento como NFT",
          description: "Convierte tu certificado de residencia en un NFT verificado en blockchain.",
          icon: FileText,
        }}
      >
        <div className="flex items-center justify-center min-h-[80vh] py-8">
          <div className="w-full max-w-5xl px-4">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              </div>
            }>
              <ClaimNFTContent />
            </Suspense>
          </div>
        </div>
      </DashboardPageLayout>
    </PageTransition>
  );
}
