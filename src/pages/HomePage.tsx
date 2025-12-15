import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShoeModel {
  id: string;
  name: string;
  path: string;
  displayName: string;
  description: string;
  price: string;
  category: string;
  colors: string[];
  thumbnail: string;
}

function HomePage() {
  const navigate = useNavigate();
  const [models, setModels] = useState<ShoeModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load models from JSON file
    const loadModels = async () => {
      try {
        const response = await fetch('/models/models.json');
        if (response.ok) {
          const data = await response.json();
          setModels(data);
        } else {
          // Fallback models
          setModels([
            {
              id: 'shoe-1',
              name: 'shoe-1',
              path: '/models/shoe-1.glb',
              displayName: 'Shoe Model 1',
              description: 'Premium customizable shoe model',
              price: '$129.99',
              category: 'Running',
              colors: ['Black', 'White', 'Blue'],
              thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
            },
            {
              id: 'ML-9_OS-1',
              name: 'ML-9_OS-1',
              path: '/models/ML-9_OS-1.glb',
              displayName: 'ML-9 OS-1',
              description: 'High-performance athletic shoe',
              price: '$159.99',
              category: 'Athletic',
              colors: ['Black', 'Gray', 'Navy'],
              thumbnail: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading models:', error);
        // Use fallback models
        setModels([
          {
            id: 'shoe-1',
            name: 'shoe-1',
            path: '/models/shoe-1.glb',
            displayName: 'Shoe Model 1',
            description: 'Premium customizable shoe model',
            price: '$129.99',
            category: 'Running',
            colors: ['Black', 'White', 'Blue'],
            thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          },
          {
            id: 'ML-9_OS-1',
            name: 'ML-9_OS-1',
            path: '/models/ML-9_OS-1.glb',
            displayName: 'ML-9 OS-1',
            description: 'High-performance athletic shoe',
            price: '$159.99',
            category: 'Athletic',
            colors: ['Black', 'Gray', 'Navy'],
            thumbnail: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const handleSelectModel = (model: ShoeModel) => {
    navigate(`/customize?model=${encodeURIComponent(model.path)}`);
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px'
      }}>
        <div>Loading models...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '10px', fontWeight: 'bold' }}>
            3D Product Customizer
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px' }}>
            Choose a product model to customize
          </p>
        </header>

        {models.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'white', padding: '60px 20px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>No Models Available</h2>
            <p>Add GLB/GLTF files to public/models/ directory</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {models.map((model) => (
              <div
                key={model.id}
                onClick={() => handleSelectModel(model)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  transition: 'transform 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{
                  width: '100%',
                  height: '300px',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <img
                    src={model.thumbnail}
                    alt={model.displayName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    background: '#667eea',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {model.category}
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                      {model.displayName}
                    </h3>
                    <div style={{ color: '#fbbf24', fontSize: '14px' }}>
                      ⭐ 4.8
                    </div>
                  </div>
                  
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px', lineHeight: '1.5' }}>
                    {model.description}
                  </p>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
                      {model.price}
                    </span>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>Available Colors:</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {model.colors.slice(0, 4).map((color, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '2px solid #ddd',
                            backgroundColor: color.toLowerCase() === 'black' ? '#000' :
                                            color.toLowerCase() === 'white' ? '#fff' :
                                            color.toLowerCase() === 'blue' ? '#3b82f6' :
                                            color.toLowerCase() === 'red' ? '#ef4444' :
                                            color.toLowerCase() === 'gray' ? '#6b7280' :
                                            color.toLowerCase() === 'navy' ? '#1e3a8a' : '#9ca3af',
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#667eea',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '12px',
                    background: '#f0f4ff',
                    borderRadius: '8px',
                    marginTop: '10px'
                  }}>
                    <span>Click to Customize</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
