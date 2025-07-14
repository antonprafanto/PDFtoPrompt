// src/App.js - Production Version dengan Real OpenAI API
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Key, Check, X, Copy, Image, FileText, Loader, Trash2, DollarSign } from 'lucide-react';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyValid, setApiKeyValid] = useState(null);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // Inline styles (same as before)
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
      backgroundColor: '#d4edda',
      border: '1px solid #c3e6cb',
      borderRadius: '8px',
      display: 'inline-block',
      color: '#155724',
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
    },
    costCard: {
      backgroundColor: '#fff5f5',
      border: '1px solid #feb2b2',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    }
  };

  // Real OpenAI API calls
  const callOpenAI = async (messages, maxTokens = 500) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o", // Latest vision model
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update token usage for cost calculation
        setTotalTokens(prev => prev + (data.usage?.total_tokens || 0));
        return data.choices[0].message.content;
      } else {
        throw new Error(data.error?.message || 'API call failed');
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  };

  // Validate API Key dengan real OpenAI API
  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyValid(false);
      alert('Silakan masukkan API Key terlebih dahulu');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setApiKeyValid(false);
      alert('API Key harus dimulai dengan "sk-"');
      return;
    }

    try {
      setProcessing(true);
      
      // Test API key dengan simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setApiKeyValid(true);
        alert('✅ API Key valid! Anda dapat mulai memproses gambar.');
      } else {
        const errorData = await response.json();
        setApiKeyValid(false);
        alert(`❌ API Key tidak valid: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      setApiKeyValid(false);
      alert('❌ Gagal memvalidasi API Key. Periksa koneksi internet Anda.');
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
      alert('PDF processing akan diimplementasikan dalam update berikutnya. Silakan upload gambar langsung untuk saat ini.');
      return [];
    }
    
    return [];
  };

  // Filter meaningful images menggunakan real OpenAI API
  const filterMeaningfulImages = async (images) => {
    const meaningfulImages = [];
    
    for (const image of images) {
      try {
        const base64 = await fileToBase64(image);
        
        const messages = [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and determine if it contains meaningful visual content or is just a simple icon/thumbnail.

Consider MEANINGFUL:
- Photographs of people, places, objects, scenes
- Artwork, illustrations, drawings, paintings  
- Screenshots with substantial content
- Charts, graphs, diagrams with data
- Complex designs or compositions

Consider NOT meaningful (skip these):
- Simple icons or logos
- Small thumbnails or previews
- Basic geometric shapes
- UI elements like buttons
- Low resolution or pixelated images

Respond ONLY with valid JSON:
{
  "meaningful": true/false,
  "reason": "brief explanation why",
  "confidence": 0.0-1.0,
  "imageType": "photo/artwork/screenshot/icon/etc"
}`
              },
              {
                type: "image_url",
                image_url: {
                  url: base64
                }
              }
            ]
          }
        ];

        const response = await callOpenAI(messages);
        const result = JSON.parse(response);
        
        if (result.meaningful && result.confidence > 0.6) {
          meaningfulImages.push({
            file: image,
            analysis: result
          });
        } else {
          console.log(`Skipping image (${result.reason}):`, image.name);
        }
      } catch (error) {
        console.error('Error filtering image:', error);
        // Jika ada error, masukkan gambar (better safe than sorry)
        meaningfulImages.push({
          file: image,
          analysis: { 
            meaningful: true, 
            reason: 'Analysis failed, included by default', 
            confidence: 0.5,
            imageType: 'unknown'
          }
        });
      }
    }
    
    return meaningfulImages;
  };

  // Generate AI prompts menggunakan real OpenAI API
  const generatePrompts = async (meaningfulImages) => {
    const prompts = [];
    
    for (const imageData of meaningfulImages) {
      try {
        const base64 = await fileToBase64(imageData.file);
        
        const messages = [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and create detailed AI prompts for generating similar content.

Generate prompts optimized for different AI platforms:

1. TEXT-TO-IMAGE: Perfect for DALL-E 3, Midjourney, Stable Diffusion
2. TEXT-TO-VIDEO: Optimized for Runway ML, Pika Labs, Gen-2
3. CREATIVE ENHANCED: Artistic interpretation for creative exploration

Focus on:
- Visual style and artistic technique
- Composition and framing  
- Lighting, shadows, and mood
- Color palette and contrast
- Subject matter and context
- Camera angle and perspective
- Textures and materials
- Atmosphere and emotion

Respond ONLY with valid JSON:
{
  "imagePrompt": "detailed text-to-image prompt (50-100 words)",
  "videoPrompt": "detailed text-to-video prompt with motion (50-100 words)",
  "creativePrompt": "enhanced artistic interpretation prompt (50-100 words)",
  "tags": ["relevant", "descriptive", "tags"],
  "style": "art style description",
  "mood": "emotional tone/atmosphere",
  "colors": ["dominant", "color", "palette"],
  "lighting": "lighting description",
  "composition": "composition type"
}`
              },
              {
                type: "image_url",
                image_url: {
                  url: base64
                }
              }
            ]
          }
        ];

        const response = await callOpenAI(messages, 800); // More tokens for detailed prompts
        const result = JSON.parse(response);
        
        prompts.push({
          image: imageData.file,
          analysis: imageData.analysis,
          ...result
        });
      } catch (error) {
        console.error('Error generating prompts:', error);
        alert(`Error generating prompts for ${imageData.file.name}: ${error.message}`);
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

  // Calculate estimated cost
  const calculateCost = (imageCount, tokenCount) => {
    // GPT-4o pricing (approximate)
    const costPerImage = 0.00765; // per image input
    const costPerToken = 0.00003; // per output token
    
    return (imageCount * costPerImage) + (tokenCount * costPerToken);
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

    const confirmProcess = window.confirm(
      `Anda akan memproses ${files.length} file. Ini akan menggunakan OpenAI API dan dikenakan biaya pada akun Anda. Lanjutkan?`
    );

    if (!confirmProcess) return;

    setProcessing(true);
    setProgress(0);
    setResults([]);
    setTotalCost(0);
    setTotalTokens(0);

    const totalSteps = files.length * 3;
    let currentStep = 0;

    for (const fileItem of files) {
      try {
        // Step 1: Extract images
        setProgress((currentStep / totalSteps) * 100);
        const images = await extractImages(fileItem);
        currentStep++;

        if (images.length === 0) continue;

        // Step 2: Filter meaningful images
        setProgress((currentStep / totalSteps) * 100);
        const meaningfulImages = await filterMeaningfulImages(images);
        currentStep++;

        if (meaningfulImages.length === 0) {
          alert(`No meaningful images found in ${fileItem.file.name}`);
          continue;
        }

        // Step 3: Generate prompts
        setProgress((currentStep / totalSteps) * 100);
        const prompts = await generatePrompts(meaningfulImages);
        currentStep++;

        setResults(prev => [...prev, {
          fileName: fileItem.file.name,
          meaningfulImages,
          prompts
        }]);

      } catch (error) {
        console.error(`Error processing ${fileItem.file.name}:`, error);
        alert(`Error processing ${fileItem.file.name}: ${error.message}`);
      }
    }

    // Calculate final cost
    const finalCost = calculateCost(results.reduce((acc, r) => acc + r.prompts.length, 0), totalTokens);
    setTotalCost(finalCost);

    setProgress(100);
    setProcessing(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Prompt berhasil disalin ke clipboard!');
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
          <p style={styles.subtitle}>AI-Powered Image Prompt Generator</p>
          <div style={styles.demoNote}>
            🚀 Production Version - Menggunakan Real OpenAI API
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
              placeholder="Masukkan OpenAI API Key Anda (sk-...)..."
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
          
          {!apiKeyValid && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef5e7', borderRadius: '8px', fontSize: '0.9rem' }}>
              💡 <strong>Cara mendapatkan API Key:</strong><br/>
              1. Kunjungi <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{color: '#3182ce'}}>platform.openai.com/api-keys</a><br/>
              2. Login atau daftar akun OpenAI<br/>
              3. Klik "Create new secret key"<br/>
              4. Copy dan paste key di sini
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <Upload size={20} color="#38a169" />
            <span>Upload Files</span>
          </div>

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
                  Proses File dengan AI
                </>
              )}
            </button>
          </div>

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
                Progress: {Math.round(progress)}% - Menggunakan OpenAI API...
              </p>
            </div>
          )}
        </div>

        {/* Cost Estimation */}
        {(totalCost > 0 || totalTokens > 0) && (
          <div style={styles.costCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <DollarSign size={20} color="#e53e3e" />
              <span style={{ fontWeight: '600', color: '#c53030' }}>
                Biaya API OpenAI
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#742a2a' }}>
              <div>Total Tokens: {totalTokens.toLocaleString()}</div>
              <div>Estimasi Biaya: ${totalCost.toFixed(4)} USD</div>
              <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#a0aec0' }}>
                *Biaya akan dibebankan ke akun OpenAI Anda
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748', marginBottom: '24px' }}>
              Hasil Analisis AI
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
                        <span style={{ fontSize: '0.8rem', color: '#718096', backgroundColor: '#f7fafc', padding: '2px 8px', borderRadius: '12px' }}>
                          {promptData.analysis.imageType} - {(promptData.analysis.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <img
                          src={URL.createObjectURL(promptData.image)}
                          alt={`Preview ${promptIndex + 1}`}
                          style={styles.imagePreview}
                        />
                      </div>

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

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                              🎨 Text-to-Image Prompt:
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
                            rows={4}
                            style={styles.textarea}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                              🎬 Text-to-Video Prompt:
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
                            rows={4}
                            style={styles.textarea}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                              ✨ Enhanced Creative Prompt:
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
                            rows={4}
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