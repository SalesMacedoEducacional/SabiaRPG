import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';

const TestUpload: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  // Manipular seleção de imagem
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validar o tipo de arquivo
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Formato inválido. Use JPG ou PNG.'
      });
      return;
    }
    
    // Validar o tamanho (máximo 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setUploadStatus({
        type: 'error',
        message: 'Imagem muito grande. O tamanho máximo é 5MB.'
      });
      return;
    }
    
    // Criar URL para pré-visualização
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setUploadStatus(null);
  };
  
  // Remover a imagem selecionada
  const removeSelectedImage = () => {
    setImagePreview(null);
    setUploadStatus(null);
    
    // Limpar o input file
    const fileInput = document.getElementById('testImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Upload da imagem para o servidor
  const uploadImage = async () => {
    if (!imagePreview) return;
    
    // Converter a URL para um arquivo
    const fileInput = document.getElementById('testImage') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      setUploadStatus({
        type: 'error',
        message: 'Nenhum arquivo selecionado.'
      });
      return;
    }
    
    setIsUploading(true);
    setUploadStatus(null);
    setUploadedImageUrl(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/test/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao fazer upload da imagem');
      }
      
      const data = await response.json();
      
      setUploadedImageUrl(data.imageUrl);
      setUploadStatus({
        type: 'success',
        message: 'Imagem enviada com sucesso!'
      });
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Falha ao salvar. Tente novamente.'
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark p-4">
      <Card className="w-full max-w-md bg-dark-light border-primary">
        <CardHeader>
          <CardTitle className="text-accent">Teste de Upload de Imagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <div className="relative">
                <Button
                  type="button"
                  onClick={() => {
                    const fileInput = document.getElementById('testImage');
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Imagem
                </Button>
                <input 
                  type="file" 
                  id="testImage" 
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
              
              {uploadStatus && (
                <div className={`text-sm mt-2 ${uploadStatus.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {uploadStatus.message}
                </div>
              )}
              
              {/* Preview da imagem selecionada */}
              {imagePreview && (
                <div className="mt-4">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium mb-2">Pré-visualização:</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      onClick={removeSelectedImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="border border-primary rounded overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Pré-visualização" 
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}
              
              {imagePreview && (
                <Button
                  type="button"
                  className="mt-4 w-full bg-accent text-dark"
                  onClick={uploadImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Imagem
                    </>
                  )}
                </Button>
              )}
              
              {uploadedImageUrl && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Imagem enviada:</h3>
                  <div className="border border-accent rounded overflow-hidden">
                    <img 
                      src={uploadedImageUrl} 
                      alt="Imagem enviada" 
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                  <div className="text-xs mt-2 break-all text-parchment-dark">
                    URL: {uploadedImageUrl}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestUpload;