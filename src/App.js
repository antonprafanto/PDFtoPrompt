// src/App.js - Version dengan styling sederhana
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Key, Check, X, Copy, Image, FileText, Loader, AlertTriangle, Trash2 } from 'lucide-react';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyValid, setApiKeyValid] = useState(null);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // Inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '10px'
    },
    subtitle: {
      color: '#718096',
      fontSize: '1.1rem'
    },
    demoNote: {
      marginTop: '10px',
      padding: '12px 20px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      display: 'inline-block',
      color: '#856404',
      fontSize: '0.9rem'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    inputGroup: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    button: {
      padding: '12px 16px',
      backgroundColor: '#3182ce',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    buttonSuccess: {
      backgroundColor: '#38a169'
    },
    buttonDanger: {
      backgroundColor: '#e53e3e'
    },
    uploadArea: {
      border: '2px dashed #cbd5e0',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: dragActive ? '#ebf8ff' : 'transparent'
    },
    uploadAreaActive: {
      borderColor: '#3182ce',
      backgroundColor: '#ebf8ff'
    },
    fileList: {
      marginTop: '20px'
    },
    fileItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f7fafc',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    fileInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '16px'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#3182ce',
      transition: 'width 0.3s ease'
    },
    resultCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    },
    imagePreview: {
      maxWidth: '200px',
      maxHeight: '150px',
      objectFit: 'contain',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      marginBottom: '16px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      backgroundColor: '#f7fafc',
      fontSize: '0.9rem',
      resize: 'vertical'
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      marginTop: '8px'
    },
    tag: {
      padding: '4px 8px',
      backgroundColor: '#bee3f8',
      color: '#2b6cb0',
      fontSize: '0.75rem',
      borderRadius: '9999px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px'
    }
  };

  // Mock OpenAI API call
  const mockOpenAICall = async (prompt, base64Image = null) => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    if (prompt.includes('validate')) {
      if (apiKey.length > 10) {
        return { valid: true };
      } else {
        return { valid: false, error: "API key terlalu pendek" };
      }
    }
    
    if (prompt.includes('meaningful')) {
      return {
        meaningful: Math.random() > 0.3,
        reason: "Image contains substantial visual content",
        confidence: 0.8 + Math.random() * 0.2
      };
    }
    
    if (prompt.includes('Generate')) {
      const styles = ['photorealistic', 'artistic', 'cartoon', 'cinematic', 'abstract'];
      const moods = ['dramatic', 'peaceful', 'energetic', 'mysterious', 'bright'];
      const tags = ['landscape', 'portrait', 'nature', 'urban', 'vintage', 'modern', 'colorful'];
      
      return {
        imagePrompt: `A ${styles[Math.floor(Math.random() * styles.length)]} image featuring detailed composition with ${moods[Math.floor(Math.random() * moods.length)]} lighting, high quality, professional photography style, sharp focus, vibrant colors`,
        videoPrompt: `Cinematic ${moods[Math.floor(Math.random() * moods.length)]} scene with smooth camera movement, dynamic lighting transitions, ${styles[Math.floor(Math.random() * styles.length)]} style, 4K quality, 30fps`,
        creativePrompt: `Artistic interpretation with enhanced ${styles[Math.floor(Math.random() * styles.length)]} elements, creative composition, expressive ${moods[Math.floor(Math.random() * moods.length)]} atmosphere, masterpiece quality`,
        tags: tags.slice(0, 3 + Math.floor(Math.random() * 3)),
        style: styles[Math.floor(Math.random() * styles.length)],
        mood: moods[Math.floor(Math.random() * moods.length)]
      };
    }
    
    return {};
  };

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyValid(false);
      return;
    }

    try {
      setProcessing(true);
      const result = await mockOpenAICall('validate api key');
      setApiKeyValid(result.valid);
      
      if (!result.valid) {
        alert(`API Key tidak valid: ${result.error}`);
      } else {
        alert('API Key valid! ✅');
      }
    } catch (error) {
      setApiKeyValid(false);
      alert('Gagal memvalidasi API Key. Pastikan key sudah benar.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).filter(file => {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File ${file.name} terlalu besar. Maksimal 50MB.`);
        return false;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} tidak didukung. Hanya gambar dan PDF yang diperbolehkan.`);
        return false;
      }

      return true;
    });

    setFiles(prev => [...prev, ...newFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      status: 'pending',
      images: [],
      prompts: []
    }))]);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const extractImages = async (fileItem) => {
    const { file } = fileItem;
    
    if (file.type.startsWith('image/')) {
      return [file];
    } else if (file.type === 'application/pdf') {
      alert('PDF processing akan diimplementasikan di versi production. Silakan upload gambar langsung.');
      return [];
    }
    
    return [];
  };

  const filterMeaningfulImages = async (images) => {
    const meaningfulImages = [];
    
    for (const image of images) {
      try {
        const base64 = await fileToBase64(image);
        const result = await mockOpenAICall('check meaningful image', base64);
        
        if (result.meaningful && result.confidence > 0.7) {
          meaningfulImages.push({
            file: image,
            analysis: result
          });
        }
      } catch (error) {
        console.error('Error filtering image:', error);
        meaningfulImages.push({
          file: image,
          analysis: { meaningful: true, reason: 'Analysis failed, included by default', confidence: 0.5 }
        });
      }
    }
    
    return meaningfulImages;
  };

  const generatePrompts = async (meaningfulImages) => {
    const prompts = [];
    
    for (const imageData of meaningfulImages) {
      try {
        const base64 = await fileToBase64(imageData.file);
        const result = await mockOpenAICall('Generate prompts for image', base64);
        
        prompts.push({
          image: imageData.file,
          ...result
        });
      } catch (error) {
        console.error('Error generating prompts:', error);
      }
    }
    
    return prompts;
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const processFiles = async () => {
    if (!apiKeyValid) {
      alert('Silakan validasi API Key terlebih dahulu');
      return;
    }

    if (files.length === 0) {
      alert('Silakan upload file terlebih dahulu');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setResults([]);
    setTotalCost(0);

    const totalSteps = files.length * 3;
    let currentStep = 0;

    for (const fileItem of files) {
      try {
        setProgress((currentStep / totalSteps) * 100);
        const images = await extractImages(fileItem);
        currentStep++;

        if (images.length === 0) continue;

        setProgress((currentStep / totalSteps) * 100);
        const meaningfulImages = await filterMeaningfulImages(images);
        currentStep++;

        setProgress((currentStep / totalSteps) * 100);
        const prompts = await generatePrompts(meaningfulImages);
        currentStep++;

        const estimatedCost = meaningfulImages.length * 0.02;
        setTotalCost(prev => prev + estimatedCost);

        setResults(prev => [...prev, {
          fileName: fileItem.file.name,
          meaningfulImages,
          prompts,
          cost: estimatedCost
        }]);

      } catch (error) {
        console.error(`Error processing ${fileItem.file.name}:`, error);
      }
    }

    setProgress(100);
    setProcessing(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Prompt berhasil disalin ke clipboard! ✅');
    });
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>PromptSnap Clone</h1>
          <p style={styles.subtitle}>AI-Powered Image Prompt Generator (Local Demo)</p>
          <div style={styles.demoNote}>
            🚀 Versi Demo - Menggunakan mock data untuk testing local
          </div>
        </div>

        {/* API Key Section */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <Key size={20} color="#3182ce" />
            <span>OpenAI API Key</span>
          </div>
          
          <div style={styles.inputGroup}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Masukkan OpenAI API Key Anda (demo: minimal 10 karakter)..."
              style={styles.input}
            />
            <button
              onClick={validateApiKey}
              disabled={processing}
              style={{
                ...styles.button,
                ...(processing ? styles.buttonDisabled : {})
              }}
            >
              {processing ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
              Validasi
            </button>
            {apiKeyValid !== null && (
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: apiKeyValid ? '#c6f6d5' : '#fed7d7',
                color: apiKeyValid ? '#2f855a' : '#c53030'
              }}>
                {apiKeyValid ? <Check size={20} /> : <X size={20} />}
              </div>
            )}
          </div>
        </div>

        {/* File Upload Section */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <Upload size={20} color="#38a169" />
            <span>Upload Files</span>
          </div>

          {/* Drag & Drop Area */}
          <div
            ref={dropRef}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              ...styles.uploadArea,
              ...(dragActive ? styles.uploadAreaActive : {})
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} color="#a0aec0" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '1.1rem', color: '#4a5568', marginBottom: '8px' }}>
              Seret & lepas file di sini atau{' '}
              <span style={{ color: '#3182ce', textDecoration: 'underline' }}>
                pilih file
              </span>
            </p>
            <p style={{ fontSize: '0.9rem', color: '#718096' }}>
              Mendukung gambar (JPG, PNG, GIF, WebP) dan PDF. Maksimal 50MB per file.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div style={styles.fileList}>
              <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>File yang akan diproses:</h3>
              <div>
                {files.map((fileItem) => (
                  <div key={fileItem.id} style={styles.fileItem}>
                    <div style={styles.fileInfo}>
                      {fileItem.file.type.startsWith('image/') ? (
                        <Image size={20} color="#3182ce" />
                      ) : (
                        <FileText size={20} color="#e53e3e" />
                      )}
                      <span style={{ fontWeight: '500' }}>{fileItem.file.name}</span>
                      <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                        ({(fileItem.file.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#e53e3e', 
                        cursor: 'pointer' 
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Button */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={processFiles}
              disabled={processing || !apiKeyValid || files.length === 0}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: '600',
                ...(processing || !apiKeyValid || files.length === 0 ? styles.buttonDisabled : {})
              }}
            >
              {processing ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Image size={20} />
                  Proses File
                </>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          {processing && (
            <div style={{ marginTop: '16px' }}>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${progress}%`
                  }}
                ></div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#4a5568', marginTop: '8px' }}>
                Progress: {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>

        {/* Cost Estimation */}
        {totalCost > 0 && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#d69e2e" />
              <span style={{ fontWeight: '600', color: '#b45309' }}>
                Estimasi Biaya: ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748', marginBottom: '24px' }}>
              Hasil Analisis
            </h2>
            
            {results.map((result, index) => (
              <div key={index} style={styles.card}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#2b6cb0' }}>
                  {result.fileName}
                </h3>
                
                <div>
                  {result.prompts.map((promptData, promptIndex) => (
                    <div key={promptIndex} style={styles.resultCard}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Image size={20} color="#38a169" />
                        <span style={{ fontWeight: '600' }}>Gambar {promptIndex + 1}</span>
                      </div>
                      
                      {/* Image Preview */}
                      <div style={{ marginBottom: '16px' }}>
                        <img
                          src={URL.createObjectURL(promptData.image)}
                          alt={`Preview ${promptIndex + 1}`}
                          style={styles.imagePreview}
                        />
                      </div>

                      {/* Style and Mood */}
                      <div style={styles.grid}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>
                            Gaya:
                          </label>
                          <p style={{ fontSize: '0.9rem', backgroundColor: '#f7fafc', padding: '8px', borderRadius: '4px' }}>
                            {promptData.style}
                          </p>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>
                            Mood:
                          </label>
                          <p style={{ fontSize: '0.9rem', backgroundColor: '#f7fafc', padding: '8px', borderRadius: '4px' }}>
                            {promptData.mood}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ margin: '16px 0' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>
                          Tag:
                        </label>
                        <div style={styles.tagContainer}>
                          {promptData.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} style={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Prompts */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Text-to-Image Prompt */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                              Text-to-Image Prompt:
                            </label>
                            <button
                              onClick={() => copyToClipboard(promptData.imagePrompt)}
                              style={{
                                ...styles.button,
                                padding: '4px 8px',
                                fontSize: '0.8rem'
                              }}
                            >
                              <Copy size={12} />
                              Salin
                            </button>
                          </div>
                          <textarea
                            value={promptData.imagePrompt}
                            readOnly
                            rows={3}
                            style={styles.textarea}
                          />
                        </div>

                        {/* Text-to-Video Prompt */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                              Text-to-Video Prompt:
                            </label>
                            <button
                              onClick={() => copyToClipboard(promptData.videoPrompt)}
                              style={{
                                ...styles.button,
                                backgroundColor: '#805ad5',
                                padding: '4px 8px',
                                fontSize: '0.8rem'
                              }}
                            >
                              <Copy size={12} />
                              Salin
                            </button>
                          </div>
                          <textarea
                            value={promptData.videoPrompt}
                            readOnly
                            rows={3}
                            style={styles.textarea}
                          />
                        </div>

                        {/* Creative Prompt */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                              Enhanced Creative Prompt:
                            </label>
                            <button
                              onClick={() => copyToClipboard(promptData.creativePrompt)}
                              style={{
                                ...styles.button,
                                ...styles.buttonSuccess,
                                padding: '4px 8px',
                                fontSize: '0.8rem'
                              }}
                            >
                              <Copy size={12} />
                              Salin
                            </button>
                          </div>
                          <textarea
                            value={promptData.creativePrompt}
                            readOnly
                            rows={3}
                            style={styles.textarea}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;